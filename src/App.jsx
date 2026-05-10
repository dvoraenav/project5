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

// --- Protected Route Wrapper ---
// Ensures only authenticated users can access specific paths.
// Injects the Navbar into the layout for protected pages.
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <><Navbar />{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* --- Dynamic User Routes --- 
              All paths below now strictly follow the /users/:userId/ structure 
          */}
          
          {/* Main user dashboard */}
          <Route path="/users/:userId" element={<ProtectedRoute><h2>ברוכים הבאים!</h2></ProtectedRoute>} />
          
          {/* Personal information page */}
          <Route path="/users/:userId/info" element={<ProtectedRoute><Info /></ProtectedRoute>} />
          
          {/* Tasks/Todos management */}
          <Route path="/users/:userId/todos" element={<ProtectedRoute><Todos /></ProtectedRoute>} />
          
          {/* --- Posts Hierarchy --- 
              Supports list view, single post view, and comments view 
          */}
          <Route path="/users/:userId/posts" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
          <Route path="/users/:userId/posts/:postId" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
          <Route path="/users/:userId/posts/:postId/comments" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
          
          {/* --- Albums & Photos Hierarchy --- 
              Deep linking structure: User -> Album -> Photos
          */}
          <Route path="/users/:userId/albums" element={<ProtectedRoute><Albums /></ProtectedRoute>} />
          <Route path="/users/:userId/albums/:albumId" element={<ProtectedRoute><Albums /></ProtectedRoute>} />
          <Route path="/users/:userId/albums/:albumId/photos" element={<ProtectedRoute><Albums /></ProtectedRoute>} />

          {/* --- Default Redirection --- */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;