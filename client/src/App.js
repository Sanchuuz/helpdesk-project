import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import ProtectedRoute from './ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Страница регистрации */}
          <Route path="/register" element={<Register />} />

          {/* Страница логина */}
          <Route path="/login" element={<Login />} />

          {/* Главная страница с тикетами */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Если ввели непонятно что — кидаем на главную */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
