import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { SessionEngine } from '../../core/utils/sessionEngine';
import { ChallengeRuntime } from './ChallengeRuntime';

const CATEGORIES = [
  'Web Exploitation', 'Linux Privilege Escalation', 'Windows Privilege Escalation',
  'Active Directory', 'Reverse Engineering', 'Malware Analysis', 'Digital Forensics',
  'Cloud Security', 'Networking', 'Cryptography', 'OSINT'
];

export function ChallengesPage() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState(() => SessionEngine.getChallengesCatalog());
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  // Resolve Batch and Today's Practice for Instructor-Led Training (HP-030.1)
  const session = SessionEngine.getCurrentSession().session;
  const username = session.username;
  const userBatch = SessionEngine.getBatches().find(b => b.studentUsernames.includes(username));
  const todayPractice = userBatch ? SessionEngine.getTodayPractice(userBatch.id) : null;
  const activeTopic = todayPractice?.topic;

  React.useEffect(() => {
    return SessionEngine.subscribe(() => {
      setChallenges(SessionEngine.getChallengesCatalog());
    });
  }, []);

  // Filter logic
  let filteredMissions = challenges.filter(ch => {
    const matchesSearch = ch.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !selectedCat || ch.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  // If in an active batch with today's topic, filter challenges to only show today's topic challenges
  if (userBatch && activeTopic) {
    const todayChallengeIds = activeTopic.challenges.map(c => c.id);
    filteredMissions = filteredMissions.filter(ch => todayChallengeIds.includes(ch.id));
  }

  const handleStartMission = (challengeId: string) => {
    SessionEngine.startChallenge(challengeId);
    setChallenges(SessionEngine.getChallengesCatalog()); // update UI state
    navigate('/challenges');
  };

  const handleReplayMission = (challengeId: string) => {
    SessionEngine.replayChallenge(challengeId);
    setChallenges(SessionEngine.getChallengesCatalog()); // update UI state
    navigate('/challenges');
  };

  const activeChallenge = challenges.find(ch => ch.active);

  const handleAbort = () => {
    SessionEngine.startChallenge(null);
    setChallenges(SessionEngine.getChallengesCatalog());
    navigate('/challenges');
  };

  if (activeChallenge) {
    return (
      <ChallengeRuntime
        challenge={activeChallenge}
        onAbort={handleAbort}
        onReplay={() => handleReplayMission(activeChallenge.id)}
      />
    );
  }

  return (
    <div style={styles.container}>
      {/* ILT Banner */}
      {userBatch && activeTopic && (
        <div style={styles.iltBanner}>
          <span style={styles.iltBannerLabel}>⚡ INSTRUCTOR-LED LIVE MISSION</span>
          <h4 style={styles.iltBannerTitle}>
            Today's Target Topic: <strong>{activeTopic.title}</strong>
          </h4>
          <p style={styles.iltBannerDesc}>
            Displaying only the security operations assigned for today's training in {userBatch.name}.
          </p>
        </div>
      )}
      {/* Search and Category filters */}
      <div style={styles.filterCard}>
        <Input
          type="text"
          placeholder="Search mission objectives, CVE parameters, flags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon="🔍"
        />
        <div style={styles.categoriesRow}>
          {CATEGORIES.map(cat => {
            const isSelected = selectedCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(isSelected ? null : cat)}
                style={{
                  ...styles.catTag,
                  ...(isSelected ? styles.catTagActive : {})
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Game Stage Progression Display */}
      <div style={styles.stageProgress}>
        <h4 style={styles.header}>OPERATIVE MISSIONS PATHWAY</h4>
        <div style={styles.grid}>
          {filteredMissions.length > 0 ? (
            filteredMissions.map((ch, index) => {
              const difficultyStyle = ch.difficulty.toLowerCase() as keyof typeof styles;
              const isPremiumLocked = ch.premiumLocked;
              const isProgLocked = !isPremiumLocked && ch.locked;
              const cardStyle = isPremiumLocked ? styles.cardPremiumLocked : isProgLocked ? styles.cardLocked : styles.cardActive;
              const statusText = isPremiumLocked ? 'PREMIUM' : ch.completed ? 'SOLVED' : isProgLocked ? 'LOCKED' : 'AVAILABLE';
              const statusStyle = isPremiumLocked ? styles.premiumText : ch.completed ? styles.completedText : styles.pendingText;
              const btnLabel = isPremiumLocked ? '⭐ UPGRADE TO UNLOCK' : isProgLocked ? '🔒 DECRYPT STAGE FIRST' : ch.completed ? 'REPLAY MISSION' : 'START MISSION';
              const btnVariant = (ch.completed && !isPremiumLocked) ? 'secondary' : (isProgLocked || isPremiumLocked) ? 'outline' : 'primary';
              return (
                <Card
                  key={ch.id}
                  title={isPremiumLocked ? `🔒 PREMIUM MISSION ${index + 1}` : `MISSION ${index + 1}: ${ch.title}`}
                  subtitle={isPremiumLocked ? 'Upgrade your plan to access this mission' : `${ch.category} • Est: ${ch.duration}`}
                  hoverGlow={!isProgLocked && !isPremiumLocked}
                  style={cardStyle}
                  extra={
                    <span style={{ ...styles.badge, ...styles[difficultyStyle] }}>
                      {ch.difficulty}
                    </span>
                  }
                >
                  <div style={styles.metaRow}>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>REWARD:</span>
                      <span style={styles.metaVal}>{isPremiumLocked ? '⭐' : `${ch.xp} XP`}</span>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>STATUS:</span>
                      <span style={statusStyle}>{statusText}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: '15px' }}>
                    <Button
                      variant={btnVariant}
                      disabled={isProgLocked || isPremiumLocked}
                      style={{ width: '100%', ...(isPremiumLocked ? styles.premiumBtn : {}) }}
                      onClick={() => !isPremiumLocked && (ch.completed ? handleReplayMission(ch.id) : handleStartMission(ch.id))}
                    >
                      {btnLabel}
                    </Button>
                  </div>
                </Card>
              );
            })
          ) : (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>🛰️</span>
              <h5>No decryptable operations located</h5>
              <p>Try refining your active search string or clear category toggles.</p>
            </div>
          )}
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
  filterCard: {
    backgroundColor: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
  },
  categoriesRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
    borderTop: '1px solid rgba(255,255,255,0.03)',
    paddingTop: '15px',
  },
  catTag: {
    backgroundColor: 'var(--color-bg-element)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    borderRadius: 'var(--radius-pill)',
    padding: '6px 12px',
    fontSize: 'var(--font-size-xs)',
    cursor: 'pointer',
    outline: 'none',
  },
  catTagActive: {
    borderColor: 'var(--color-accent)',
    color: 'var(--color-accent)',
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
  },
  stageProgress: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-text-secondary)',
    letterSpacing: '1px',
    margin: '0 0 15px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
  },
  cardActive: {
    opacity: 1,
  },
  cardLocked: {
    opacity: 0.5,
    borderColor: 'rgba(255,255,255,0.02)',
    boxShadow: 'none',
  },
  cardPremiumLocked: {
    opacity: 0.8,
    borderColor: 'rgba(255, 179, 0, 0.25)',
    boxShadow: '0 0 12px rgba(255, 179, 0, 0.06)',
  },
  premiumText: {
    color: 'var(--color-warning)',
    fontWeight: 'var(--font-weight-bold)' as const,
  },
  premiumBtn: {
    borderColor: 'rgba(255, 179, 0, 0.35)',
    color: 'rgba(255, 179, 0, 0.85)',
    cursor: 'default' as const,
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid rgba(255,255,255,0.03)',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    padding: '12px 0',
    fontSize: 'var(--font-size-xs)',
    fontFamily: 'var(--font-family-mono)',
  },
  metaItem: {
    display: 'flex',
    gap: '6px',
  },
  metaLabel: {
    color: 'var(--color-text-muted)',
  },
  metaVal: {
    color: 'var(--color-text-secondary)',
  },
  completedText: {
    color: 'var(--color-primary)',
    fontWeight: 'var(--font-weight-bold)',
  },
  pendingText: {
    color: 'var(--color-text-muted)',
  },
  badge: {
    fontSize: '0.65rem',
    fontFamily: 'var(--font-family-mono)',
    fontWeight: 'var(--font-weight-bold)',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase' as const,
  },
  beginner: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    color: 'var(--color-primary)',
    border: '1px solid rgba(0, 230, 118, 0.2)',
  },
  intermediate: {
    backgroundColor: 'rgba(255, 179, 0, 0.1)',
    color: 'var(--color-warning)',
    border: '1px solid rgba(255, 179, 0, 0.2)',
  },
  advanced: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--color-danger)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center' as const,
    padding: '40px 20px',
    backgroundColor: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '15px',
    display: 'block',
  },
  iltBanner: {
    backgroundColor: 'rgba(0, 230, 118, 0.05)',
    border: '1px solid rgba(0, 230, 118, 0.2)',
    borderRadius: 'var(--radius-lg)',
    padding: '16px 20px',
    marginBottom: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  iltBannerLabel: {
    fontFamily: 'var(--font-family-mono)',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-primary)',
    fontWeight: 'var(--font-weight-bold)',
    letterSpacing: '1px',
  },
  iltBannerTitle: {
    fontSize: 'var(--font-size-md)',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  iltBannerDesc: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    margin: 0,
  },
};
