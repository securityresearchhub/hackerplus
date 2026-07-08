import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';

// Placeholder Pages
function SplashPage() {
  return (
    <div style={styles.fullscreenPage}>
      <h1 style={{ color: '#00e676', fontSize: '3.5rem', marginBottom: '10px' }}>HackerPlus</h1>
      <p style={{ color: '#90a4ae', fontSize: '1.2rem', marginBottom: '30px' }}>Cybersecurity Learning Platform</p>
      <div style={styles.navLinks}>
        <Link to="/login" style={styles.link}>Go to Login</Link>
        <Link to="/dashboard" style={styles.link}>Go to Console</Link>
      </div>
    </div>
  );
}

function LoginPage() {
  return (
    <div style={styles.fullscreenPage}>
      <h2 style={{ marginBottom: '20px' }}>Sign In to HackerPlus</h2>
      <Link to="/dashboard" style={styles.link}>Access Dashboard (Mock Login)</Link>
    </div>
  );
}

// Inner Pages wrapped by AppLayout
function DashboardPage() {
  return (
    <div style={styles.innerPage}>
      <h3>Console Dashboard</h3>
      <p style={styles.text}>Welcome back, operative. Complete your daily challenges and browse the academy catalog to begin your training sessions.</p>
    </div>
  );
}

function AcademyPage() {
  return (
    <div style={styles.innerPage}>
      <h3>Academy Catalog</h3>
      <p style={styles.text}>Select a path to build your skills in penetration testing, malware analysis, or web application hacking.</p>
    </div>
  );
}

function LabsPage() {
  return (
    <div style={styles.innerPage}>
      <h3>Sandboxed Labs</h3>
      <p style={styles.text}>Deploy active containers and run real-world vulnerability checks in isolated, browser-based terminals.</p>
    </div>
  );
}

function ChallengesPage() {
  return (
    <div style={styles.innerPage}>
      <h3>CTF Challenges</h3>
      <p style={styles.text}>Capture the Flag points by analyzing and cracking targets across various difficulty brackets.</p>
    </div>
  );
}

function ToolsPage() {
  return (
    <div style={styles.innerPage}>
      <h3>Hacking Toolkit</h3>
      <p style={styles.text}>Access pre-configured terminal utilities, decoders, and scripting tools directly from the portal.</p>
    </div>
  );
}

function NotesPage() {
  return (
    <div style={styles.innerPage}>
      <h3>Personal Notes</h3>
      <p style={styles.text}>Keep track of exploit steps, flag logs, and custom guidelines as you progress through training modules.</p>
    </div>
  );
}

function LeaderboardPage() {
  return (
    <div style={styles.innerPage}>
      <h3>Global Leaderboard</h3>
      <p style={styles.text}>View where you stand compared to other security operatives in XP and achievements globally.</p>
    </div>
  );
}

function ProfilePage() {
  return (
    <div style={styles.innerPage}>
      <h3>User Profile</h3>
      <p style={styles.text}>Manage your public achievements, view earned badges, and inspect your total XP logs.</p>
    </div>
  );
}

function SettingsPage() {
  return (
    <div style={styles.innerPage}>
      <h3>Portal Settings</h3>
      <p style={styles.text}>Adjust interface preferences, manage storage keys, and customize notification alerts.</p>
    </div>
  );
}

// Router Component wrapping Dashboard/Academy/etc inside AppLayout
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Unauthenticated Routes */}
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Authenticated Dashboard Shell Layout */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/academy" element={<AcademyPage />} />
          <Route path="/labs" element={<LabsPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const styles = {
  fullscreenPage: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#0a0e17',
    color: '#ffffff',
    fontFamily: '"Outfit", "Inter", sans-serif',
    padding: '20px',
  },
  innerPage: {
    padding: '10px 0',
  },
  text: {
    color: '#94a3b8',
    fontSize: '1rem',
    lineHeight: '1.6',
    marginTop: '10px',
    maxWidth: '650px',
  },
  navLinks: {
    display: 'flex',
    gap: '15px',
  },
  link: {
    color: '#00d4ff',
    textDecoration: 'none',
    border: '1px solid rgba(0, 212, 255, 0.3)',
    padding: '10px 20px',
    borderRadius: '4px',
    fontSize: '0.95rem',
    fontFamily: '"JetBrains Mono", monospace',
    transition: 'all 0.2s ease',
  },
};
