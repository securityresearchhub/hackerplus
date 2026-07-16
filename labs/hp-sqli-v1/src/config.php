<?php
// Veloce Digital Systems - Database Configuration
$db_host = 'localhost';
$db_user = 'veloce_app';
$db_pass = 'V3loce_S3cure_P@ss!';
$db_name = 'veloce_systems';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
