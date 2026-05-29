CREATE DATABASE IF NOT EXISTS datasense;
USE datasense;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS datasets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    column_names JSON,
    total_rows INT,
    total_columns INT,
    mime VARCHAR(100),
    size BIGINT,
    is_active TINYINT(1) DEFAULT 0,
    status VARCHAR(32) DEFAULT 'uploaded',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pipelines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dataset_id INT NOT NULL UNIQUE,
    current_step_index INT DEFAULT -1,
    total_steps INT DEFAULT 0,
    status VARCHAR(32) DEFAULT 'idle',
    FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pipeline_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pipeline_id INT NOT NULL,
    step_index INT NOT NULL,
    step_type VARCHAR(64) NOT NULL,
    step_params JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pipeline_id) REFERENCES pipelines(id) ON DELETE CASCADE,
    UNIQUE KEY unique_step (pipeline_id, step_index)
);
