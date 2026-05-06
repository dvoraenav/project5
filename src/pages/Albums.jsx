import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Photos from './Photos';

const Albums = () => {
  const { user } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`http://localhost:3000/albums?userId=${user.id}`)
      .then(res => res.json())
      .then(setAlbums);
  }, [user.id]);

  const filteredAlbums = albums.filter(a => a.title.includes(search));

  return (
    <div style={{ padding: '20px' }}>
      {!selectedAlbumId ? (
        <>
          <h3>האלבומים שלי</h3>
          <input placeholder="חיפוש אלבום..." onChange={(e) => setSearch(e.target.value)} />
          <ul>
            {filteredAlbums.map(album => (
              <li key={album.id}>
                <button onClick={() => setSelectedAlbumId(album.id)}>
                  {album.id}: {album.title}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <button onClick={() => setSelectedAlbumId(null)}>חזור לאלבומים</button>
          <Photos albumId={selectedAlbumId} />
        </>
      )}
    </div>
  );
};

export default Albums;