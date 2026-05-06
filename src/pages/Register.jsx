import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [step, setStep] = useState(1);
  const [userForm, setUserForm] = useState({ username: '', website: '', name: '', email: '' });
  const navigate = useNavigate();

  const handleNext = async (e) => {
    e.preventDefault();
    // בדיקה אם המשתמש קיים
    const res = await fetch(`http://localhost:3000/users?username=${userForm.username}`);
    const data = await res.json();
    if (data.length > 0) {
      alert("שם המשתמש כבר תפוס!");
    } else {
      setStep(2);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch(`http://localhost:3000/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userForm)
    });
    if (res.ok) {
      alert("נרשמת בהצלחה!");
      navigate('/login');
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h2>הרשמה - שלב {step}</h2>
      {step === 1 ? (
        <form onSubmit={handleNext}>
          <input placeholder="Username" required onChange={e => setUserForm({...userForm, username: e.target.value})} /><br/>
          <input placeholder="Password (website)" required onChange={e => setUserForm({...userForm, website: e.target.value})} /><br/>
          <button type="submit">המשך</button>
        </form>
      ) : (
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