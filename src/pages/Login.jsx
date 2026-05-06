import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch(`http://localhost:3000/users?username=${form.username}`);
    const data = await res.json();
    if (data[0] && data[0].website === form.password) {
      login(data[0]);
      navigate('/home');
    } else {
      alert("פרטים שגויים!");
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Username" required onChange={e => setForm({...form, username: e.target.value})} /><br/>
        <input type="password" placeholder="Password" required onChange={e => setForm({...form, password: e.target.value})} /><br/>
        <button type="submit">התחבר</button>
      </form>
      <p>עוד לא רשומים? <Link to="/register">הירשמו כאן</Link></p>
    </div>
  );
};

export default Login;