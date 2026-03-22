<?php
ini_set('memory_limit', '512M');
ini_set('max_execution_time', '60');
//error_reporting(0);
//ini_set('display_errors', 0);
header('Content-Type: application/json');

$stationsFile = __DIR__ . '/stations_example.json';

// Check 1: file exists and is readable
if (!file_exists($stationsFile) || !is_readable($stationsFile)) {
    http_response_code(503);
    echo json_encode(['error' => 'stations.json not found', 'path' => $stationsFile]);
    exit;
}

$raw = file_get_contents($stationsFile);

// Check 2: file was read correctly
if ($raw === false || empty($raw)) {
    http_response_code(503);
    echo json_encode(['error' => 'stations.json is empty or unreadable']);
    exit;
}

$stations = json_decode($raw, true);

// Check 3: JSON is valid
if (!is_array($stations)) {
    http_response_code(503);
    echo json_encode(['error' => 'stations.json invalid JSON', 'json_error' => json_last_error_msg()]);
    exit;
}

// Common filters (used by all endpoints)
$countryFilter  = isset($_GET['country'])  ? strtolower(trim($_GET['country']))  : '';
$languageFilter = isset($_GET['language']) ? strtolower(trim($_GET['language'])) : '';

// All light - lightweight station list (DEFAULT if no other params)
if (isset($_GET['channel']) && $_GET['channel'] === 'all_light') {
    $offset = (int)($_GET['offset'] ?? 0);
    $limit  = (int)($_GET['limit']  ?? 50000);

    $light = array_map(fn($s) => [
        'channel_id'   => $s['channel_id']   ?? 0,
        'name'         => $s['name']         ?? '',
        'url_resolved' => $s['url_resolved'] ?? ($s['url'] ?? ''),
        'countrycode'  => $s['countrycode']  ?? '',
        'language'     => $s['language']     ?? '',
        'tags'         => $s['tags']         ?? '',
        'favicon'      => $s['favicon']      ?? '',
    ], $stations);

    // Remove stations without URL
    $light = array_values(array_filter(
        $light,
        fn($s) => !empty($s['url_resolved'])
    ));

    // Country filter (exact match on countrycode)
    if ($countryFilter) {
        $light = array_values(array_filter(
            $light,
            fn($s) => strtolower($s['countrycode'] ?? '') === $countryFilter
        ));
    }

    // Language filter (substring match in language OR tags)
    if ($languageFilter) {
        $light = array_values(array_filter(
            $light,
            fn($s) =>
                str_contains(strtolower($s['language'] ?? ''), $languageFilter) ||
                str_contains(strtolower($s['tags']     ?? ''), $languageFilter)
        ));
    }

    echo json_encode(array_values(array_slice($light, $offset, $limit)));
    exit;
}

// Single channel by number
if (isset($_GET['channel']) && is_numeric($_GET['channel'])) {
    $ch     = (int)$_GET['channel'];
    $result = array_values(array_filter($stations, fn($s) => ($s['channel_id'] ?? 0) === $ch));
    echo json_encode($result[0] ?? null);
    exit;
}

// Search by name
if (isset($_GET['search'])) {
    $q      = strtolower(trim($_GET['search']));
    
    $result = array_values(array_filter($stations,
        fn($s) => str_contains(strtolower($s['name'] ?? ''), $q)
    ));

    // Apply country/language filters to search results too
    if ($countryFilter) {
        $result = array_values(array_filter(
            $result,
            fn($s) => strtolower($s['countrycode'] ?? '') === $countryFilter
        ));
    }
    if ($languageFilter) {
        $result = array_values(array_filter(
            $result,
            fn($s) =>
                str_contains(strtolower($s['language'] ?? ''), $languageFilter) ||
                str_contains(strtolower($s['tags']     ?? ''), $languageFilter)
        ));
    }

    echo json_encode(array_slice($result, 0, 20));
    exit;
}

// NO PARAMETERS = return entire list (lightweight)
$offset = (int)($_GET['offset'] ?? 0);
$limit  = (int)($_GET['limit']  ?? 50000);

$light = array_map(fn($s) => [
    'channel_id'   => $s['channel_id']   ?? 0,
    'name'         => $s['name']         ?? '',
    'url_resolved' => $s['url_resolved'] ?? ($s['url'] ?? ''),
    'countrycode'  => $s['countrycode']  ?? '',
    'language'     => $s['language']     ?? '',
    'tags'         => $s['tags']         ?? '',
    'favicon'      => $s['favicon']      ?? '',
], $stations);

// Remove stations without URL
$light = array_values(array_filter(
    $light,
    fn($s) => !empty($s['url_resolved'])
));

// Apply filters if specified
if ($countryFilter) {
    $light = array_values(array_filter(
        $light,
        fn($s) => strtolower($s['countrycode'] ?? '') === $countryFilter
    ));
}
if ($languageFilter) {
    $light = array_values(array_filter(
        $light,
        fn($s) =>
            str_contains(strtolower($s['language'] ?? ''), $languageFilter) ||
            str_contains(strtolower($s['tags']     ?? ''), $languageFilter)
    ));
}

echo json_encode(array_values(array_slice($light, $offset, $limit)));
