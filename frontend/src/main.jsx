import React from 'react'; // Changed from StrictMode to React for clarity, StrictMode is good practice though
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import UserContext from './context/UserContext.jsx';
// **CORRECTED** Import and component name
import CaptainContext from './context/CaptainContext.jsx';
import SocketProvider from './context/SocketContext.jsx';

createRoot(document.getElementById('root')).render(
  // StrictMode can be re-added if desired for development checks: <React.StrictMode>
  // **CORRECTED** Component name used
  <CaptainContext>
    <UserContext>
      <SocketProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SocketProvider>
    </UserContext>
  </CaptainContext>
  // </React.StrictMode>
);