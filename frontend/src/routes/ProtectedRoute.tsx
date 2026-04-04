import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Lấy token từ localStorage
  const token = localStorage.getItem('token');

  // Nếu có token thì cho phép vào (Outlet), không thì chuyển về /login
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;