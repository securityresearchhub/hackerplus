<?php
session_start();
if (!isset($_SESSION['user'])) {
    header("Location: index.php");
    exit;
}
$user = $_SESSION['user'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Veloce Digital Systems - User Profile</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <nav class="navbar">
    <div class="nav-brand">Veloce <span>Systems</span></div>
    <ul class="nav-menu">
      <li><a href="dashboard.php" class="nav-link">Dashboard</a></li>
      <li><a href="search.php" class="nav-link">Employee Search</a></li>
      <li><a href="reports.php" class="nav-link">Reports</a></li>
      <li><a href="profile.php" class="nav-link active">Profile</a></li>
      <li><a href="logout.php" class="nav-link logout-link">Logout</a></li>
    </ul>
  </nav>

  <main class="container">
    <div class="panel">
      <h2>VDS Account Profile</h2>
      <p style="color: var(--text-secondary); margin-bottom: 2rem;">
        Your system identity credentials and security classification.
      </p>

      <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
        <div style="width: 120px; height: 120px; background-color: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: bold; color: var(--accent);">
          <?php echo strtoupper(substr($user['username'], 0, 2)); ?>
        </div>

        <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center; gap: 0.75rem;">
          <div>
            <label style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">Full Name</label>
            <p style="font-size: 1.25rem; font-weight: bold;"><?php echo htmlspecialchars($user['full_name']); ?></p>
          </div>
          <div>
            <label style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">User Callsign</label>
            <p style="font-family: monospace; font-size: 1rem; color: var(--accent);">@<?php echo htmlspecialchars($user['username']); ?></p>
          </div>
          <div>
            <label style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">Corporate Email</label>
            <p><?php echo htmlspecialchars($user['email']); ?></p>
          </div>
          <div>
            <label style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">Security Role Class</label>
            <p><strong><?php echo htmlspecialchars($user['role']); ?></strong></p>
          </div>
        </div>
      </div>
    </div>
  </main>
</body>
</html>
