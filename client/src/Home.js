import { useState, useEffect, useCallback } from 'react';
// Добавили LogOut в импорт иконок
import { PlusCircle, ClipboardList, Trash2, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './App.css';

const API_URL = 'https://helpdesk-project-djbn.onrender.com/api/tickets';

const Home = () => {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate(); // Инициализируем навигацию
  const userEmail = localStorage.getItem('userEmail');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
  });
  const [search, setSearch] = useState({ term: '', status: 'All' });

  // Функция для выхода из системы
  const handleLogout = () => {
    localStorage.removeItem('token'); // Удаляем ключ доступа
    navigate('/login'); // Отправляем на страницу входа
  };

  const apiCall = useCallback(
    async (url, method = 'GET', body = null) => {
      try {
        // 1. Достаем токен прямо перед запросом
        const token = localStorage.getItem('token');

        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            // 2. Добавляем заголовок авторизации
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: body ? JSON.stringify(body) : null,
        });

        // 3. Если сервер ответил 401 (токен протух или неверный), выкидываем на логин
        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return null;
        }

        return res.ok ? await res.json() : null;
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    [navigate],
  );

  const refresh = useCallback(async () => {
    const data = await apiCall(API_URL);
    setTickets(Array.isArray(data) ? data : []);
  }, [apiCall]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login'); // Если токена нет, отправляем на вход
    } else {
      refresh();
    }
  }, [refresh, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await apiCall(API_URL, 'POST', formData);
    if (success) {
      setFormData({ title: '', description: '', priority: 'Medium' });
      refresh();
      toast.success('Заявка создана! 🚀');
    } else {
      toast.error('Не удалось создать заявку ❌');
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

  const stats = {
    high: filtered.filter((t) => t.priority === 'High').length,
    medium: filtered.filter((t) => t.priority === 'Medium').length,
    low: filtered.filter((t) => t.priority === 'Low').length,
  };

  const total = filtered.length;
  const completed = filtered.filter((t) => t.status === 'Completed').length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="container">
      {/* Обновленный хедер с кнопкой выхода */}
      <header
        className="header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ClipboardList size={32} />
          <h1>Helpdesk System</h1>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
            Вы вошли как: <strong>{userEmail}</strong>
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="logout-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#ff4d4d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          <LogOut size={18} /> Выйти
        </button>
      </header>

      <div className="analytics-section">
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
                      apiCall(`${API_URL}/${t._id}`, 'DELETE').then((res) => {
                        if (res) {
                          refresh();
                          toast.info('Заявка удалена');
                        }
                      })
                    }
                  />
                </div>
                <h4>{t.title}</h4>
                <p>{t.description}</p>
                <div className="ticket-date">
                  {t.createdAt &&
                    formatDistanceToNow(new Date(t.createdAt), {
                      addSuffix: true,
                      locale: ru,
                    })}
                </div>
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
};

export default Home;
