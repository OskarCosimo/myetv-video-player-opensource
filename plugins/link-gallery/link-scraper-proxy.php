<?php // link-scraper-proxy.php
/**
 * MYETV Link Gallery Plugin - Secure Metadata Scraper Proxy
 * File: link-scraper-proxy.php
 *
 * Extracts title, description, and preview image from a target HTTP/HTTPS URL
 * with SSRF protection, DNS rebinding mitigation, response caching, and per-IP rate limiting.
 */

declare(strict_types=1);

// ============================================================================
// CONFIGURATION
// ============================================================================
const SCRAPER_MAX_REDIRECTS       = 3;
const SCRAPER_CONNECT_TIMEOUT     = 4;       // Seconds
const SCRAPER_TOTAL_TIMEOUT       = 6;       // Seconds
const SCRAPER_MAX_BODY_BYTES      = 524288;  // 512 KB max HTML download
const SCRAPER_RATE_LIMIT_MAX      = 20;      // Max requests per window per IP
const SCRAPER_RATE_LIMIT_WINDOW   = 60;      // Window in seconds
const SCRAPER_CACHE_TTL           = 900;     // Cache results for 15 minutes (0 to disable)
const SCRAPER_TRUST_PROXY_HEADERS = false;   // Keep false unless behind a trusted reverse proxy
const SCRAPER_USER_AGENT          = 'MYETVLinkPreviewBot/1.0 (+https://www.myetv.tv)';

// Optional CORS allowlist: add allowed origins (e.g. ['https://www.myetv.tv']) or leave empty for same-origin
const SCRAPER_ALLOWED_ORIGINS     = [];

// ============================================================================
// SECURITY HEADERS & METHOD CHECK
// ============================================================================
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, SCRAPER_ALLOWED_ORIGINS, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($method !== 'GET') {
    sendJsonError(405, 'Method not allowed.');
}

if (!function_exists('curl_init')) {
    sendJsonError(500, 'cURL extension is required.');
}

// ============================================================================
// STORAGE DIRECTORY (RATE LIMIT + CACHE)
// ============================================================================
$storageBaseDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'myetv_link_scraper';
$rateLimitDir   = $storageBaseDir . DIRECTORY_SEPARATOR . 'ratelimit';
$cacheDir       = $storageBaseDir . DIRECTORY_SEPARATOR . 'cache';

ensureDirectory($rateLimitDir);
ensureDirectory($cacheDir);

// ============================================================================
// RATE LIMITING
// ============================================================================
$clientIp = getClientIp(SCRAPER_TRUST_PROXY_HEADERS);
$rateCheck = checkRateLimit($rateLimitDir, $clientIp, SCRAPER_RATE_LIMIT_MAX, SCRAPER_RATE_LIMIT_WINDOW);

header('X-RateLimit-Limit: ' . SCRAPER_RATE_LIMIT_MAX);
header('X-RateLimit-Remaining: ' . $rateCheck['remaining']);
header('X-RateLimit-Reset: ' . $rateCheck['reset']);

if (!$rateCheck['allowed']) {
    header('Retry-After: ' . max(1, $rateCheck['reset'] - time()));
    sendJsonError(429, 'Rate limit exceeded. Please try again later.');
}

// ============================================================================
// INPUT URL VALIDATION
// ============================================================================
$rawUrl = isset($_GET['url']) ? trim((string)$_GET['url']) : '';
if ($rawUrl === '' || strlen($rawUrl) > 2048) {
    sendJsonError(400, 'Invalid or missing URL parameter.');
}

$validatedUrl = validateExternalUrl($rawUrl);
if ($validatedUrl === null) {
    sendJsonError(400, 'URL scheme, host, or port is not permitted.');
}

// ============================================================================
// CACHE LOOKUP
// ============================================================================
$cacheKey  = hash('sha256', $validatedUrl);
$cacheFile = $cacheDir . DIRECTORY_SEPARATOR . $cacheKey . '.json';

