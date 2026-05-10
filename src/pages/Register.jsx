import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  // --- State Management ---
  const [step, setStep] = useState(1);
  const [userForm, setUserForm] = useState({ username: '', website: '', name: '', email: '' });
  const [verifyPassword, setVerifyPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // --- Step 1 to Step 2 Transition ---
  const handleNext = async (e) => {
    e.preventDefault();
    setError('');

    if (userForm.website !== verifyPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/users?username=${userForm.username}`);
      const data = await res.json();
      
      if (data.length > 0) {
        setError("Username is already taken.");
      } else {
        setStep(2);
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    }
  };

  // --- Final Submit ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch(`http://localhost:3000/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      
      if (res.ok) {
        setSuccess("Account created! Redirecting to login...");
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (err) {
      setError("Registration failed.");
    }
  };

  return (
    <div className="content-container auth-page-wrapper">
      <div className="card auth-card">
        
        <div className="auth-header">
          <div className="brand-logo auth-logo">N</div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Step {step} of 2</p>
        </div>

        {success && <div className="success-message">{success}</div>}

        {/* Step 1: Account Credentials */}
        {step === 1 && !success && (
          <form onSubmit={handleNext} className="auth-form">
            <div className="input-wrapper">
              <label className="input-label">Username</label>
              <input 
                type="text"
                placeholder="Choose a username" 
                className="std-input auth-input"
                required 
                onChange={e => setUserForm({...userForm, username: e.target.value})} 
              />
            </div>

            <div className="input-wrapper">
              <label className="input-label">Password</label>
              <input 
                type="password"
                placeholder="Create a password" 
                className="std-input auth-input"
                required 
                onChange={e => setUserForm({...userForm, website: e.target.value})} 
              />
            </div>

            <div className="input-wrapper">
              <label className="input-label">Verify Password</label>
              <input 
                type="password"
                placeholder="Confirm your password" 
                className="std-input auth-input"
                required 
                onChange={e => setVerifyPassword(e.target.value)}
              />
              
              {/* Dynamic feedback based on password match */}
              {verifyPassword && (
                <span className={`password-feedback ${userForm.website === verifyPassword ? 'password-match' : 'password-mismatch'}`}>
                  {userForm.website === verifyPassword ? '✓ Passwords match' : '× Passwords do not match'}
                </span>
              )}
              {error && <span className="error-message">{error}</span>}
            </div>

            <button type="submit" className="primary-btn auth-submit-btn">Continue</button>
          </form>
        )}

        {/* Step 2: Personal Details */}
        {step === 2 && !success && (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="input-wrapper">
              <label className="input-label">Full Name</label>
              <input 
                type="text"
                placeholder="Enter your full name" 
                className="std-input auth-input"
                required 
                onChange={e => setUserForm({...userForm, name: e.target.value})} 
              />
            </div>

            <div className="input-wrapper">
              <label className="input-label">Email Address</label>
              <input 
                type="email"
                placeholder="Enter your email" 
                className="std-input auth-input"
                required 
                onChange={e => setUserForm({...userForm, email: e.target.value})} 
              />
              {error && <span className="error-message">{error}</span>}
            </div>

            <div className="register-buttons-group">
              <button type="button" className="secondary-btn" onClick={() => setStep(1)}>Back</button>
              <button type="submit" className="primary-btn">Sign Up</button>
            </div>
          </form>
        )}

        {!success && (
          <div className="auth-footer">
            <p>Already have an account? <Link to="/login" className="auth-link">Sign In</Link></p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Register;