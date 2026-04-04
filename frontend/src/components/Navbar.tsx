import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Users, MessageCircle, Bell, Search, 
  ThumbsUp, MessageSquare, UserPlus, Image as ImageIcon, MoreHorizontal 
} from 'lucide-react';

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

const Navbar = ({ userData }: any) => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock dữ liệu thông báo
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'like', user: { name: 'Hoàng Nam', avatar: 'https://i.pravatar.cc/150?u=1' }, content: 'đã thích bài viết của bạn.', time: '2 phút trước', isRead: false },
    { id: 2, type: 'comment', user: { name: 'Minh Hằng', avatar: 'https://i.pravatar.cc/150?u=2' }, content: 'đã bình luận về ảnh của bạn.', time: '1 giờ trước', isRead: false },
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2.5 rounded-full transition-all relative active:scale-95 
              ${showNotifications ? 'bg-blue-50 text-blue-600' : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-black'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#E41E3F] text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {unreadCount}
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
                  <button className="text-blue-600 text-sm font-semibold hover:bg-blue-50 px-2 py-1 rounded">Xem tất cả</button>
                </div>
                
                <div className="max-h-[450px] overflow-y-auto">
                  <div className="space-y-1 py-2">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`flex items-start gap-3 p-3 mx-2 rounded-lg cursor-pointer hover:bg-gray-50 relative group ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
                        onClick={() => {
                          setNotifications(notifications.map(n => n.id === notif.id ? {...n, isRead: true} : n));
                        }}
                      >
                        <div className="relative flex-shrink-0">
                          <img src={notif.user.avatar} className="w-12 h-12 rounded-full object-cover" alt="avt" />
                          <div className="absolute bottom-0 right-0 p-1 bg-blue-600 rounded-full border-2 border-white">
                            <ThumbsUp size={8} className="text-white fill-current" />
                          </div>
                        </div>
                        <div className="flex-1 text-sm">
                          <p className="text-gray-800"><span className="font-bold">{notif.user.name}</span> {notif.content}</p>
                          <p className="text-blue-600 text-xs font-semibold mt-1">{notif.time}</p>
                        </div>
                        {!notif.isRead && <div className="w-3 h-3 bg-blue-600 rounded-full self-center"></div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

       

      </div>
    </nav>
  );
};

export default Navbar;