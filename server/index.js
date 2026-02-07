const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Ticket = require('./models/Ticket');
require('dotenv').config();

const app = express();
// На Render PORT передается автоматически, локально будет 5000
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к MongoDB
// Проверяем все возможные варианты названия переменной из .env
const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  'mongodb+srv://alejnikaleksandr71_db_user:miredmi9t@cluster0.ferjubc.mongodb.net/helpdesk?appName=Cluster0';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ Успешное подключение к MongoDB'))
  .catch((err) => {
    console.error('❌ Ошибка подключения к базе:', err.message);
  });

// Тестовый маршрут
app.get('/', (req, res) => {
  res.send('Сервер Helpdesk работает!');
});

// Маршрут для СОЗДАНИЯ заявки
app.post('/api/tickets', async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    const newTicket = new Ticket({ title, description, priority });
    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (error) {
    console.error('Ошибка при создании:', error);
    res.status(400).json({ message: 'Ошибка при создании заявки', error });
  }
});

// Маршрут для ПОЛУЧЕНИЯ всех заявок (с сортировкой)
app.get('/api/tickets', async (req, res) => {
  try {
    // Сортируем по дате создания: самые новые — вверху
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    console.error('Ошибка при получении:', error);
    res
      .status(500)
      .json({ message: 'Ошибка при получении списка', error: error.message });
  }
});

// Маршрут для удаления заявки
app.delete('/api/tickets/:id', async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: 'Заявка удалена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
