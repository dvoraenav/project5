import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Logout Icon SVG
const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const Navbar = () => {
  const { user, logout } = useAuth(); // Assuming logout exists in your context
  const navigate = useNavigate();

  const handleLogout = () => {
    // If you have a logout function in AuthContext, call it here. 
    // Otherwise, just navigate to login to clear the flow.
    if (logout) logout();
    navigate('/login');
  };

  if (!user) return null;

  const firstLetter = user.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <nav className="main-navbar">
      {/* Brand / Logo Area */}
      <div className="nav-brand">
        <div className="brand-logo">N</div>
        <span className="brand-name">Network</span>
      </div>

      {/* Main Navigation Links */}
      <div className="nav-links">
        <NavLink 
          to="/home/posts" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          Feed
        </NavLink>
        
        <NavLink 
          to="/home/albums" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          Albums
        </NavLink>
        
        <NavLink 
          to="/home/todos" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          Tasks
        </NavLink>
      </div>

      {/* User Profile & Logout */}
      <div className="nav-profile">
        <NavLink 
          to="/home/info" 
          className={({ isActive }) => isActive ? "profile-link active" : "profile-link"}
          title="My Profile"
        >
          <div className="nav-avatar">{firstLetter}</div>
          <span className="nav-username">{user.name.split(' ')[0]}</span>
        </NavLink>
        
        <button 
          className="icon-btn logout-btn" 
          onClick={handleLogout} 
          title="Sign Out"
        >
          <LogoutIcon />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;