import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Todos = () => {
  const { user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('id');

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

  const filteredAndSorted = [...todos]
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a[sortBy] > b[sortBy] ? 1 : -1));

  return (
    <div style={{ padding: '20px' }}>
      <h3>המשימות שלי</h3>
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
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Todos;