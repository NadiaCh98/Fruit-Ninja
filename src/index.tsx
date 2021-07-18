import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'babylonjs-loaders';
import App from './App';
import { StoreProvider } from './app/common/store';
import { AppErrorBoundary } from './AppErrorBoundary';

ReactDOM.render(
  <React.StrictMode>
    <AppErrorBoundary>
      <StoreProvider>
        <App />
      </StoreProvider>
    </AppErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);
