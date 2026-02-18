import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';
import reportWebVitals from './reportWebVitals.js';

// ✅ Correct import with .jsx extension
import { Web3Provider } from './context/Web3Context.jsx';

// Create root and render App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Web3Provider>
      <App />
    </Web3Provider>
  </React.StrictMode>
);

// Optional: measure performance in your app
reportWebVitals();
