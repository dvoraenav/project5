import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`http://localhost:3000/users?username=${form.username}`);
      const data = await res.json();

      if (data[0] && data[0].website === form.password) {
        login(data[0]);
        navigate('/home');
      } else {
        setError("Invalid username or password. Please try again.");
      }
    } catch (err) {
      setError("Server connection failed. Please try again later.");
    }
  };

  return (
    <div className="content-container auth-page-wrapper">
      <div className="card auth-card">
        
        {/* Brand Header */}
        <div className="auth-header">
          <div className="brand-logo auth-logo">N</div>
          <h2 className="auth-title">Sign In</h2>
          <p className="auth-subtitle">Welcome back to Network</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="auth-form">
          
          <div className="input-wrapper">
            <label className="input-label">Username</label>
            <input 
              type="text" 
              className="std-input auth-input" 
              placeholder="Enter your username" 
              required 
              onChange={e => setForm({...form, username: e.target.value})} 
            />
          </div>

          <div className="input-wrapper">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className="std-input auth-input" 
              placeholder="Enter your password" 
              required 
              onChange={e => setForm({...form, password: e.target.value})} 
            />
            {error && (
              <span className="error-message">{error}</span>
            )}
          </div>

          <button type="submit" className="primary-btn auth-submit-btn">
            Sign In
          </button>
        </form>

        {/* Footer Link */}
        <div className="auth-footer">
          <p>
            New to Network? <Link to="/register" className="auth-link">Create an account</Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;