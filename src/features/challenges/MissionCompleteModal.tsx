import React, { useState, useEffect } from 'react';
import { Button } from '../../components/common/Button';
import { MissionCompleteDetails } from '../../core/utils/sessionEngine';

interface MissionCompleteModalProps {
  isOpen: boolean;
  details: MissionCompleteDetails | null;
  challengeTitle: string;
  onContinue: () => void;
  onReplay: () => void;
}

export function MissionCompleteModal({ isOpen, details, challengeTitle, onContinue, onReplay }: MissionCompleteModalProps) {
  const [animatedXp, setAnimatedXp] = useState(0);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    if (isOpen && details) {
      // 1. XP Count-up animation
      let start = 0;
      const end = details.xpEarned;
      if (end > 0) {
        const duration = 1200;
        const stepTime = Math.max(Math.floor(duration / end), 16);
        const timer = setInterval(() => {
          start += Math.ceil(end / 40);
          if (start >= end) {
            start = end;
            clearInterval(timer);
          }
          setAnimatedXp(start);
        }, stepTime);
        return () => clearInterval(timer);
      } else {
        setAnimatedXp(0);
      }

      // 2. Progress Bar Fill animation
      setBarWidth(details.prevXpPercent);
      const delay = setTimeout(() => {
        setBarWidth(details.currentXpPercent);
      }, 200);
      return () => clearTimeout(delay);
    }
  }, [isOpen, details]);

  if (!isOpen || !details) return null;

  // Confetti particles generator
  const confetti = Array.from({ length: 24 }).map((_, i) => ({
    id: i,
    color: ['#00e676', '#00d4ff', '#ffb300', '#ef4444', '#a855f7'][i % 5],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.4}s`,
    duration: `${1.2 + Math.random() * 1.5}s`,
    size: `${6 + Math.random() * 6}px`
  }));

  return (
    <div style={styles.overlay}>
      {/* Confetti container */}
      <div style={styles.confettiContainer}>
        {confetti.map(p => (
          <div
            key={p.id}
            style={{
              ...styles.confettiParticle,
              backgroundColor: p.color,
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              width: p.size,
              height: p.size,
            }}
          />
        ))}
      </div>

      <div style={styles.modal}>
        {/* Success Icon Animation */}
        <div style={styles.successIconWrapper}>
          <div style={styles.successIcon}>✓</div>
        </div>

        <h2 style={styles.header}>MISSION COMPLETED</h2>
        <h4 style={styles.subHeader}>{challengeTitle}</h4>

        {/* XP Earned */}
        <div style={styles.xpBox}>
          <span style={styles.xpText}>+{animatedXp} XP</span>
          <span style={styles.xpLabel}>ALLOCATED TO OPERATIVE PROFILES</span>
        </div>

        {/* Level Progression details */}
        <div style={styles.progressionRow}>
          <span style={styles.levelLabel}>LEVEL {details.prevLevel}</span>
          <div style={styles.progressBarBg}>
            <div style={{ ...styles.progressBarFill, width: `${barWidth}%` }} />
          </div>
          <span style={styles.levelLabel}>LEVEL {details.currentLevel}</span>
        </div>
        <div style={styles.rankLabel}>CURRENT OPERATIVE RANK: {details.currentRank}</div>

        {/* Unlocks container */}
        {(details.unlockedBadge || details.unlockedChallenge) && (
          <div style={styles.unlocksList}>
            {details.unlockedBadge && (
              <div style={styles.unlockItem}>
                <span style={styles.unlockIcon}>{details.unlockedBadge.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={styles.unlockTitle}>NEW BADGE ACCREDITED: {details.unlockedBadge.name}</div>
                  <div style={styles.unlockDesc}>{details.unlockedBadge.description}</div>
                </div>
              </div>
            )}
            {details.unlockedChallenge && (
              <div style={styles.unlockItem}>
                <span style={styles.unlockIcon}>🔑</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={styles.unlockTitle}>DECRYPTED NEW STAGE</div>
                  <div style={styles.unlockDesc}>{details.unlockedChallenge.title}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div style={styles.buttonRow}>
          <Button variant="secondary" onClick={onReplay}>REPLAY MISSION</Button>
          <Button variant="primary" onClick={onContinue}>CONTINUE</Button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(2, 4, 8, 0.9)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  confettiContainer: { position: 'absolute' as const, inset: 0, overflow: 'hidden', pointerEvents: 'none' as const },
  confettiParticle: { position: 'absolute' as const, top: '-20px', borderRadius: '50%', animationName: 'confettiFall', animationTimingFunction: 'linear', animationIterationCount: 'infinite' },
  modal: { backgroundColor: '#0b111e', border: '2px solid #1a2c4c', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '480px', padding: '30px', textAlign: 'center' as const, boxShadow: '0 0 40px rgba(0, 212, 255, 0.15)', display: 'flex', flexDirection: 'column' as const, gap: '20px', animation: 'modalSlideUp 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards' },
  successIconWrapper: { display: 'flex', justifyContent: 'center' },
  successIcon: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(0, 230, 118, 0.1)', border: '2px solid #00e676', color: '#00e676', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', animation: 'scalePulse 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' },
  header: { fontSize: '1.4rem', color: '#00e676', letterSpacing: '2px', fontWeight: 'bold', margin: 0 },
  subHeader: { fontSize: '1.1rem', color: 'var(--color-text-primary)', margin: 0 },
  xpBox: { backgroundColor: '#070c14', border: '1px solid #101a2d', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column' as const, gap: '4px' },
  xpText: { fontSize: '2rem', color: '#00d4ff', fontWeight: 'bold', fontFamily: 'var(--font-family-mono)' },
  xpLabel: { fontSize: '0.65rem', color: 'var(--color-text-muted)', letterSpacing: '0.5px' },
  progressionRow: { display: 'flex', alignItems: 'center', gap: '12px', width: '100%' },
  levelLabel: { fontSize: '0.75rem', fontFamily: 'var(--font-family-mono)', color: 'var(--color-text-secondary)', fontWeight: 'bold' },
  progressBarBg: { flex: 1, height: '8px', backgroundColor: '#101a2d', borderRadius: 'var(--radius-pill)', overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-pill)', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' },
  rankLabel: { fontSize: '0.75rem', color: 'var(--color-text-secondary)', letterSpacing: '0.5px' },
  unlocksList: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
  unlockItem: { display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: 'rgba(0, 212, 255, 0.03)', border: '1px dashed rgba(0, 212, 255, 0.2)', borderRadius: 'var(--radius-md)', padding: '12px' },
  unlockIcon: { fontSize: '1.5rem' },
  unlockTitle: { fontSize: '0.75rem', color: '#00d4ff', fontWeight: 'bold' },
  unlockDesc: { fontSize: '0.7rem', color: 'var(--color-text-muted)' },
  buttonRow: { display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '10px' },
};

// Append keyframes safely
if (typeof document !== 'undefined' && !document.getElementById('hp-complete-keyframes')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'hp-complete-keyframes';
  styleEl.textContent = `
    @keyframes scalePulse {
      0% { transform: scale(0.3); opacity: 0; }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes confettiFall {
      0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(500px) rotate(720deg); opacity: 0; }
    }
  `;
  document.head.appendChild(styleEl);
}
