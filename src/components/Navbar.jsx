import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={{ padding: '15px', background: '#282c34', color: 'white', display: 'flex', gap: '20px', alignItems: 'center' }}>
      <span style={{ fontWeight: 'bold' }}>{user.name}</span>
      <Link style={{ color: 'white' }} to="/home/info">Info</Link>
      <Link style={{ color: 'white' }} to="/home/todos">Todos</Link>
      <Link style={{ color: 'white' }} to="/home/posts">Posts</Link>
      <Link style={{ color: 'white' }} to="/home/albums">Albums</Link>
      <button onClick={() => { logout(); navigate('/login'); }}>Logout</button>
    </nav>
  );
};

export default Navbar;