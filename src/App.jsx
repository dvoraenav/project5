import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Todos from './pages/Todos';
import Posts from './pages/Posts';
import Albums from './pages/Albums';
import Info from './pages/Info';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <><Navbar />{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<ProtectedRoute><h2>ברוכים הבאים!</h2></ProtectedRoute>} />
          <Route path="/home/info" element={<ProtectedRoute><Info /></ProtectedRoute>} />
          <Route path="/home/todos" element={<ProtectedRoute><Todos /></ProtectedRoute>} />
          <Route path="/home/posts" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
          <Route path="/home/albums" element={<ProtectedRoute><Albums /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;