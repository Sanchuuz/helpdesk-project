# 🛠 Helpdesk System (Fullstack Project) — Day 15

Система управления техническими заявками с раздельной архитектурой (Monorepo), защищенной авторизацией и динамическим интерфейсом.

## 🚀 Ссылки на проект

- **Frontend (Vercel):** [https://helpdesk-project-alpha.vercel.app]
- **Backend (Render):** [https://helpdesk-project-djbn.onrender.com]

## 🗓 Прогресс разработки (Экватор: 15/30 дней)

Проект находится в активной стадии. На текущий момент реализован базовый цикл жизни заявки и система безопасности.

### Что уже реализовано:

- **Auth Service:** Полноценная регистрация и вход в систему. Пароли хешируются через `bcrypt`, сессии управляются через `JWT`.
- **Security:** Реализован `ProtectedRoute` на React — доступ к системе закрыт без валидного токена в `localStorage`.
- **Ticketing System:** Полный CRUD (создание, чтение, обновление статуса, удаление заявок).
- **UI/UX:** Анимированный интерфейс на `Framer Motion`, иконки `Lucide React` и расчет прогресса выполнения задач в реальном времени.
- **Infrastructure:** Настроен CI/CD. Фронтенд автоматически деплоится на **Vercel**, бэкенд — на **Render.com**.

## 💻 Стек технологий

- **Frontend:** React, JavaScript (ES6+), Framer Motion, Lucide React, CSS Modules.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB & Mongoose.
- **Auth:** JSON Web Tokens (JWT), Bcrypt.

## 🏗 Структура проекта

Проект организован по принципу Monorepo:

- `/client` — Frontend часть (React).
- `/server` — Backend часть (API на Express).

## ⚙️ Как запустить локально

1. Клонировать репозиторий: `git clone <ссылка-на-твой-репозиторий>`
2. Установить зависимости для сервера: `cd server && npm install`
3. Установить зависимости для клиента: `cd ../client && npm install`
4. Создать файл `.env` в папке `/server` и добавить `MONGODB_URI` и `JWT_SECRET`.
5. Запустить проект:
   - Сервер: `npm start` (в папке server)
   - Клиент: `npm start` (в папке client)

---

_Разработано в рамках 30-дневного интенсива по Fullstack-разработке._
