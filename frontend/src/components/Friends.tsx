import React, { useState } from 'react';
import { 
  Users, UserPlus, MessageCircleMore, Search, 
  UserCheck, UserX, Users2, MoreVertical, 
  MoreHorizontal
} from 'lucide-react';
import Navbar from './Navbar';

const Friends = () => {
  // 1. Khởi tạo Tab hoạt động
  const [activeTab, setActiveTab] = useState<'all' | 'requests' | 'suggestions'>('all');
  const [searchTerm, setSearchTerm] = useState("");

  // 2. Mock Data (Trong đồ án thật, bạn sẽ lấy cái này từ API)
  const [friendsList, setFriendsList] = useState([
    { id: 1, name: 'Hoàng Nam', mutualFriends: 12, avatar: 'https://i.pravatar.cc/150?u=1', status: 'friend' },
    { id: 2, name: 'Minh Hằng', mutualFriends: 5, avatar: 'https://i.pravatar.cc/150?u=2', status: 'request' },
    { id: 3, name: 'Quốc Anh', mutualFriends: 8, avatar: 'https://i.pravatar.cc/150?u=3', status: 'suggestion' },
    { id: 4, name: 'Thanh Trúc', mutualFriends: 20, avatar: 'https://i.pravatar.cc/150?u=4', status: 'friend' },
    { id: 5, name: 'Đức Phúc', mutualFriends: 3, avatar: 'https://i.pravatar.cc/150?u=5', status: 'request' },
  ]);

  // 3. Hàm xử lý logic (Tính năng động)
  const handleAccept = (id: number) => {
    setFriendsList(prev => prev.map(f => f.id === id ? { ...f, status: 'friend' } : f));
  };

  const handleRemove = (id: number) => {
    setFriendsList(prev => prev.filter(f => f.id !== id));
  };

  // 4. Lọc danh sách theo Tab và Tìm kiếm
  const filteredFriends = friendsList.filter(f => {
    const matchesTab = activeTab === 'all' ? f.status === 'friend' : 
                       activeTab === 'requests' ? f.status === 'request' : f.status === 'suggestion';
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    
    <div className="min-h-screen bg-[#F0F2F5]">
        <Navbar />
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Bạn bè</h2>
          <p className="text-gray-500 font-medium">Quản lý các kết nối của bạn</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm bạn bè..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm text-sm"
            />
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="flex p-1 gap-1">
          {[
            { id: 'all', label: 'Tất cả bạn bè', count: friendsList.filter(f => f.status === 'friend').length },
            { id: 'requests', label: 'Lời mời kết bạn', count: friendsList.filter(f => f.status === 'request').length },
            { id: 'suggestions', label: 'Gợi ý', count: friendsList.filter(f => f.status === 'suggestion').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all
                ${activeTab === tab.id 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* FRIENDS GRID */}
      {filteredFriends.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFriends.map((friend) => (
            <div key={friend.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              {/* Banner nhỏ phía sau avatar */}
              <div className="h-20 bg-gradient-to-br from-blue-400 to-indigo-600 relative">
                <button className="absolute top-2 right-2 p-1.5 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors">
                  <MoreHorizontal size={18} />
                </button>
              </div>
              
              <div className="px-5 pb-6 flex flex-col items-center">
                {/* Avatar */}
                <div className="relative -mt-10 mb-3">
                  <img 
                    src={friend.avatar} 
                    className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md object-cover" 
                    alt={friend.name} 
                  />
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
                </div>

                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{friend.name}</h3>
                <p className="text-sm text-gray-500 mb-5 font-medium">{friend.mutualFriends} bạn chung</p>
                
                {/* DYNAMIC ACTIONS */}
                <div className="flex gap-2 w-full mt-auto">
                  {friend.status === 'friend' ? (
                    <>
                      <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5">
                        <UserCheck size={16} /> Bạn bè
                      </button>
                      <button className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all">
                        <MessageCircleMore size={18} />
                      </button>
                    </>
                  ) : friend.status === 'request' ? (
                    <>
                      <button 
                        onClick={() => handleAccept(friend.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-200"
                      >
                        Xác nhận
                      </button>
                      <button 
                        onClick={() => handleRemove(friend.id)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold transition-all"
                      >
                        Xóa
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => handleAccept(friend.id)} // Giả lập thêm bạn
                      className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <UserPlus size={16} /> Thêm bạn bè
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users2 size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Không tìm thấy kết quả</h3>
          <p className="text-gray-500 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc chuyển tab xem sao.</p>
        </div>
      )}
    </div>
  );
};

export default Friends;