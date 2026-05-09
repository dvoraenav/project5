import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// --- SVG Icons ---
const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
);
const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);

const Info = () => {
  const { user } = useAuth(); // Get current user data from context
  const navigate = useNavigate(); // Hook for navigation

  // Prevent rendering if user data is not yet loaded
  if (!user) return null;

  // Generate an avatar initial based on the first letter of the user's name
  const firstLetter = user.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="content-container">
      {/* Back button triggers browser's history back action */}
      <button className="secondary-btn" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
        ← Back
      </button>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px 20px' }}>
        
        {/* Avatar Area: Visual circle representing the user */}
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: 'var(--brand-primary)',
          color: 'white',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
        }}>
          {firstLetter}
        </div>

        {/* Profile Header: Name and dynamic username generation */}
        <h2 style={{ margin: '0 0 5px 0', fontSize: '2rem', color: 'var(--text-main)' }}>
          {user.name}
        </h2>
        <p style={{ margin: '0 0 40px 0', color: 'var(--text-muted)', fontSize: '1rem' }}>
          @{user.username || user.name.toLowerCase().replace(/\s/g, '')}
        </p>

        {/* Personal Details Section */}
        <div style={{ width: '100%', maxWidth: '450px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Email Information Box */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px', 
            padding: '16px 20px', 
            backgroundColor: '#F8FAFC', 
            border: '1px solid var(--border-light)', 
            borderRadius: '12px' 
          }}>
            <div style={{ color: 'var(--brand-primary)', display: 'flex' }}>
              <MailIcon />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Email Address
              </span>
              <span style={{ color: 'var(--text-main)', fontWeight: '500', fontSize: '1.05rem' }}>
                {user.email}
              </span>
            </div>
          </div>

          {/* Location Information Box: Safe access to nested address object */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px', 
            padding: '16px 20px', 
            backgroundColor: '#F8FAFC', 
            border: '1px solid var(--border-light)', 
            borderRadius: '12px' 
          }}>
            <div style={{ color: 'var(--brand-primary)', display: 'flex' }}>
              <MapPinIcon />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Location
              </span>
              <span style={{ color: 'var(--text-main)', fontWeight: '500', fontSize: '1.05rem' }}>
                {user.address?.city || 'Not specified'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Info;