import { useState } from 'react';

const TodoModal = ({ modal, onClose, onAdd, onEdit }) => {
  const [title, setTitle] = useState(
    modal.mode === 'edit' ? modal.todo.title : ''
  );

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (modal.mode === 'add') onAdd(title);
    else onEdit(modal.todo.id, title);
  };

  return (
    <>
      {/* Blurred backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 10
      }} />

      {/* Modal box */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        padding: '30px',
        borderRadius: '10px',
        zIndex: 11,
        minWidth: '300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        <h3>{modal.mode === 'add' ? 'Add Task' : 'Edit Task'}</h3>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Task title..."
          autoFocus
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleSubmit}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </>
  );
};

export default TodoModal;