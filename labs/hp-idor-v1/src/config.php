<?php
/**
 * config.php — Database connection for hp-idor-v1
 * Veloce Digital Systems HR Employee Portal
 */

define('DB_HOST', 'localhost');
define('DB_USER', 'veloce_hr_app');
define('DB_PASS', 'V3loce_HR_S3cur3!');
define('DB_NAME', 'veloce_hr');

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    // Graceful error — do not expose connection details
    die('<div style="font-family:monospace;color:#ef4444;padding:2rem;">⚠ Database connection failed. Contact systems administrator.</div>');
}

$conn->set_charset('utf8mb4');
