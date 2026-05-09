import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  // --- State Management ---
  const [step, setStep] = useState(1); // Tracks current step in the multi-stage registration
  const [userForm, setUserForm] = useState({ username: '', website: '', name: '', email: '' });
  const navigate = useNavigate();

  const handleNext = async (e) => {
    e.preventDefault();
    
    // Check if the username is already taken before proceeding to next step
    const res = await fetch(`http://localhost:3000/users?username=${userForm.username}`);
    const data = await res.json();
    
    if (data.length > 0) {
      alert("שם המשתמש כבר תפוס!");
    } else {
      setStep(2); // Proceed to personal details stage
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Submit the complete user object to the database
    const res = await fetch(`http://localhost:3000/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userForm)
    });
    
    if (res.ok) {
      alert("נרשמת בהצלחה!");
      navigate('/login'); // Redirect to login page after successful registration
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h2>הרשמה - שלב {step}</h2>
      
      {/* Conditional Rendering: Step 1 - Account Credentials */}
      {step === 1 ? (
        <form onSubmit={handleNext}>
          <input placeholder="Username" required onChange={e => setUserForm({...userForm, username: e.target.value})} /><br/>
          <input placeholder="Password (website)" required onChange={e => setUserForm({...userForm, website: e.target.value})} /><br/>
          <button type="submit">המשך</button>
        </form>
      ) : (
        /* Step 2 - Personal Information */
        <form onSubmit={handleRegister}>
          <input placeholder="Full Name" required onChange={e => setUserForm({...userForm, name: e.target.value})} /><br/>
          <input placeholder="Email" required onChange={e => setUserForm({...userForm, email: e.target.value})} /><br/>
          <button type="submit">סיים הרשמה</button>
        </form>
      )}
    </div>
  );
};

export default Register;