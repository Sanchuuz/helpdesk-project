import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Если токена нет, перенаправляем на логин
    return <Navigate to="/login" />;
  }

  // Если токен есть, показываем запрошенную страницу
  return children;
};

export default ProtectedRoute;
