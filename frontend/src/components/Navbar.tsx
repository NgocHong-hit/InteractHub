import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Users, MessageCircle, Bell, Search, 
  ThumbsUp, MessageSquare, UserPlus, UserCheck, Heart
} from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import notificationAPI from '../api/notificationAPI';
import type { NotificationData } from '../api/notificationAPI';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5012';

const getAvatarUrl = (url?: string, seed?: string) => {
  if (url) return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || 'user'}`;
};

// Component con cho các icon điều hướng giữa màn hình (Có thêm Label Tooltip)
const NavMainIcon = ({ icon, active, to, label }: any) => (
  <Link 
    to={to}
    className={`relative h-full px-10 flex items-center justify-center cursor-pointer transition-all group
      ${active ? 'text-[#0866FF]' : 'text-[#65676B] hover:bg-gray-100 hover:rounded-lg my-1'}`}
  >
    {icon}
    
    {/* Label hiện lên khi hover (Tooltip) */}
    {label && (
      <div className="absolute top-[110%] left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[11px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[60]">
        {label}
      </div>
    )}

    {active && (
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0866FF]"></div>
    )}
    {!active && (
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-transparent group-hover:bg-gray-200 transition-all"></div>
    )}
  </Link>
);

// Hàm tính thời gian tương đối
const getRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

// Hàm lấy icon theo loại thông báo
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'Like':
      return (
        <div className="absolute bottom-0 right-0 p-1 bg-blue-600 rounded-full border-2 border-white">
          <ThumbsUp size={8} className="text-white fill-current" />
        </div>
      );
    case 'Comment':
      return (
        <div className="absolute bottom-0 right-0 p-1 bg-green-500 rounded-full border-2 border-white">
          <MessageSquare size={8} className="text-white fill-current" />
        </div>
      );
    case 'FriendRequest':
      return (
        <div className="absolute bottom-0 right-0 p-1 bg-purple-500 rounded-full border-2 border-white">
          <UserPlus size={8} className="text-white fill-current" />
        </div>
      );
    case 'FriendAccepted':
      return (
        <div className="absolute bottom-0 right-0 p-1 bg-emerald-500 rounded-full border-2 border-white">
          <UserCheck size={8} className="text-white fill-current" />
        </div>
      );
    default:
      return (
        <div className="absolute bottom-0 right-0 p-1 bg-gray-500 rounded-full border-2 border-white">
          <Bell size={8} className="text-white fill-current" />
        </div>
      );
  }
};

const Navbar = ({ userData }: any) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  // Get current user data for profile avatar
  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  let persistedUser = null;
  if (storedUser) {
    try { persistedUser = JSON.parse(storedUser); } catch { /* ignore malformed data */ }
  }
  const currentUser = userData || persistedUser;
  const profileAvatar = getAvatarUrl(currentUser?.avatarUrl, currentUser?.userName || 'User');

  // Fetch thông báo từ API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationAPI.getNotifications();
      setNotifications(data);
      const count = await notificationAPI.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Silently handle - notifications will just show empty
    } finally {
      setLoading(false);
    }
  };

  // Kết nối SignalR
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Fetch lần đầu
    fetchNotifications();

    // Tạo SignalR connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5012/notificationHub', {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.None)
      .build();

    connection.on('ReceiveNotification', (notification: NotificationData) => {
      // Thêm thông báo mới vào đầu danh sách
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    connection.start()
      .then(() => {
        // Đăng ký user vào group
        connection.invoke('RegisterUser').catch(() => {});
      })
      .catch(() => {});

    connectionRef.current = connection;

    return () => {
      connection.stop();
    };
  }, []);

  // Đánh dấu 1 thông báo đã đọc
  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // Silently handle
    }
  };

  // Đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Silently handle
    }
  };

  // Navigate to notification sender's profile
  const handleNotificationClick = (notif: NotificationData) => {
    if (!notif.isRead) {
      handleMarkAsRead(notif.id);
    }
    setShowNotifications(false);
    // Navigate to the sender's profile
    if (notif.senderId) {
      navigate(`/profile/${notif.senderId}`);
    }
  };

  return (
    <nav className="fixed top-0 w-full h-14 bg-white border-b border-gray-200 z-[100] flex items-center justify-between px-4 shadow-sm">
      
      {/* --- PHẦN BÊN TRÁI: LOGO & TÌM KIẾM --- */}
      <div className="flex items-center gap-2">
        <Link 
          to="/homepages" 
          className="bg-[#0866FF] p-1.5 rounded-full cursor-pointer shadow-md flex-shrink-0 active:scale-95 transition-transform"
        >
          <div className="text-white font-black text-xl italic w-7 h-7 flex items-center justify-center">C</div>
        </Link>

        <div className="hidden sm:flex items-center bg-[#F0F2F5] px-3 py-2 rounded-full w-64 border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all">
          <Search size={18} className="text-[#65676B]" />
          <input 
            type="text" 
            placeholder="Tìm kiếm trên Connect..." 
            className="bg-transparent border-none outline-none ml-2 text-[15px] w-full" 
          />
        </div>
      </div>

      {/* --- PHẦN GIỮA: ICON ĐIỀU HƯỚNG --- */}
      <div className="hidden lg:flex items-center gap-4 h-full">
        <NavMainIcon 
          icon={<Home size={26} />} 
          active={location.pathname === '/homepages'} 
          to="/homepages"
          label="Trang chủ"
        />
        <NavMainIcon 
          icon={<Users size={26} />} 
          active={location.pathname === '/friends'} 
          to="/friends"
          label="Bạn bè"
        />
      </div>

      {/* --- PHẦN BÊN PHẢI: TIỆN ÍCH --- */}
      <div className="flex items-center gap-2 relative">
        
        {/* Nút Tin nhắn */}
        <button className="p-2.5 bg-[#E4E6EB] hover:bg-[#D8DADF] rounded-full relative active:scale-95 transition-all">
          <MessageCircle size={20} className="text-black" />
        </button>
        
        {/* Nút Thông báo (Có Dropdown) */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              // Refresh khi mở dropdown
              if (!showNotifications) {
                fetchNotifications();
              }
            }}
            className={`p-2.5 rounded-full transition-all relative active:scale-95 
              ${showNotifications ? 'bg-blue-50 text-blue-600' : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-black'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E41E3F] text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              {/* Lớp phủ đóng dropdown khi nhấn ra ngoài */}
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
              
              <div className="absolute top-12 right-0 w-[360px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-200 z-[200]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">Thông báo</h3>
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-blue-600 text-sm font-semibold hover:bg-blue-50 px-2 py-1 rounded"
                  >
                    Đánh dấu tất cả đã đọc
                  </button>
                </div>
                
                <div className="max-h-[450px] overflow-y-auto">
                  {loading && notifications.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
                      Đang tải thông báo...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <Bell size={40} className="mb-3 text-gray-300" />
                      <p className="text-sm font-medium">Chưa có thông báo nào</p>
                    </div>
                  ) : (
                    <div className="space-y-1 py-2">
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`flex items-start gap-3 p-3 mx-2 rounded-lg cursor-pointer hover:bg-gray-50 relative group transition-colors ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <div className="relative flex-shrink-0">
                            <img 
                              src={getAvatarUrl(notif.senderAvatarUrl, notif.senderUserName || 'user')} 
                              className="w-12 h-12 rounded-full object-cover" 
                              alt="avatar" 
                            />
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1 text-sm">
                            <p className="text-gray-800">
                              <span className="font-bold hover:underline">{notif.senderUserName || 'Ai đó'}</span>{' '}
                              {notif.message}
                            </p>
                            <p className={`text-xs font-semibold mt-1 ${!notif.isRead ? 'text-blue-600' : 'text-gray-400'}`}>
                              {getRelativeTime(notif.createdAt)}
                            </p>
                          </div>
                          {!notif.isRead && <div className="w-3 h-3 bg-blue-600 rounded-full self-center flex-shrink-0"></div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Nút Profile Avatar */}
        <Link 
          to="/profile"
          className="relative group"
        >
          <img 
            src={profileAvatar} 
            className="w-10 h-10 rounded-full object-cover border-2 border-transparent hover:border-blue-500 transition-all cursor-pointer" 
            alt="My Profile" 
          />
          {/* Tooltip */}
          <div className="absolute top-[110%] left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[11px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[60]">
            Trang cá nhân
          </div>
        </Link>

      </div>
    </nav>
  );
};

export default Navbar;