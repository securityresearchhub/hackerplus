<?php
session_start();
require_once 'config.php';

// Already logged in
if (isset($_SESSION['employee'])) {
    header('Location: dashboard.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = isset($_POST['username']) ? trim($_POST['username']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    // SECURE login — uses prepared statements (login is NOT the vulnerability here)
    $stmt = $conn->prepare("SELECT * FROM employees WHERE username = ? AND password = ?");
    $stmt->bind_param('ss', $username, $password);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows > 0) {
        $employee = $result->fetch_assoc();
        $_SESSION['employee'] = $employee;
        header('Location: dashboard.php');
        exit;
    } else {
        $error = 'Invalid credentials. Access denied.';
    }
    $stmt->close();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Veloce Digital Systems — HR Portal</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-logo">
        <h1>Veloce <span>Systems</span></h1>
        <p class="login-subtitle">HR Employee Portal</p>
      </div>

      <?php if (!empty($error)): ?>
        <div class="error-msg"><?php echo htmlspecialchars($error); ?></div>
      <?php endif; ?>

      <form action="index.php" method="POST">
        <div class="form-group">
          <label for="username">Employee Username</label>
          <input type="text" id="username" name="username" class="form-control"
                 placeholder="e.g. jsmith" required autofocus
                 value="<?php echo isset($_POST['username']) ? htmlspecialchars($_POST['username']) : ''; ?>">
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" class="form-control"
                 placeholder="••••••••" required>
        </div>
        <button type="submit" class="btn">Authenticate</button>
      </form>

      <div class="guest-access">
        <p>Guest access enabled for system testing:</p>
        <p><strong>Username:</strong> jsmith &nbsp;|&nbsp; <strong>Password:</strong> password123</p>
      </div>
    </div>
  </div>
</body>
</html>
