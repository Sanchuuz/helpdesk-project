import React, { useState, useEffect } from 'react';
import { PlusCircle, ClipboardList, Trash2 } from 'lucide-react';
import './App.css'; // Импортируем наши новые стили

function App() {
  const API_URL = 'https://helpdesk-project-djbn.onrender.com/api/tickets';

  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTickets = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
    }
  };

  // Фильтруем массив, чтобы посчитать количество по категориям
  const highPriorityCount = tickets.filter((t) => t.priority === 'High').length;
  const mediumPriorityCount = tickets.filter(
    (t) => t.priority === 'Medium',
  ).length;
  const lowPriorityCount = tickets.filter((t) => t.priority === 'Low').length;

  // Фильтруем список в зависимости от того, что введено в поиск
  const filteredTickets = tickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority }),
      });
      if (response.ok) {
        setTitle('');
        setDescription('');
        fetchTickets();
      }
    } catch (error) {
      alert('Ошибка сервера');
    }
  };

  const deleteTicket = async (id) => {
    if (window.confirm('Удалить заявку?')) {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      fetchTickets();
    }
  };

  return (
    <div className="container">
      <header className="header">
        <ClipboardList size={32} />
        <h1>Helpdesk System</h1>
      </header>

      <div className="stats-container">
        <div className="stat-card" style={{ borderTop: '4px solid #ef4444' }}>
          <span className="stat-number">{highPriorityCount}</span>
          <span className="stat-label">Срочных</span>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #f59e0b' }}>
          <span className="stat-number">{mediumPriorityCount}</span>
          <span className="stat-label">Средних</span>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #6b7280' }}>
          <span className="stat-number">{lowPriorityCount}</span>
          <span className="stat-label">Низких</span>
        </div>
      </div>

      <form className="ticket-form" onSubmit={handleSubmit}>
        <h3>Новое обращение</h3>
        <input
          className="input-field"
          placeholder="Тема..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="textarea-field"
          placeholder="Описание проблемы..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <select
          className="select-field"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="Low">Низкий</option>
          <option value="Medium">Средний</option>
          <option value="High">Высокий</option>
        </select>
        <button type="submit" className="submit-btn">
          <PlusCircle size={20} /> Создать тикет
        </button>
      </form>

      <div className="list-section">
        <input
          className="input-field"
          style={{ marginBottom: '15px', borderColor: '#2563eb' }}
          placeholder="Поиск по названию..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <h2>Список заявок ({tickets.length})</h2>
        {filteredTickets.map((ticket) => (
          <div key={ticket._id} className="ticket-card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
              }}
            >
              <div>
                <span className={`badge priority-${ticket.priority}`}>
                  {ticket.priority}
                </span>
                <h4 style={{ margin: '8px 0' }}>{ticket.title}</h4>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  {ticket.description}
                </p>
              </div>
              <button
                onClick={() => deleteTicket(ticket._id)}
                className="delete-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                }}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
