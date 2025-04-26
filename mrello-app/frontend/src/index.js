// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
// Remove default CRA index.css import if you manage global styles elsewhere
// import './index.css';
import App from './App'; // Ensure this points to App.jsx (or App.js if you didn't rename)
import reportWebVitals from './reportWebVitals';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();