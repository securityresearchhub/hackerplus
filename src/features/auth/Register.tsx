import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { SessionEngine } from '../../core/utils/sessionEngine';

export function RegisterPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const tempErrors: typeof errors = {};

    if (!username) {
      tempErrors.username = 'Callsign (username) is required';
    } else if (username.length < 3) {
      tempErrors.username = 'Callsign must be at least 3 characters';
    }

    if (!email) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      tempErrors.password = 'Password key is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password key must be at least 6 characters';
    }

    if (!confirmPassword) {
      tempErrors.confirmPassword = 'Confirm your password key';
    } else if (confirmPassword !== password) {
      tempErrors.confirmPassword = 'Security keys do not match';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    // Register through SessionEngine → AuthService → localStorage
    setTimeout(() => {
      const result = SessionEngine.register(username, email, password);
      setIsLoading(false);

      if (!result.success) {
        setErrors({ form: result.error || 'Registration failed. Please try again.' });
        return;
      }

      // Registration auto-logs the user in — go straight to dashboard
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div style={styles.authBg}>
      <Card
        style={styles.authCard}
        title="🕵️ REQUEST ACCESS"
        subtitle="ENLIST AS A SECURITY OPERATIVE"
      >
        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <Input
            label="Callsign (Username)"
            type="text"
            placeholder="neo_matrix"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
            disabled={isLoading}
            leftIcon="🆔"
          />

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
            label="Choose Security Key"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            disabled={isLoading}
            leftIcon="🔑"
          />

          <Input
            label="Verify Security Key"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            disabled={isLoading}
            leftIcon="🔒"
          />

          {errors.form && (
            <div style={styles.formError}>
              ⛔ {errors.form}
            </div>
          )}

          <Button
            type="submit"
            isLoading={isLoading}
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
          >
            INITIALIZE OPERATIVE ACCOUNT
          </Button>

          <div style={styles.footerText}>
            Existing Account?{' '}
            <Link to="/login" style={styles.loginLink}>
              Authenticate
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
    gap: 'var(--space-3)',
  },
  formError: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '6px',
    padding: '10px 14px',
    fontSize: '0.8rem',
    fontFamily: 'var(--font-family-mono)',
    color: '#ef4444',
    letterSpacing: '0.3px',
  },
  footerText: {
    textAlign: 'center' as const,
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
    marginTop: 'var(--space-4)',
  },
  loginLink: {
    color: 'var(--color-accent)',
    textDecoration: 'none',
    fontWeight: 'var(--font-weight-semibold)',
  },
};
