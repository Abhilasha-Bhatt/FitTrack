<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../login_page/db.php';

try {
    $pdo = getConnection();
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database connection failed."]);
    exit;
}

$email = strtolower(trim($_GET['email'] ?? ''));
if (!$email) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Email is required."]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        unset($row['password']);
        echo json_encode([
            "success" => true,
            "user" => $row
        ]);
    } else {
        echo json_encode(["success" => false, "error" => "User not found."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database error."]);
}
?>