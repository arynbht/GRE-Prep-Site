import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initReveal } from './lib/reveal';
// Vellum design system. Order matters:
//   tokens    defines every --vlm-* custom property, light and dark
//   utilities the answer row and the shared helper classes
//   app       the existing stylesheet, which now aliases onto the tokens
//   motion    last, so its prefers-reduced-motion block wins by source order
import '../design-system/css/tokens.css';
// Glassmorphism theme from the UI/UX Pro Max design system. Redefines the
// --vlm-* semantic tokens, so it must come after tokens.css and before
// anything that consumes them.
import '../design-system/css/glass-theme.css';
import '../design-system/css/utilities.css';
import './styles/glass.css';
import './styles.css';
import '../design-system/css/motion.css';

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root element in index.html');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Scroll reveal, Subtle tier. Started after mount so the first paint is never
// blocked, and it degrades to "everything visible" if it never runs.
initReveal();
