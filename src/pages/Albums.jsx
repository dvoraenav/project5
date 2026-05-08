import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Photos from './Photos';

const Albums = () => {
  const { user } = useAuth();
  const { albumId } = useParams();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [search, setSearch] = useState('');
  const location = useLocation();

  useEffect(() => {
    fetch(`http://localhost:3000/albums?userId=${user.id}`)
      .then(res => res.json())
      .then(setAlbums);
    return () => {
      setSearch('');
    };
  }, [user.id]);


  useEffect(() => {
    if (!albumId) {
      setSearch('');
    }
  }, [albumId, location]);

  
  // Resets search whenever the URL changes to /home/albums

  const filteredAlbums = albums.filter(a =>
    a.title.includes(search)
  );

  // אם יש albumId ב-URL — הצג תמונות
  if (albumId) {
    return (
      <>
        <button onClick={() => {setSearch(''); navigate('/home/albums');}}>חזור לאלבומים</button>
        <Photos albumId={albumId} />
      </>
    );
  }

  // אחרת — הצג רשימת אלבומים
  return (
    <div style={{ padding: '20px' }}>
      <h3>האלבומים שלי</h3>
      <input
        placeholder="חיפוש אלבום..." value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul>
        {filteredAlbums.map(album => (
          <li key={album.id}>
            <button onClick={() => navigate(`/home/albums/${album.id}`)}>
              {album.id}: {album.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Albums;