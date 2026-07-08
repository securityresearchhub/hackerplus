// Toast notification component
function injectStyles() {
  if (document.getElementById('hp-toast-styles')) return;
  const style = document.createElement('style');
  style.id = 'hp-toast-styles';
  style.textContent = `
    #hp-toast-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: var(--z-toast, 400);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
    }
    .hp-toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.25rem;
      border-radius: 8px;
      background: var(--color-surface-2, #1e2530);
      border: 1px solid var(--color-border, #2a3040);
      color: var(--color-text-primary, #eee);
      font-size: 0.9rem;
      font-family: var(--font-sans);
      pointer-events: all;
      min-width: 280px;
      max-width: 380px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.5);
      animation: toastIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      transition: all 0.3s ease;
    }
    .hp-toast.leaving {
      animation: toastOut 0.3s ease forwards;
    }
    .hp-toast-icon { font-size: 1.25rem; flex-shrink: 0; }
    .hp-toast-msg { flex: 1; line-height: 1.4; }
    .hp-toast-close {
      background: none;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      font-size: 1rem;
      opacity: 0.6;
      transition: opacity 0.2s;
      padding: 2px;
    }
    .hp-toast-close:hover { opacity: 1; }
    .hp-toast.success { border-left: 3px solid var(--color-primary); }
    .hp-toast.error { border-left: 3px solid var(--color-danger, #e05252); }
    .hp-toast.warning { border-left: 3px solid var(--color-warning, #f59e0b); }
    .hp-toast.info { border-left: 3px solid var(--color-accent); }
    @keyframes toastIn {
      from { opacity: 0; transform: translateX(50px) scale(0.9); }
      to { opacity: 1; transform: translateX(0) scale(1); }
    }
    @keyframes toastOut {
      from { opacity: 1; transform: translateX(0) scale(1); }
      to { opacity: 0; transform: translateX(50px) scale(0.9); }
    }
  `;
  document.head.appendChild(style);
}

function getContainer() {
  let c = document.getElementById('hp-toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'hp-toast-container';
    document.body.appendChild(c);
  }
  return c;
}

const ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

export function showToast(message, type = 'info', duration = 3500) {
  injectStyles();
  const container = getContainer();

  const toast = document.createElement('div');
  toast.className = `hp-toast ${type}`;
  toast.innerHTML = `
    <span class="hp-toast-icon">${ICONS[type] || 'ℹ️'}</span>
    <span class="hp-toast-msg">${message}</span>
    <button class="hp-toast-close" aria-label="Close">✕</button>
  `;

  const close = () => {
    toast.classList.add('leaving');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };

  toast.querySelector('.hp-toast-close').addEventListener('click', close);
  container.appendChild(toast);

  if (duration > 0) setTimeout(close, duration);
  return close;
}

export const Toast = { showToast };
export default Toast;
