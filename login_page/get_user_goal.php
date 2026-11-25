<?php
header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

$email = isset($_GET['email']) ? strtolower(trim($_GET['email'])) : '';

if (!$email) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Email parameter is required.']);
    exit;
}

try {
    $pdo = getConnection();
    $stmt = $pdo->prepare('SELECT goal FROM `users` WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo json_encode(['success' => true, 'goal' => $user['goal'] ?? 'stay active']);
    } else {
        echo json_encode(['success' => false, 'error' => 'User not found.']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
