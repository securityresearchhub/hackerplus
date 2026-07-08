import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';

// Mock earned badges structure
const mockBadges = [
  { id: 1, emoji: '🩸', name: 'First Blood', desc: 'Completed first lesson' },
  { id: 2, emoji: '📜', name: 'Script Starter', desc: 'Reached 500 XP' },
  { id: 3, emoji: '🔥', name: 'On Fire', desc: '7-day streak milestone' },
  { id: 4, emoji: '🔐', name: 'Cipher Breaker', desc: 'Completed Cryptography' },
];

export function ProfilePage() {
  // Local profile state
  const [profile, setProfile] = useState({
    username: 'neo_matrix',
    displayName: 'Thomas Anderson',
    bio: 'SecOps Engineer & CTF enthusiast. Specializing in reverse engineering and web vulnerability research.',
    country: 'United States',
    joinedDate: 'July 2026',
    level: 12,
    xp: 2450,
    nextLevelXp: 3000,
    streak: 8,
    rank: 'Packet Sniffer',
    completedCourses: 3,
    completedLabs: 14,
    completedChallenges: 27,
  });

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: profile.displayName,
    bio: profile.bio,
    country: profile.country,
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(prev => ({
      ...prev,
      displayName: editForm.displayName,
      bio: editForm.bio,
      country: editForm.country,
    }));
    setIsEditOpen(false);
  };

  const xpPercent = Math.min(100, Math.round((profile.xp / profile.nextLevelXp) * 100));

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <div style={styles.avatarContainer}>
            <div style={styles.avatar}>🐱‍💻</div>
            <h3 style={styles.displayName}>{profile.displayName}</h3>
            <p style={styles.username}>@{profile.username}</p>
          </div>
          
          <div style={styles.metaList}>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Location:</span>
              <span style={styles.metaValue}>📍 {profile.country}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Enlisted:</span>
              <span style={styles.metaValue}>📅 {profile.joinedDate}</span>
            </div>
          </div>

          <p style={styles.bioText}>{profile.bio}</p>

          <Button 
            variant="outline" 
            style={{ width: '100%', marginTop: 'auto' }}
            onClick={() => {
              setEditForm({
                displayName: profile.displayName,
                bio: profile.bio,
                country: profile.country,
              });
              setIsEditOpen(true);
            }}
          >
            ⚙️ EDIT PROFILE
          </Button>
        </Card>

        {/* Stats and Progress Cards */}
        <div style={styles.statsColumn}>
          {/* Level / Rank Summary Card */}
          <Card 
            title="🎯 AGENT STANDINGS"
            subtitle="CURRENT PROGRESS METRICS"
            style={{ flex: 1 }}
          >
            <div style={styles.rankRow}>
              <div>
                <span style={styles.rankLabel}>CURRENT RANK</span>
                <h4 style={styles.rankValue}>{profile.rank}</h4>
              </div>
              <div style={styles.levelBadge}>
                <span style={styles.levelLabel}>LEVEL</span>
                <span style={styles.levelValue}>{profile.level}</span>
              </div>
            </div>

            {/* XP progress bar */}
            <div style={{ marginTop: '20px' }}>
              <div style={styles.xpLabelRow}>
                <span>XP: {profile.xp} / {profile.nextLevelXp}</span>
                <span>{xpPercent}%</span>
              </div>
              <div style={styles.progressBarBg}>
                <div style={{ ...styles.progressBarFill, width: `${xpPercent}%` }} />
              </div>
            </div>

            {/* Daily Streak Indicator */}
            <div style={styles.streakBox}>
              <span style={styles.streakIcon}>🔥</span>
              <div>
                <h5 style={styles.streakTitle}>{profile.streak} DAY STREAK</h5>
                <p style={styles.streakSubtitle}>Keep learning daily to secure your bonus multiplier</p>
              </div>
            </div>
          </Card>

          {/* Activity Completions Stats Grid */}
          <div style={styles.completionsGrid}>
            <Card style={styles.miniStatCard}>
              <span style={styles.miniStatIcon}>🎓</span>
              <span style={styles.miniStatVal}>{profile.completedCourses}</span>
              <span style={styles.miniStatLbl}>Courses Done</span>
            </Card>
            <Card style={styles.miniStatCard}>
              <span style={styles.miniStatIcon}>🧪</span>
              <span style={styles.miniStatVal}>{profile.completedLabs}</span>
              <span style={styles.miniStatLbl}>Labs Completed</span>
            </Card>
            <Card style={styles.miniStatCard}>
              <span style={styles.miniStatIcon}>🚩</span>
              <span style={styles.miniStatVal}>{profile.completedChallenges}</span>
              <span style={styles.miniStatLbl}>Flags Captured</span>
            </Card>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div style={{ marginTop: '30px' }}>
        <h4 style={styles.sectionHeader}>🎖️ UNLOCKED ACHIEVEMENT BADGES</h4>
        <div style={styles.badgesGrid}>
          {mockBadges.map(badge => (
            <Card key={badge.id} style={styles.badgeCard}>
              <span style={styles.badgeEmoji}>{badge.emoji}</span>
              <h5 style={styles.badgeName}>{badge.name}</h5>
              <p style={styles.badgeDesc}>{badge.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditOpen}
        title="Edit Profile Callsign"
        onClose={() => setIsEditOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveProfile}>
              Save Updates
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveProfile} style={styles.editForm}>
          <Input
            label="Display Name"
            type="text"
            value={editForm.displayName}
            onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
            required
          />
          <Input
            label="Country"
            type="text"
            value={editForm.country}
            onChange={(e) => setEditForm(prev => ({ ...prev, country: e.target.value }))}
            required
          />
          <div style={styles.inputGroup}>
            <label style={styles.formLabel}>Bio (Agent Description)</label>
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
              style={styles.textarea}
              rows={4}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '30px',
  },
  profileCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
  },
  avatarContainer: {
    marginBottom: '20px',
  },
  avatar: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-bg-element)',
    border: '2px solid var(--color-primary)',
    boxShadow: 'var(--glow-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
    margin: '0 auto 15px auto',
  },
  displayName: {
    fontSize: 'var(--font-size-xl)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-text-primary)',
    margin: '0 0 4px 0',
  },
  username: {
    fontFamily: 'var(--font-family-mono)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-accent)',
    margin: 0,
  },
  metaList: {
    width: '100%',
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
    padding: '15px 0',
    margin: '20px 0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  metaItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 'var(--font-size-sm)',
  },
  metaLabel: {
    color: 'var(--color-text-muted)',
  },
  metaValue: {
    color: 'var(--color-text-secondary)',
    fontWeight: 'var(--font-weight-medium)',
  },
  bioText: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.6',
    margin: '0 0 25px 0',
  },
  statsColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  rankRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankLabel: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    letterSpacing: '1px',
    display: 'block',
  },
  rankValue: {
    fontSize: 'var(--font-size-xl)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-accent)',
    margin: '4px 0 0 0',
  },
  levelBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.05)',
    border: '1px solid rgba(0, 230, 118, 0.2)',
    padding: '8px 16px',
    borderRadius: '8px',
    textAlign: 'center' as const,
  },
  levelLabel: {
    fontSize: '0.65rem',
    color: 'var(--color-text-muted)',
    display: 'block',
    letterSpacing: '1px',
  },
  levelValue: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-primary)',
  },
  xpLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 'var(--font-size-xs)',
    fontFamily: 'var(--font-family-mono)',
    color: 'var(--color-text-secondary)',
    marginBottom: '8px',
  },
  progressBarBg: {
    height: '6px',
    backgroundColor: 'var(--color-bg-element)',
    borderRadius: 'var(--radius-pill)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'var(--color-primary)',
    boxShadow: 'var(--glow-primary)',
    borderRadius: 'var(--radius-pill)',
  },
  streakBox: {
    marginTop: '25px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    backgroundColor: 'rgba(255, 179, 0, 0.05)',
    border: '1px solid rgba(255, 179, 0, 0.15)',
    padding: '12px 16px',
    borderRadius: '8px',
  },
  streakIcon: {
    fontSize: '1.8rem',
  },
  streakTitle: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-warning)',
    margin: 0,
  },
  streakSubtitle: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    margin: '2px 0 0 0',
  },
  completionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
  },
  miniStatCard: {
    alignItems: 'center',
    textAlign: 'center' as const,
    padding: '15px 10px',
  },
  miniStatIcon: {
    fontSize: '1.5rem',
    marginBottom: '8px',
    display: 'block',
  },
  miniStatVal: {
    fontSize: 'var(--font-size-xl)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-text-primary)',
    display: 'block',
  },
  miniStatLbl: {
    fontSize: '0.7rem',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase' as const,
    marginTop: '4px',
    letterSpacing: '0.5px',
  },
  sectionHeader: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-text-secondary)',
    letterSpacing: '1px',
    marginBottom: '15px',
  },
  badgesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
  },
  badgeCard: {
    alignItems: 'center',
    textAlign: 'center' as const,
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-sm)',
    transition: 'border-color 0.2s ease',
  },
  badgeEmoji: {
    fontSize: '2.5rem',
    marginBottom: '10px',
    display: 'block',
  },
  badgeName: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-text-primary)',
    margin: '0 0 4px 0',
  },
  badgeDesc: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    margin: 0,
    lineHeight: '1.4',
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-4)',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-2)',
  },
  formLabel: {
    fontSize: 'var(--font-size-xs)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--color-text-secondary)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
  },
  textarea: {
    width: '100%',
    backgroundColor: 'var(--color-bg-element)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text-primary)',
    padding: '12px',
    fontSize: 'var(--font-size-sm)',
    fontFamily: 'var(--font-family-sans)',
    outline: 'none',
    resize: 'vertical' as const,
  },
};
