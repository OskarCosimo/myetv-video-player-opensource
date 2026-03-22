<?php
// proxy.php?url=http://...
$url = $_GET['url'] ?? '';

// security: only allow valid URLs starting with http
if (!filter_var($url, FILTER_VALIDATE_URL) || !str_starts_with($url, 'http')) {
    http_response_code(400);
    exit;
}

// header audio
$headers = get_headers($url, 1);
$contentType = $headers['Content-Type'] ?? 'audio/mpeg';
header('Content-Type: ' . $contentType);
header('Cache-Control: no-cache');
header('X-Accel-Buffering: no');

// direct stream
$stream = fopen($url, 'rb');
if (!$stream) { http_response_code(502); exit; }

while (!feof($stream)) {
    echo fread($stream, 8192);
    flush();
}
fclose($stream);
