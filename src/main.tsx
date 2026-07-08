import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/theme.css';

// React mounting setup.
// If index.html doesn't contain a #root element, we will fallback to app or create one.
const rootElement = document.getElementById('root') || document.getElementById('app') || document.body;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Dismiss loading screen after mounting
const loader = document.getElementById('loading-screen');
if (loader) {
  loader.classList.add('hidden');
}
