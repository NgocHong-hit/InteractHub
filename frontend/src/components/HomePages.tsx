import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Feed from '../components/Feed';
import RightPanel from '../components/RightPanel';
import Navbar from './Navbar';

const Homepages = () => {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Load userData from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
  }, []);

  // Mock Data giữ nguyên
  const stories = [
    { id: 1, name: 'Hoàng Nam', thumb: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200' },
    { id: 2, name: 'Minh Hằng', thumb: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
  ];

  const posts = [
    { id: 1, author: 'Nguyễn Văn A', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=A', time: '2 giờ trước', content: 'Giao diện Connect Pro!', image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1000' },
  ];

  const contacts = [
    { id: 1, name: 'Lê Hoàng Nam', status: 'online' },
    { id: 2, name: 'Nguyễn Minh Hằng', status: 'online' },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* KHÔNG GỌI NAVBAR Ở ĐÂY (Vì Navbar đã được đặt ở file App.tsx để hiện chung cho mọi trang) */}
      <Navbar />
      <div className="pt-14"> 
        {/* Bố cục 3 cột cố định cho trang chủ */}
        <div className="max-w-[1400px] mx-auto flex justify-between gap-8 px-4 lg:px-8 mt-6">
          {/* Sidebar giờ không cần nhận setView nữa, nó sẽ dùng Link để chuyển trang */}
          <Sidebar /> 
          
          <div className="flex-1 min-w-0">
            <Feed posts={posts} stories={stories} userData={userData} />
          </div>

          <RightPanel contacts={contacts} />
        </div>
      </div>
    </div>
  );
};

export default Homepages;