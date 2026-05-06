import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Posts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`http://localhost:3000/posts?userId=${user.id}`)
      .then(res => res.json())
      .then(setPosts);
  }, [user.id]);

  const viewPost = async (post) => {
    setSelectedPost(post);
    const res = await fetch(`http://localhost:3000/comments?postId=${post.id}`);
    const data = await res.json();
    setComments(data);
  };

  const filteredPosts = posts.filter(p => p.title.includes(search));

  return (
    <div style={{ display: 'flex', padding: '20px', gap: '20px' }}>
      <div style={{ flex: 1 }}>
        <h3>הפוסטים שלי</h3>
        <input placeholder="חיפוש פוסט..." onChange={(e) => setSearch(e.target.value)} />
        <ul>
          {filteredPosts.map(post => (
            <li key={post.id} style={{ marginBottom: '10px' }}>
              <b>{post.id}: {post.title}</b> <br />
              <button onClick={() => viewPost(post)}>הצג תוכן ותגובות</button>
            </li>
          ))}
        </ul>
      </div>

      {selectedPost && (
        <div style={{ flex: 1, border: '1px solid #ccc', padding: '15px' }}>
          <h4>תוכן הפוסט</h4>
          <p>{selectedPost.body}</p>
          <hr />
          <h5>תגובות ({comments.length})</h5>
          {comments.map(c => (
            <div key={c.id} style={{ fontSize: '0.9em', background: '#f9f9f9', marginBottom: '5px' }}>
              <b>{c.name}:</b> {c.body}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Posts;