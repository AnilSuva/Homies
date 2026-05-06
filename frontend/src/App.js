import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import ModeSelection from './components/ModeSelection';
import BuyerDashboard from './components/BuyerDashboard';
import SellerDashboard from './components/SellerDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userMode, setUserMode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    checkAuthStatus();
  };

  const handleModeSelect = (mode) => {
    setUserMode(mode);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h1>Homies</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : !userMode ? (
          <>
            <Route path="/mode-selection" element={<ModeSelection onModeSelect={handleModeSelect} user={user} />} />
            <Route path="/" element={<Navigate to="/mode-selection" replace />} />
            <Route path="*" element={<Navigate to="/mode-selection" replace />} />
          </>
        ) : (
          <>
            <Route 
              path="/buyer-dashboard" 
              element={userMode === 'buyer' ? <BuyerDashboard user={user} /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/seller-dashboard" 
              element={userMode === 'seller' ? <SellerDashboard user={user} /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/" 
              element={userMode === 'buyer' ? <Navigate to="/buyer-dashboard" replace /> : <Navigate to="/seller-dashboard" replace />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
