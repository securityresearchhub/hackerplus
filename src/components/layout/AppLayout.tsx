import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export function AppLayout() {
  const location = useLocation();

  // Menu items list mapping label to path
  const menuItems = [
    { label: 'Home', path: '/dashboard', icon: '🏠' },
    { label: 'Academy', path: '/academy', icon: '🎓' },
    { label: 'Labs', path: '/labs', icon: '🧪' },
    { label: 'Challenges', path: '/challenges', icon: '🚩' },
    { label: 'Tools', path: '/tools', icon: '🛠️' },
    { label: 'Notes', path: '/notes', icon: '📝' },
    { label: 'Leaderboard', path: '/leaderboard', icon: '🏆' },
    { label: 'Profile', path: '/profile', icon: '👤' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  // Helper to dynamically set current section title in header
  const getHeaderTitle = () => {
    const current = menuItems.find(item => item.path === location.pathname);
    return current ? current.label : 'HackerPlus';
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <span style={styles.brandPrimary}>HACKER</span>
          <span style={styles.brandAccent}>PLUS</span>
        </div>
        
        <nav style={styles.nav}>
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                style={{
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {})
                }}
              >
                <span style={styles.icon}>{item.icon}</span>
                <span>{item.label}</span>
                {isActive && <div style={styles.activeIndicator} />}
              </Link>
            );
          })}
        </nav>

        <div style={styles.sidebarFooter}>
          <Link to="/" style={styles.logoutLink}>🚪 Logout</Link>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div style={styles.mainArea}>
        {/* Top Header */}
        <header style={styles.header}>
          <h2 style={styles.headerTitle}>{getHeaderTitle()}</h2>
          <div style={styles.userInfo}>
            <span style={styles.userStatus}>● ONLINE</span>
            <div style={styles.avatar}>🐱‍💻</div>
          </div>
        </header>

        {/* Content Viewport */}
        <main style={styles.contentViewport}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#0a0e17',
    color: '#ffffff',
    fontFamily: '"Outfit", "Inter", sans-serif',
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#0f1422',
    borderRight: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'sticky' as const,
    top: 0,
    height: '100vh',
  },
  brand: {
    padding: '24px 20px',
    fontSize: '1.25rem',
    fontWeight: 900,
    letterSpacing: '1.5px',
    borderBottom: '1px solid #1e293b',
  },
  brandPrimary: {
    color: '#00e676',
  },
  brandAccent: {
    color: '#00d4ff',
  },
  nav: {
    flex: 1,
    padding: '20px 12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    color: '#94a3b8',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    position: 'relative' as const,
  },
  navLinkActive: {
    color: '#00e676',
    backgroundColor: 'rgba(0, 230, 118, 0.05)',
  },
  icon: {
    marginRight: '12px',
    fontSize: '1.1rem',
  },
  activeIndicator: {
    position: 'absolute' as const,
    left: 0,
    top: '25%',
    height: '50%',
    width: '3px',
    backgroundColor: '#00e676',
    borderRadius: '0 4px 4px 0',
  },
  sidebarFooter: {
    padding: '20px',
    borderTop: '1px solid #1e293b',
  },
  logoutLink: {
    display: 'flex',
    alignItems: 'center',
    color: '#ef4444',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontFamily: '"JetBrains Mono", monospace',
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    overflow: 'hidden',
  },
  header: {
    height: '70px',
    backgroundColor: '#0f1422',
    borderBottom: '1px solid #1e293b',
    padding: '0 30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    margin: 0,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userStatus: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '0.75rem',
    color: '#00e676',
    letterSpacing: '1px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    border: '1px solid #334155',
  },
  contentViewport: {
    flex: 1,
    padding: '30px',
    overflowY: 'auto' as const,
    backgroundColor: '#0a0e17',
  },
};
