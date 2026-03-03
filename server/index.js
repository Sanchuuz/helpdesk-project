const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Ticket = require('./models/Ticket');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const auth = require('../middleware/auth');
require('dotenv').config();

const app = express();
// На Render PORT передается автоматически, локально будет 5000
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

// Подключение к MongoDB
// Проверяем все возможные варианты названия переменной из .env
const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  'mongodb+srv://alejnikaleksandr71_db_user:miredmi9t@cluster0.ferjubc.mongodb.net/helpdesk?appName=Cluster0';

mongoose.connect(MONGO_URI).catch((err) => {
  console.error('❌ Ошибка подключения к базе:', err.message);
});

// Тестовый маршрут
app.get('/', (req, res) => {
  res.send('Сервер Helpdesk работает!');
});

// Маршрут для СОЗДАНИЯ заявки
app.post('/api/tickets', auth, async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    const newTicket = new Ticket({
      title,
      description,
      priority,
      user: req.user.userId,
    });
    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (error) {
    console.error('Ошибка при создании:', error);
    res.status(400).json({ message: 'Ошибка при создании заявки', error });
  }
});

// Маршрут для ПОЛУЧЕНИЯ всех заявок (с сортировкой)
app.get('/api/tickets', auth, async (req, res) => {
  try {
    // Сортируем по дате создания: самые новые — вверху
    const tickets = await Ticket.find({ user: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json(tickets);
  } catch (error) {
    console.error('Ошибка при получении:', error);
    res
      .status(500)
      .json({ message: 'Ошибка при получении списка', error: error.message });
  }
});

// Маршрут для ОБНОВЛЕНИЯ заявки (например, смена статуса)
app.put('/api/tickets/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;

    // { new: true} вернет нам уже обновленный объект из базы
    const updatedTicket = await Ticket.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { status },
      { new: true },
    );

    if (!updatedTicket) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    res.json(updatedTicket);
  } catch (error) {
    console.error('Ошибка при обновлении:', error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении' });
  }
});

// Маршрут для удаления заявки
app.delete('/api/tickets/:id', auth, async (req, res) => {
  // <-- 5. ДОБАВИЛИ AUTH
  try {
    const deletedTicket = await Ticket.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!deletedTicket) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }
    res.json({ message: 'Заявка удалена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении' });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
