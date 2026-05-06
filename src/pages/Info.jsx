import { useAuth } from '../context/AuthContext';

const Info = () => {
  const { user } = useAuth();
  return (
    <div style={{ margin: '20px', padding: '20px', border: '1px solid #ccc' }}>
      <h3>מידע אישי</h3>
      <p><b>שם מלא:</b> {user.name}</p>
      <p><b>אימייל:</b> {user.email}</p>
      <p><b>עיר:</b> {user.address?.city || 'לא צוין'}</p>
    </div>
  );
};

export default Info;