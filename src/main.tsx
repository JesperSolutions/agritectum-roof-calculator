import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import RoofImpactWizard from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RoofImpactWizard />
  </StrictMode>
);
