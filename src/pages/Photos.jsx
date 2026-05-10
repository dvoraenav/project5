// export default Photos;
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Photos = ({ albumId }) => {
  const { user } = useAuth();
  
  // --- State Management ---
  //const [allPhotos, setAllPhotos] = useState([]); // Stores the full list of photos for the current album
  const [visiblePhotos, setVisiblePhotos] = useState([]); // Stores only the photos currently displayed (pagination)
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [newPhoto, setNewPhoto] = useState({ title: '', url: '' });
  
  const [albumOwnerId, setAlbumOwnerId] = useState(null); // Used to verify if the logged-in user owns this album
  
  // --- Inline Editing State ---
  const [editingPhotoId, setEditingPhotoId] = useState(null);
  const [editPhotoTitle, setEditPhotoTitle] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');

  const photosPerPage = 12;

  // Simple SVG trash icon component
  const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
  );

  useEffect(() => {
    // 1. Fetch album details to determine ownership
    fetch(`http://localhost:3000/albums/${albumId}`)
      .then(res => res.json())
      .then(data => setAlbumOwnerId(data.userId));

    // 2. Fetch all photos belonging to this specific album
    fetch(`http://localhost:3000/photos?albumId=${albumId}&_page=1&_limit=${photosPerPage}`)
      .then(res => res.json())
      .then(data => setVisiblePhotos(data));
  }, [albumId]);

  // Authorization Check: Compare logged-in user ID with album owner ID
  const isOwner = String(albumOwnerId) === String(user.id);

  // Pagination Logic: Append the next batch of photos to the visible list
  const loadMore = async () => {
    const nextPage = page + 1;
    const res = await fetch(`http://localhost:3000/photos?albumId=${albumId}&_page=${nextPage}&_limit=${photosPerPage}`);
    const data = await res.json();
    setVisiblePhotos([...visiblePhotos, ...data]);
    setPage(nextPage);
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!isOwner) return; // Guard clause to prevent unauthorized actions

    // Fetch all photos to calculate the next unique ID manually
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

    // Save new photo to the database
    const res = await fetch('http://localhost:3000/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(photoData)
    });

    if (res.ok) {
      const saved = await res.json();
      // Update UI immediately by adding the new photo to the top of the lists
      setAllPhotos([saved, ...allPhotos]);
      setVisiblePhotos([saved, ...visiblePhotos]);
      setNewPhoto({ title: '', url: '' }); // Reset form
    }
  };

  const handleEditPhoto = async (photo) => {
    if (editingPhotoId === photo.id) {
      // --- Save Mode ---
      const updatedData = { 
        ...photo, 
        title: editPhotoTitle, 
        url: editPhotoUrl, 
        thumbnailUrl: editPhotoUrl 
      };
      
      const res = await fetch(`http://localhost:3000/photos/${photo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      
      if (res.ok) {
        // Sync local state with updated database values
        //setAllPhotos(allPhotos.map(p => p.id === photo.id ? updatedData : p));
        setVisiblePhotos(visiblePhotos.map(p => p.id === photo.id ? updatedData : p));
        setEditingPhotoId(null); // Exit edit mode
      }
    } else {
      // --- Enter Edit Mode ---
      setEditingPhotoId(photo.id);
      setEditPhotoTitle(photo.title);
      setEditPhotoUrl(photo.url);
    }
  };

  const handleDeletePhoto = async (id) => {
    if (!isOwner) return;
    
    if (window.confirm("להסיר את התמונה?")) {
      await fetch(`http://localhost:3000/photos/${id}`, { method: 'DELETE' });
      // Remove photo from local state to update UI
      setAllPhotos(allPhotos.filter(p => p.id !== id));
      setVisiblePhotos(visiblePhotos.filter(p => p.id !== id));
    }
  };

  // Filter photos based on the search input
  const filteredPhotos = visiblePhotos.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="card">
        <h3>אלבום {albumId}</h3>
        
        {/* Conditional Rendering: Only owners can see the upload form */}
        {isOwner ? (
          <form onSubmit={handleAddPhoto} style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
            <input className="std-input" placeholder="image title " value={newPhoto.title} onChange={e=>setNewPhoto({...newPhoto, title: e.target.value})} required style={{margin: 0}} />
            <input className="std-input" placeholder="image URL " value={newPhoto.url} onChange={e=>setNewPhoto({...newPhoto, url: e.target.value})} required style={{margin: 0}} />
            <button type="submit" className="primary-btn"> add photo</button>
          </form>
        ) : (
          <p style={{color: '#666', marginBottom: '20px'}}>צפייה באלבום של משתמש אחר. אין הרשאת עריכה.</p>
        )}
        
        {/* Local Search Input */}
        <input className="std-input" placeholder="search photos in album  ..." value={search} onChange={e => setSearch(e.target.value)} style={{margin: 0}} />
      </div>

      <div className="photos-grid">
        {filteredPhotos.map(photo => (
          <div key={photo.id} className="photo-item">
            
            {/* Action Buttons: Only visible if the logged-in user owns the photo/album */}
            {isOwner && (
              <div className="photo-actions-overlay">
                <button className="icon-btn" onClick={() => handleEditPhoto(photo)} title="ערוך">
                    {editingPhotoId === photo.id ? '💾' : '✏️'}
                </button>
                <button className="icon-btn danger" onClick={() => handleDeletePhoto(photo.id)} title="מחק">
                  <TrashIcon />
                </button>
              </div>
            )}
            
            <img src={photo.thumbnailUrl} alt={photo.title} />
            
            <div className="photo-info">
                {/* Inline Editing: Switch between text and inputs based on editing status */}
                {editingPhotoId === photo.id ? (
                    <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                        <input className="std-input" value={editPhotoTitle} onChange={e=>setEditPhotoTitle(e.target.value)} style={{fontSize:'11px'}} />
                        <input className="std-input" value={editPhotoUrl} onChange={e=>setEditPhotoUrl(e.target.value)} style={{fontSize:'9px'}} />
                    </div>
                ) : photo.title}
            </div>
          </div>
        ))}
      </div>

      {/* Infinite Scroll / Load More Logic */}
      {visiblePhotos.length === page * photosPerPage && (
        <div style={{textAlign: 'center', marginTop: '30px'}}>
          <button className="secondary-btn" onClick={loadMore}>load more</button>
        </div>
      )}
    </div>
  );
};

export default Photos;