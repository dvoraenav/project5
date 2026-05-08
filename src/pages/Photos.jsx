import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext'; // ייבוא הקונטקסט של המשתמש

const Photos = ({ albumId }) => {
  const { user } = useAuth(); // שליפת המשתמש המחובר
  
  const [allPhotos, setAllPhotos] = useState([]);
  const [visiblePhotos, setVisiblePhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [newPhoto, setNewPhoto] = useState({ title: '', url: '' });
  
  const [albumOwnerId, setAlbumOwnerId] = useState(null); // שמירת מזהה בעל האלבום
  const photosPerPage = 12;

  const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
  );

  useEffect(() => {
    // 1. בדיקה מי הבעלים של האלבום
    fetch(`http://localhost:3000/albums/${albumId}`)
      .then(res => res.json())
      .then(data => setAlbumOwnerId(data.userId));

    // 2. משיכת התמונות
    fetch(`http://localhost:3000/photos?albumId=${albumId}`)
      .then(res => res.json())
      .then(data => {
        const reversed = data.reverse();
        setAllPhotos(reversed);
        setVisiblePhotos(reversed.slice(0, photosPerPage));
      });
  }, [albumId]);

  // משתנה בוליאני שבודק האם המשתמש המחובר הוא בעל האלבום
  const isOwner = albumOwnerId === user.id;

  const loadMore = () => {
    const nextPage = page + 1;
    setVisiblePhotos(allPhotos.slice(0, nextPage * photosPerPage));
    setPage(nextPage);
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!isOwner) return; // הגנה נוספת

    // מציאת ID פנוי לתמונה
    const allPhotosRes = await fetch('http://localhost:3000/photos');
    const allPhotosData = await allPhotosRes.json();
    const nextId = allPhotosData.length > 0 ? Math.max(...allPhotosData.map(p => parseInt(p.id) || 0)) + 1 : 1;

    const photoData = {
      id: nextId.toString(),
      albumId: parseInt(albumId),
      title: newPhoto.title,
      url: newPhoto.url,
      thumbnailUrl: newPhoto.url
    };

    const res = await fetch('http://localhost:3000/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(photoData)
    });

    if (res.ok) {
      const saved = await res.json();
      setAllPhotos([saved, ...allPhotos]);
      setVisiblePhotos([saved, ...visiblePhotos]);
      setNewPhoto({ title: '', url: '' });
    }
  };

  const handleDeletePhoto = async (id) => {
    if (!isOwner) return; // הגנה נוספת
    
    if (window.confirm("Remove this photo?")) {
      await fetch(`http://localhost:3000/photos/${id}`, { method: 'DELETE' });
      setAllPhotos(allPhotos.filter(p => p.id !== id));
      setVisiblePhotos(visiblePhotos.filter(p => p.id !== id));
    }
  };

  const filteredPhotos = visiblePhotos.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="card">
        <h3 style={{marginTop: 0}}>Album {albumId}</h3>
        
        {/* טופס הוספת תמונה יופיע רק אם המשתמש הוא בעל האלבום */}
        {isOwner ? (
          <form onSubmit={handleAddPhoto} style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
            <input className="std-input" placeholder="Photo Title" value={newPhoto.title} onChange={e=>setNewPhoto({...newPhoto, title: e.target.value})} required style={{margin: 0}} />
            <input className="std-input" placeholder="Image URL" value={newPhoto.url} onChange={e=>setNewPhoto({...newPhoto, url: e.target.value})} required style={{margin: 0}} />
            <button type="submit" className="primary-btn">Add Photo</button>
          </form>
        ) : (
          <p style={{color: 'var(--text-muted)', marginBottom: '20px'}}>
            You are viewing an album created by another user. You cannot add or delete photos.
          </p>
        )}

        <input 
          className="std-input" 
          placeholder="Search photos in this album..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{margin: 0}}
        />
      </div>

      <div className="photos-grid">
        {filteredPhotos.map(photo => (
          <div key={photo.id} className="photo-item">
            {/* כפתור מחיקת תמונה יופיע רק לבעל האלבום */}
            {isOwner && (
              <button className="delete-photo-overlay" onClick={() => handleDeletePhoto(photo.id)} title="Delete Photo">
                <TrashIcon />
              </button>
            )}
            <img src={photo.thumbnailUrl} alt={photo.title} />
            <div className="photo-info">{photo.title}</div>
          </div>
        ))}
      </div>

      {visiblePhotos.length < allPhotos.length && (
        <div style={{textAlign: 'center', marginTop: '30px'}}>
          <button className="secondary-btn" onClick={loadMore}>Load More Photos</button>
        </div>
      )}
    </div>
  );
};

export default Photos;