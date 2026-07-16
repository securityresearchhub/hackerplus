<?php
session_start();
if (!isset($_SESSION['user'])) {
    header("Location: index.php");
    exit;
}
require_once 'config.php';

$search = isset($_GET['q']) ? $_GET['q'] : '';
$employees = [];

// Secure search query using prepared statements - enforces ONLY ONE vulnerability rule
if ($search !== '') {
    $stmt = $conn->prepare("SELECT name, department, role, email FROM employees WHERE name LIKE ? OR department LIKE ?");
    $searchTerm = '%' . $search . '%';
    $stmt->bind_param("ss", $searchTerm, $searchTerm);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $employees[] = $row;
    }
    $stmt->close();
} else {
    // Show all employees by default
    $result = $conn->query("SELECT name, department, role, email FROM employees");
    while ($row = $result->fetch_assoc()) {
        $employees[] = $row;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Veloce Digital Systems - Employee Directory</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <nav class="navbar">
    <div class="nav-brand">Veloce <span>Systems</span></div>
    <ul class="nav-menu">
      <li><a href="dashboard.php" class="nav-link">Dashboard</a></li>
      <li><a href="search.php" class="nav-link active">Employee Search</a></li>
      <li><a href="reports.php" class="nav-link">Reports</a></li>
      <li><a href="profile.php" class="nav-link">Profile</a></li>
      <li><a href="logout.php" class="nav-link logout-link">Logout</a></li>
    </ul>
  </nav>

  <main class="container">
    <div class="panel">
      <h2>Employee Directory Search</h2>
      <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
        Query the active staff directory by employee name or department.
      </p>

      <form action="search.php" method="GET" class="search-box">
        <input type="text" name="q" class="form-control" placeholder="Search by name or department..." value="<?php echo htmlspecialchars($search); ?>">
        <button type="submit" class="btn">Search</button>
      </form>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Department</th>
              <th>System Role</th>
              <th>Contact Email</th>
            </tr>
          </thead>
          <tbody>
            <?php if (count($employees) > 0): ?>
              <?php foreach ($employees as $emp): ?>
                <tr>
                  <td><strong><?php echo htmlspecialchars($emp['name']); ?></strong></td>
                  <td><?php echo htmlspecialchars($emp['department']); ?></td>
                  <td><?php echo htmlspecialchars($emp['role']); ?></td>
                  <td><code><?php echo htmlspecialchars($emp['email']); ?></code></td>
                </tr>
              <?php endforeach; ?>
            <?php else: ?>
              <tr>
                <td colspan="4" style="text-align: center; color: var(--text-secondary);">No employee records matched your query.</td>
              </tr>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</body>
</html>
