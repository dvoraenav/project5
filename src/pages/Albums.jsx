import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Photos from './Photos';

const Albums = () => {
  const { user } = useAuth();
  const { albumId } = useParams();
  const navigate = useNavigate();

  // --- State ---
  const [albums, setAlbums] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('title');
  const [newAlbumTitle, setNewAlbumTitle] = useState('');

  // Icon Component
  const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
  );

  // טעינת האלבומים של המשתמש
  useEffect(() => {
    fetch(`http://localhost:3000/albums?userId=${user.id}`)
      .then(res => res.json())
      .then(setAlbums);
  }, [user.id]);

  // יצירת אלבום - מתוקן למניעת שגיאת 500
  const handleAddAlbum = async (e) => {
    e.preventDefault();
    
    // פתרון השגיאה: מושכים רגע את *כל* האלבומים מהשרת כדי למצוא את ה-ID האמיתי הפנוי
    const allAlbumsRes = await fetch('http://localhost:3000/albums');
    const allAlbumsData = await allAlbumsRes.json();
    const nextId = allAlbumsData.length > 0 ? Math.max(...allAlbumsData.map(a => parseInt(a.id) || 0)) + 1 : 1;
    
    const albumData = {
      id: nextId.toString(),
      userId: user.id,
      title: newAlbumTitle
    };

    const res = await fetch('http://localhost:3000/albums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(albumData)
    });

    if (res.ok) {
      const saved = await res.json();
      // מוסיפים את האלבום החדש לתחילת הרשימה
      setAlbums([saved, ...albums]);
      setNewAlbumTitle('');
    }
  };

  const handleDeleteAlbum = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Delete this album and all its contents?")) {
      await fetch(`http://localhost:3000/albums/${id}`, { method: 'DELETE' });
      setAlbums(albums.filter(a => a.id !== id));
    }
  };

  const filteredAlbums = albums.filter(a => 
    searchCriteria === 'id' 
      ? a.id.toString() === searchValue 
      : a.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  if (albumId) {
    return (
      <div className="content-container">
        <button className="secondary-btn" onClick={() => navigate('/home/albums')} style={{marginBottom: '20px'}}>
          ← Back to Albums
        </button>
        <Photos albumId={albumId} />
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="card">
        <h3 style={{marginTop: 0}}>Create New Album</h3>
        <form onSubmit={handleAddAlbum} style={{display: 'flex', gap: '10px'}}>
          <input 
            className="std-input" 
            placeholder="Album Title" 
            value={newAlbumTitle}
            onChange={e => setNewAlbumTitle(e.target.value)}
            required
            style={{margin: 0}}
          />
          <button type="submit" className="primary-btn">Create</button>
        </form>
      </div>

      <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
        <select 
          className="std-select" 
          style={{width: '150px', margin: 0}}
          value={searchCriteria}
          onChange={e => setSearchCriteria(e.target.value)}
        >
          <option value="title">By Title</option>
          <option value="id">By ID</option>
        </select>
        <input 
          className="std-input" 
          placeholder="Search your albums..." 
          style={{margin: 0}}
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
        />
      </div>

      <div className="albums-grid">
        {filteredAlbums.map(album => (
          <div key={album.id} className="album-card" onClick={() => navigate(`/home/albums/${album.id}`)}>
            <div>
              <span style={{fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--brand-primary)'}}>#{album.id}</span>
              <h4 style={{margin: '5px 0', color: 'var(--text-main)'}}>{album.title}</h4>
            </div>
            
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
              {/* הרשאת מחיקה: רק אם המשתמש הוא יוצר האלבום */}
              {album.userId === user.id && (
                <button 
                  className="icon-btn danger" 
                  style={{width: '28px', height: '28px'}}
                  onClick={(e) => handleDeleteAlbum(album.id, e)}
                  title="Delete Album"
                >
                  <TrashIcon />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Albums;