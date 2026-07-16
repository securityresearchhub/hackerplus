<?php
session_start();
if (!isset($_SESSION['employee'])) {
    header('Location: index.php');
    exit;
}
require_once 'config.php';

$current_emp = $_SESSION['employee'];

// ⚠ IDOR VULNERABILITY — No authorization check on the ?id parameter.
// Fetches documents for ANY employee_id supplied in the URL.
// Admin's document (employee_id=1) contains the dynamic HP_FLAG.
$requested_id = isset($_GET['id']) ? intval($_GET['id']) : $current_emp['id'];

// Fetch the owner's name for display
$stmt = $conn->prepare("SELECT full_name, role FROM employees WHERE id = ?");
$stmt->bind_param('i', $requested_id);
$stmt->execute();
$owner_result = $stmt->get_result();
$owner = $owner_result ? $owner_result->fetch_assoc() : null;
$stmt->close();

// Fetch all documents for that employee_id
$stmt2 = $conn->prepare("SELECT * FROM documents WHERE employee_id = ? ORDER BY created_at DESC");
$stmt2->bind_param('i', $requested_id);
$stmt2->execute();
$docs_result = $stmt2->get_result();
$documents = [];
while ($row = $docs_result->fetch_assoc()) {
    $documents[] = $row;
}
$stmt2->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Veloce Systems — Documents</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <nav class="navbar">
    <div class="nav-brand">Veloce <span>Systems</span></div>
    <ul class="nav-menu">
      <li><a href="dashboard.php" class="nav-link">Dashboard</a></li>
      <li><a href="profile.php?id=<?php echo $current_emp['id']; ?>" class="nav-link">My Profile</a></li>
      <li><a href="documents.php?id=<?php echo $current_emp['id']; ?>" class="nav-link active">Documents</a></li>
      <li><a href="payslips.php?id=<?php echo $current_emp['id']; ?>" class="nav-link">Payslips</a></li>
      <li><a href="logout.php" class="nav-link logout-link">Logout</a></li>
    </ul>
  </nav>

  <main class="container">
    <div class="panel">
      <div class="panel-header">
        <h2>HR Documents</h2>
        <?php if ($owner): ?>
          <span class="panel-sub">
            Employee: <strong><?php echo htmlspecialchars($owner['full_name']); ?></strong>
            &nbsp;(ID: <?php echo $requested_id; ?>)
          </span>
        <?php endif; ?>
      </div>

      <?php if (empty($documents)): ?>
        <div class="empty-state">
          <div class="empty-icon">📁</div>
          <h3>No Documents</h3>
          <p>No documents found for this employee record.</p>
        </div>
      <?php else: ?>
        <div class="doc-list">
          <?php foreach ($documents as $doc): ?>
            <div class="doc-card <?php echo strtolower($doc['classification']); ?>">
              <div class="doc-header">
                <div class="doc-icon">📄</div>
                <div class="doc-meta">
                  <div class="doc-title"><?php echo htmlspecialchars($doc['title']); ?></div>
                  <div class="doc-info">
                    <span class="classification-badge classif-<?php echo strtolower($doc['classification']); ?>">
                      <?php echo htmlspecialchars($doc['classification']); ?>
                    </span>
                    <span class="doc-date"><?php echo htmlspecialchars($doc['created_at']); ?></span>
                  </div>
                </div>
              </div>
              <div class="doc-content">
                <?php echo nl2br(htmlspecialchars($doc['content'])); ?>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
    </div>
  </main>
</body>
</html>
