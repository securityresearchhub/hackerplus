<?php
session_start();
require_once 'config.php';

// If already logged in, go to dashboard
if (isset($_SESSION['user'])) {
    header("Location: dashboard.php");
    exit;
}

$error = "";
$debug_query = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = isset($_POST['username']) ? $_POST['username'] : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    // Vulnerable SQL query construction
    $query = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";
    $debug_query = $query; // Helpful for learning/debugging SQL Injection

    $result = $conn->query($query);

    if ($result) {
        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            $_SESSION['user'] = $user;
            header("Location: dashboard.php");
            exit;
        } else {
            $error = "Invalid credential combinations. Access denied.";
        }
    } else {
        // Show SQL query error to help students debug their injections
        $error = "Database Error: " . $conn->error . "<br><small>Executed Query: <code>" . htmlspecialchars($query) . "</code></small>";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Veloce Digital Systems - Corporate Authentication</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-logo">
        <h1>Veloce <span>Systems</span></h1>
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.25rem;">Internal Gateway Portal</p>
      </div>

      <?php if (!empty($error)): ?>
        <div class="error-msg">
          <?php echo $error; ?>
        </div>
      <?php endif; ?>

      <form action="index.php" method="POST">
        <div class="form-group">
          <label for="username">User Callsign / Email</label>
          <input type="text" id="username" name="username" class="form-control" placeholder="e.g. admin" required autofocus>
        </div>
        <div class="form-group">
          <label for="password">Security Password</label>
          <input type="password" id="password" name="password" class="form-control" placeholder="••••••••" required>
        </div>
        <button type="submit" class="btn">Authenticate</button>
      </form>
    </div>
  </div>
</body>
</html>
