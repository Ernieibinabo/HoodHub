import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';
import reportWebVitals from './reportWebVitals.js';

// ✅ Web3 Context
import { Web3Provider } from './context/Web3Context.jsx';

/* ---------- APPLY SAVED THEME BEFORE REACT LOADS ---------- */
/*
   This prevents light-mode flash on refresh
   and restores the user's saved preference.
*/
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.classList.add(savedTheme);

/* ---------- RENDER APP ---------- */
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Web3Provider>
      <App />
    </Web3Provider>
  </React.StrictMode>
);

/* ---------- PERFORMANCE (OPTIONAL) ---------- */
reportWebVitals();