import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';
import MillSelector from './pages/MillSelector';
import MillDashboard from './pages/MillDashboard';

export default function App() {
  return (
    <Router>
      <div className="scanlines">
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'toast-cyber',
            duration: 3500,
            style: {
              background: '#080e18',
              border: '1px solid rgba(0,200,255,0.4)',
              color: '#e8f4fd',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '15px'
            }
          }}
        />
        <Routes>
          <Route path="/" element={<MillSelector />} />
          <Route path="/mill/:millId/*" element={<MillDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
