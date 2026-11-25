<?php
header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid request body.']);
    exit;
}

$name = trim($input['name'] ?? '');
$email = strtolower(trim($input['email'] ?? ''));
$password = $input['password'] ?? '';
$goal = trim($input['goal'] ?? '');

if (!$name || !$email || strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Name, valid email, and password of at least 6 characters are required.']);
    exit;
}

try {
    $pdo = getConnection();
    $stmt = $pdo->prepare('SELECT id FROM `users` WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'error' => 'This email is already registered.']);
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $insert = $pdo->prepare('INSERT INTO `users` (`name`, `email`, `password`, `goal`) VALUES (?, ?, ?, ?)');
    $insert->execute([$name, $email, $hash, $goal]);
    $userId = $pdo->lastInsertId();

    echo json_encode(['success' => true, 'user' => ['id' => $userId, 'name' => $name, 'email' => $email, 'goal' => $goal]]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
