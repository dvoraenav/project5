import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Posts = () => {
  const { user } = useAuth();
  const { postId } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [search, setSearch] = useState('');
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3000/posts?userId=${user.id}`)
      .then(res => res.json())
      .then(setPosts);
  }, [user.id]);

  // כשה-URL משתנה ל-postId — טען את הפוסט
  useEffect(() => {
    if (postId) {
      fetch(`http://localhost:3000/posts/${postId}`)
        .then(res => res.json())
        .then(setSelectedPost);
    } else {
      setSelectedPost(null);
      setShowComments(false);
    }
  }, [postId]);

  // כשעוברים ל-comments — טען תגובות
  useEffect(() => {
    if (postId && showComments) {
      fetch(`http://localhost:3000/comments?postId=${postId}`)
        .then(res => res.json())
        .then(setComments);
    }
  }, [postId, showComments]);

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  // מצב: הצגת פוסט בודד
  if (postId && selectedPost) {
    return (
      <div style={{ padding: '20px' }}>
        <button onClick={() => navigate('/home/posts')}>חזור לפוסטים</button>
        <h3>{selectedPost.title}</h3>
        <p>{selectedPost.body}</p>
        <button onClick={() => {
          setShowComments(true);
          navigate(`/home/posts/${postId}/comments`);
        }}>
          הצג תגובות
        </button>
        {showComments && (
          <>
            <h4>תגובות ({comments.length})</h4>
            {comments.map(c => (
              <div key={c.id} style={{ background: '#f9f9f9', marginBottom: '5px' }}>
                <b>{c.name}:</b> {c.body}
              </div>
            ))}
          </>
        )}
      </div>
    );
  }

  // מצב: רשימת פוסטים
  return (
    <div style={{ padding: '20px' }}>
      <h3>הפוסטים שלי</h3>
      <input
        placeholder="חיפוש פוסט..."
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul>
        {filteredPosts.map(post => (
          <li key={post.id}>
            <b>{post.id}: {post.title}</b>
            <button onClick={() => navigate(`/home/posts/${post.id}`)}>
              הצג פוסט
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Posts;