<?php
/**
 * MYETV Radio Stats Backend
 * Handles live viewers polling and historical stats tracking via JSON files.
 */

declare(strict_types=1);

// Enable CORS if the API is on a different subdomain/domain
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

class RadioStatsManager {
    
    private string $dataDir;
    private int $liveTimeout;

    public function __construct(string $dataDir = __DIR__ . '/data', int $liveTimeout = 30) {
        $this->dataDir = $dataDir;
        $this->liveTimeout = $liveTimeout; // Seconds before a client is considered offline
        
        if (!is_dir($this->dataDir)) {
            @mkdir($this->dataDir, 0755, true);
        }
    }

    /**
     * Sanitizes strings to prevent path traversal and XSS
     */
    private function sanitizeInput(?string $input): string {
        if ($input === null) return '';
        // Allow only alphanumeric characters, dashes, and underscores
        return preg_replace('/[^a-zA-Z0-9\-_]/', '', $input);
    }

    /**
     * Safely reads and decodes a JSON file using a shared lock
     */
    private function readJson(string $filePath): array {
        if (!file_exists($filePath)) {
            return [];
        }
        
        $fp = fopen($filePath, 'r');
        if (!$fp) return [];
        
        flock($fp, LOCK_SH); // Shared lock for reading
        $size = filesize($filePath);
        $json = $size > 0 ? fread($fp, $size) : '';
        flock($fp, LOCK_UN);
        fclose($fp);
        
        $data = json_decode($json ?: '', true);
        return is_array($data) ? $data : [];
    }

    /**
     * Safely encodes and writes to a JSON file using an exclusive lock
     */
    private function writeJson(string $filePath, array $data): bool {
        $fp = fopen($filePath, 'c'); // Open for write, create if not exists
        if (!$fp) return false;
        
        if (flock($fp, LOCK_EX)) { // Exclusive lock for writing
            ftruncate($fp, 0); // Clear file content
            fwrite($fp, json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
            fflush($fp);
            flock($fp, LOCK_UN);
            fclose($fp);
            return true;
        }
        
        fclose($fp);
        return false;
    }

    /**
     * Generates time periods for history tracking
     */
    private function getTimePeriods(): array {
        $now = time();
        return [
            'daily'   => date('Y-m-d', $now),
            'weekly'  => date('Y-W', $now), // Year and ISO-8601 week number
            'monthly' => date('Y-m', $now),
            'yearly'  => date('Y', $now)
        ];
    }

    /**
     * Main processor
     */
    public function processRequest(): void {
        $stationId = $this->sanitizeInput($_GET['station_id'] ?? null);
        $clientId = $this->sanitizeInput($_GET['client_id'] ?? null);
        $status = $_GET['status'] ?? null;
        $isPlaying = ($status === 'playing');

        if (empty($stationId) || empty($clientId)) {
            $this->sendResponse(false, ['error' => 'Missing parameters']);
            return;
        }

        $now = time();
        
        // Define file paths
        $liveFile = $this->dataDir . '/live_' . $stationId . '.json';
        $historyFile = $this->dataDir . '/history_' . $stationId . '.json';
        $clientsFile = $this->dataDir . '/clients_' . $stationId . '.json';

        // 1. Handle Live Viewers
        $liveData = $this->readJson($liveFile);
        
        if ($isPlaying) {
            $liveData[$clientId] = $now;
        }
        
        // Garbage collection: remove expired clients
        $activeLiveCount = 0;
        foreach ($liveData as $cId => $lastPing) {
            if ($now - $lastPing > $this->liveTimeout) {
                unset($liveData[$cId]);
            } else {
                $activeLiveCount++;
            }
        }
        
        $this->writeJson($liveFile, $liveData);

        // 2. Handle History Stats
        $historyData = $this->readJson($historyFile);
        $clientHistory = $this->readJson($clientsFile);
        
        // Initialize default structure if empty
        if (empty($historyData)) {
            $historyData = [
                'total' => 0,
                'periods' => $this->getTimePeriods(),
                'stats' => ['daily' => 0, 'weekly' => 0, 'monthly' => 0, 'yearly' => 0]
            ];
        }
        
        $currentPeriods = $this->getTimePeriods();
        $historyUpdated = false;
        
        // Reset counters if period changed (e.g., new day, new month)
        foreach (['daily', 'weekly', 'monthly', 'yearly'] as $periodKey) {
            if ($historyData['periods'][$periodKey] !== $currentPeriods[$periodKey]) {
                $historyData['stats'][$periodKey] = 0;
                $historyData['periods'][$periodKey] = $currentPeriods[$periodKey];
                $historyUpdated = true;
                
                // Clear the daily clients list to allow counting them again tomorrow
                if ($periodKey === 'daily') {
                    $clientHistory = []; 
                }
            }
        }

        // If the user is playing, check if we need to count them as a new view for today
        if ($isPlaying && !isset($clientHistory[$clientId])) {
            $clientHistory[$clientId] = $now;
            $this->writeJson($clientsFile, $clientHistory);
            
            $historyData['total']++;
            $historyData['stats']['daily']++;
            $historyData['stats']['weekly']++;
            $historyData['stats']['monthly']++;
            $historyData['stats']['yearly']++;
            $historyUpdated = true;
        }

        if ($historyUpdated) {
            $this->writeJson($historyFile, $historyData);
        }

        // 3. Output Response
        $this->sendResponse(true, [
            'live' => $activeLiveCount,
            'total' => $historyData['total'],
            'daily' => $historyData['stats']['daily'],
            'weekly' => $historyData['stats']['weekly'],
            'monthly' => $historyData['stats']['monthly'],
            'yearly' => $historyData['stats']['yearly']
        ]);
    }

    /**
     * Outputs the JSON payload and exits
     */
    private function sendResponse(bool $success, array $payload): void {
        echo json_encode([
            'success' => $success,
            'stats' => $success ? $payload : null,
            'error' => !$success ? ($payload['error'] ?? 'Unknown error') : null
        ]);
        exit;
    }
}

// Execute the request
$api = new RadioStatsManager();
$api->processRequest();