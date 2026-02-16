const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

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

module.exports = router;
