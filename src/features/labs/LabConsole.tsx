import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LabInfo } from '../../core/utils/sessionEngine';
import { SessionEngine } from '../../core/utils/sessionEngine';
import { LabSessionService } from '../../core/utils/labSessionService';

interface LabConsoleProps {
  lab: LabInfo;
  onAbort: () => void;
}

export function LabConsole({ lab, onAbort }: LabConsoleProps) {
  const [flag, setFlag] = useState('');
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  const session = SessionEngine.getCurrentSession().session;
  const expiresAt = session.activeLabExpiresAt;

  // Status polling every 5 seconds
  React.useEffect(() => {
    if (!session.activeLabSessionId) return;

    const interval = setInterval(async () => {
      try {
        const status = await LabSessionService.pollStatus(session.activeLabSessionId!);
        if (status.status === 'expired' || status.status === 'terminated' || status.status === 'failed') {
          clearInterval(interval);
          onAbort();
        }
      } catch (err) {
        console.warn('[LabConsole] Active status poll failed:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [session.activeLabSessionId, onAbort]);

  // TTL countdown timer
  React.useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Expired');
        onAbort();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const parts = [];
      if (hours > 0) parts.push(`${hours}h`);
      parts.push(`${mins}m`);
      parts.push(`${secs}s`);

      setTimeLeft(parts.join(' '));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onAbort]);

  const handleSubmitFlag = async () => {
    setIsSubmitting(true);
    try {
      const res = await SessionEngine.submitLabFlag(lab.id, flag);
      setFeedback(res);
      if (res.success) {
        setTimeout(() => {
          onAbort();
        }, 1500);
      }
    } catch (err: any) {
      setFeedback({ success: false, message: err?.message || 'Flag submission failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <span style={styles.activeTag}>
            📡 ACTIVE CONTAINER RUNTIME {timeLeft ? `• TIME REMAINING: ${timeLeft}` : ''}
          </span>
          <h3 style={styles.title}>{lab.title}</h3>
          <span style={styles.category}>{lab.category}</span>
        </div>
        <Button variant="danger" size="sm" onClick={onAbort}>ABORT SESSION</Button>
      </div>

      <div style={styles.split}>
        <Card title="🎯 INSTANCE ATTRIBUTES">
          <div style={styles.targetRow}>
            {[[ 'TARGET IP ADDRESS:', lab.targetIp || '10.10.85.3', true ], [ 'TARGET WORKSPACE URL:', lab.targetUrl || 'http://10.10.85.3', false, true ], [ 'COMPLEXITY:', lab.difficulty ], [ 'REWARD:', `${lab.xp} XP` ]].map(([lbl, val, isIp, isLink]) => (
              <div key={String(lbl)} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={styles.lbl}>{lbl}</span>
                {isLink ? (
                  <a href={String(val)} target="_blank" rel="noreferrer" style={styles.targetLink}>{val}</a>
                ) : (
                  <span style={{
                    fontSize: 'var(--font-size-sm)',
                    fontFamily: isIp ? 'var(--font-family-mono)' : undefined,
                    color: isIp ? 'var(--color-accent)' : 'var(--color-text-primary)',
                    fontWeight: 'bold'
                  }}>{val}</span>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
            <Button
              variant="primary"
              onClick={() => window.open(lab.targetUrl || undefined, '_blank')}
              disabled={!lab.targetUrl}
              style={{ width: '100%' }}
            >
              🚀 LAUNCH TARGET
            </Button>
          </div>
        </Card>

        <Card title="🚩 SUBMIT DECRYPTED FLAG">
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <Input
                type="text"
                placeholder="hp_flag{sql_login_bypass_728}"
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                leftIcon="🏁"
              />
            </div>
            <Button variant="primary" onClick={handleSubmitFlag} disabled={isSubmitting}>
              {isSubmitting ? 'VERIFYING...' : 'SUBMIT FLAG'}
            </Button>
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
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column' as const, gap: '24px', fontFamily: 'var(--font-family-sans)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' },
  activeTag: { fontFamily: 'var(--font-family-mono)', fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 'bold' as const, letterSpacing: '1px' },
  title: { fontSize: 'var(--font-size-md)', color: 'var(--color-text-primary)', fontWeight: 'bold' as const, margin: 0 },
  category: { fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' },
  split: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' },
  targetRow: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', padding: '5px 0' },
  lbl: { fontSize: '0.65rem', fontFamily: 'var(--font-family-mono)', color: 'var(--color-text-muted)' },
  targetLink: { fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-family-mono)', color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: 'bold' as const },
};
export default LabConsole;
