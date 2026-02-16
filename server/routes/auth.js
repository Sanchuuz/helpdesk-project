const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// МАРШРУТ РЕГИСТРАЦИИ: /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Проверяем, нет ли уже такого пользователя
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: 'Такой пользователь уже существует' });
    }

    // 2. Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Создаем и сохраняем
    user = new User({
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: 'Пользователь успешно создан' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера при регистрации' });
  }
});

// МАРШРУТ ЛОГИНА: /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Ищем пользователя
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Неверные данные для входа' });
    }

    // 2. Проверяем пароль (сравниваем обычный текст и хеш из базы)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверные данные для входа' });
    }

    // 3. Создаем JWT токен (валиден, например, 1 час)
    const token = jwt.sign({ userId: user._id }, 'super_secret_key_123', {
      expiresIn: '1h',
    });

    res.json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера при входе' });
  }
});

module.exports = router;
