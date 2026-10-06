import { useState, useEffect } from 'react';

export function TaskManager({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');

  // Carrega as tarefas exclusivas do usuário logado
  useEffect(() => {
    const saved = localStorage.getItem(`tasks_${user.email}`);
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, [user.email]);

  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem(`tasks_${user.email}`, JSON.stringify(newTasks));
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      id: Date.now(),
      title,
      duration: duration ? parseInt(duration, 10) : null,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      completed: false,
    };

    saveTasks([...tasks, newTask]);
    setTitle('');
    setDuration('');
  };

  const toggleTask = (id) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTasks(updated);
  };

  const deleteTask = (id) => {
    saveTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div className="task-card">
      <header className="header">
        <div>
          <h2>Minhas Tarefas</h2>
          <small>Usuário: {user.name}</small>
        </div>
        <button onClick={onLogout} className="btn-secondary">
          Sair
        </button>
      </header>

      <form onSubmit={handleAddTask} className="task-form">
        <input
          type="text"
          placeholder="O que precisa ser feito?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-title"
        />
        <input
          type="number"
          placeholder="Tempo (min)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="input-time"
          min="1"
        />
        <button type="submit" className="btn-primary">
          Adicionar
        </button>
      </form>

      <ul className="task-list">
        {tasks.length === 0 ? (
          <p className="empty-message">Nenhuma tarefa encontrada.</p>
        ) : (
          tasks.map((task) => (
            <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <div className="task-info">
                <span className="task-title">{task.title}</span>
                <div className="task-meta">
                  {task.duration && <span>⏱ Est: {task.duration} min</span>}
                  <span>🕒 Criado às {task.createdAt}</span>
                </div>
              </div>
              <div className="task-actions">
                <button onClick={() => toggleTask(task.id)} className="btn-check">
                  {task.completed ? 'Desfazer' : 'Concluir'}
                </button>
                <button onClick={() => deleteTask(task.id)} className="btn-delete">
                  Excluir
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}