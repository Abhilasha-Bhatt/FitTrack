<?php

header("Content-Type: application/json");

require '../login_page/db.php';

$pdo = getConnection();

$user_id = $_GET['user_id'];

$pdo->exec("
CREATE TABLE IF NOT EXISTS meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    meal_name VARCHAR(255) NOT NULL,
    meal_type VARCHAR(100),
    calories INT,
    protein VARCHAR(50),
    carbs VARCHAR(50),
    fats VARCHAR(50),
    meal_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
");

$sql = "
SELECT * FROM meals
WHERE user_id = ?
ORDER BY created_at DESC
";

$stmt = $pdo->prepare($sql);

$stmt->execute([$user_id]);

$meals = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($meals);

?>