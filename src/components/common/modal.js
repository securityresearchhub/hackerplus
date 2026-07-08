// Modal component
function injectStyles() {
  if (document.getElementById('hp-modal-styles')) return;
  const style = document.createElement('style');
  style.id = 'hp-modal-styles';
  style.textContent = `
    .hp-modal-backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.75);
      z-index: var(--z-modal, 300);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      animation: backdropIn 0.2s ease;
    }
    @keyframes backdropIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .hp-modal {
      background: var(--color-surface-1, #101620);
      border: 1px solid var(--color-border, #2a3040);
      border-radius: 12px;
      padding: 2rem;
      max-width: 560px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      animation: modalIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 20px 60px rgba(0,0,0,0.7);
    }
    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.9) translateY(-20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .hp-modal-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: 1.25rem;
      padding-right: 2rem;
    }
    .hp-modal-close {
      position: absolute; top: 1rem; right: 1rem;
      background: none; border: none;
      color: var(--color-text-secondary);
      font-size: 1.25rem; cursor: pointer;
      opacity: 0.7; transition: opacity 0.2s;
      padding: 4px 8px; border-radius: 4px;
    }
    .hp-modal-close:hover { opacity: 1; background: var(--color-surface-2); }
    .hp-modal-actions {
      display: flex; gap: 0.75rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border);
    }
  `;
  document.head.appendChild(style);
}

export function showModal({ title, content, actions, onClose, size = 'md' }) {
  injectStyles();

  const backdrop = document.createElement('div');
  backdrop.className = 'hp-modal-backdrop';

  const maxWidths = { sm: '400px', md: '560px', lg: '720px', xl: '900px' };

  const modal = document.createElement('div');
  modal.className = 'hp-modal';
  modal.style.maxWidth = maxWidths[size] || maxWidths.md;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'hp-modal-close';
  closeBtn.innerHTML = '✕';
  closeBtn.setAttribute('aria-label', 'Close modal');

  const titleEl = document.createElement('div');
  titleEl.className = 'hp-modal-title';
  titleEl.textContent = title;

  const body = document.createElement('div');
  body.className = 'hp-modal-body';
  if (typeof content === 'string') {
    body.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    body.appendChild(content);
  }

  modal.appendChild(closeBtn);
  modal.appendChild(titleEl);
  modal.appendChild(body);

  if (actions && actions.length) {
    const actionsEl = document.createElement('div');
    actionsEl.className = 'hp-modal-actions';
    actions.forEach(({ label, onClick, variant = 'secondary' }) => {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.className = `hp-btn hp-btn-${variant}`;
      btn.style.cssText = variant === 'primary'
        ? 'padding: 0.6rem 1.5rem; background: var(--color-primary); color: #000; border: none; border-radius: 6px; font-weight: 700; cursor: pointer;'
        : 'padding: 0.6rem 1.5rem; background: var(--color-surface-2); color: var(--color-text-primary); border: 1px solid var(--color-border); border-radius: 6px; font-weight: 600; cursor: pointer;';
      btn.addEventListener('click', () => { if (onClick) onClick(); });
      actionsEl.appendChild(btn);
    });
    modal.appendChild(actionsEl);
  }

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  const close = () => {
    backdrop.style.animation = 'backdropIn 0.2s ease reverse';
    setTimeout(() => { backdrop.remove(); if (onClose) onClose(); }, 200);
  };

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  });

  return { close, modal };
}

export const Modal = { showModal };
export default Modal;
