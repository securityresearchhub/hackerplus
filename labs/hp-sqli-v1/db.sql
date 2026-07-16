-- Create Veloce Digital Systems Database
CREATE DATABASE IF NOT EXISTS veloce_systems;
USE veloce_systems;

-- Create Users Table (for login portal)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL
);

-- Populate Users (CEO, IT Admin, CFO, HR)
-- Passwords are set to random long hashes so they are impossible to guess/bruteforce, enforcing SQLi
INSERT INTO users (username, password, full_name, role, email) VALUES
('admin', 'f49b14c3e8bc803e0708f5127ef6b39d1b64ffccae7cfefcfcbcfcffcf44445b', 'Marcus Vance', 'Administrator', 'm.vance@velocedigital.com'),
('ceo', 'cb8e0789bc55452d00130dbd5f81e8b233a59fe51dfefef49ab9efb8efb489a2', 'Helena Rostova', 'Chief Executive Officer', 'h.rostova@velocedigital.com'),
('cfo', '91a789efdc890203f13904fd893efd93a7c8efb9daefcfbcda3e2c3daef92381', 'David Krenshaw', 'Chief Financial Officer', 'd.krenshaw@velocedigital.com'),
('hr', 'aa1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b', 'Sarah Jenkins', 'HR Director', 's.jenkins@velocedigital.com');

-- Create Employees Table (for the directory search)
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL
);

-- Populate Employees Directory
INSERT INTO employees (name, department, role, email) VALUES
('Helena Rostova', 'Executive', 'Chief Executive Officer', 'h.rostova@velocedigital.com'),
('Marcus Vance', 'IT & Security', 'Director of Systems Administration', 'm.vance@velocedigital.com'),
('David Krenshaw', 'Finance', 'Chief Financial Officer', 'd.krenshaw@velocedigital.com'),
('Sarah Jenkins', 'Human Resources', 'HR Director', 's.jenkins@velocedigital.com'),
('Devon Miller', 'Engineering', 'Senior Cryptographer', 'd.miller@velocedigital.com'),
('Anya Chen', 'Engineering', 'SCADA Security Lead', 'a.chen@velocedigital.com'),
('Robert Kincaid', 'Operations', 'Chief Operations Officer', 'r.kincaid@velocedigital.com'),
('Emma Watson', 'Legal', 'General Counsel', 'e.watson@velocedigital.com'),
('Lucas Bennett', 'IT & Security', 'Network Engineer', 'l.bennett@velocedigital.com');

-- Create System Secrets Table (contains the flag)
CREATE TABLE IF NOT EXISTS system_secrets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    value VARCHAR(255) NOT NULL
);

-- Seed placeholder flag value (updated dynamically by entrypoint.sh)
INSERT INTO system_secrets (name, value) VALUES
('flag', 'hp_flag{placeholder_flag_value_to_be_replaced}');
