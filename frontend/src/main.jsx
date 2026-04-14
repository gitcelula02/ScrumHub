import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

/**
 * Entry point for the ScrumHub React application.
 * Mounts the root App component into the #root element in index.html.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
