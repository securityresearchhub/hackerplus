<?php
session_start();
if (!isset($_SESSION['employee'])) {
    header('Location: index.php');
    exit;
}
require_once 'config.php';

$current_emp = $_SESSION['employee'];

// ⚠ IDOR VULNERABILITY — No authorization check on the ?id parameter.
// The application fetches ANY employee record based on the user-supplied ID.
// A logged-in employee can view any other employee's profile by changing the id parameter.
$requested_id = isset($_GET['id']) ? intval($_GET['id']) : $current_emp['id'];

$stmt = $conn->prepare("SELECT * FROM employees WHERE id = ?");
$stmt->bind_param('i', $requested_id);
$stmt->execute();
$result = $stmt->get_result();
$profile = $result ? $result->fetch_assoc() : null;
$stmt->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Veloce Systems — Employee Profile</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <nav class="navbar">
    <div class="nav-brand">Veloce <span>Systems</span></div>
    <ul class="nav-menu">
      <li><a href="dashboard.php" class="nav-link">Dashboard</a></li>
      <li><a href="profile.php?id=<?php echo $current_emp['id']; ?>" class="nav-link active">My Profile</a></li>
      <li><a href="documents.php?id=<?php echo $current_emp['id']; ?>" class="nav-link">Documents</a></li>
      <li><a href="payslips.php?id=<?php echo $current_emp['id']; ?>" class="nav-link">Payslips</a></li>
      <li><a href="logout.php" class="nav-link logout-link">Logout</a></li>
    </ul>
  </nav>

  <main class="container">
    <div class="panel">
      <h2>Employee Profile</h2>

      <?php if ($profile): ?>
        <div class="profile-header">
          <div class="profile-avatar"><?php echo strtoupper(substr($profile['full_name'], 0, 1)); ?></div>
          <div>
            <h3 class="profile-name"><?php echo htmlspecialchars($profile['full_name']); ?></h3>
            <p class="profile-meta"><?php echo htmlspecialchars($profile['job_title']); ?> &middot; <?php echo htmlspecialchars($profile['department']); ?></p>
            <span class="role-badge role-<?php echo strtolower($profile['role']); ?>"><?php echo htmlspecialchars($profile['role']); ?></span>
          </div>
        </div>

        <div class="profile-grid">
          <div class="profile-field">
            <span class="field-label">EMPLOYEE ID</span>
            <span class="field-value accent"><?php echo $profile['id']; ?></span>
          </div>
          <div class="profile-field">
            <span class="field-label">FULL NAME</span>
            <span class="field-value"><?php echo htmlspecialchars($profile['full_name']); ?></span>
          </div>
          <div class="profile-field">
            <span class="field-label">EMAIL ADDRESS</span>
            <span class="field-value"><?php echo htmlspecialchars($profile['email']); ?></span>
          </div>
          <div class="profile-field">
            <span class="field-label">PHONE</span>
            <span class="field-value"><?php echo htmlspecialchars($profile['phone']); ?></span>
          </div>
          <div class="profile-field">
            <span class="field-label">DEPARTMENT</span>
            <span class="field-value"><?php echo htmlspecialchars($profile['department']); ?></span>
          </div>
          <div class="profile-field">
            <span class="field-label">JOB TITLE</span>
            <span class="field-value"><?php echo htmlspecialchars($profile['job_title']); ?></span>
          </div>
          <div class="profile-field">
            <span class="field-label">HIRE DATE</span>
            <span class="field-value"><?php echo htmlspecialchars($profile['hire_date']); ?></span>
          </div>
          <div class="profile-field">
            <span class="field-label">ANNUAL SALARY</span>
            <span class="field-value">$<?php echo number_format($profile['salary'], 2); ?></span>
          </div>
        </div>

        <div class="profile-actions">
          <a href="documents.php?id=<?php echo $profile['id']; ?>" class="btn btn-secondary">View Documents</a>
          <a href="payslips.php?id=<?php echo $profile['id']; ?>" class="btn btn-secondary">View Payslips</a>
        </div>

      <?php else: ?>
        <div class="empty-state">
          <div class="empty-icon">⚠</div>
          <h3>Employee Not Found</h3>
          <p>No employee record found for the requested ID.</p>
          <a href="dashboard.php" class="btn">Return to Dashboard</a>
        </div>
      <?php endif; ?>
    </div>
  </main>
</body>
</html>
