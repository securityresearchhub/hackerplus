import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { SessionEngine } from '../../core/utils/sessionEngine';

const CATEGORIES = [
  'Web Security', 'Network Security', 'Linux', 'Windows', 'Active Directory',
  'Cloud Security', 'Digital Forensics', 'Malware Analysis', 'Reverse Engineering',
  'Mobile Security', 'Cryptography'
];

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export function LabsPage() {
  const navigate = useNavigate();
  const [labs, setLabs] = useState(() => SessionEngine.getLabsCatalog());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  // Filter Logic
  const filteredLabs = labs.filter(lab => {
    const matchesSearch = lab.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || lab.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || lab.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Extract subsets from dynamic labs list
  const activeLab = labs.find(lab => lab.inProgress);
  const featuredLabs = filteredLabs.filter(lab => lab.featured);
  const recommendedLabs = filteredLabs.filter(lab => lab.recommended);
  const recentLabs = filteredLabs.filter(lab => lab.recent && lab.completed);

  const handleStartLab = (labId: string) => {
    SessionEngine.startLab(labId);
    setLabs(SessionEngine.getLabsCatalog()); // refresh UI state
    navigate('/challenges');
  };

  const handleResumeActiveLab = () => {
    navigate('/challenges');
  };

  return (
    <div style={styles.container}>
      {/* Continue Last Lab Banner */}
      {activeLab && (
        <div style={styles.activeBanner}>
          <div style={styles.activeText}>
            <span style={styles.activeStatus}>📡 RETRIEVING PREVIOUS LAB SESSION</span>
            <h3 style={styles.activeTitle}>{activeLab.title}</h3>
            <p style={styles.activeMeta}>
              Category: <strong>{activeLab.category}</strong> | Est. Time: <strong>{activeLab.duration}</strong> | Value: <strong>{activeLab.xp} XP</strong>
            </p>
          </div>
          <Button variant="primary" onClick={handleResumeActiveLab}>RESUME CONTAINER</Button>
        </div>
      )}

      {/* Grid: Search and filter controls */}
      <div style={styles.controlsCard}>
        <div style={styles.controlsRow}>
          <div style={{ flex: 1.5 }}>
            <Input
              type="text"
              placeholder="Search target vulnerabilities, tools (nmap, metasploit)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon="🔍"
            />
          </div>
          <div style={styles.difficultyContainer}>
            <span style={styles.diffLabel}>Difficulty:</span>
            <div style={styles.diffRow}>
              {DIFFICULTIES.map(diff => {
                const isActive = selectedDifficulty === diff;
                return (
                  <button
                     key={diff}
                     onClick={() => setSelectedDifficulty(diff)}
                     style={{
                       ...styles.diffBtn,
                       ...(isActive ? styles.diffBtnActive : {})
                     }}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Categories Tags List */}
        <div style={styles.categoriesRow}>
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isSelected ? null : cat)}
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

      {/* Layout Split: Featured / Recommended (Left) & Recently Completed (Right) */}
      <div style={styles.layoutSplit}>
        {/* Left Column: Lists */}
        <div style={styles.leftCol}>
          {/* Featured Labs */}
          {featuredLabs.length > 0 && (
            <div style={styles.section}>
              <h4 style={styles.sectionHeader}>⭐ FEATURED CONTAINER LABS ({featuredLabs.length})</h4>
              <div style={styles.labsGrid}>
                {featuredLabs.map(lab => (
                  <LabCard key={lab.id} lab={lab} onStart={handleStartLab} />
                ))}
              </div>
            </div>
          )}

          {/* Recommended Labs */}
          {recommendedLabs.length > 0 && (
            <div style={styles.section}>
              <h4 style={styles.sectionHeader}>💡 RECOMMENDED MISSIONS ({recommendedLabs.length})</h4>
              <div style={styles.labsGrid}>
                {recommendedLabs.map(lab => (
                  <LabCard key={lab.id} lab={lab} onStart={handleStartLab} />
                ))}
              </div>
            </div>
          )}

          {featuredLabs.length === 0 && recommendedLabs.length === 0 && (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>🛰️</span>
              <h5>No matching sandbox targets located</h5>
              <p>Adjust your search filters or difficulty parameters to reload listings.</p>
            </div>
          )}
        </div>

        {/* Right Column: History Sidebar */}
        <div style={styles.rightCol}>
          <h4 style={styles.sectionHeader}>✅ RECENT COMPLETED LABS</h4>
          <div style={styles.historyList}>
            {recentLabs.map(lab => (
              <div key={lab.id} style={styles.historyItem}>
                <span style={styles.checkIcon}>✔</span>
                <div style={{ flex: 1 }}>
                  <h5 style={styles.historyTitle}>{lab.title}</h5>
                  <span style={styles.historyMeta}>{lab.category} • {lab.duration}</span>
                </div>
                <span style={styles.historyXp}>+{lab.xp} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Inner reusable Card component for Labs
function LabCard({ lab, onStart }: { lab: any; onStart: (labId: string) => void }) {
  const diffStyle = lab.difficulty.toLowerCase() as keyof typeof styles;
  return (
    <Card 
      title={lab.title} 
      subtitle={`${lab.category} • Est. Time: ${lab.duration}`}
      hoverGlow
      extra={
        <span style={{ ...styles.badge, ...styles[diffStyle] }}>
          {lab.difficulty}
        </span>
      }
    >
      <div style={styles.cardInfo}>
        <div style={styles.xpBox}>
          <span style={styles.xpLabel}>REWARD:</span>
          <span style={styles.xpVal}>{lab.xp} XP</span>
        </div>
        <div style={styles.statusBox}>
          <span style={styles.statusLabel}>STATUS:</span>
          <span style={lab.completed ? styles.statusSuccess : styles.statusPending}>
            {lab.completed ? 'COMPLETED' : 'UNSOLVED'}
          </span>
        </div>
      </div>
      <div style={styles.cardAction}>
        <Button 
          variant={lab.completed ? 'secondary' : 'primary'} 
          style={{ width: '100%' }}
          onClick={() => onStart(lab.id)}
        >
          {lab.completed ? 'LAUNCH RETRAINING' : 'INITIALIZE TARGET'}
        </Button>
      </div>
    </Card>
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
  activeBanner: {
    background: 'linear-gradient(135deg, rgba(0, 230, 118, 0.05) 0%, rgba(0, 212, 255, 0.05) 100%)',
    border: '1px solid rgba(0, 230, 118, 0.2)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: 'var(--glow-primary)',
  },
  activeText: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  activeStatus: {
    fontFamily: 'var(--font-family-mono)',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-primary)',
    fontWeight: 'var(--font-weight-bold)',
    letterSpacing: '1px',
  },
  activeTitle: {
    fontSize: 'var(--font-size-lg)',
    color: 'var(--color-text-primary)',
    margin: 0,
    fontWeight: 'var(--font-weight-bold)',
  },
  activeMeta: {
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--font-size-xs)',
    margin: 0,
  },
  controlsCard: {
    backgroundColor: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
  },
  controlsRow: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start',
  },
  difficultyContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  diffLabel: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    fontWeight: 'var(--font-weight-semibold)',
    textTransform: 'uppercase' as const,
  },
  diffRow: {
    display: 'flex',
    gap: '6px',
  },
  diffBtn: {
    backgroundColor: 'var(--color-bg-element)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    padding: '8px 16px',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-size-xs)',
    cursor: 'pointer',
    fontFamily: 'var(--font-family-mono)',
  },
  diffBtnActive: {
    borderColor: 'var(--color-accent)',
    color: 'var(--color-accent)',
    boxShadow: 'var(--glow-accent)',
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
  },
  catTagActive: {
    borderColor: 'var(--color-accent)',
    color: 'var(--color-accent)',
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
  },
  layoutSplit: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '30px',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '30px',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  section: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
  },
  sectionHeader: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-text-secondary)',
    letterSpacing: '1px',
    margin: 0,
    textTransform: 'uppercase' as const,
  },
  labsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  cardInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid rgba(255,255,255,0.03)',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    padding: '12px 0',
    fontSize: 'var(--font-size-xs)',
    fontFamily: 'var(--font-family-mono)',
  },
  xpBox: {
    display: 'flex',
    gap: '6px',
  },
  xpLabel: {
    color: 'var(--color-text-muted)',
  },
  xpVal: {
    color: 'var(--color-primary)',
    fontWeight: 'var(--font-weight-bold)',
  },
  statusBox: {
    display: 'flex',
    gap: '6px',
  },
  statusLabel: {
    color: 'var(--color-text-muted)',
  },
  statusSuccess: {
    color: 'var(--color-primary)',
    fontWeight: 'var(--font-weight-bold)',
  },
  statusPending: {
    color: 'var(--color-text-muted)',
  },
  cardAction: {
    marginTop: '15px',
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
  historyList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    marginTop: '15px',
  },
  historyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
  },
  checkIcon: {
    color: 'var(--color-primary)',
    fontSize: '1.1rem',
  },
  historyTitle: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  historyMeta: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    display: 'block',
    marginTop: '2px',
  },
  historyXp: {
    fontFamily: 'var(--font-family-mono)',
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-primary)',
    fontWeight: 'var(--font-weight-semibold)',
  },
  emptyState: {
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
