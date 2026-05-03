import { Video, Search, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5012';

const getAvatarUrl = (url?: string, seed?: string) => {
  if (url) return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || 'user'}`;
};

function RightPanel({ contacts }: any) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  
  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  let persistedUser = null;
  if (storedUser) {
    try { persistedUser = JSON.parse(storedUser); } catch { /* ignore malformed data */ }
  }
  const currentUser = authUser || persistedUser;
  const profileName = currentUser?.fullName || currentUser?.userName || 'Người dùng';
  const profileHandle = currentUser?.userName ? `@${currentUser.userName}` : '@guest';
  const profileAvatar = getAvatarUrl(currentUser?.avatarUrl, currentUser?.userName || 'User');

  return (
    <aside className="hidden xl:block w-[320px] sticky top-20 h-fit space-y-6">

      {/* --- PHẦN 1: PROFILE CÁ NHÂN --- */}
      <Link
        to="/profile"
        className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-5 group cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-100 p-0.5 flex-shrink-0">
            <img
              src={profileAvatar}
              className="w-full h-full rounded-full object-cover"
              alt="My Profile"
            />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">{profileName}</h4>
            <p className="text-[11px] text-gray-400 font-medium">{profileHandle}</p>
          </div>
        </div>
      </Link>
    </aside>
  );
}

export default RightPanel;