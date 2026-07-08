import React, { ReactNode, useEffect, useRef } from 'react';

export interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({
  isOpen,
  title,
  onClose,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle backdrop clicks to dismiss
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { maxWidth: '400px' };
      case 'lg':
        return { maxWidth: '800px' };
      case 'md':
      default:
        return { maxWidth: '560px' };
    }
  };

  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(4px)',
    zIndex: 9000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  };

  const modalStyles: React.CSSProperties = {
    backgroundColor: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-xl)',
    width: '100%',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column' as const,
    boxShadow: 'var(--shadow-lg)',
    animation: 'modalSlideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards',
    ...getSizeStyles(),
  };

  return (
    <div 
      style={overlayStyles} 
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div 
        ref={modalRef} 
        style={modalStyles}
      >
        {/* Modal Header */}
        <header style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
          <button
            onClick={onClose}
            style={styles.closeBtn}
            aria-label="Close dialog"
            title="Close"
          >
            ✕
          </button>
        </header>

        {/* Modal Body */}
        <div style={styles.body}>
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <footer style={styles.footer}>
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--space-4) var(--space-5)',
    borderBottom: '1px solid var(--color-border)',
  },
  title: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--color-text-secondary)',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: 'var(--radius-xs)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  },
  body: {
    padding: 'var(--space-5)',
    overflowY: 'auto' as const,
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--space-3)',
    padding: 'var(--space-4) var(--space-5)',
    borderTop: '1px solid var(--color-border)',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderBottomLeftRadius: 'var(--radius-xl)',
    borderBottomRightRadius: 'var(--radius-xl)',
  },
};

// Add slide-up animation rules for modal transition safely
if (typeof document !== 'undefined' && !document.getElementById('hp-modal-keyframes')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'hp-modal-keyframes';
  styleEl.textContent = `
    @keyframes modalSlideUp {
      from { opacity: 0; transform: scale(0.95) translateY(10px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
  `;
  document.head.appendChild(styleEl);
}
