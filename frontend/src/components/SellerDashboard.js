import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ChatModal from './ChatModal';
import './Dashboard.css';

const SellerDashboard = ({ user }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState({
    activeGigs: 0,
    totalOrders: 0,
    earnings: 0,
    rating: 0,
  });
  const [gigs, setGigs] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchUserProfile();
    fetchStats();
    fetchMyGigs();
    fetchMyContracts();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
        credentials: 'include',
      });
      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/stats?role=seller`, {
        credentials: 'include',
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchMyGigs = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/gigs?filter=my`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setGigs(Array.isArray(data) ? data : []);
      } else {
        setGigs([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching gigs:', error);
      setGigs([]);
      setLoading(false);
    }
  };

  const fetchMyContracts = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/contracts?role=seller`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setContracts(Array.isArray(data) ? data : []);
      } else {
        setContracts([]);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setContracts([]);
    }
  };

  const handleAcceptOrder = async (contractId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/contracts/${contractId}/accept`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (response.ok) {
        alert('Order accepted!');
        fetchMyContracts();
        fetchStats(); // Update stats immediately
      } else {
        const errorData = await response.json();
        alert(`Error accepting order: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Error accepting order');
    }
  };

  const handleCompleteOrder = async (contractId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/contracts/${contractId}/complete`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (response.ok) {
        alert('Order marked as completed!');
        fetchMyContracts();
        fetchStats(); // Update stats immediately (earnings will increase)
      } else {
        const errorData = await response.json();
        alert(`Error completing order: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Error completing order');
    }
  };

  const handleCreateGig = async (formData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/gigs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchMyGigs();
        fetchStats();
      } else {
        alert('Error creating gig');
      }
    } catch (error) {
      console.error('Error creating gig:', error);
      alert('Error creating gig');
    }
  };

  const handleToggleActive = async (gigId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/gigs/${gigId}/toggle-active`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (response.ok) {
        fetchMyGigs();
        fetchStats();
      } else {
        alert('Error updating gig status');
      }
    } catch (error) {
      console.error('Error toggling gig status:', error);
      alert('Error updating gig status');
    }
  };

  const handleDeleteGig = async (gigId) => {
    if (!window.confirm('Are you sure you want to delete this gig? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/gigs/${gigId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        fetchMyGigs();
        fetchStats();
      } else {
        alert('Error deleting gig');
      }
    } catch (error) {
      console.error('Error deleting gig:', error);
      alert('Error deleting gig');
    }
  };

  const handleLogout = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/logout`;
  };

  return (
    <div>
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-left">
          <div className="logo">Homies</div>
          <div className="nav-links">
            <a href="#dashboard">Dashboard</a>
            <a href="#gigs">My Gigs</a>
            <a href="#orders">Orders</a>
            <a href="#messages">Messages</a>
          </div>
        </div>
        <div className="user-profile">
          {userProfile?.profileImage && (
            <img src={userProfile.profileImage} alt="Profile" />
          )}
          <span>{userProfile?.name}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container">
        <div className="header">
          <h1>Seller Dashboard</h1>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            + Create New Gig
          </button>
        </div>

        {/* Stats Container */}
        <div className="stats-container">
          <div className="stat-card">
            <h3>Active Gigs</h3>
            <p>{stats.activeGigs}</p>
          </div>
          <div className="stat-card">
            <h3>Total Orders</h3>
            <p>{stats.totalOrders}</p>
          </div>
          <div className="stat-card">
            <h3>Earnings</h3>
            <p>${stats.earnings}</p>
          </div>
          <div className="stat-card">
            <h3>Rating</h3>
            <p>{stats.rating} ⭐</p>
          </div>
        </div>

        {/* Your Gigs Section */}
        <div id="gigs">
          <div className="section-title">
            <span>Your Gigs</span>
          </div>

          {gigs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              <p>No gigs yet. <button onClick={() => setShowCreateModal(true)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Create your first gig</button></p>
            </div>
          ) : (
            <>
              <div className="tabs">
                <button
                  className={`tab ${activeTab === 'active' ? 'active' : ''}`}
                  onClick={() => setActiveTab('active')}
                >
                  Active ({gigs.filter(g => g.status === 'open' && g.isActive !== false).length})
                </button>
                <button
                  className={`tab ${activeTab === 'paused' ? 'active' : ''}`}
                  onClick={() => setActiveTab('paused')}
                >
                  Paused ({gigs.filter(g => g.status === 'open' && g.isActive === false).length})
                </button>
                <button
                  className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('completed')}
                >
                  Completed
                </button>
              </div>

              <div className="projects-grid">
                {gigs
                  .filter(gig => {
                    if (activeTab === 'active') return gig.status === 'open' && gig.isActive !== false;
                    if (activeTab === 'paused') return gig.status === 'open' && gig.isActive === false;
                    if (activeTab === 'completed') return gig.status === 'completed';
                    return true;
                  })
                  .map((gig) => (
                  <div key={gig._id} className="project-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="project-header">
                      <h3 className="project-title">{gig.title}</h3>
                      <span className="badge" style={{ backgroundColor: gig.status === 'open' && gig.isActive !== false ? '#10b981' : gig.status === 'open' && gig.isActive === false ? '#f59e0b' : '#6b7280' }}>
                        {gig.status === 'open' && gig.isActive !== false ? 'Active' : gig.status === 'open' && gig.isActive === false ? 'Paused' : 'Completed'}
                      </span>
                    </div>
                    <p className="project-description">{gig.description}</p>
                    <div className="project-footer" style={{ marginBottom: '1rem' }}>
                      <span className="project-budget">${gig.budget}</span>
                      <span className="project-bids">{gig.bids?.length || 0} orders</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                      <button 
                        className="btn" 
                        style={{ flex: 1, backgroundColor: gig.isActive === false ? '#10b981' : '#f59e0b', color: 'white', padding: '0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                        onClick={() => handleToggleActive(gig._id)}
                      >
                        {gig.isActive === false ? 'Activate' : 'Deactivate'}
                      </button>
                      <button 
                        className="btn" 
                        style={{ flex: 1, backgroundColor: '#ef4444', color: 'white', padding: '0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                        onClick={() => handleDeleteGig(gig._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Gig Orders Section */}
        <div id="orders" style={{ marginTop: '3rem' }}>
          <div className="section-title" id="messages">
            <span>Gig Orders & Messages</span>
          </div>

          {contracts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              <p>No orders yet.</p>
            </div>
          ) : (
            <div className="projects-grid">
              {contracts.map((contract) => (
                <div key={contract._id} className="project-card">
                  <div className="project-header">
                    <h3 className="project-title">{contract.projectId?.title || 'Unknown Gig'}</h3>
                    <span className="badge" style={{ 
                      backgroundColor: contract.status === 'pending' ? '#f59e0b' : contract.status === 'active' ? '#3b82f6' : '#10b981' 
                    }}>
                      {contract.status === 'pending' ? 'Pending' : contract.status === 'active' ? 'Active' : 'Completed'}
                    </span>
                  </div>
                  <p className="project-description">Order Amount: ${contract.amount}</p>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '1rem', marginBottom: '1rem' }}>
                    Buyer: <strong>{contract.buyerId?.name || 'Unknown'}</strong>
                  </div>
                  {contract.status === 'pending' && (
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%' }}
                      onClick={() => handleAcceptOrder(contract._id)}
                    >
                      Accept Order
                    </button>
                  )}
                  {contract.status === 'active' && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button 
                        className="btn btn-primary" 
                        style={{ flex: 1 }}
                        onClick={() => setActiveChat({
                          contractId: contract._id,
                          title: `Chat with ${contract.buyerId?.name || 'Buyer'}`,
                        })}
                      >
                        Chat
                      </button>
                      <button 
                        className="btn btn-primary" 
                        style={{ flex: 1, backgroundColor: '#10b981' }}
                        onClick={() => handleCompleteOrder(contract._id)}
                      >
                        Complete Order
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Gig Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGig}
        title="Create a New Gig"
        fields={[
          { name: 'title', label: 'Gig Title', placeholder: 'What service do you offer?', required: true },
          { name: 'description', label: 'Description', placeholder: 'Describe your gig in detail', type: 'textarea', required: true },
          { name: 'price', label: 'Price ($)', placeholder: 'Enter your price', type: 'number', required: true },
          { name: 'category', label: 'Category', placeholder: 'e.g., Web Development, Design, Writing' },
          { name: 'skills', label: 'Skills', placeholder: 'e.g., React, Node.js, UI Design' },
        ]}
      />

      {/* Chat Modal */}
      <ChatModal 
        isOpen={!!activeChat}
        onClose={() => setActiveChat(null)}
        contractId={activeChat?.contractId}
        currentUserId={userProfile?._id}
        chatTitle={activeChat?.title}
      />
    </div>
  );
};

export default SellerDashboard;
