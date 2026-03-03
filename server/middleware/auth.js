const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // 1. Получаем токен из заголовка Authorization
  // Обычно он приходит в формате: "Bearer <token>"
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  // 2. Если токена нет — закрываем доступ
  if (!token) {
    return res
      .status(401)
      .json({ message: 'Нет токена, авторизация отклонена' });
  }

  try {
    // 3. Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Добавляем данные пользователя из токена в объект запроса (req)
    req.user = decoded;

    // 5. Пропускаем запрос дальше (к контроллеру)
    next();
  } catch (err) {
    res.status(401).json({ message: 'Токен невалиден' });
  }
};

module.exports = auth;
