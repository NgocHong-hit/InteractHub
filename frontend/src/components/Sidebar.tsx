import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import Link và useLocation
import { Home, Settings, LogOut, TrendingUpIcon } from 'lucide-react';

// Sửa SidebarItem để dùng Link
const SidebarItem = ({ icon, label, to, colorClass = "" }: any) => {
  const location = useLocation();
  // Kiểm tra xem đường dẫn hiện tại có khớp với nút này không
  const active = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all 
        ${active ? 'bg-blue-600 text-white shadow-md' : `hover:bg-gray-100 ${colorClass || 'text-gray-600'}`}`}
    >
      <div className={active ? 'text-white' : (colorClass ? colorClass : 'text-blue-500')}>
        {icon}
      </div>
      <span className={`text-[14px] ${active ? 'font-bold' : 'font-semibold'}`}>
        {label}
      </span>
    </Link>
  );
};

const Sidebar = () => {
  return (
    <aside className="hidden lg:block w-[280px] sticky top-20 h-fit space-y-1">
      {/* Thêm đường dẫn 'to' cho mỗi mục */}
      <SidebarItem icon={<Home size={20}/>} label="Bảng tin" to="/homepages" />
      {/* Nút hashtag dẫn đến trang /hashtags */}
      <SidebarItem 
        icon={<TrendingUpIcon size={20}/>} 
        label="Hashtag" 
        to="/hashtags" 
      />      
      <div className="pt-4 pb-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Lối tắt</div>
      <SidebarItem icon={<div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-[10px] text-blue-600 font-bold">UI</div>} label="UI/UX Designers" to="/shortcut-ui" />
      <SidebarItem icon={<div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-[10px] text-blue-600 font-bold">VN</div>} label="React Việt Nam" to="/shortcut-vn" />
      
      <hr className="my-4 border-gray-200" />

      {/* Nút Cài đặt dẫn đến trang /settings */}
      <SidebarItem 
        icon={<Settings size={20}/>} 
        label="Cài đặt" 
        to="/settings" 
      />      

      {/* Nút Đăng xuất dẫn về trang /login */}
      <SidebarItem 
        icon={<LogOut size={20}/>} 
        label="Đăng xuất" 
        to="/login" 
        colorClass="text-red-500" 
      />

      
    </aside>
  );
};

export default Sidebar;