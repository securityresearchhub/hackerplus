import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export function LoginPage() {
  const navigate = useNavigate();
  
  // State variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Validate form entries
  const validateForm = () => {
    const tempErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Mock submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate authenticating against local-first database
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div style={styles.authBg}>
      <Card 
        style={styles.authCard}
        title="🔑 CONSOLE LOGIN"
        subtitle="HACKERPLUS SECURE GATEWAY"
      >
        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <Input
            label="Email Address"
            type="email"
            placeholder="operative@hackerplus.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            disabled={isLoading}
            leftIcon="📧"
          />

          <Input
            label="Security Passkey"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={isLoading}
            leftIcon="🔒"
          />

          <div style={styles.extraRow}>
            <Link to="/forgot-password" style={styles.forgotLink}>
              Recover Key?
            </Link>
          </div>

          <Button 
            type="submit" 
            isLoading={isLoading} 
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
          >
            AUTHORIZE SESSION
          </Button>

          <div style={styles.footerText}>
            New Operative?{' '}
            <Link to="/register" style={styles.registerLink}>
              Request Access
            </Link>
          </div>
        </form>
      </Card>
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
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-4)',
  },
  extraRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '-5px',
  },
  forgotLink: {
    color: 'var(--color-text-muted)',
    textDecoration: 'none',
    fontSize: '0.8rem',
    fontFamily: 'var(--font-family-mono)',
    transition: 'color 0.2s ease',
  },
  footerText: {
    textAlign: 'center' as const,
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
    marginTop: 'var(--space-4)',
  },
  registerLink: {
    color: 'var(--color-accent)',
    textDecoration: 'none',
    fontWeight: 'var(--font-weight-semibold)',
  },
};
