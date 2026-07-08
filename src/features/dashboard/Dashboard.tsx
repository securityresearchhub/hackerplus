import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

// List of rotating cybersecurity quotes
const HACKER_QUOTES = [
  "\"The quieter you become, the more you are able to hear.\" — Ram Dass",
  "\"Code is like humor. When you have to explain it, it’s bad.\" — Cory House",
  "\"Security is not a product, it's a process.\" — Bruce Schneier",
  "\"No system is safe.\" — Who Am I",
];

export function DashboardPage() {
  const navigate = useNavigate();

  // Mock dashboard details
  const stats = {
    username: 'neo_matrix',
    level: 12,
    xp: 2450,
    streak: 8,
    rank: 'Packet Sniffer',
  };

  const dailyMissions = [
    { id: 1, task: 'Complete 1 SQL Injection Lab', xpReward: 150, completed: true },
    { id: 2, task: 'Capture a Flag in Cryptography category', xpReward: 200, completed: false },
    { id: 3, task: 'Read documentation on Cookie Poisoning', xpReward: 50, completed: false },
  ];

  const recentActivity = [
    { id: 1, action: 'Captured flag "HP{cookie_tampering_101}"', category: 'Web', time: '2 hours ago', xp: '+100 XP' },
    { id: 2, action: 'Enrolled in "Cryptography for Hackers"', category: 'Academy', time: '1 day ago', xp: '0 XP' },
    { id: 3, action: 'Completed lesson "Burp Suite Fundamentals"', category: 'Web', time: '2 days ago', xp: '+150 XP' },
    { id: 4, action: 'Earned achievement badge "First Blood"', category: 'System', time: '3 days ago', xp: '+100 XP' },
  ];

  const randomQuote = HACKER_QUOTES[Math.floor(Math.random() * HACKER_QUOTES.length)];

  return (
    <div style={styles.container}>
      {/* Welcome Banner */}
      <div style={styles.banner}>
        <div style={styles.bannerText}>
          <span style={styles.bannerAlert}>CLASSIFIED SECURE SECTOR // ACCESS GRANTED</span>
          <h2 style={styles.bannerTitle}>Welcome Back, {stats.username}</h2>
          <p style={styles.bannerQuote}>{randomQuote}</p>
        </div>
        <div style={styles.rankStatus}>
          <span style={styles.rankLbl}>AGENT CLASSIFICATION</span>
          <span style={styles.rankVal}>{stats.rank}</span>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div style={styles.statsRow}>
        <Card style={styles.statCard}>
          <span style={styles.statIcon}>🔥</span>
          <div style={styles.statContent}>
            <span style={styles.statLabel}>DAILY STREAK</span>
            <span style={styles.statValue}>{stats.streak} DAYS</span>
          </div>
        </Card>

        <Card style={styles.statCard}>
          <span style={styles.statIcon}>🎯</span>
          <div style={styles.statContent}>
            <span style={styles.statLabel}>CURRENT LEVEL</span>
            <span style={styles.statValue}>LEVEL {stats.level}</span>
          </div>
        </Card>

        <Card style={styles.statCard}>
          <span style={styles.statIcon}>⚡</span>
          <div style={styles.statContent}>
            <span style={styles.statLabel}>TOTAL XP RECORDED</span>
            <span style={styles.statValue}>{stats.xp} XP</span>
          </div>
        </Card>
      </div>

      {/* Layout Split Grid */}
      <div style={styles.splitGrid}>
        {/* Left Side: Learning & Activities */}
        <div style={styles.leftColumn}>
          {/* Continue Learning */}
          <Card 
            title="📖 CONTINUE TRAINING" 
            subtitle="RESUME YOUR IN-PROGRESS MODULES"
            hoverGlow
          >
            <div style={styles.trainingItem}>
              <div style={styles.trainingMeta}>
                <span style={styles.tag}>Web Hacking</span>
                <span style={styles.progressText}>65% Complete</span>
              </div>
              <h4 style={styles.trainingTitle}>Web Application Hacking: From Zero to Hero</h4>
              <p style={styles.trainingDesc}>Current Lesson: <strong>Blind SQL Injection Techniques</strong> (estimated 45 mins)</p>
              
              <div style={styles.trainingAction}>
                <Button 
                  variant="primary"
                  onClick={() => navigate('/academy')}
                >
                  RESUME LAB SESSION
                </Button>
              </div>
            </div>
          </Card>

          {/* Recent Logs (Activity) */}
          <Card 
            title="🖥️ RECENT TELEMETRY LOGS" 
            subtitle="AUDIT RECORD OF SYSTEM ACTIONS"
          >
            <div style={styles.activityList}>
              {recentActivity.map(act => (
                <div key={act.id} style={styles.activityRow}>
                  <div style={styles.actMain}>
                    <span style={styles.actIndicator}>❯</span>
                    <div>
                      <div style={styles.actAction}>{act.action}</div>
                      <div style={styles.actMeta}>
                        <span style={styles.actCategory}>{act.category}</span>
                        <span style={styles.actSeparator}>|</span>
                        <span>{act.time}</span>
                      </div>
                    </div>
                  </div>
                  <span style={act.xp !== '0 XP' ? styles.actXpPositive : styles.actXpNeutral}>
                    {act.xp}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Side: Daily Missions & Navigation */}
        <div style={styles.rightColumn}>
          {/* Daily Missions */}
          <Card 
            title="🎯 ACTIVE MISSIONS" 
            subtitle="COMPLETE CHECKS TO EARN BONUS XP"
          >
            <div style={styles.missionList}>
              {dailyMissions.map(mis => (
                <div key={mis.id} style={styles.missionItem}>
                  <div style={styles.missionStatus}>
                    <input 
                      type="checkbox" 
                      checked={mis.completed} 
                      readOnly 
                      style={styles.checkbox}
                    />
                    <span style={mis.completed ? styles.missionTextCompleted : styles.missionText}>
                      {mis.task}
                    </span>
                  </div>
                  <span style={styles.missionReward}>+{mis.xpReward} XP</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Access */}
          <Card 
            title="⚡ QUICK TELEPORT" 
            subtitle="FAST ACCESS DIRECTORIES"
          >
            <div style={styles.quickAccessGrid}>
              <Button 
                variant="outline" 
                onClick={() => navigate('/academy')}
                style={styles.quickBtn}
              >
                🎓 Academy
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/labs')}
                style={styles.quickBtn}
              >
                🧪 Labs
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/challenges')}
                style={styles.quickBtn}
              >
                🚩 Challenges
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/profile')}
                style={styles.quickBtn}
              >
                👤 Profile
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '30px',
  },
  banner: {
    background: 'linear-gradient(135deg, #0f1422 0%, #151c2e 100%)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  bannerText: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    zIndex: 2,
  },
  bannerAlert: {
    fontFamily: 'var(--font-family-mono)',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-primary)',
    fontWeight: 'var(--font-weight-semibold)',
    letterSpacing: '1.5px',
  },
  bannerTitle: {
    fontSize: 'var(--font-size-2xl)',
    color: 'var(--color-text-primary)',
    margin: 0,
    fontWeight: 'var(--font-weight-bold)',
  },
  bannerQuote: {
    color: 'var(--color-text-muted)',
    fontSize: 'var(--font-size-sm)',
    margin: '5px 0 0 0',
  },
  rankStatus: {
    textAlign: 'right' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    zIndex: 2,
    borderLeft: '1px solid var(--color-border)',
    paddingLeft: '30px',
  },
  rankLbl: {
    fontSize: '0.65rem',
    color: 'var(--color-text-muted)',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
  },
  rankVal: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-accent)',
    fontFamily: 'var(--font-family-mono)',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: '20px',
    padding: '24px',
  },
  statIcon: {
    fontSize: '2.5rem',
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  statLabel: {
    fontSize: '0.65rem',
    color: 'var(--color-text-muted)',
    letterSpacing: '1px',
  },
  statValue: {
    fontSize: 'var(--font-size-xl)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-text-primary)',
  },
  splitGrid: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 1fr',
    gap: '30px',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '30px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '30px',
  },
  trainingItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  trainingMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    color: 'var(--color-accent)',
    border: '1px solid rgba(0, 212, 255, 0.2)',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontFamily: 'var(--font-family-mono)',
    textTransform: 'uppercase' as const,
  },
  progressText: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-primary)',
    fontWeight: 'var(--font-weight-semibold)',
  },
  trainingTitle: {
    fontSize: 'var(--font-size-md)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  trainingDesc: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    margin: 0,
  },
  trainingAction: {
    marginTop: '10px',
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  activityRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
  },
  actMain: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  actIndicator: {
    color: 'var(--color-accent)',
    fontSize: '0.8rem',
    marginTop: '3px',
  },
  actAction: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-primary)',
  },
  actMeta: {
    display: 'flex',
    gap: '8px',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    marginTop: '4px',
  },
  actCategory: {
    fontFamily: 'var(--font-family-mono)',
    color: 'var(--color-accent)',
  },
  actSeparator: {
    opacity: 0.5,
  },
  actXpPositive: {
    color: 'var(--color-primary)',
    fontFamily: 'var(--font-family-mono)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 'var(--font-weight-bold)',
  },
  actXpNeutral: {
    color: 'var(--color-text-muted)',
    fontFamily: 'var(--font-family-mono)',
    fontSize: 'var(--font-size-xs)',
  },
  missionList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  missionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missionStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  checkbox: {
    accentColor: 'var(--color-primary)',
    cursor: 'default',
  },
  missionText: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
  },
  missionTextCompleted: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-muted)',
    textDecoration: 'line-through',
  },
  missionReward: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-primary)',
    fontFamily: 'var(--font-family-mono)',
    fontWeight: 'var(--font-weight-semibold)',
  },
  quickAccessGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  quickBtn: {
    width: '100%',
    textAlign: 'center' as const,
  },
};
