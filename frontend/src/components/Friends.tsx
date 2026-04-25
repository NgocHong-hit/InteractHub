import { useState, useEffect } from 'react';
import { 
  UserPlus, UserCheck, UserX, Search, 
  Users2, Clock, MessageCircleMore, X
} from 'lucide-react';
import Navbar from './Navbar';
import friendAPI from '../api/friendAPI';
import { toast } from 'react-hot-toast';

const Friends = ({ userData }: any) => {
  // 1. States - Mặc định vào tab 'suggestions' để người dùng thấy người để kết bạn ngay
  const [activeTab, setActiveTab] = useState<'suggestions' | 'friends' | 'requests' | 'sent'>('suggestions');
  const [searchTerm, setSearchTerm] = useState('');
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Hàm Fetch dữ liệu linh hoạt theo Tab
  const fetchData = async () => {
    try {
      setLoading(true);
      let res;
      switch (activeTab) {
        case 'suggestions':
          res = await friendAPI.getAllUsers();
          break;
        case 'friends':
          res = await friendAPI.getFriends();
          break;
        case 'requests':
          res = await friendAPI.getPendingRequests();
          break;
        case 'sent':
          res = await friendAPI.getSentRequests();
          break;
      }
      // Vì API của bạn trả về { success: true, data: [...] }
      setDataList(res.data || []);
    } catch (error) {
      console.error("Lỗi fetch:", error);
      toast.error("Không thể tải dữ liệu");
      setDataList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // 3. Xử lý các Action thực tế
  const handleAction = async (action: () => Promise<any>, successMsg: string) => {
    try {
      const res = await action();
      if (res.success) {
        toast.success(successMsg);
        fetchData(); // Refresh lại danh sách
      } else {
        toast.error(res.message || "Thao tác thất bại");
      }
    } catch (err) {
      toast.error("Lỗi kết nối Server");
    }
  };

  // 4. Logic lọc và lấy thông tin hiển thị (Rất quan trọng)
  const filteredData = dataList.filter(item => {
    // Nếu là gợi ý, item chính là User. Nếu là friendship, bóc tách User ra.
    const isSug = activeTab === 'suggestions';
    const info = isSug ? item : {
      fullName: item.senderFullName || item.receiverFullName,
      userName: item.senderUserName || item.receiverUserName
    };
    const name = info?.fullName || info?.userName || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  }).filter(u => activeTab !== 'suggestions' || u.id !== userData?.id); // Không hiện mình ở gợi ý

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Bạn bè</h2>
            <p className="text-gray-500 font-medium">Kết nối và mở rộng vòng bạn bè của bạn</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 p-1">
          <div className="flex gap-1">
            {[
              { id: 'suggestions', label: 'Gợi ý kết bạn' },
              { id: 'friends', label: 'Bạn bè' },
              { id: 'requests', label: 'Lời mời' },
              { id: 'sent', label: 'Đã gửi' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all
                  ${activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* DATA GRID */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div></div>
        ) : filteredData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredData.map((item) => {
              // Bóc tách thông tin User tùy theo Tab
              const isSug = activeTab === 'suggestions';
              const user = isSug ? item : {
                id: item.senderId || item.receiverId,
                userName: item.senderUserName || item.receiverUserName,
                fullName: item.senderFullName || item.receiverFullName,
                avatarUrl: item.senderAvatarUrl || item.receiverAvatarUrl
              };
              
              if (!user) return null;

              return (
                <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="h-20 bg-gradient-to-r from-blue-400 to-indigo-500" />
                  <div className="px-5 pb-6 flex flex-col items-center">
                    <div className="relative -mt-10 mb-3">
                      <img 
                        src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.userName}`} 
                        className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md object-cover" 
                        alt="avatar" 
                      />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">{user.fullName || user.userName}</h3>
                    <p className="text-sm text-gray-500 mb-5 font-medium">@{user.userName}</p>
                    
                    <div className="flex gap-2 w-full">
                      {activeTab === 'suggestions' && (
                        <button 
                          onClick={() => handleAction(() => friendAPI.sendRequest(user.id), "Đã gửi lời mời")}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md"
                        >
                          <UserPlus size={16} className="inline mr-1" /> Kết bạn
                        </button>
                      )}

                      {activeTab === 'friends' && (
                        <>
                          <button className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-xs font-bold">Bạn bè</button>
                          <button 
                            onClick={() => handleAction(() => friendAPI.removeFriend(user.id), "Đã xóa bạn")}
                            className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"
                          ><UserX size={18} /></button>
                        </>
                      )}

                      {activeTab === 'requests' && (
                        <>
                          <button 
                            onClick={() => handleAction(() => friendAPI.acceptRequest(item.friendshipId), "Đã chấp nhận")}
                            className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold"
                          >Xác nhận</button>
                          <button 
                            onClick={() => handleAction(() => friendAPI.rejectRequest(item.friendshipId), "Đã từ chối")}
                            className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-xs font-bold"
                          >Xóa</button>
                        </>
                      )}

                      {activeTab === 'sent' && (
                        <button 
                          onClick={() => handleAction(() => friendAPI.removeFriend(user.id), "Đã hủy yêu cầu")}
                          className="w-full bg-gray-100 text-gray-600 py-2.5 rounded-xl text-xs font-bold"
                        ><X size={16} className="inline mr-1" /> Hủy yêu cầu</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <Users2 size={40} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">Trống trơn</h3>
            <p className="text-gray-500 mt-1">Không có kết quả nào hiển thị ở đây.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;