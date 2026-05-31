<?php
require_once __DIR__ . '/../login_page/db.php';

header('Content-Type: application/json');

try {
    $pdo = getConnection();
} catch (PDOException $e) {
    die(json_encode(["success" => false, "error" => "Database connection failed."]));
}

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$water_intake = $data['water_intake'] ?? null;
$sleep_hours = $data['sleep_hours'] ?? null;
$steps = $data['steps'] ?? null;

if (!$email) {
    die(json_encode(["success" => false, "error" => "Email missing"]));
}

try {
    // Collect fields to update
    $updates = [];
    $params = [];

    if ($water_intake !== null) {
        $updates[] = "water_intake = ?";
        $params[] = $water_intake;
    }
    if ($sleep_hours !== null) {
        $updates[] = "sleep_hours = ?";
        $params[] = $sleep_hours;
    }
    if ($steps !== null) {
        $updates[] = "steps = ?";
        $params[] = $steps;
    }

    if (count($updates) > 0) {
        $sql = "UPDATE users SET " . implode(", ", $updates) . " WHERE email = ?";
        $params[] = $email;
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode(["success" => true]);
    } else {
        die(json_encode(["success" => false, "error" => "No stats to update"]));
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
