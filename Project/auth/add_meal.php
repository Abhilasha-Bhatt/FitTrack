<?php

header("Content-Type: application/json");

require '../login_page/db.php';

$pdo = getConnection();

$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data['user_id'];
$meal_name = $data['meal_name'];
$meal_type = $data['meal_type'];
$calories = $data['calories'];
$protein = $data['protein'];
$carbs = $data['carbs'];
$fats = $data['fats'];
$meal_time = $data['meal_time'];

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
INSERT INTO meals
(user_id, meal_name, meal_type, calories, protein, carbs, fats, meal_time)
VALUES
(?, ?, ?, ?, ?, ?, ?, ?)
";

$stmt = $pdo->prepare($sql);

$result = $stmt->execute([
    $user_id,
    $meal_name,
    $meal_type,
    $calories,
    $protein,
    $carbs,
    $fats,
    $meal_time
]);

if ($result) {

    echo json_encode([
        "success" => true,
        "message" => "Meal added successfully"
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Database error"
    ]);
}
?>