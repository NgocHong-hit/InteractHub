import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Feed from '../components/Feed';
import RightPanel from '../components/RightPanel';
import Navbar from './Navbar';
import storyAPI from '../api/storyAPI';

const Homepages = () => {
  const location = useLocation();
  const [userData, setUserData] = useState<any>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);

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
    
    // Fetch stories whenever location changes or component mounts
    fetchStories();
  }, [location.pathname]);

  const fetchStories = async () => {
    try {
      setLoadingStories(true);
      // Fetch cả stories của bạn bè và stories của chính mình
      const friendStories = await storyAPI.getFriendsStories();
      const myStories = await storyAPI.getMyStories();
      
      console.log('Friend stories:', friendStories);
      console.log('My stories:', myStories);
      
      // Kiểm tra dữ liệu và convert thành array nếu cần
      const friendStoriesArray = Array.isArray(friendStories) ? friendStories : [];
      const myStoriesArray = Array.isArray(myStories) ? myStories : [];
      
      console.log('Stories to display:', [...myStoriesArray, ...friendStoriesArray]);
      
      // Kết hợp stories và chuyển đổi format
      const allStories = [...myStoriesArray, ...friendStoriesArray].map((story: any) => ({
        id: story.id,
        // StoryDto trả về FullName, UserName, AvatarUrl tại top level
        name: story.fullName || story.userName || 'Người dùng',
        avatar: story.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${story.userName}`,
        thumb: story.mediaUrl || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200',
        content: story.content,
        createdAt: story.createdAt,
        expiresAt: story.expiresAt,
        userId: story.userId,
      }));
      
      console.log('Formatted stories:', allStories);
      setStories(allStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setStories([]);
    } finally {
      setLoadingStories(false);
    }
  };

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
            {loadingStories ? (
              <div className="flex items-center justify-center py-10">Đang tải tin...</div>
            ) : (
              <Feed posts={posts} stories={stories} userData={userData} />
            )}
          </div>

          <RightPanel contacts={contacts} />
        </div>
      </div>
    </div>
  );
};

export default Homepages;