<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../login_page/db.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid request body.']);
    exit;
}

$email = strtolower(trim($input['email'] ?? ''));
if (!$email) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Email is required.']);
    exit;
}

try {
    $pdo = getConnection();
    $stmt = $pdo->prepare('SELECT id FROM `users` WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(['success' => false, 'error' => 'User not found.']);
        exit;
    }

    $update = $pdo->prepare(
        'UPDATE `users` SET
            age = ?,
            gender = ?,
            height_cm = ?,
            weight_kg = ?,
            target_weight_kg = ?,
            activity_level = ?,
            medications = ?,
            medication_details = ?,
            conditions = ?,
            diet = ?,
            water_intake = ?,
            preferences = ?,
            workout_time = ?,
            workout_days = ?,
            session_duration = ?,
            fitness_level = ?
        WHERE email = ?'
    );

    $update->execute([
        $input['age'] ?? null,
        $input['gender'] ?? null,
        $input['height'] ?? null,
        $input['weight'] ?? null,
        $input['target_weight'] ?? null,
        $input['activity_level'] ?? null,
        $input['medications'] ?? null,
        $input['medication_details'] ?? null,
        $input['conditions'] ?? null,
        $input['diet'] ?? null,
        $input['water'] ?? null,
        isset($input['preferences']) ? json_encode($input['preferences']) : null,
        $input['workout_time'] ?? null,
        $input['workout_days'] ?? null,
        $input['session_duration'] ?? null,
        $input['fitness_level'] ?? null,
        $email,
    ]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
