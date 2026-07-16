<?php
session_start();
if (!isset($_SESSION['user'])) {
    header("Location: index.php");
    exit;
}
require_once 'config.php';
$user = $_SESSION['user'];

$flag = "";
$access_granted = false;

if ($user['role'] === 'Administrator') {
    $access_granted = true;
    
    // Fetch flag from the system_secrets table
    $query = "SELECT value FROM system_secrets WHERE name = 'flag'";
    $result = $conn->query($query);
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $flag = $row['value'];
    } else {
        $flag = "hp_flag{error_fetching_flag_record}";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Veloce Digital Systems - System Reports</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <nav class="navbar">
    <div class="nav-brand">Veloce <span>Systems</span></div>
    <ul class="nav-menu">
      <li><a href="dashboard.php" class="nav-link">Dashboard</a></li>
      <li><a href="search.php" class="nav-link">Employee Search</a></li>
      <li><a href="reports.php" class="nav-link active">Reports</a></li>
      <li><a href="profile.php" class="nav-link">Profile</a></li>
      <li><a href="logout.php" class="nav-link logout-link">Logout</a></li>
    </ul>
  </nav>

  <main class="container">
    <div class="panel">
      <h2>Corporate System Reports</h2>
      
      <?php if ($access_granted): ?>
        <p style="color: var(--accent); font-weight: 600; margin-bottom: 1.5rem;">
          ✓ Administrator Credentials Verified. Access Granted.
        </p>

        <div style="background-color: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem;">
          <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">Corporate Integration Secret Flag</h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
            Below is the system security token extracted from the secure database:
          </p>
          <div style="background-color: var(--bg-primary); border: 1px solid var(--border); padding: 1rem; border-radius: 6px; font-family: monospace; font-size: 1.2rem; color: var(--accent); text-align: center; font-weight: bold; letter-spacing: 0.5px;">
            <?php echo htmlspecialchars($flag); ?>
          </div>
        </div>

        <div class="table-wrapper">
          <table style="width: 100%;">
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Classification</th>
                <th>Last Modified</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Q2 Financial Audit.pdf</td>
                <td style="color: #ef4444;">PROPRIETARY</td>
                <td>2026-07-02</td>
                <td><span style="color: var(--accent);">Archived</span></td>
              </tr>
              <tr>
                <td>SCADA Cryptographic Keys.key</td>
                <td style="color: #ef4444;">RESTRICTED</td>
                <td>2026-07-14</td>
                <td><span style="color: var(--accent);">Active</span></td>
              </tr>
              <tr>
                <td>Defense Contract Bid - VDS-2026.docx</td>
                <td style="color: #ef4444;">SECRET</td>
                <td>2026-07-15</td>
                <td><span>Pending Review</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      <?php else: ?>
        <div style="text-align: center; padding: 2rem 0;">
          <div style="color: #ef4444; font-size: 3rem; margin-bottom: 1rem;">⚠</div>
          <h3 style="color: #ef4444; margin-bottom: 0.5rem;">Access Denied</h3>
          <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto;">
            You are authenticated as <strong><?php echo htmlspecialchars($user['full_name']); ?></strong> (<?php echo htmlspecialchars($user['role']); ?>). 
            Access to this directory is strictly restricted to members of the <strong>Administrator</strong> classification role.
          </p>
        </div>
      <?php endif; ?>
    </div>
  </main>
</body>
</html>
