import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { App } from './components/App';
import { ToastContainer } from 'react-toastify';
import './styles/index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
    <ToastContainer />
  </React.StrictMode>
);

reportWebVitals();
