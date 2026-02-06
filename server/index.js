const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Ticket = require('./models/Ticket');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к MongoDB
// 'helpdesk' в конце строки - это название твоей будущей базы
const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://alejnikaleksandr71_db_user:miredmi9t@cluster0.ferjubc.mongodb.net/helpdesk?appName=Cluster0';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Успешное подключение к MongoDB'))
  .catch((err) => console.error('Ошибка подключения к базе:', err));

// Тестовый маршрут
app.get('/', (req, res) => {
  res.send('Сервер Helpdesk работает!');
});

// Маршрут для СОЗДАНИЯ заявки
app.post('/api/tickets', async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    const newTicket = new Ticket({ title, description, priority });
    await newTicket.save(); // Сохраняем в MongoDB
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(400).json({ message: 'Ошибка при создании заявки', error });
  }
});

// Маршрут для ПОЛУЧЕНИЯ всех заявок
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await Ticket.find(); // Берем всё из базы
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении списка', error });
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
  console.log(`Сервер запущен на порту ${PORT}`);
});
