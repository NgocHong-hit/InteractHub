import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Import Components
import HomePages from '../components/HomePages';
import Settings from '../components/setting';
import Login from '../components/Login';
import Register from '../components/Register';
import Profile from '../components/Profile';
import Friends from '../components/Friends';
import AdminDashboard from '../components/AdminDashboard';
import TrendingHashtags from '../components/TrendingHashtags';
import CreateStory from '../components/CreateStory';

const AppRouter = () => {
  return (
    <Routes>
      {/* --- NHÓM 1: PUBLIC ROUTES --- */}
      {/* Khi vào "/" sẽ tự động chuyển hướng sang "/login" */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* --- NHÓM 2: PROTECTED ROUTES --- */}
      <Route element={<ProtectedRoute />}>
        {/* Bỏ dòng chuyển hướng "/" ở trong này đi */}
        <Route path="/homepages" element={<HomePages />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/hashtags" element={<TrendingHashtags />} />
        <Route path="/create-story" element={<CreateStory />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* --- NHÓM 3: 404 NOT FOUND --- */}
      <Route path="*" element={<div className="flex items-center justify-center h-screen font-bold">404 - Không tìm thấy trang</div>} />
    </Routes>
  );
};
export default AppRouter;