import React, { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  // Compute variant-specific styles from the global design system variables
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'var(--color-bg-element)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        };
      case 'danger':
        return {
          backgroundColor: 'var(--color-danger)',
          color: '#ffffff',
          border: '1px solid transparent',
          boxShadow: 'var(--glow-danger)',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-accent)',
          border: '1px solid rgba(0, 212, 255, 0.4)',
          boxShadow: 'none',
        };
      case 'primary':
      default:
        return {
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-bg-base)',
          border: '1px solid transparent',
          boxShadow: 'var(--glow-primary)',
          fontWeight: 'var(--font-weight-bold)',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: 'var(--space-1) var(--space-3)',
          fontSize: 'var(--font-size-xs)',
        };
      case 'lg':
        return {
          padding: 'var(--space-4) var(--space-8)',
          fontSize: 'var(--font-size-lg)',
        };
      case 'md':
      default:
        return {
          padding: 'var(--space-3) var(--space-5)',
          fontSize: 'var(--font-size-sm)',
        };
    }
  };

  const isBtnDisabled = disabled || isLoading;

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-family-mono)',
    fontWeight: 'var(--font-weight-semibold)',
    cursor: isBtnDisabled ? 'not-allowed' : 'pointer',
    opacity: isBtnDisabled ? 0.6 : 1,
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    gap: 'var(--space-2)',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style,
  };

  return (
    <button
      disabled={isBtnDisabled}
      style={baseStyles}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && (
        <span 
          style={styles.spinner} 
          aria-hidden="true" 
        />
      )}
      {!isLoading && leftIcon && <span style={styles.icon}>{leftIcon}</span>}
      <span style={styles.content}>{children}</span>
      {!isLoading && rightIcon && <span style={styles.icon}>{rightIcon}</span>}
    </button>
  );
}

const styles = {
  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    lineHeight: 1,
  },
  spinner: {
    width: '1em',
    height: '1em',
    border: '2px solid currentColor',
    borderBottomColor: 'transparent',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.75s linear infinite',
  },
};

// CSS Keyframes are handled globally, but we add an inline styles check for safety
if (typeof document !== 'undefined' && !document.getElementById('hp-btn-keyframes')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'hp-btn-keyframes';
  styleEl.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleEl);
}
