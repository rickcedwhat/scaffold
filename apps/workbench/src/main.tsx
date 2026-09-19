import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@scaffold/ui';
import { RenderStormProvider } from '@scaffold/core';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultMode="light">
      <RenderStormProvider>
        <App />
      </RenderStormProvider>
    </ThemeProvider>
  </React.StrictMode>
);
