<?php
require_once __DIR__ . '/../login_page/db.php';

try {
    $pdo = getConnection();
} catch (PDOException $e) {
    die(json_encode(["success" => false, "error" => $e->getMessage()]));
}


$email = $_GET['email'];

$sql = "SELECT * FROM users WHERE email=?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$email]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if ($row) {
    echo json_encode([
        "success" => true,
        "user" => $row
    ]);
} else {
    echo json_encode(["success" => false]);
}

?>