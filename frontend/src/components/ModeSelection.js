import React, { useState, useEffect } from 'react';
import './ModeSelection.css';

const ModeSelection = ({ onModeSelect, user }) => {
  const [selectedMode, setSelectedMode] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Fetch user data from API
    const fetchUser = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
          credentials: 'include',
        });
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
  };

  const handleContinue = () => {
    if (selectedMode) {
      onModeSelect(selectedMode);
    }
  };

  const handleLogout = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/logout`;
  };

  return (
    <div className="mode-container" id="modeSelectionPage">
      <div className="logo">
        <h1>Homies</h1>
      </div>

      <div className="welcome-message">
        <h2>Welcome back, <span id="username">{userData?.name || 'User'}</span>!</h2>
        <p>Please select your mode</p>
      </div>

      <div className="mode-selection">
        <div
          className={`mode-card ${selectedMode === 'buyer' ? 'selected' : ''}`}
          id="buyerMode"
          onClick={() => handleModeSelect('buyer')}
        >
          <div className="mode-icon">👔</div>
          <h3 className="mode-title">Buyer Mode</h3>
          <p className="mode-description">
            Hire freelancers for your projects. Post jobs and manage contracts.
          </p>
        </div>

        <div
          className={`mode-card ${selectedMode === 'seller' ? 'selected' : ''}`}
          id="sellerMode"
          onClick={() => handleModeSelect('seller')}
        >
          <div className="mode-icon">🛠️</div>
          <h3 className="mode-title">Seller Mode</h3>
          <p className="mode-description">
            Offer your services. Find projects and get hired.
          </p>
        </div>
      </div>

      <button
        className="continue-btn"
        id="continueBtn"
        disabled={!selectedMode}
        onClick={handleContinue}
      >
        Continue
      </button>
      <a href="#logout" className="logout-link" id="logoutLink" onClick={handleLogout}>
        Not you? Sign out
      </a>
    </div>
  );
};

export default ModeSelection;
