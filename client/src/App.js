import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, ClipboardList, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

function App() {
  // Автоматическое переключение URL между локалкой и облаком
  const API_URL =
    window.location.hostname === 'localhost'
      ? 'http://localhost:5000/api/tickets'
      : 'https://helpdesk-project-djbn.onrender.com/api/tickets';

  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTickets = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ошибка:', error);
      setTickets([]);
    }
  }, [API_URL]); // Функция зависит от API_URL

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]); // Теперь fetchTickets можно безопасно добавить сюда

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
      alert('Ошибка при создании заявки');
    }
  };

  const deleteTicket = async (id) => {
    if (window.confirm('Удалить заявку?')) {
      try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchTickets();
      } catch (error) {
        alert('Ошибка при удалении');
      }
    }
  };

  const filteredTickets = tickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const stats = {
    high: filteredTickets.filter((t) => t.priority === 'High').length,
    medium: filteredTickets.filter((t) => t.priority === 'Medium').length,
    low: filteredTickets.filter((t) => t.priority === 'Low').length,
  };

  return (
    <div className="container">
      <header className="header">
        <ClipboardList size={32} />
        <h1>Helpdesk System</h1>
      </header>

      <div className="stats-container">
        <div className="stat-card" style={{ borderTop: '4px solid #ef4444' }}>
          <span className="stat-number">{stats.high}</span>
          <span className="stat-label">Срочных</span>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #f59e0b' }}>
          <span className="stat-number">{stats.medium}</span>
          <span className="stat-label">Средних</span>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #6b7280' }}>
          <span className="stat-number">{stats.low}</span>
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
          className="input-field search-bar"
          style={{ marginBottom: '15px', borderColor: '#2563eb' }}
          placeholder="Поиск по названию..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <h2>Список заявок ({filteredTickets.length})</h2>

        <div className="tickets-grid">
          <AnimatePresence>
            {filteredTickets.map((ticket) => (
              <motion.div
                key={ticket._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="ticket-card"
              >
                <div className="ticket-content">
                  <div className="ticket-header">
                    <span className={`badge priority-${ticket.priority}`}>
                      {ticket.priority}
                    </span>
                    <button
                      onClick={() => deleteTicket(ticket._id)}
                      className="delete-btn"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <h4>{ticket.title}</h4>
                  <p>{ticket.description}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredTickets.length === 0 && (
            <p className="empty-message">Заявок пока нет...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
