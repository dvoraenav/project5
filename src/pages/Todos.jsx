import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import TodoModal from '../components/TodoModal'; // add this import


const Todos = () => {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [modal, setModal] = useState(null); 
// null = closed, { mode: 'add' } or { mode: 'edit', todo }

  useEffect(() => {
    fetch(`http://localhost:3000/todos?userId=${user.id}`)
      .then(res => res.json())
      .then(setTodos);
  }, [user.id]);

  const toggleComplete = async (todo) => {
    const res = await fetch(`http://localhost:3000/todos/${todo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !todo.completed })
    });
    const updated = await res.json();
    setTodos(todos.map(t => t.id === todo.id ? updated : t));
  };

  const deleteTodo = (id) => {
    fetch(`http://localhost:3000/todos/${id}`, { method: 'DELETE' })
      .then(() => setTodos(todos.filter(t => t.id !== id)));
  };

  const addTodo = async (title) => {
    const res = await fetch(`http://localhost:3000/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: Number(user.id), title, completed: false })    });
    const newTodo = await res.json();
    console.log('New todo from server:', newTodo); // add this
    setTodos([...todos, newTodo]);
    setModal(null);
  } ;

  const editTodo = async (id, newTitle) => {
    const res = await fetch(`http://localhost:3000/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle })
    });
    const updated = await res.json();
    setTodos(todos.map(t => t.id === id ? updated : t));
    setModal(null);
  };

  const filteredAndSorted = [...todos]
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a[sortBy] > b[sortBy] ? 1 : -1));

  return (
    <div style={{ padding: '20px' }}>
      <h3>המשימות שלי</h3>
      <button onClick={() => setModal({ mode: 'add' })}>+ Add Task</button>
      <input placeholder="חיפוש..." onChange={(e) => setSearch(e.target.value)} />
      <select onChange={(e) => setSortBy(e.target.value)}>
        <option value="id">לפי מזהה</option>
        <option value="title">לפי כותרת</option>
        <option value="completed">לפי ביצוע</option>
      </select>
      <ul>
        {filteredAndSorted.map(t => (
          <li key={t.id}>
            <input type="checkbox" checked={t.completed} onChange={() => toggleComplete(t)} />
            <span style={{ textDecoration: t.completed ? 'line-through' : 'none' }}>{t.title}</span>
            <button onClick={() => deleteTodo(t.id)}>מחק</button>
            <button onClick={() => setModal({ mode: 'edit', todo: t })}>Edit</button>
          </li>
        ))}
      </ul>
      {modal && (
        <TodoModal
          modal={modal}
          onClose={() => setModal(null)}
          onAdd={addTodo}
          onEdit={editTodo}
        />
      )}
    </div>
  );
};

export default Todos;