import React, { InputHTMLAttributes, ReactNode, useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  style,
  disabled,
  ...props
}: InputProps) {
  const inputId = useId();
  const helperId = useId();
  const errorId = useId();

  const isInvalid = !!error;

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-2)',
    width: '100%',
    fontFamily: 'var(--font-family-sans)',
  };

  const inputWrapperStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    position: 'relative' as const,
    width: '100%',
  };

  const fieldStyles: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'var(--color-bg-element)',
    border: `1px solid ${isInvalid ? 'var(--color-danger)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-family-sans)',
    fontSize: 'var(--font-size-sm)',
    padding: 'var(--space-3)',
    paddingLeft: leftIcon ? 'var(--space-10)' : 'var(--space-3)',
    paddingRight: rightIcon ? 'var(--space-10)' : 'var(--space-3)',
    outline: 'none',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    ...style,
  };

  return (
    <div style={containerStyles}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId} 
          style={styles.label}
        >
          {label}
        </label>
      )}

      {/* Input Field wrapper for potential icons */}
      <div style={inputWrapperStyles}>
        {leftIcon && (
          <span style={{ ...styles.icon, left: 'var(--space-3)' }}>
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          disabled={disabled}
          style={fieldStyles}
          className="hp-input-field"
          aria-invalid={isInvalid}
          aria-describedby={
            isInvalid ? errorId : helperText ? helperId : undefined
          }
          {...props}
        />

        {rightIcon && (
          <span style={{ ...styles.icon, right: 'var(--space-3)' }}>
            {rightIcon}
          </span>
        )}
      </div>

      {/* Error Message */}
      {isInvalid && (
        <span 
          id={errorId} 
          style={styles.error} 
          role="alert"
        >
          ⚠️ {error}
        </span>
      )}

      {/* Helper text */}
      {!isInvalid && helperText && (
        <span 
          id={helperId} 
          style={styles.helper}
        >
          {helperText}
        </span>
      )}
    </div>
  );
}

const styles = {
  label: {
    fontSize: 'var(--font-size-xs)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--color-text-secondary)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
  },
  icon: {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-muted)',
    pointerEvents: 'none' as const,
    zIndex: 2,
  },
  error: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-danger)',
    fontFamily: 'var(--font-family-mono)',
  },
  helper: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    fontFamily: 'var(--font-family-mono)',
  },
};

// Inject Focus styling rules safely
if (typeof document !== 'undefined' && !document.getElementById('hp-input-styles')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'hp-input-styles';
  styleEl.textContent = `
    .hp-input-field:focus {
      border-color: var(--color-accent) !important;
      box-shadow: var(--glow-accent) !important;
    }
  `;
  document.head.appendChild(styleEl);
}
