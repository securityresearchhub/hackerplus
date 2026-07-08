import React, { ReactNode } from 'react';

export interface CardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
  hoverGlow?: boolean;
  onClick?: () => void;
  children: ReactNode;
  footer?: ReactNode;
  style?: React.CSSProperties;
}

export function Card({
  title,
  subtitle,
  extra,
  hoverGlow = false,
  onClick,
  children,
  footer,
  style,
}: CardProps) {
  const isClickable = !!onClick;

  const cardStyles: React.CSSProperties = {
    backgroundColor: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-5)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-4)',
    boxShadow: 'var(--shadow-md)',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: isClickable ? 'pointer' : 'default',
    position: 'relative' as const,
    ...style,
  };

  return (
    <div
      style={cardStyles}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={hoverGlow ? 'hp-card-glow' : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {/* Optional Card Header */}
      {(title || subtitle || extra) && (
        <div style={styles.header}>
          <div style={styles.titleArea}>
            {title && <div style={styles.title}>{title}</div>}
            {subtitle && <div style={styles.subtitle}>{subtitle}</div>}
          </div>
          {extra && <div style={styles.extra}>{extra}</div>}
        </div>
      )}

      {/* Card Body */}
      <div style={styles.body}>{children}</div>

      {/* Optional Card Footer */}
      {footer && <div style={styles.footer}>{footer}</div>}
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: 'var(--space-3)',
  },
  titleArea: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-1)',
  },
  title: {
    fontSize: 'var(--font-size-md)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-text-primary)',
    letterSpacing: '0.5px',
  },
  subtitle: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    fontFamily: 'var(--font-family-mono)',
  },
  extra: {
    display: 'flex',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.6',
  },
  footer: {
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: 'var(--space-3)',
    marginTop: 'auto',
  },
};

// Inject hover glow keyframes and styles safely
if (typeof document !== 'undefined' && !document.getElementById('hp-card-styles')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'hp-card-styles';
  styleEl.textContent = `
    .hp-card-glow:hover {
      border-color: var(--color-accent) !important;
      box-shadow: var(--glow-accent) !important;
      transform: translateY(-2px);
    }
  `;
  document.head.appendChild(styleEl);
}