if (SCRAPER_CACHE_TTL > 0 && is_file($cacheFile)) {
    $mtime = @filemtime($cacheFile);
    if ($mtime !== false && (time() - $mtime) < SCRAPER_CACHE_TTL) {
        $cachedPayload = @file_get_contents($cacheFile);
        if ($cachedPayload !== false) {
            header('Cache-Control: public, max-age=' . SCRAPER_CACHE_TTL);
            header('X-Scraper-Cache: HIT');
            echo $cachedPayload;
            exit;
        }
    }
}

// ============================================================================
// SAFE FETCH WITH MANUAL REDIRECT & SSRF PROTECTION
// ============================================================================
$fetchResult = fetchHtmlSafely($validatedUrl);
if ($fetchResult['error'] !== null) {
    sendJsonError($fetchResult['status'], $fetchResult['error']);
}

// ============================================================================
// METADATA PARSING
// ============================================================================
$metadata = extractMetadataFromHtml($fetchResult['html'], $fetchResult['finalUrl']);
$jsonOutput = json_encode($metadata, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

if ($jsonOutput === false) {
    sendJsonError(500, 'Failed to encode metadata response.');
}

// Store in cache atomically
if (SCRAPER_CACHE_TTL > 0) {
    @file_put_contents($cacheFile, $jsonOutput, LOCK_EX);
}

header('Cache-Control: public, max-age=' . SCRAPER_CACHE_TTL);
header('X-Scraper-Cache: MISS');
echo $jsonOutput;
exit;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Send a JSON error response and terminate execution
 */
function sendJsonError(int $statusCode, string $message): void
{
    http_response_code($statusCode);
    echo json_encode(['error' => $message], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Create a private storage directory if it does not exist
 */
function ensureDirectory(string $path): void
{
    if (!is_dir($path)) {
        @mkdir($path, 0750, true);
    }
}

/**
 * Determine client IP safely
 */
function getClientIp(bool $trustProxy): string
{
    $remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    if ($trustProxy && !empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts = explode(',', (string)$_SERVER['HTTP_X_FORWARDED_FOR']);
        $candidate = trim($parts[0]);
        if (filter_var($candidate, FILTER_VALIDATE_IP)) {
            return $candidate;
        }
    }
    return filter_var($remoteAddr, FILTER_VALIDATE_IP) ? $remoteAddr : '0.0.0.0';
}

/**
 * Fixed-window per-IP rate limiter backed by file locks
 *
 * @return array{allowed: bool, remaining: int, reset: int}
 */
function checkRateLimit(string $dir, string $ip, int $maxRequests, int $windowSeconds): array
{
    $now = time();
    $file = $dir . DIRECTORY_SEPARATOR . hash('sha256', $ip) . '.json';
    $fp = @fopen($file, 'c+');

    if ($fp === false) {
        // Fail open only if filesystem lock cannot be created, or change to false to fail closed
        return ['allowed' => true, 'remaining' => $maxRequests - 1, 'reset' => $now + $windowSeconds];
    }

    flock($fp, LOCK_EX);
    $raw = stream_get_contents($fp);
    $data = $raw ? json_decode($raw, true) : null;

    if (!is_array($data) || !isset($data['reset']) || $now >= (int)$data['reset']) {
        $data = [
            'count' => 0,
            'reset' => $now + $windowSeconds,
        ];
    }

    $allowed = ((int)$data['count'] < $maxRequests);
    if ($allowed) {
        $data['count'] = (int)$data['count'] + 1;
    }

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($data));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);

    return [
        'allowed'   => $allowed,
        'remaining' => max(0, $maxRequests - (int)$data['count']),
        'reset'     => (int)$data['reset'],
    ];
}

/**
 * Validate URL syntax, allowed schemes, ports, and absence of credentials
 */
function validateExternalUrl(string $url): ?string
{
    if (preg_match('/[\x00-\x1F\x7F\s]/', $url)) {
        return null;
    }

    $parts = parse_url($url);
    if (!is_array($parts)) {
        return null;
    }

    $scheme = strtolower($parts['scheme'] ?? '');
    if ($scheme !== 'http' && $scheme !== 'https') {
        return null;
    }

    if (isset($parts['user']) || isset($parts['pass'])) {
        return null;
    }

    $host = $parts['host'] ?? '';
    if ($host === '' || strlen($host) > 253) {
        return null;
    }

    if (isset($parts['port']) && !in_array((int)$parts['port'], [80, 443], true)) {
        return null;
    }

    // Reject raw IPv6 brackets normalization mismatch by stripping brackets when checking IP
    $cleanHost = trim($host, '[]');
    if (strtolower($cleanHost) === 'localhost') {
        return null;
    }

    return $url;
}

/**
 * Check if an IP address is public and safe for outbound server connections
 */
function isPublicIp(string $ip): bool
{
    if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
        return false;
    }

    // Explicit check for IPv4-mapped IPv6 addresses (e.g. ::ffff:127.0.0.1)
    if (stripos($ip, '::ffff:') === 0) {
        $mappedIpv4 = substr($ip, 7);
        if (!filter_var($mappedIpv4, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return false;
        }
    }

    return true;
}

/**
 * Resolve hostname to a verified public IP address to prevent SSRF and DNS rebinding
 */
function resolveAndVerifyHostIp(string $host): ?string
{
    $cleanHost = trim($host, '[]');

    if (filter_var($cleanHost, FILTER_VALIDATE_IP)) {
        return isPublicIp($cleanHost) ? $cleanHost : null;
    }

    $ips = [];

    $aRecords = @dns_get_record($cleanHost, DNS_A);
    if (is_array($aRecords)) {
        foreach ($aRecords as $rec) {
            if (!empty($rec['ip'])) {
                $ips[] = $rec['ip'];
            }
        }
    }

    $aaaaRecords = @dns_get_record($cleanHost, DNS_AAAA);
    if (is_array($aaaaRecords)) {
        foreach ($aaaaRecords as $rec) {
            if (!empty($rec['ipv6'])) {
                $ips[] = $rec['ipv6'];
            }
        }
    }

    if (empty($ips)) {
        $fallbackIps = @gethostbynamel($cleanHost);
        if (is_array($fallbackIps)) {
            $ips = $fallbackIps;
        }
    }

    if (empty($ips)) {
        return null;
    }

    // Every resolved IP must be public; reject mixed public/private DNS responses
    foreach ($ips as $ip) {
        if (!isPublicIp($ip)) {
            return null;
        }
    }

    return $ips[0];
}

/**
 * Fetch HTML document securely with manual redirect handling and size caps
 *
 * @return array{html: string, finalUrl: string, status: int, error: ?string}
 */
function fetchHtmlSafely(string $startUrl): array
{
    $currentUrl = $startUrl;

    for ($hop = 0; $hop <= SCRAPER_MAX_REDIRECTS; $hop++) {
        $parts = parse_url($currentUrl);
        $host  = $parts['host'] ?? '';
        $port  = isset($parts['port']) ? (int)$parts['port'] : (($parts['scheme'] === 'https') ? 443 : 80);

        $resolvedIp = resolveAndVerifyHostIp($host);
        if ($resolvedIp === null) {
            return ['html' => '', 'finalUrl' => $currentUrl, 'status' => 403, 'error' => 'Destination host is blocked or unresolvable.'];
        }

        $ch = curl_init();
        $body = '';
        $bodyLimitExceeded = false;
        $headers = [];

        // Pin resolved IP via CURLOPT_RESOLVE to block DNS rebinding
        $resolveEntry = sprintf('%s:%d:%s', trim($host, '[]'), $port, $resolvedIp);

        curl_setopt_array($ch, [
            CURLOPT_URL            => $currentUrl,
            CURLOPT_RESOLVE        => [$resolveEntry],
            CURLOPT_RETURNTRANSFER => false,
            CURLOPT_FOLLOWLOCATION => false, // Handle redirects manually to re-validate every hop
            CURLOPT_PROTOCOLS      => CURLPROTO_HTTP | CURLPROTO_HTTPS,
            CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
            CURLOPT_CONNECTTIMEOUT => SCRAPER_CONNECT_TIMEOUT,
            CURLOPT_TIMEOUT        => SCRAPER_TOTAL_TIMEOUT,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_USERAGENT      => SCRAPER_USER_AGENT,
            CURLOPT_ENCODING       => '', // Allow gzip/deflate
            CURLOPT_HTTPHEADER     => [
                'Accept: text/html,application/xhtml+xml;q=0.9,*/*;q=0.1',
                'Accept-Language: en-US,en;q=0.8',
            ],
            CURLOPT_HEADERFUNCTION => static function ($curl, string $headerLine) use (&$headers): int {
                $len = strlen($headerLine);
                $colonPos = strpos($headerLine, ':');
                if ($colonPos !== false) {
                    $name = strtolower(trim(substr($headerLine, 0, $colonPos)));
                    $val  = trim(substr($headerLine, $colonPos + 1));
                    $headers[$name] = $val;
                }
                return $len;
            },
            CURLOPT_WRITEFUNCTION => static function ($curl, string $chunk) use (&$body, &$bodyLimitExceeded): int {
                $remaining = SCRAPER_MAX_BODY_BYTES - strlen($body);
                if ($remaining <= 0) {
                    $bodyLimitExceeded = true;
                    return 0; // Abort transfer cleanly once cap is reached
                }
                if (strlen($chunk) > $remaining) {
                    $body .= substr($chunk, 0, $remaining);
                    $bodyLimitExceeded = true;
                    return 0;
                }
                $body .= $chunk;
                return strlen($chunk);
            },
        ]);

        curl_exec($ch);
        $curlErrno = curl_errno($ch);
        $httpCode  = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $contentType = strtolower((string)curl_getinfo($ch, CURLINFO_CONTENT_TYPE));
        curl_close($ch);

        // CURLE_WRITE_ERROR (23) is expected when we intentionally stop at SCRAPER_MAX_BODY_BYTES
        if ($curlErrno !== 0 && !($bodyLimitExceeded && $curlErrno === 23)) {
            return ['html' => '', 'finalUrl' => $currentUrl, 'status' => 502, 'error' => 'Failed to fetch target URL.'];
        }

        // Handle 3xx redirects manually
        if ($httpCode >= 300 && $httpCode < 400 && !empty($headers['location'])) {
            $nextUrl = resolveRelativeUrl($headers['location'], $currentUrl);
            if ($nextUrl === null || validateExternalUrl($nextUrl) === null) {
                return ['html' => '', 'finalUrl' => $currentUrl, 'status' => 403, 'error' => 'Redirect target is not permitted.'];
            }
            $currentUrl = $nextUrl;
            continue;
        }

        if ($httpCode < 200 || $httpCode >= 400) {
            return ['html' => '', 'finalUrl' => $currentUrl, 'status' => 502, 'error' => 'Target URL returned HTTP ' . $httpCode . '.'];
        }

        if ($contentType !== '' && strpos($contentType, 'text/html') === false && strpos($contentType, 'application/xhtml+xml') === false) {
            return ['html' => '', 'finalUrl' => $currentUrl, 'status' => 415, 'error' => 'Target URL did not return HTML content.'];
        }

        return ['html' => $body, 'finalUrl' => $currentUrl, 'status' => 200, 'error' => null];
    }

    return ['html' => '', 'finalUrl' => $currentUrl, 'status' => 508, 'error' => 'Too many redirects.'];
}

/**
 * Parse HTML safely and extract title, description, and preview image
 *
 * @return array{title: string, description: string, image: string}
 */
function extractMetadataFromHtml(string $html, string $baseUrl): array
{
    if ($html === '') {
        return ['title' => '', 'description' => '', 'image' => ''];
    }

    $previousErrors = libxml_use_internal_errors(true);

    $dom = new DOMDocument();
    // Convert non-ASCII bytes to numeric HTML entities for UTF-8 compatibility across PHP 7.4 - 8.4+
    $encodedHtml = mb_encode_numericentity($html, [0x80, 0x10FFFF, 0, 0x1FFFFF], 'UTF-8');
    $dom->loadHTML($encodedHtml, LIBXML_NONET | LIBXML_NOWARNING | LIBXML_NOERROR);

    libxml_clear_errors();
    libxml_use_internal_errors($previousErrors);

    $xpath = new DOMXPath($dom);

    $getMeta = static function (array $queries) use ($xpath): string {
        foreach ($queries as $query) {
            $nodes = $xpath->query($query);
            if ($nodes !== false && $nodes->length > 0) {
                $val = trim((string)$nodes->item(0)->nodeValue);
                if ($val !== '') {
                    return $val;
                }
            }
        }
        return '';
    };

    $title = $getMeta([
        "//meta[translate(@property,'OGTITLE','ogtitle')='og:title']/@content",
        "//meta[translate(@name,'TWITTERTITLE','twittertitle')='twitter:title']/@content",
        '//title',
    ]);

    $description = $getMeta([
        "//meta[translate(@property,'OGDESCRIPTION','ogdescription')='og:description']/@content",
        "//meta[translate(@name,'TWITTERDESCRIPTION','twitterdescription')='twitter:description']/@content",
        "//meta[translate(@name,'DESCRIPTION','description')='description']/@content",
    ]);

    $rawImage = $getMeta([
        "//meta[translate(@property,'OGIMAGE:SECURE_URL','ogimage:secure_url')='og:image:secure_url']/@content",
        "//meta[translate(@property,'OGIMAGE','ogimage')='og:image']/@content",
        "//meta[translate(@name,'TWITTERIMAGE:SRC','twitterimage:src')='twitter:image:src']/@content",
        "//meta[translate(@name,'TWITTERIMAGE','twitterimage')='twitter:image']/@content",
        "//link[contains(translate(@rel,'APPLE-TOUCH-ICON','apple-touch-icon'),'apple-touch-icon')]/@href",
        "//link[translate(@rel,'ICON','icon')='icon']/@href",
    ]);

    $safeImage = '';
    if ($rawImage !== '') {
        $resolvedImage = resolveRelativeUrl($rawImage, $baseUrl);
        if ($resolvedImage !== null && validateExternalUrl($resolvedImage) !== null) {
            $safeImage = $resolvedImage;
        }
    }

    return [
        'title'       => cleanMetadataText($title, 300),
        'description' => cleanMetadataText($description, 3000),
        'image'       => $safeImage,
    ];
}

/**
 * Clean control characters, normalize whitespace, and enforce maximum length
 */
function cleanMetadataText(string $text, int $maxLength): string
{
    if ($text === '') {
        return '';
    }

    $decoded = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $cleaned = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $decoded) ?? '';
    $cleaned = preg_replace('/[ \t]+/u', ' ', $cleaned) ?? '';
    $cleaned = trim($cleaned);

    if (mb_strlen($cleaned, 'UTF-8') > $maxLength) {
        $cleaned = mb_substr($cleaned, 0, $maxLength - 1, 'UTF-8') . '…';
    }

    return $cleaned;
}

/**
 * Resolve a relative or protocol-relative URL against a base URL
 */
function resolveRelativeUrl(string $target, string $baseUrl): ?string
{
    $target = trim($target);
    if ($target === '') {
        return null;
    }

    if (preg_match('/^https?:\/\//i', $target)) {
        return $target;
    }

    $base = parse_url($baseUrl);
    if (!is_array($base) || empty($base['scheme']) || empty($base['host'])) {
        return null;
    }

    $scheme = $base['scheme'];
    $host   = $base['host'];
    $port   = isset($base['port']) ? ':' . $base['port'] : '';

    if (strpos($target, '//') === 0) {
        return $scheme . ':' . $target;
    }

    $origin = $scheme . '://' . $host . $port;

    if ($target[0] === '/') {
        return $origin . $target;
    }

    $basePath = $base['path'] ?? '/';
    $dirPath  = substr($basePath, -1) === '/' ? $basePath : dirname($basePath) . '/';
    if ($dirPath === '//' || $dirPath === './') {
        $dirPath = '/';
    }

    return $origin . $dirPath . $target;
}