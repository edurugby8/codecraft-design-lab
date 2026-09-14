import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@fontsource/bodoni-moda/400.css';
import '@fontsource/bodoni-moda/500.css';
import '@fontsource/bodoni-moda/600.css';
import '@fontsource/bodoni-moda/700.css';
import '@fontsource/bodoni-moda/500-italic.css';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/space-mono/400.css';
import '@fontsource/space-mono/700.css';

import './styles/global.css';
import App from './App';
import { MotionProvider } from './hooks/useMotion';

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <MotionProvider>
      <App />
    </MotionProvider>
  </StrictMode>,
);
