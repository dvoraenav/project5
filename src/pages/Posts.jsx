import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- SVG Icons Components ---
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);
const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);
const SaveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
);
const CancelIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const Posts = () => {
  const { user } = useAuth();
  const { postId } = useParams();
  const navigate = useNavigate();
  const commentInputRef = useRef(null);

  const userId = user?.id;

  // States
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  
  const [searchCriteria, setSearchCriteria] = useState('title');
  const [searchValue, setSearchValue] = useState('');
  
  // Create New Post State
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');

  // Editing States
  const [isEditingMainPost, setIsEditingMainPost] = useState(false);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostBody, setEditPostBody] = useState('');
  
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentBody, setEditCommentBody] = useState('');
  
  const [newCommentBody, setNewCommentBody] = useState('');

  // Load All Posts (Removed userId filter so everyone sees all posts)
  useEffect(() => {
    fetch('http://localhost:3000/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data.reverse());
      });
  }, []);

  // Load Specific Post & Comments
  useEffect(() => {
    if (postId) {
      fetch(`http://localhost:3000/posts/${postId}`)
        .then(res => res.json())
        .then(data => {
          setSelectedPost(data);
          setEditPostTitle(data.title);
          setEditPostBody(data.body);
          setIsEditingMainPost(false);
        });
      
      fetch(`http://localhost:3000/comments?postId=${postId}`)
        .then(res => res.json())
        .then(setComments);
    }
  }, [postId]);

  // --- Post DB Operations ---

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const postData = { userId: user.id, title: newPostTitle, body: newPostBody };
    
    const res = await fetch('http://localhost:3000/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    });
    
    if (res.ok) {
      const savedPost = await res.json();
      setPosts([savedPost, ...posts]);
      setNewPostTitle('');
      setNewPostBody('');
    }
  };

  const handleUpdateMainPost = async () => {
    const updatedData = { title: editPostTitle, body: editPostBody };
    const res = await fetch(`http://localhost:3000/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });

    if (res.ok) {
      setSelectedPost({ ...selectedPost, ...updatedData });
      setPosts(posts.map(p => p.id === parseInt(postId) ? { ...p, ...updatedData } : p));
      setIsEditingMainPost(false);
    }
  };

  const handleDeletePost = async (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm("Delete this post permanently?")) {
      await fetch(`http://localhost:3000/posts/${id}`, { method: 'DELETE' });
      setPosts(posts.filter(p => p.id !== id));
      if (postId === id.toString()) navigate(`/users/${userId}/posts`);
    }
  };

  // --- Comment DB Operations ---

  const handleAddComment = async (e) => {
    e.preventDefault();
    const commentData = {
      postId: parseInt(postId),
      name: user.name,
      email: user.email,
      body: newCommentBody
    };

    const res = await fetch('http://localhost:3000/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData)
    });

    if (res.ok) {
      const savedComment = await res.json();
      setComments([...comments, savedComment]);
      setNewCommentBody('');
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    }
  };

  const startEditingComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentBody(comment.body);
  };

  const handleUpdateComment = async (commentId) => {
    const res = await fetch(`http://localhost:3000/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: editCommentBody })
    });

    if (res.ok) {
      setComments(comments.map(c => c.id === commentId ? { ...c, body: editCommentBody } : c));
      setEditingCommentId(null);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Delete this comment?")) {
      await fetch(`http://localhost:3000/comments/${commentId}`, { method: 'DELETE' });
      setComments(comments.filter(c => c.id !== commentId));
    }
  };

  // Filter
  const filteredPosts = posts.filter(p => 
    searchCriteria === 'id' ? p.id.toString() === searchValue : p.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  // ==========================================
  // VIEW 1: SINGLE POST WITH COMMENTS
  // ==========================================
  if (postId && selectedPost) {
    return (
      <div className="content-container">
        <button className="secondary-btn" onClick={() => navigate(`/users/${userId}/posts`)} style={{marginBottom: '20px'}}>
          ← Back to Feed
        </button>
        
        {/* Main Post Card */}
        <div className="card">
          {isEditingMainPost ? (
            <div>
              <input value={editPostTitle} onChange={e => setEditPostTitle(e.target.value)} className="std-input" />
              <textarea value={editPostBody} onChange={e => setEditPostBody(e.target.value)} className="std-textarea" rows="4" />
              <div className="card-actions-left">
                <button className="icon-btn success" title="Save" onClick={handleUpdateMainPost}><SaveIcon /></button>
                <button className="icon-btn" title="Cancel" onClick={() => setIsEditingMainPost(false)}><CancelIcon /></button>
              </div>
            </div>
          ) : (
            <div>
              <h2 style={{marginTop: 0}}>{selectedPost.title}</h2>
              <p style={{fontSize: '1.1rem', lineHeight: '1.6', color: '#475569'}}>{selectedPost.body}</p>
              
              {/* Show edit/delete ONLY if the logged-in user is the author of the post */}
              {selectedPost.userId === user.id && (
                <div className="card-actions-left">
                  <button className="icon-btn" title="Edit Post" onClick={() => setIsEditingMainPost(true)}><EditIcon /></button>
                  <button className="icon-btn danger" title="Delete Post" onClick={() => handleDeletePost(selectedPost.id)}><TrashIcon /></button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div>
          <h3 style={{marginTop: '30px', marginBottom: '20px', color: '#334155'}}>Comments ({comments.length})</h3>
          
          {comments.map(c => (
            <div key={c.id} className="comment-frame">
              <div className="comment-avatar">{c.name ? c.name.charAt(0).toUpperCase() : '?'}</div>
              
              <div style={{flexGrow: 1}}>
                <div style={{fontWeight: 'bold', marginBottom: '5px'}}>{c.name}</div>
                
                {editingCommentId === c.id ? (
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                    <input 
                      value={editCommentBody} 
                      onChange={e => setEditCommentBody(e.target.value)} 
                      className="std-input" 
                      style={{margin: 0, padding: '8px'}}
                    />
                    <button className="icon-btn success" onClick={() => handleUpdateComment(c.id)}><SaveIcon /></button>
                    <button className="icon-btn" onClick={() => setEditingCommentId(null)}><CancelIcon /></button>
                  </div>
                ) : (
                  <div style={{color: '#475569'}}>{c.body}</div>
                )}
              </div>

              {/* Comment Actions Bottom Left (Only for comment owner) */}
              {c.email === user.email && editingCommentId !== c.id && (
                <div className="card-actions-left" style={{left: '65px', bottom: '10px'}}>
                  <button className="icon-btn" style={{width: '26px', height: '26px'}} onClick={() => startEditingComment(c)}><EditIcon /></button>
                  <button className="icon-btn danger" style={{width: '26px', height: '26px'}} onClick={() => handleDeleteComment(c.id)}><TrashIcon /></button>
                </div>
              )}
            </div>
          ))}
          
          {/* Spacer for floating bar */}
          <div style={{height: '100px'}}></div>
        </div>

        {/* Floating Input Bar */}
        <div className="floating-comment-bar">
          <form onSubmit={handleAddComment} className="floating-form">
            <input 
              ref={commentInputRef}
              value={newCommentBody}
              onChange={(e) => setNewCommentBody(e.target.value)}
              className="std-input"
              placeholder="Write a comment..."
              required
            />
            <button type="submit" className="primary-btn">Post</button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: POSTS LIST / FEED
  // ==========================================
  return (
    <div className="content-container">
      
      {/* Create New Post */}
      <div className="card" style={{paddingBottom: '24px'}}>
        <h3 style={{marginTop: 0}}>Create New Post</h3>
        <form onSubmit={handleCreatePost}>
          <input 
            placeholder="Post Title" 
            className="std-input" 
            value={newPostTitle} 
            onChange={e => setNewPostTitle(e.target.value)} 
            required 
          />
          <textarea 
            placeholder="What's on your mind?" 
            className="std-textarea" 
            rows="3" 
            value={newPostBody} 
            onChange={e => setNewPostBody(e.target.value)} 
            required 
          />
          <button type="submit" className="primary-btn">Publish</button>
        </form>
      </div>

      {/* Search Bar */}
      <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
        <select value={searchCriteria} onChange={e => setSearchCriteria(e.target.value)} className="std-select" style={{width: '150px', margin: 0}}>
          <option value="title">Title</option>
          <option value="id">ID</option>
        </select>
        <input 
          placeholder="Search posts..." 
          className="std-input" 
          style={{margin: 0}}
          onChange={e => setSearchValue(e.target.value)} 
        />
      </div>

      {/* Posts Grid */}
      <div>
        {filteredPosts.map(post => (
          <div key={post.id} className="card" style={{cursor: 'pointer'}} onClick={() => navigate(`/users/${userId}/posts/${post.id}`)}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <span style={{background: '#EEF2FF', color: 'var(--brand-primary)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold'}}>
                #{post.id}
              </span>
              <h4 style={{margin: 0}}>{post.title}</h4>
            </div>
            
            {/* Show delete ONLY if the logged-in user is the author of the post */}
            {post.userId === user.id && (
              <div className="card-actions-left">
                <button className="icon-btn danger" title="Delete Post" onClick={(e) => handleDeletePost(post.id, e)}><TrashIcon /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Posts;