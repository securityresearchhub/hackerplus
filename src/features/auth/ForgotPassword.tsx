import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

export function ForgotPasswordPage() {
  // State variables
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Validate form entries
  const validateForm = () => {
    if (!email) {
      setError('Email address is required to locate callsign');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    setError('');
    return true;
  };

  // Mock submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    // Mock network request to generate recovery payload
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccessOpen(true);
    }, 1200);
  };

  return (
    <div style={styles.authBg}>
      <Card
        style={styles.authCard}
        title="⚠️ KEY RECOVERY"
        subtitle="RETRIEVE ACCESS CREDENTIALS"
      >
        <p style={styles.description}>
          Enter your registered email below. We will send a security recovery link to authenticate your browser terminal.
        </p>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <Input
            label="Recovery Email"
            type="email"
            placeholder="operative@hackerplus.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            disabled={isLoading}
            leftIcon="📧"
          />

          <Button
            type="submit"
            isLoading={isLoading}
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
          >
            TRANSMIT RECOVERY KEY
          </Button>

          <div style={styles.footerText}>
            <Link to="/login" style={styles.loginLink}>
              Return to Authentication
            </Link>
          </div>
        </form>
      </Card>

      {/* Success Modal */}
      <Modal
        isOpen={isSuccessOpen}
        title="🛰️ TRANSMISSION SUCCESSFUL"
        onClose={() => setIsSuccessOpen(false)}
        footer={
          <Link to="/login">
            <Button variant="primary">PROCEED TO LOGIN</Button>
          </Link>
        }
      >
        <div style={styles.modalContent}>
          <span style={styles.modalIcon}>📬</span>
          <h4>Recovery Payload Dispatched</h4>
          <p style={styles.modalText}>
            An access package has been queued for delivery to <strong>{email}</strong>. Check your inbox and click the security link within 15 minutes to reset your terminal keys.
          </p>
        </div>
      </Modal>
    </div>
  );
}

const styles = {
  authBg: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg-base)',
    padding: '20px',
  },
  authCard: {
    width: '100%',
    maxWidth: '420px',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-lg)',
  },
  description: {
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.5',
    margin: '0 0 10px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-4)',
  },
  footerText: {
    textAlign: 'center' as const,
    fontSize: '0.85rem',
    marginTop: 'var(--space-4)',
  },
  loginLink: {
    color: 'var(--color-accent)',
    textDecoration: 'none',
    fontWeight: 'var(--font-weight-semibold)',
  },
  modalContent: {
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  modalIcon: {
    fontSize: '3rem',
    marginBottom: 'var(--space-2)',
    display: 'block',
  },
  modalText: {
    color: 'var(--color-text-secondary)',
    lineHeight: '1.6',
    fontSize: '0.9rem',
    margin: 0,
  },
};
