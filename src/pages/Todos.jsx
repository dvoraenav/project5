import { useEffect, useState } from 'react';
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
const CheckCircleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
const CircleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>
);

const Todos = () => {
  const { user } = useAuth();
  
  // --- States ---
  const [todos, setTodos] = useState([]);
  
  // Create State
  const [newTodoTitle, setNewTodoTitle] = useState('');
  
  // Search States
  const [searchCriteria, setSearchCriteria] = useState('title');
  const [searchValue, setSearchValue] = useState('');
  
  // Edit States
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editTodoTitle, setEditTodoTitle] = useState('');

  // --- Fetch User Todos ---
  useEffect(() => {
    fetch(`http://localhost:3000/todos?userId=${user.id}`)
      .then(res => res.json())
      .then(data => setTodos(data.reverse())); // Show newest first
  }, [user.id]);

  // --- CRUD Operations ---

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    // Fetch all todos to calculate the true sequential ID
    const allTodosRes = await fetch('http://localhost:3000/todos');
    const allTodosData = await allTodosRes.json();
    const nextId = allTodosData.length > 0 ? Math.max(...allTodosData.map(t => parseInt(t.id) || 0)) + 1 : 1;

    const todoData = {
      id: nextId.toString(),
      userId: user.id,
      title: newTodoTitle,
      completed: false
    };

    const res = await fetch('http://localhost:3000/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todoData)
    });

    if (res.ok) {
      const savedTodo = await res.json();
      setTodos([savedTodo, ...todos]);
      setNewTodoTitle('');
    }
  };

  const handleToggleComplete = async (todo) => {
    const updatedStatus = !todo.completed;

    const res = await fetch(`http://localhost:3000/todos/${todo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: updatedStatus })
    });

    if (res.ok) {
      setTodos(todos.map(t => t.id === todo.id ? { ...t, completed: updatedStatus } : t));
    }
  };

  const handleDeleteTodo = async (id) => {
    if (window.confirm("Delete this task?")) {
      await fetch(`http://localhost:3000/todos/${id}`, { method: 'DELETE' });
      setTodos(todos.filter(t => t.id !== id));
    }
  };

  const startEditing = (todo) => {
    setEditingTodoId(todo.id);
    setEditTodoTitle(todo.title);
  };

  const handleSaveEdit = async (id) => {
    if (!editTodoTitle.trim()) return;

    const res = await fetch(`http://localhost:3000/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTodoTitle })
    });

    if (res.ok) {
      setTodos(todos.map(t => t.id === id ? { ...t, title: editTodoTitle } : t));
      setEditingTodoId(null);
    }
  };

  // --- Advanced Search Filter ---
  const filteredTodos = todos.filter(todo => {
    if (!searchValue) return true;
    
    const lowerSearch = searchValue.toLowerCase();
    
    if (searchCriteria === 'id') {
      return todo.id.toString() === lowerSearch;
    }
    
    if (searchCriteria === 'title') {
      return todo.title.toLowerCase().includes(lowerSearch);
    }
    
    if (searchCriteria === 'status') {
      // User can type "completed" or "pending" to filter by status
      const statusText = todo.completed ? 'completed' : 'pending';
      return statusText.includes(lowerSearch);
    }
    
    return true;
  });

  return (
    <div className="content-container">
      
      {/* Create New Todo */}
      <div className="card" style={{ paddingBottom: '24px' }}>
        <h3 style={{ marginTop: 0, color: 'var(--text-main)' }}>Add New Task</h3>
        <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: '10px' }}>
          <input 
            className="std-input" 
            placeholder="What needs to be done?" 
            value={newTodoTitle}
            onChange={e => setNewTodoTitle(e.target.value)}
            style={{ margin: 0 }}
            required
          />
          <button type="submit" className="primary-btn">Add Task</button>
        </form>
      </div>

      {/* Advanced Search Bar */}
      <div className="card" style={{ paddingBottom: '24px' }}>
        <h3 style={{ marginTop: 0, color: 'var(--text-main)' }}>Search Tasks</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            className="std-select" 
            value={searchCriteria}
            onChange={e => {
              setSearchCriteria(e.target.value);
              setSearchValue(''); // Reset search value when changing criteria
            }}
            style={{ width: '160px', margin: 0 }}
          >
            <option value="title">By Title</option>
            <option value="id">By ID</option>
            <option value="status">By Status</option>
          </select>
          <input 
            className="std-input" 
            placeholder={searchCriteria === 'status' ? "Type 'completed' or 'pending'..." : "Type to search..."}
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            style={{ margin: 0 }}
          />
        </div>
      </div>

      {/* Todos List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredTodos.length > 0 ? filteredTodos.map(todo => (
          <div 
            key={todo.id} 
            className="card" 
            style={{ 
              padding: '16px 20px', 
              marginBottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              opacity: todo.completed ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            {/* Left Side: Status Checkbox & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexGrow: 1 }}>
              <button 
                onClick={() => handleToggleComplete(todo)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  cursor: 'pointer',
                  color: todo.completed ? 'var(--accent-mint)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={todo.completed ? "Mark as pending" : "Mark as completed"}
              >
                {todo.completed ? <CheckCircleIcon /> : <CircleIcon />}
              </button>

              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--brand-primary)', minWidth: '35px' }}>
                #{todo.id}
              </span>

              {/* Editing Mode Inline */}
              {editingTodoId === todo.id ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1, marginRight: '15px' }}>
                  <input 
                    className="std-input" 
                    value={editTodoTitle}
                    onChange={e => setEditTodoTitle(e.target.value)}
                    style={{ margin: 0, padding: '8px' }}
                    autoFocus
                  />
                  <button className="icon-btn success" onClick={() => handleSaveEdit(todo.id)} title="Save"><SaveIcon /></button>
                  <button className="icon-btn" onClick={() => setEditingTodoId(null)} title="Cancel"><CancelIcon /></button>
                </div>
              ) : (
                <span style={{ 
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? 'var(--text-muted)' : 'var(--text-main)',
                  fontWeight: 500,
                  flexGrow: 1
                }}>
                  {todo.title}
                </span>
              )}
            </div>

            {/* Right Side: Actions (Only show if not currently editing) */}
            {editingTodoId !== todo.id && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="icon-btn" onClick={() => startEditing(todo)} title="Edit Task"><EditIcon /></button>
                <button className="icon-btn danger" onClick={() => handleDeleteTodo(todo.id)} title="Delete Task"><TrashIcon /></button>
              </div>
            )}
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No tasks found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Todos;