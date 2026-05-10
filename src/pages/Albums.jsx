// export default Albums;
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Photos from './Photos';

const Albums = () => {
  const { user } = useAuth(); // Access current logged-in user data
  const { albumId } = useParams(); // Check if a specific album is selected via URL parameters
  const navigate = useNavigate(); // Hook for programmatic navigation

  const userId = user?.id;

  // --- State Management ---
  const [albums, setAlbums] = useState([]); // List of albums owned by the user
  const [searchValue, setSearchValue] = useState(''); // Text for filtering albums
  const [searchCriteria, setSearchCriteria] = useState('title'); // Filter by 'title' or 'id'
  const [newAlbumTitle, setNewAlbumTitle] = useState(''); // Input state for creating new albums
  
  // --- Inline Editing State ---
  const [editingAlbumId, setEditingAlbumId] = useState(null); // Tracks which album is currently being renamed
  const [editingTitle, setEditingTitle] = useState(''); // Temporary storage for the new title during edit

  // Simple SVG trash icon component for the UI
  const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
  );

  // Fetch only the albums belonging to the logged-in user on component mount
  useEffect(() => {
    fetch(`http://localhost:3000/albums?userId=${user.id}`)
      .then(res => res.json())
      .then(setAlbums);
  }, [user.id]);

  // Logic to create a new album with an auto-incremented ID
  const handleAddAlbum = async (e) => {
    e.preventDefault();
    
    // Fetch all existing albums to calculate the next unique ID
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
      // Update the local list to include the newly created album
      setAlbums([saved, ...albums]);
      setNewAlbumTitle('');
    }
  };

  // Logic to permanently delete an album
  const handleDeleteAlbum = async (id, e) => {
    e.stopPropagation(); // Prevent the click from triggering the navigate event on the parent card
    if (window.confirm("למחוק את האלבום וכל תוכנו?")) {
      await fetch(`http://localhost:3000/albums/${id}`, { method: 'DELETE' });
      // Remove the deleted album from the UI state
      setAlbums(albums.filter(a => a.id !== id));
    }
  };

  // Logic to handle album renaming (PUT request)
  const handleEditAlbum = async (album, e) => {
    e.stopPropagation(); // Prevent navigation during edit mode
    
    
      // --- Save Mode ---
      const res = await fetch(`http://localhost:3000/albums/${album.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...album, title: editingTitle })
      });
      if (res.ok) {
        // Update the local album list with the new title
        setAlbums(albums.map(a => a.id === album.id ? { ...a, title: editingTitle } : a));
        setEditingAlbumId(null); // Exit edit mode
      }
  
  };

  // Filtering logic based on chosen criteria (Title or ID)
  const filteredAlbums = albums.filter(a => 
    searchCriteria === 'id' 
      ? a.id.toString() === searchValue 
      : a.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  // --- Render View Logic ---
  // If an album ID is in the URL, render the Photos component (Single Album View)
  if (albumId) {
    return (
      <div className="content-container">
        <button className="secondary-btn" onClick={() => navigate(`/users/${userId}/albums`)} style={{marginBottom: '20px'}}>
          ← back to albums
        </button>
        <Photos albumId={albumId} />
      </div>
    );
  }

  // Otherwise, render the Album Gallery View
  return (
    <div className="content-container">
      {/* Create New Album Section */}
      <div className="card">
        <h3>create new album</h3>
        <form onSubmit={handleAddAlbum} style={{display: 'flex', gap: '10px'}}>
          <input className="std-input" placeholder="album name" value={newAlbumTitle} onChange={e => setNewAlbumTitle(e.target.value)} required style={{margin: 0}} />
          <button type="submit" className="primary-btn">create album</button>
        </form>
      </div>

      {/* Search and Filter Section */}
      <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
        <select className="std-select" style={{width: '150px', margin: 0}} value={searchCriteria} onChange={e => setSearchCriteria(e.target.value)}>
          <option value="title">by name</option>
          <option value="id">by id(ID)</option>
        </select>
        <input className="std-input" placeholder="search in my albums.." style={{margin: 0}} value={searchValue} onChange={e => setSearchValue(e.target.value)} />
      </div>

      {/* Album List Grid */}
      <div className="albums-grid">
        {filteredAlbums.map(album => (
          <div key={album.id} className="album-card" onClick={() => !editingAlbumId && navigate(`/users/${userId}/albums/${album.id}`)}>
            <div>
              <span style={{fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--brand-primary)'}}>#{album.id}</span>
              {/* Conditional rendering for editing title vs. displaying title */}
              {editingAlbumId === album.id ? (
                <input className="std-input" value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} onClick={(e) => e.stopPropagation()} />
              ) : (
                <h4 style={{margin: '5px 0'}}>{album.title}</h4>
              )}
            </div>
            
            {/* Actions: Edit and Delete (Only visible for the owner) */}
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '5px'}}>
              {String(album.userId) === String(user.id) && (
                <>
                  <button className="icon-btn" onClick={(e) => handleEditAlbum(album, e)} title="edit name">
                    {editingAlbumId === album.id ? '💾' : '✏️'}
                  </button>
                  <button className="icon-btn danger" onClick={(e) => handleDeleteAlbum(album.id, e)} title="delete album">
                    <TrashIcon />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Albums;