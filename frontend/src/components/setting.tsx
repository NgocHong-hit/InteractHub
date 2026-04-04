import React, { useState, useEffect } from 'react'; // ĐÃ NHÚNG: Thêm useEffect
import Navbar from './Navbar';
import { 
  Home, 
  Users, 
  MessageCircle, 
  Bell, 
  Plus, 
  MoreHorizontal, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Image as ImageIcon, 
  Smile, 
  ChevronDown,
  MapPin,
  Calendar,
  Camera,
  Edit2,
  Flag,
  Grid,
  Heart,
  User,
  Lock,
  Shield,
  Globe,
  LogOut,
  ChevronRight,
  Check,
  Settings,
  BellRing,
  Palette,
  HelpCircle,
  Key
} from 'lucide-react';
import axiosClient from '../api/axiosClient';

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU ---

interface Post {
  id: number;
  author: string;
  avatar: string;
  time: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  liked: boolean;
}

interface SettingsCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'profile' | 'settings'>('settings'); 
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [activeSettingsCategory, setActiveSettingsCategory] = useState('account');
  
  // --- ĐÃ NHÚNG: State lưu dữ liệu từ Backend ---
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- ĐÃ NHÚNG: Hàm lấy dữ liệu và format ngày sinh ---
  const fetchProfile = async () => {
    try {
      const response = await axiosClient.get('/userprofile/me');
      setUserProfile(response.data);
    } catch (error) {
      console.error("Lỗi tải profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const formatBirthday = (dateString: string) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Chưa cập nhật";
    return `${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
  };

  // --- ĐÃ NHÚNG: Logic xử lý hiển thị linh hoạt ---
  const displayName = userProfile?.fullName || userProfile?.userName || "Người dùng";
  const profileAvatar = userProfile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.userName}`;
  const firstName = displayName.split(' ').pop();

  const settingsCategories: SettingsCategory[] = [
    { id: 'account', label: 'Thông tin cá nhân', icon: <User size={20} />, description: 'Quản lý tên, email và thông tin cơ bản.' },
    { id: 'security', label: 'Mật khẩu và bảo mật', icon: <Lock size={20} />, description: 'Thay đổi mật khẩu và bảo vệ tài khoản.' },
    { id: 'privacy', label: 'Quyền riêng tư', icon: <Shield size={20} />, description: 'Kiểm soát ai có thể xem hoạt động của bạn.' },
    { id: 'notifications', label: 'Thông báo', icon: <BellRing size={20} />, description: 'Tùy chỉnh thông báo đẩy và email.' },
    { id: 'display', label: 'Hiển thị & Ngôn ngữ', icon: <Palette size={20} />, description: 'Giao diện sáng/tối và ngôn ngữ sử dụng.' },
    { id: 'support', label: 'Hỗ trợ & Trợ giúp', icon: <HelpCircle size={20} />, description: 'Báo cáo sự cố hoặc tìm trợ giúp.' },
  ];

  const [posts] = useState<Post[]>([
    {
      id: 1,
      author: displayName, // ĐÃ NHÚNG
      avatar: profileAvatar, // ĐÃ NHÚNG
      time: '13 tháng 6, 2022',
      content: '“ Ngọn cỏ không chạm được vào mây, nhưng cỏ không vì vậy mà ngừng vươn lên ”',
      likes: 152,
      comments: 24,
      liked: false,
    }
  ]);

  // Màn hình chờ khi đang kết nối DB
  if (loading) return <div className="flex h-screen items-center justify-center bg-white font-bold text-blue-600 animate-pulse">InteractHub...</div>;
  
  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-[#1C1E21]">
      <Navbar/>

      <div className="pt-14 pb-10">
        {view === 'settings' ? (
          <div className="max-w-[1100px] mx-auto mt-6 px-4 flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="w-full md:w-80 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-20">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-800">Cài đặt</h2>
                </div>
                <div className="py-2">
                  {settingsCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveSettingsCategory(cat.id)}
                      className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-all relative ${
                        activeSettingsCategory === cat.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {activeSettingsCategory === cat.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>}
                      <div className={`${activeSettingsCategory === cat.id ? 'text-blue-600' : 'text-gray-400'}`}>{cat.icon}</div>
                      <div className="flex-1"><p className="font-bold text-[15px]">{cat.label}</p></div>
                      <ChevronRight size={16} className={`${activeSettingsCategory === cat.id ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                    </button>
                  ))}
                </div>
                <hr className="border-gray-100" />
                <div className="p-2">
                  {/* Nút quay lại Profile */}
                  <button onClick={() => setView('profile')} className="w-full flex items-center gap-4 px-4 py-3 text-left text-gray-600 hover:bg-gray-100 rounded-lg font-bold text-[15px] mb-1">
                    <User size={20} /><span>Trang cá nhân</span>
                  </button>
                  <button className="w-full flex items-center gap-4 px-4 py-3 text-left text-red-500 hover:bg-red-50 transition-all rounded-lg font-bold text-[15px]">
                    <LogOut size={20} /><span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-xl font-bold text-gray-900">{settingsCategories.find(c => c.id === activeSettingsCategory)?.label}</h3>
                  <p className="text-sm text-gray-500 mt-1">{settingsCategories.find(c => c.id === activeSettingsCategory)?.description}</p>
                </div>

                <div className="p-6">
                  {activeSettingsCategory === 'account' && (
                    <div className="space-y-8">
                      <div className="flex items-center gap-6 p-4 bg-blue-50/30 rounded-xl border border-blue-100/50">
                        <img src={profileAvatar} className="w-20 h-20 rounded-full border-2 border-white shadow-sm" alt="profile" />
                        <div>
                          <p className="font-bold text-gray-800">Ảnh đại diện</p>
                          <p className="text-xs text-gray-500 mb-3">Sử dụng ảnh thật để bạn bè dễ nhận ra bạn hơn.</p>
                          <div className="flex gap-2">
                            <button className="bg-blue-600 text-white text-xs px-4 py-1.5 rounded-lg font-bold">Thay đổi</button>
                            <button className="bg-white border border-gray-200 text-gray-700 text-xs px-4 py-1.5 rounded-lg font-bold">Gỡ bỏ</button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        {/* ĐÃ NHÚNG: Dữ liệu thật vào SettingsItem */}
                        <SettingsItem label="Họ và tên" value={displayName} />
                        <SettingsItem label="Email liên hệ" value={userProfile?.email || "Chưa cập nhật"} />
                        <SettingsItem label="Ngày sinh" value={formatBirthday(userProfile?.dateOfBirth)} />
                        <SettingsItem label="Giới tính" value={userProfile?.gender || "Chưa xác định"} />
                        <SettingsItem label="Địa chỉ" value={userProfile?.address || "Chưa cập nhật"} />
                      </div>

                      <div className="pt-4 flex justify-end gap-3">
                        <button className="px-6 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition-colors">Hủy</button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-bold shadow-md">Lưu tất cả</button>
                      </div>
                    </div>
                  )}
                  {/* ... các danh mục settings khác giữ nguyên ... */}
                  {activeSettingsCategory !== 'account' && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                        <Settings size={40} className="text-gray-300 animate-spin-slow" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Đang cập nhật</h3>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-sm pt-8 animate-in fade-in duration-500">
            <div className="max-w-[1095px] mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center md:items-end pb-6 gap-4 px-4 md:px-8">
                <div className="relative group/avatar">
                  <div className="w-40 h-40 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg relative z-10">
                    <img src={profileAvatar} className="w-full h-full object-cover" alt="avatar" />
                  </div>
                  <button className="absolute bottom-2 right-2 p-2 bg-gray-200 hover:bg-gray-300 rounded-full border-2 border-white shadow-sm z-20"><Camera size={20} /></button>
                </div>

                <div className="flex-1 text-center md:text-left mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
                  <p className="text-gray-500 font-semibold">839 người bạn</p>
                </div>

                <div className="flex gap-2 mb-4">
                  <button className="bg-[#0866FF] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-md"><Plus size={18} /> Thêm vào tin</button>
                  <button onClick={() => setView('settings')} className="bg-[#E4E6EB] text-gray-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all">
                    <Edit2 size={18}/> Chỉnh sửa trang cá nhân
                  </button>
                </div>
              </div>

              <div className="flex border-t border-gray-100 items-center justify-between">
                <div className="flex overflow-x-auto no-scrollbar">
                  {['Tất cả', 'Giới thiệu', 'Bạn bè', 'Ảnh'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-5 font-bold text-sm border-b-4 ${activeTab === tab ? 'text-[#0866FF] border-[#0866FF]' : 'text-[#65676B] border-transparent hover:bg-gray-100 rounded-lg m-1'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="max-w-[1095px] mx-auto px-4 mt-4 grid grid-cols-1 lg:grid-cols-5 gap-4 bg-[#F0F2F5] pb-10">
              <div className="lg:col-span-2 space-y-4 pt-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold mb-4">Thông tin cá nhân</h3>
                  <div className="space-y-4">
                    {/* ĐÃ NHÚNG: Dữ liệu thật từ DB vào Profile Intro */}
                    <DetailRow icon={<MapPin size={20} className="text-gray-500" />} text="Sống ở " bold={userProfile?.address || "Chưa cập nhật"} />
                    <DetailRow icon={<Calendar size={20} className="text-gray-500" />} text={formatBirthday(userProfile?.dateOfBirth)} />
                    <DetailRow icon={<Users size={20} className="text-gray-500" />} text={userProfile?.gender || "Chưa xác định"} />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 space-y-4 pt-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex gap-3 mb-4">
                    <img src={profileAvatar} className="w-10 h-10 rounded-full" alt="avatar" />
                    <button className="w-full bg-[#F0F2F5] text-left px-4 py-2.5 rounded-full text-[17px] text-gray-500">
                      {firstName} ơi, bạn đang nghĩ gì thế?
                    </button>
                  </div>
                </div>

                {posts.map(post => (
                  <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 flex justify-between items-start">
                      <div className="flex gap-3">
                        <img src={post.avatar} className="w-10 h-10 rounded-full shadow-sm" alt="author" />
                        <div><h4 className="font-bold text-[15px]">{post.author}</h4><p className="text-[13px] text-gray-500">{post.time} • 🌏</p></div>
                      </div>
                    </div>
                    <div className="px-4 pb-3 text-[15px]">{post.content}</div>
                    <div className="mx-4 mb-2 p-1 flex gap-1 border-t border-gray-100">
                      <ActionButton icon={<ThumbsUp size={20}/>} text="Thích" />
                      <ActionButton icon={<MessageSquare size={20}/>} text="Bình luận" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}} />
    </div>
  );
};

// --- CÁC THÀNH PHẦN GIAO DIỆN PHỤ (GIỮ NGUYÊN) ---

const DetailRow: React.FC<{ icon: React.ReactNode; text: string; bold?: string }> = ({ icon, text, bold }) => (
  <div className="flex items-center gap-3 text-[15px] text-gray-700">
    <div className="flex-shrink-0">{icon}</div>
    <p>{text}{bold && <span className="font-bold">{bold}</span>}</p>
  </div>
);

const ActionButton: React.FC<{ icon: React.ReactNode; text: string; active?: boolean }> = ({ icon, text, active }) => (
  <button className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg font-bold text-[15px] hover:bg-gray-100 transition-colors ${active ? 'text-[#0866FF]' : 'text-[#65676B]'}`}>
    {icon} {text}
  </button>
);

const PostTypeBtn: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg transition-colors font-semibold text-[#65676B] text-[15px]">
    {icon} {label}
  </button>
);

const SettingsItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0 group hover:bg-gray-50/50 px-2 rounded-lg transition-all">
    <div>
      <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-base font-semibold text-gray-800">{value}</p>
    </div>
    <button className="text-blue-600 text-sm font-bold bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">Chỉnh sửa</button>
  </div>
);

export default App;