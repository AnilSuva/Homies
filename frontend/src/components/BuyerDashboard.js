import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ChatModal from './ChatModal';
import './Dashboard.css';

const BuyerDashboard = ({ user }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalSpent: 0,
  });
  const [projects, setProjects] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [activeReview, setActiveReview] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
    fetchStats();
    fetchMyProjects();
    fetchAvailableGigs();
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/stats?role=buyer`, {
        credentials: 'include',
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchMyProjects = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/projects?filter=my`, {
        credentials: 'include',
      });
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchAvailableGigs = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/gigs`, {
        credentials: 'include',
      });
      const data = await response.json();
      setGigs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching gigs:', error);
      setLoading(false);
    }
  };

  const fetchMyContracts = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/contracts?role=buyer`, {
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

  const handleBookGig = async (gigId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/contracts/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ gigId }),
      });

      if (response.ok) {
        alert('Gig booked successfully! Waiting for seller to accept.');
        fetchMyContracts();
      } else {
        const errorData = await response.json();
        alert(`Error booking gig: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error booking gig:', error);
      alert('Error booking gig');
    }
  };

  const handleCreateProject = async (formData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchMyProjects();
        fetchStats();
      } else {
        alert('Error creating project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        fetchMyProjects();
        fetchStats();
      } else {
        alert('Error deleting project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    }
  };

  const handleReviewSubmit = async (formData) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/contracts/${activeReview}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          rating: Number(formData.rating),
          comment: formData.comment,
        }),
      });

      if (response.ok) {
        alert('Review submitted successfully!');
        setActiveReview(null);
        fetchMyContracts();
      } else {
        const errorData = await response.json();
        alert(`Error submitting review: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review');
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
            <a href="#projects">My Projects</a>
            <a href="#orders">My Orders</a>
            <a href="#gigs">Available Gigs</a>
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
          <h1>Buyer Dashboard</h1>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            + Post a New Project
          </button>
        </div>

        {/* Stats Container */}
        <div className="stats-container">
          <div className="stat-card">
            <h3>Total Projects</h3>
            <p>{stats.totalProjects}</p>
          </div>
          <div className="stat-card">
            <h3>Active Projects</h3>
            <p>{stats.activeProjects}</p>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <p>{stats.completedProjects}</p>
          </div>
          <div className="stat-card">
            <h3>Total Spent</h3>
            <p>${stats.totalSpent}</p>
          </div>
        </div>

        {/* Your Projects Section */}
        <div id="projects">
          <h2 className="section-title">Your Projects</h2>
          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              <p>No projects yet. <button onClick={() => setShowCreateModal(true)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Post your first project</button></p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <div key={project._id} className="project-card">
                  <div className="project-content">
                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-description">{project.description}</p>
                    <div className="project-footer" style={{ marginBottom: '1rem' }}>
                      <span className="project-budget">${project.budget}</span>
                      <span className="project-bids">{project.bids?.length || 0} bids</span>
                    </div>
                    <div style={{ display: 'flex', marginTop: 'auto' }}>
                      <button 
                        className="btn" 
                        style={{ width: '100%', backgroundColor: '#ef4444', color: 'white', padding: '0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                        onClick={() => handleDeleteProject(project._id)}
                      >
                        Delete Project
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Gigs/Services Section */}
        <div id="gigs" style={{ marginTop: '3rem' }}>
          <h2 className="section-title">Available Gigs from Sellers</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              <p>Loading gigs...</p>
            </div>
          ) : gigs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              <p>No gigs available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="projects-grid">
              {gigs.map((gig) => (
                <div key={gig._id} className="project-card">
                  <div className="project-content">
                    <h3 className="project-title">{gig.title}</h3>
                    <p className="project-description">{gig.description}</p>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem' }}>
                      By: <strong>{gig.sellerId?.name || 'Unknown'}</strong>
                    </div>
                    <div className="project-footer">
                      <span className="project-budget">${gig.budget}</span>
                      <span className="project-bids">⭐ {gig.sellerId?.rating || 'N/A'}</span>
                    </div>
                    <button 
                      className="btn btn-primary" 
                      style={{ marginTop: '1rem', width: '100%' }}
                      onClick={() => handleBookGig(gig._id)}
                    >
                      Book Gig
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Orders Section */}
        <div id="orders" style={{ marginTop: '3rem' }}>
          <h2 className="section-title" id="messages">My Orders & Messages</h2>
          {contracts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              <p>You haven't booked any gigs yet.</p>
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
                      {contract.status === 'pending' ? 'Pending Acceptance' : contract.status === 'active' ? 'Active' : 'Completed'}
                    </span>
                  </div>
                  <p className="project-description">Order for ${contract.amount}</p>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '1rem' }}>
                    Seller: <strong>{contract.sellerId?.name || 'Unknown'}</strong>
                  </div>
                  {contract.status === 'active' && (
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%', marginTop: '1rem' }}
                      onClick={() => setActiveChat({
                        contractId: contract._id,
                        title: `Chat with ${contract.sellerId?.name || 'Seller'}`,
                      })}
                    >
                      Chat with Seller
                    </button>
                  )}
                  {contract.status === 'completed' && (
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%', marginTop: '1rem', backgroundColor: '#10b981' }}
                      onClick={() => setActiveReview(contract._id)}
                    >
                      Rate Order
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
        title="Post a New Project"
        fields={[
          { name: 'title', label: 'Project Title', placeholder: 'Enter project title', required: true },
          { name: 'description', label: 'Description', placeholder: 'Describe your project in detail', type: 'textarea', required: true },
          { name: 'budget', label: 'Budget ($)', placeholder: 'Enter your budget', type: 'number', required: true },
          { name: 'category', label: 'Category', placeholder: 'e.g., Web Development, Design, Writing' },
          { name: 'skills', label: 'Required Skills', placeholder: 'e.g., React, Node.js, UI Design' },
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

      {/* Review Modal */}
      <Modal
        isOpen={!!activeReview}
        onClose={() => setActiveReview(null)}
        title="Rate this Order"
        onSubmit={handleReviewSubmit}
        fields={[
          { name: 'rating', label: 'Rating (1-5)', type: 'number', placeholder: '5', min: 1, max: 5 },
          { name: 'comment', label: 'Comment (Optional)', placeholder: 'Great work!', type: 'textarea' },
        ]}
      />
    </div>
  );
};

export default BuyerDashboard;
