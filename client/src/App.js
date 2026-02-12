import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, ClipboardList, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

function App() {
  const API_URL = 'https://helpdesk-project-djbn.onrender.com/api/tickets';

  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

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

  const updateTicketStatus = async (id, newStatus) => {
    try {
      const response = await fetch(
        `https://helpdesk-project-djbn.onrender.com/api/tickets/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (response.ok) {
        const updatedTicket = await response.json();
        // Обновляем состояние в React, чтобы иконка/текст изменились сразу
        setTickets(tickets.map((t) => (t._id === id ? updatedTicket : t)));
      }
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
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

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'All' || ticket.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

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

        <div
          className="filter-buttons"
          style={{
            marginBottom: '20px',
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          {['All', 'New', 'In Progress', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid #2563eb',
                backgroundColor:
                  filterStatus === status ? '#2563eb' : 'transparent',
                color: filterStatus === status ? 'white' : '#2563eb',
                cursor: 'pointer',
                transition: '0.3s',
              }}
            >
              {status === 'All'
                ? 'Все'
                : status === 'New'
                  ? 'Новые'
                  : status === 'In Progress'
                    ? 'В работе'
                    : 'Завершенные'}
            </button>
          ))}
        </div>

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
                    {/* Добавим отображение текущего статуса рядом с приоритетом */}
                    <span
                      className={`badge status-${ticket.status?.replace(' ', '-')}`}
                    >
                      {ticket.status}
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
                  {/* Пример простой логики кнопок */}
                  <div className="flex gap-2 mt-4">
                    {ticket.status === 'New' && (
                      <button
                        onClick={() =>
                          updateTicketStatus(ticket._id, 'In Progress')
                        }
                        style={{
                          backgroundColor: '#2563eb',
                          color: 'white',
                          padding: '5px 10px',
                          borderRadius: '5px',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        В работу
                      </button>
                    )}
                    {ticket.status === 'In Progress' && (
                      <button
                        onClick={() =>
                          updateTicketStatus(ticket._id, 'Completed')
                        }
                        style={{
                          backgroundColor: '#10b981',
                          color: 'white',
                          padding: '5px 10px',
                          borderRadius: '5px',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Завершить
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* НОВЫЙ БЛОК: если ничего не найдено */}
          {filteredTickets.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="empty-state"
              style={{
                textAlign: 'center',
                padding: '40px',
                gridColumn: '1 / -1', // растянуть на всю сетку
                color: '#64748b',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔍</div>
              <h3>Ничего не найдено</h3>
              <p>Попробуйте изменить параметры поиска или фильтр</p>
              {/* Кнопка сброса для удобства */}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('All');
                }}
                style={{
                  marginTop: '15px',
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                Сбросить все фильтры
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
