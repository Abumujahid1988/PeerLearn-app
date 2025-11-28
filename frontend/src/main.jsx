import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { EnrollmentProvider } from './context/EnrollmentContext';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ToastContainer';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <BrowserRouter>
      <AuthProvider>
        <EnrollmentProvider>
            <ToastProvider>
              <App />
              <ToastContainer />
            </ToastProvider>
        </EnrollmentProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
