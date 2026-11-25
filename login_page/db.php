<?php

function getConnection() {
    $host = '127.0.0.1';
    $db   = 'fittrack';
    $user = 'root';
    $pass = '';
    $charset = 'utf8mb4';

    $dsnNoDb = "mysql:host=$host;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    $pdo = new PDO($dsnNoDb, $user, $pass, $options);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $pdo = new PDO($dsn, $user, $pass, $options);
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS `users` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `name` VARCHAR(120) NOT NULL,
            `email` VARCHAR(120) NOT NULL UNIQUE,
            `password` VARCHAR(255) NOT NULL,
            `goal` VARCHAR(255) DEFAULT '',
            `age` TINYINT UNSIGNED DEFAULT NULL,
            `gender` VARCHAR(30) DEFAULT NULL,
            `height_cm` SMALLINT UNSIGNED DEFAULT NULL,
            `weight_kg` SMALLINT UNSIGNED DEFAULT NULL,
            `target_weight_kg` SMALLINT UNSIGNED DEFAULT NULL,
            `activity_level` VARCHAR(60) DEFAULT NULL,
            `medications` VARCHAR(20) DEFAULT NULL,
            `medication_details` TEXT DEFAULT NULL,
            `conditions` TEXT DEFAULT NULL,
            `diet` VARCHAR(80) DEFAULT NULL,
            `water_intake` TINYINT UNSIGNED DEFAULT NULL,
            `sleep_hours` FLOAT DEFAULT NULL,
            `steps` INT UNSIGNED DEFAULT NULL,
            `preferences` TEXT DEFAULT NULL,
            `workout_time` VARCHAR(60) DEFAULT NULL,
            `workout_days` TINYINT UNSIGNED DEFAULT NULL,
            `session_duration` VARCHAR(40) DEFAULT NULL,
            `fitness_level` VARCHAR(40) DEFAULT NULL,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
    );

    // Backward compatibility for existing tables
    $columns = [
        'age' => 'TINYINT UNSIGNED DEFAULT NULL',
        'gender' => 'VARCHAR(30) DEFAULT NULL',
        'height_cm' => 'SMALLINT UNSIGNED DEFAULT NULL',
        'weight_kg' => 'SMALLINT UNSIGNED DEFAULT NULL',
        'target_weight_kg' => 'SMALLINT UNSIGNED DEFAULT NULL',
        'activity_level' => 'VARCHAR(60) DEFAULT NULL',
        'medications' => 'VARCHAR(20) DEFAULT NULL',
        'medication_details' => 'TEXT DEFAULT NULL',
        'conditions' => 'TEXT DEFAULT NULL',
        'diet' => 'VARCHAR(80) DEFAULT NULL',
        'water_intake' => 'TINYINT UNSIGNED DEFAULT NULL',
        'sleep_hours' => 'FLOAT DEFAULT NULL',
        'steps' => 'INT UNSIGNED DEFAULT NULL',
        'preferences' => 'TEXT DEFAULT NULL',
        'workout_time' => 'VARCHAR(60) DEFAULT NULL',
        'workout_days' => 'TINYINT UNSIGNED DEFAULT NULL',
        'session_duration' => 'VARCHAR(40) DEFAULT NULL',
        'fitness_level' => 'VARCHAR(40) DEFAULT NULL'
    ];

    foreach ($columns as $col => $definition) {
        try {
            $pdo->exec("ALTER TABLE `users` ADD `$col` $definition");
        } catch (PDOException $e) {
            // Probably column already exists, safe to ignore
        }
    }


    return $pdo;
}
