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

  React.useEffect(() => {
    return SessionEngine.subscribe(() => {
      setChallenges(SessionEngine.getChallengesCatalog());
    });
  }, []);

  // Filter logic
  const filteredMissions = challenges.filter(ch => {
    const matchesSearch = ch.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !selectedCat || ch.category === selectedCat;
    return matchesSearch && matchesCat;
  });

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
              return (
                <Card
                  key={ch.id}
                  title={`MISSION ${index + 1}: ${ch.title}`}
                  subtitle={`${ch.category} • Est: ${ch.duration}`}
                  hoverGlow={!ch.locked}
                  style={ch.locked ? styles.cardLocked : styles.cardActive}
                  extra={
                    <span style={{ ...styles.badge, ...styles[difficultyStyle] }}>
                      {ch.difficulty}
                    </span>
                  }
                >
                  <div style={styles.metaRow}>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>REWARD:</span>
                      <span style={styles.metaVal}>{ch.xp} XP</span>
                    </div>
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>STATUS:</span>
                      <span style={ch.completed ? styles.completedText : styles.pendingText}>
                        {ch.completed ? 'SOLVED' : ch.locked ? 'LOCKED' : 'AVAILABLE'}
                      </span>
                    </div>
                  </div>
                  <div style={{ marginTop: '15px' }}>
                    <Button
                      variant={ch.completed ? 'secondary' : ch.locked ? 'outline' : 'primary'}
                      disabled={ch.locked}
                      style={{ width: '100%' }}
                      onClick={() => ch.completed ? handleReplayMission(ch.id) : handleStartMission(ch.id)}
                    >
                      {ch.locked ? '🔒 DECRYPT STAGE FIRST' : ch.completed ? 'REPLAY MISSION' : 'START MISSION'}
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
};
