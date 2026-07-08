import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ChallengeInfo } from '../../core/utils/challengeEngine';
import { SessionEngine, MissionCompleteDetails } from '../../core/utils/sessionEngine';
import { MissionCompleteModal } from './MissionCompleteModal';

interface ChallengeRuntimeProps {
  challenge: ChallengeInfo;
  onAbort: () => void;
  onReplay: () => void;
}

export function ChallengeRuntime({ challenge, onAbort, onReplay }: ChallengeRuntimeProps) {
  const [flag, setFlag] = useState('');
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [completeDetails, setCompleteDetails] = useState<MissionCompleteDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [objectives, setObjectives] = useState(() =>
    challenge.objectives.map((obj, idx) => ({ id: idx, text: obj, completed: false }))
  );

  const toggleObjective = (id: number) => {
    setObjectives(prev => prev.map(obj => obj.id === id ? { ...obj, completed: !obj.completed } : obj));
  };

  useEffect(() => {
    setFlag('');
    setFeedback(null);
    setCompleteDetails(null);
    setShowModal(false);
    setObjectives(challenge.objectives.map((obj, idx) => ({ id: idx, text: obj, completed: false })));
  }, [challenge.id]);

  const handleSubmitFlag = () => {
    const res = SessionEngine.submitFlag(challenge.id, flag);
    setFeedback(res);
    if (res.success) {
      setCompleteDetails(res);
      setShowModal(true);
    }
  };

  return (
    <div style={styles.grid}>
      {/* Left Column: Briefing, Target info, Flag Submission */}
      <div style={styles.col}>
        <div style={styles.header}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-danger)', fontWeight: 'bold', fontFamily: 'var(--font-family-mono)' }}>📡 LIVE OPERATION ACTIVE</span>
            <h3 style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-text-primary)', fontWeight: 'bold', margin: 0 }}>{challenge.title}</h3>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{challenge.category}</span>
          </div>
          <Button variant="danger" size="sm" onClick={onAbort}>ABORT MISSION</Button>
        </div>

        <Card title="🎯 TARGET ENVIRONMENT DATA">
          <div style={styles.targetRow}>
            {[[ 'TARGET IP ADDRESS:', challenge.targetIp, true ], [ 'EST. COMPLEXITY:', challenge.difficulty ], [ 'REWARD PREVIEW:', `${challenge.xp} XP`, false, true ], [ 'EST. DURATION:', challenge.duration ]].map(([lbl, val, isIp, isXp]) => (
              <div key={String(lbl)} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-family-mono)', color: 'var(--color-text-muted)' }}>{lbl}</span>
                <span style={{
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: isIp ? 'var(--font-family-mono)' : undefined,
                  color: isIp ? 'var(--color-accent)' : isXp ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  fontWeight: 'bold'
                }}>{val}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="📑 MISSION BRIEFING">
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>{challenge.briefing}</p>
        </Card>

        <Card title="🚩 SUBMIT CAPTURED FLAG">
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}><Input type="text" placeholder="hp_flag{v3ctor_3xploited_1234}" value={flag} onChange={(e) => setFlag(e.target.value)} leftIcon="🏁" /></div>
            <Button variant="primary" onClick={handleSubmitFlag}>SUBMIT FLAG</Button>
          </div>
          {feedback && (
            <div style={{
              marginTop: '12px',
              fontSize: 'var(--font-size-xs)',
              fontFamily: 'var(--font-family-mono)',
              color: feedback.success ? 'var(--color-primary)' : 'var(--color-danger)',
              fontWeight: 'bold',
            }}>
              {feedback.message}
            </div>
          )}
        </Card>
      </div>

      {/* Right Column: Objectives and Terminal */}
      <div style={styles.col}>
        <Card title="📋 OPERATIVE OBJECTIVES">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {objectives.map(obj => (
              <label key={obj.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input type="checkbox" checked={obj.completed} onChange={() => toggleObjective(obj.id)} style={{ marginTop: '3px', cursor: 'pointer' }} />
                <span style={{ fontSize: 'var(--font-size-sm)', color: obj.completed ? 'var(--color-text-muted)' : 'var(--color-text-secondary)', textDecoration: obj.completed ? 'line-through' : 'none' }}>{obj.text}</span>
              </label>
            ))}
          </div>
          <div style={{ marginTop: '20px' }}><Button variant="outline" style={{ width: '100%' }} disabled>💡 DECRYPT HINT (DISABLED)</Button></div>
        </Card>

        <Card title="💻 SECURITY OPERATIVE TERMINAL" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={styles.terminal}>
            <div style={{ color: 'var(--color-text-primary)' }}>operative@hackerplus:~$ nmap -sC -sV {challenge.targetIp}</div>
            <div style={{ color: '#6c83a7', whiteSpace: 'pre-wrap' }}>
              Starting Nmap 7.92 ( https://nmap.org ) at 2026-07-08 04:00 UTC<br />
              Nmap scan report for {challenge.targetIp}<br />
              PORT   STATE SERVICE VERSION<br />
              22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5<br />
              80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))<br />
              |_http-title: VulnTarget Login Portal
            </div>
            <div style={styles.prompt}>
              <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>operative@hackerplus:~$</span>
              <input type="text" disabled placeholder="Establishing sandbox shell connection..." style={styles.termInput} />
            </div>
          </div>
        </Card>
      </div>
      <MissionCompleteModal
        isOpen={showModal}
        details={completeDetails}
        challengeTitle={challenge.title}
        onContinue={onAbort}
        onReplay={() => {
          onReplay();
          setFlag('');
          setFeedback(null);
          setCompleteDetails(null);
          setShowModal(false);
          setObjectives(challenge.objectives.map((obj, idx) => ({ id: idx, text: obj, completed: false })));
        }}
      />
    </div>
  );
}

const styles = {
  grid: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' },
  col: { display: 'flex', flexDirection: 'column' as const, gap: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' },
  targetRow: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', padding: '5px 0' },
  terminal: { backgroundColor: '#05070b', border: '1px solid #1a2233', borderRadius: 'var(--radius-md)', padding: '16px', fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-xs)', lineHeight: 1.5, flex: 1, display: 'flex', flexDirection: 'column' as const, gap: '10px' },
  prompt: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto', borderTop: '1px solid #101622', paddingTop: '10px' },
  termInput: { backgroundColor: 'transparent', border: 'none', color: '#6c83a7', fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-xs)', outline: 'none', flex: 1 },
};
