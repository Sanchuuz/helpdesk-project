import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'https://helpdesk-project-djbn.onrender.com/api/auth/login',
        {
          email,
          password,
        },
      );
      alert('Вход выполнен!');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка при входе');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="auth-container"
    >
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Вход в Helpdesk</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Войти</button>
        <p
          onClick={() => navigate('/register')}
          style={{ cursor: 'pointer', color: '#3b82f6' }}
        >
          Нет аккаунта? Регистрация
        </p>
      </form>
    </motion.div>
  );
};

export default Login;
