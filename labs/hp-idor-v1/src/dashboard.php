<?php
session_start();
if (!isset($_SESSION['employee'])) {
    header('Location: index.php');
    exit;
}
require_once 'config.php';

$emp = $_SESSION['employee'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Veloce Systems — Dashboard</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <nav class="navbar">
    <div class="nav-brand">Veloce <span>Systems</span></div>
    <ul class="nav-menu">
      <li><a href="dashboard.php" class="nav-link active">Dashboard</a></li>
      <li><a href="profile.php?id=<?php echo $emp['id']; ?>" class="nav-link">My Profile</a></li>
      <li><a href="documents.php?id=<?php echo $emp['id']; ?>" class="nav-link">Documents</a></li>
      <li><a href="payslips.php?id=<?php echo $emp['id']; ?>" class="nav-link">Payslips</a></li>
      <li><a href="logout.php" class="nav-link logout-link">Logout</a></li>
    </ul>
  </nav>

  <main class="container">

    <div class="welcome-banner">
      <div>
        <div class="welcome-tag">EMPLOYEE PORTAL</div>
        <h2>Welcome back, <?php echo htmlspecialchars($emp['full_name']); ?></h2>
        <p><?php echo htmlspecialchars($emp['job_title']); ?> &middot; <?php echo htmlspecialchars($emp['department']); ?></p>
      </div>
      <div class="employee-id-badge">
        <span class="id-label">EMPLOYEE ID</span>
        <span class="id-value"><?php echo $emp['id']; ?></span>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="panel">
        <h3>My Information</h3>
        <table class="info-table">
          <tr><td class="info-label">Full Name</td><td><?php echo htmlspecialchars($emp['full_name']); ?></td></tr>
          <tr><td class="info-label">Department</td><td><?php echo htmlspecialchars($emp['department']); ?></td></tr>
          <tr><td class="info-label">Job Title</td><td><?php echo htmlspecialchars($emp['job_title']); ?></td></tr>
          <tr><td class="info-label">Email</td><td><?php echo htmlspecialchars($emp['email']); ?></td></tr>
          <tr><td class="info-label">Employee ID</td><td><strong style="color:var(--accent);"><?php echo $emp['id']; ?></strong></td></tr>
          <tr><td class="info-label">Role</td><td><?php echo htmlspecialchars($emp['role']); ?></td></tr>
        </table>
      </div>

      <div class="panel">
        <h3>Quick Access</h3>
        <div class="quick-links">
          <a href="profile.php?id=<?php echo $emp['id']; ?>" class="quick-link-card">
            <div class="quick-link-icon">👤</div>
            <div>
              <div class="quick-link-title">My Profile</div>
              <div class="quick-link-sub">View your employee record</div>
            </div>
          </a>
          <a href="documents.php?id=<?php echo $emp['id']; ?>" class="quick-link-card">
            <div class="quick-link-icon">📄</div>
            <div>
              <div class="quick-link-title">My Documents</div>
              <div class="quick-link-sub">View HR documents</div>
            </div>
          </a>
          <a href="payslips.php?id=<?php echo $emp['id']; ?>" class="quick-link-card">
            <div class="quick-link-icon">💰</div>
            <div>
              <div class="quick-link-title">Payslips</div>
              <div class="quick-link-sub">View salary statements</div>
            </div>
          </a>
        </div>
      </div>
    </div>

  </main>
</body>
</html>
