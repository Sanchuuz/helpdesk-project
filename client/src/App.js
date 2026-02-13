import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, ClipboardList, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API_URL = 'https://helpdesk-project-djbn.onrender.com/api/tickets';

function App() {
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
  });
  const [search, setSearch] = useState({ term: '', status: 'All' });

  // Универсальный запрос к API
  const apiCall = useCallback(async (url, method = 'GET', body = null) => {
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : null,
      });
      return res.ok ? await res.json() : null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

  const refresh = useCallback(async () => {
    const data = await apiCall(API_URL);
    setTickets(Array.isArray(data) ? data : []);
  }, [apiCall]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await apiCall(API_URL, 'POST', formData)) {
      setFormData({ title: '', description: '', priority: 'Medium' });
      refresh();
    }
  };

  const updateStatus = async (id, status) => {
    const updated = await apiCall(`${API_URL}/${id}`, 'PUT', { status });
    if (updated)
      setTickets((prev) => prev.map((t) => (t._id === id ? updated : t)));
  };

  const filtered = tickets.filter(
    (t) =>
      (t.title + t.description)
        .toLowerCase()
        .includes(search.term.toLowerCase()) &&
      (search.status === 'All' || t.status === search.status),
  );

  // Считаем количество по приоритетам
  const stats = {
    high: filtered.filter((t) => t.priority === 'High').length,
    medium: filtered.filter((t) => t.priority === 'Medium').length,
    low: filtered.filter((t) => t.priority === 'Low').length,
  };

  // Считаем общий прогресс (процент выполненных)
  const total = filtered.length;
  const completed = filtered.filter((t) => t.status === 'Completed').length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="container">
      <header className="header">
        <ClipboardList size={32} /> <h1>Helpdesk System</h1>
      </header>

      <div className="analytics-section">
        {/* Полоса прогресса */}
        <div className="progress-container">
          <div className="progress-label">
            <span>Прогресс выполнения</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar-bg">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* Карточки счетчиков */}
        <div className="stats-grid">
          <div className="stat-item high">
            <span className="count">{stats.high}</span>
            <span className="label">Срочные</span>
          </div>
          <div className="stat-item medium">
            <span className="count">{stats.medium}</span>
            <span className="label">Средние</span>
          </div>
          <div className="stat-item low">
            <span className="count">{stats.low}</span>
            <span className="label">Низкие</span>
          </div>
        </div>
      </div>

      {/* Форма */}
      <form className="ticket-form" onSubmit={handleSubmit}>
        <input
          placeholder="Тема..."
          value={formData.title}
          required
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <textarea
          placeholder="Описание..."
          value={formData.description}
          required
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
        <select
          value={formData.priority}
          onChange={(e) =>
            setFormData({ ...formData, priority: e.target.value })
          }
        >
          {['Low', 'Medium', 'High'].map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button type="submit" className="submit-btn">
          <PlusCircle size={20} /> Создать
        </button>
      </form>

      {/* Фильтры */}
      <div className="list-section">
        <input
          className="search-bar"
          placeholder="Поиск..."
          value={search.term}
          onChange={(e) => setSearch({ ...search, term: e.target.value })}
        />
        <div className="filter-buttons">
          {['All', 'New', 'In Progress', 'Completed'].map((s) => (
            <button
              key={s}
              onClick={() => setSearch({ ...search, status: s })}
              className={`filter-btn ${search.status === s ? 'active' : ''}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="tickets-grid">
          <AnimatePresence>
            {filtered.map((t) => (
              <motion.div
                key={t._id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`ticket-card ${t.status === 'Completed' ? 'completed' : ''}`}
              >
                <div className="ticket-header">
                  <span className={`badge priority-${t.priority}`}>
                    {t.priority}
                  </span>
                  <span
                    className={`badge status-${t.status?.replace(' ', '-')}`}
                  >
                    {t.status}
                  </span>
                  <Trash2
                    className="delete-btn"
                    onClick={() =>
                      apiCall(`${API_URL}/${t._id}`, 'DELETE').then(refresh)
                    }
                  />
                </div>
                <h4>{t.title}</h4>
                <p>{t.description}</p>
                <div className="flex gap-2 mt-4">
                  {t.status === 'New' && (
                    <button
                      className="btn-work"
                      onClick={() => updateStatus(t._id, 'In Progress')}
                    >
                      В работу
                    </button>
                  )}
                  {t.status === 'In Progress' && (
                    <button
                      className="btn-done"
                      onClick={() => updateStatus(t._id, 'Completed')}
                    >
                      Завершить
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {!filtered.length && (
            <div className="empty-state">🔍 Ничего не найдено</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
