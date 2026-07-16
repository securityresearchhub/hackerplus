<?php
session_start();
if (!isset($_SESSION['employee'])) {
    header('Location: index.php');
    exit;
}
require_once 'config.php';

$current_emp = $_SESSION['employee'];

// ⚠ IDOR VULNERABILITY — No authorization check on the ?id parameter.
// Any authenticated employee can view any other employee's payslips.
$requested_id = isset($_GET['id']) ? intval($_GET['id']) : $current_emp['id'];

// Fetch owner name
$stmt = $conn->prepare("SELECT full_name FROM employees WHERE id = ?");
$stmt->bind_param('i', $requested_id);
$stmt->execute();
$owner_res = $stmt->get_result();
$owner = $owner_res ? $owner_res->fetch_assoc() : null;
$stmt->close();

// Fetch payslips
$stmt2 = $conn->prepare("SELECT * FROM payslips WHERE employee_id = ? ORDER BY issued_date DESC");
$stmt2->bind_param('i', $requested_id);
$stmt2->execute();
$payslip_res = $stmt2->get_result();
$payslips = [];
while ($row = $payslip_res->fetch_assoc()) {
    $payslips[] = $row;
}
$stmt2->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Veloce Systems — Payslips</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <nav class="navbar">
    <div class="nav-brand">Veloce <span>Systems</span></div>
    <ul class="nav-menu">
      <li><a href="dashboard.php" class="nav-link">Dashboard</a></li>
      <li><a href="profile.php?id=<?php echo $current_emp['id']; ?>" class="nav-link">My Profile</a></li>
      <li><a href="documents.php?id=<?php echo $current_emp['id']; ?>" class="nav-link">Documents</a></li>
      <li><a href="payslips.php?id=<?php echo $current_emp['id']; ?>" class="nav-link active">Payslips</a></li>
      <li><a href="logout.php" class="nav-link logout-link">Logout</a></li>
    </ul>
  </nav>

  <main class="container">
    <div class="panel">
      <div class="panel-header">
        <h2>Payslip Records</h2>
        <?php if ($owner): ?>
          <span class="panel-sub">
            Employee: <strong><?php echo htmlspecialchars($owner['full_name']); ?></strong>
            &nbsp;(ID: <?php echo $requested_id; ?>)
          </span>
        <?php endif; ?>
      </div>

      <?php if (empty($payslips)): ?>
        <div class="empty-state">
          <div class="empty-icon">💰</div>
          <h3>No Payslips Found</h3>
          <p>No payslip records available for this employee.</p>
        </div>
      <?php else: ?>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Gross Salary</th>
                <th>Net Salary</th>
                <th>Issued Date</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($payslips as $slip): ?>
                <tr>
                  <td><?php echo htmlspecialchars($slip['month']); ?></td>
                  <td style="color: var(--accent);">$<?php echo number_format($slip['gross_salary'], 2); ?></td>
                  <td>$<?php echo number_format($slip['net_salary'], 2); ?></td>
                  <td><?php echo htmlspecialchars($slip['issued_date']); ?></td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      <?php endif; ?>
    </div>
  </main>
</body>
</html>
