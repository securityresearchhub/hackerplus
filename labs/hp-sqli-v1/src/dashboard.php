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
  <title>Veloce Digital Systems - Dashboard</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <nav class="navbar">
    <div class="nav-brand">Veloce <span>Systems</span></div>
    <ul class="nav-menu">
      <li><a href="dashboard.php" class="nav-link active">Dashboard</a></li>
      <li><a href="search.php" class="nav-link">Employee Search</a></li>
      <li><a href="reports.php" class="nav-link">Reports</a></li>
      <li><a href="profile.php" class="nav-link">Profile</a></li>
      <li><a href="logout.php" class="nav-link logout-link">Logout</a></li>
    </ul>
  </nav>

  <main class="container">
    <div class="panel">
      <h2>Welcome back, <?php echo htmlspecialchars($user['full_name']); ?>!</h2>
      <p style="color: var(--text-secondary);">
        Role classification: <strong><?php echo htmlspecialchars($user['role']); ?></strong> | Registered Email: <?php echo htmlspecialchars($user['email']); ?>
      </p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-val">9</div>
        <div class="stat-label">Employees Active</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">12</div>
        <div class="stat-label">Secure Subnets</div>
      </div>
      <div class="stat-card">
        <div class="stat-val" style="color: #ef4444;">ELEVATED</div>
        <div class="stat-label">Threat Condition</div>
      </div>
    </div>

    <div class="panel">
      <h3>System Bulletins</h3>
      <div style="margin-top: 1rem; border-left: 3px solid var(--accent); padding-left: 1rem;">
        <p style="font-weight: 600; font-size: 0.95rem;">SCADA Network Audit Scheduled</p>
        <p style="color: var(--text-secondary); font-size: 0.875rem;">
          Systems administration team will conduct a security audit on VDS SCADA controllers starting Friday 22:00 UTC. Ensure backups are synced.
        </p>
      </div>
      <div style="margin-top: 1.5rem; border-left: 3px solid var(--text-secondary); padding-left: 1rem;">
        <p style="font-weight: 600; font-size: 0.95rem;">Password Policy Reminder</p>
        <p style="color: var(--text-secondary); font-size: 0.875rem;">
          In accordance with VDS Security Directive 450, all employee passwords must consist of at least 16 characters and pass entropy checks.
        </p>
      </div>
    </div>
  </main>
</body>
</html>
