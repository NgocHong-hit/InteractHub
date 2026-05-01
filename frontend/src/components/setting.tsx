import React, { useState, useEffect, useRef } from 'react'; // ĐÃ NHÚNG: Thêm useEffect, useRef
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import { 
  Users,
  Plus,
  ThumbsUp,
  MessageSquare,
  Camera,
  Edit2,
  MapPin,
  Calendar,
  User,
  Lock,
  LogOut,
  ChevronRight,
  Settings,
} from 'lucide-react';
import profileAPI from '../api/profileAPI';
import accountAPI from '../api/accountAPI';
import type { UserProfile } from '../api/profileAPI';

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
  const navigate = useNavigate();
  const [view, setView] = useState<'home' | 'profile' | 'settings'>('settings'); 
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [activeSettingsCategory, setActiveSettingsCategory] = useState('account');
  
  // --- ĐÃ NHÚNG: State lưu dữ liệu từ Backend ---
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [editProfile, setEditProfile] = useState<Partial<UserProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // --- Password change states ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // --- ĐÃ NHÚNG: Hàm lấy dữ liệu và format ngày sinh ---
  const fetchProfile = async () => {
    try {
      const response = await profileAPI.getMe();
      setUserProfile(response);
      setEditProfile(response);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setEditProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancelEdit = () => {
    setEditProfile(userProfile);
    setSaveStatus('idle');
  };

  const handleSaveProfile = async () => {
    if (!editProfile) return;

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      await profileAPI.updateProfile({
        fullName: editProfile.fullName,
        bio: editProfile.bio,
        phoneNumber: editProfile.phoneNumber,
        gender: editProfile.gender,
        dateOfBirth: editProfile.dateOfBirth,
        address: editProfile.address,
      });
      setUserProfile((prev) => ({ ...(prev ?? {}), ...editProfile } as UserProfile));
      setSaveStatus('success');
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      window.setTimeout(() => setSaveStatus('idle'), 4000);
    }
  };



  useEffect(() => {
    fetchProfile();
  }, []);

  const formatBirthday = (dateString?: string) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Chưa cập nhật";
    return `${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
  };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5012';

  // --- ĐÃ NHÚNG: Logic xử lý hiển thị linh hoạt ---
  const displayName = userProfile?.fullName || userProfile?.userName || "Người dùng";
  const getSettingsAvatar = () => {
    if (userProfile?.avatarUrl) {
      return userProfile.avatarUrl.startsWith('http') ? userProfile.avatarUrl : `${API_BASE_URL}${userProfile.avatarUrl}`;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.userName}`;
  };
  const profileAvatar = getSettingsAvatar();
  const firstName = displayName.split(' ').pop();

  const settingsCategories: SettingsCategory[] = [
    { id: 'account', label: 'Thông tin cá nhân', icon: <User size={20} />, description: 'Quản lý tên, email và thông tin cơ bản.' },
    { id: 'security', label: 'Mật khẩu và bảo mật', icon: <Lock size={20} />, description: 'Thay đổi mật khẩu và bảo vệ tài khoản.' },
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

  // setting.tsx
  const handleChangePassword = async () => {
    // Kiểm tra khớp mật khẩu ngay tại Frontend để đỡ tốn tài nguyên server
    if (newPassword !== confirmNewPassword) {
      alert("Mật khẩu mới và xác nhận không khớp!");
      return;
    }

    try {
      await accountAPI.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      alert("Đổi mật khẩu thành công");
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch {
      alert("Đã có lỗi xảy ra, vui lòng thử lại.");
    }
  };

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
                  <button
                    onClick={() => {
                      localStorage.removeItem('authToken');
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-4 px-5 py-3.5 text-left transition-all hover:bg-red-50 text-red-500 rounded-lg font-bold"
                  >
                    <LogOut size={20} />
                    <span>Đăng xuất</span>
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
                        <img src={profileAvatar} className="w-20 h-20 rounded-full border-2 border-white shadow-sm object-cover" alt="profile" />
                        <div>
                          <p className="font-bold text-gray-800">Ảnh đại diện</p>
                          <p className="text-xs text-gray-500 mb-3">Sử dụng ảnh thật để bạn bè dễ nhận ra bạn hơn.</p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={uploadingAvatar}
                              onClick={() => avatarFileRef.current?.click()}
                              className="bg-blue-600 text-white text-xs px-4 py-1.5 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-60"
                            >
                              {uploadingAvatar ? 'Đang tải...' : 'Thay đổi'}
                            </button>
                            <input
                              ref={avatarFileRef}
                              type="file"
                              accept="image/jpeg,image/png,image/gif,image/webp"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setUploadingAvatar(true);
                                try {
                                  const result = await profileAPI.uploadAvatar(file);
                                  setUserProfile(prev => prev ? { ...prev, avatarUrl: result.avatarUrl } : prev);
                                  // Cập nhật localStorage
                                  const storedUser = localStorage.getItem('user');
                                  if (storedUser) {
                                    const parsed = JSON.parse(storedUser);
                                    parsed.avatarUrl = result.avatarUrl;
                                    localStorage.setItem('user', JSON.stringify(parsed));
                                  }
                                  alert('Cập nhật ảnh đại diện thành công!');
                                } catch {
                                  alert('Không thể cập nhật ảnh đại diện');
                                } finally {
                                  setUploadingAvatar(false);
                                  e.target.value = '';
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                          <input
                            type="text"
                            value={editProfile?.fullName || ''}
                            onChange={(e) => handleProfileChange('fullName', e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Email liên hệ</label>
                          <input
                            type="email"
                            value={editProfile?.email || ''}
                            disabled
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày sinh</label>
                          <input
                            type="date"
                            value={editProfile?.dateOfBirth?.slice(0, 10) || ''}
                            onChange={(e) => handleProfileChange('dateOfBirth', e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Giới tính</label>
                          <select
                            value={editProfile?.gender || ''}
                            onChange={(e) => handleProfileChange('gender', e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          >
                            <option value="">Chưa xác định</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ</label>
                          <input
                            type="text"
                            value={editProfile?.address || ''}
                            onChange={(e) => handleProfileChange('address', e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                          <input
                            type="tel"
                            value={editProfile?.phoneNumber || ''}
                            onChange={(e) => handleProfileChange('phoneNumber', e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder="Nhập số điện thoại"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Tiểu sử</label>
                          <textarea
                            value={editProfile?.bio || ''}
                            onChange={(e) => handleProfileChange('bio', e.target.value)}
                            rows={4}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                      </div>

                      {saveStatus === 'success' && (
                        <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">Cập nhật profile thành công.</div>
                      )}
                      {saveStatus === 'error' && (
                        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">Không thể lưu profile, vui lòng thử lại.</div>
                      )}

                      <div className="pt-4 flex flex-wrap justify-end gap-3">
                        <button
                          onClick={handleCancelEdit}
                          type="button"
                          className="px-6 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          type="button"
                          disabled={isSaving}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-bold shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSaving ? 'Đang lưu...' : 'Lưu tất cả'}
                        </button>
                      </div>
                    </div>
                  )}
                  {activeSettingsCategory === 'security' && (
                    <div className="space-y-8">
                      <div className="grid gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu hiện tại</label>
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder="Nhập mật khẩu hiện tại"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu mới</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder="Nhập mật khẩu mới"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                          <input
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder="Nhập lại mật khẩu mới"
                          />
                        </div>
                      </div>

                      {passwordChangeStatus === 'success' && (
                        <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">Đổi mật khẩu thành công.</div>
                      )}
                      {passwordChangeStatus === 'error' && (
                        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                          {passwordErrorMessage || 'Không thể đổi mật khẩu, vui lòng thử lại.'}
                        </div>
                      )}

                      <div className="pt-4 flex flex-wrap justify-end gap-3">
                        <button
                          onClick={() => {
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmNewPassword('');
                            setPasswordChangeStatus('idle');
                            setPasswordErrorMessage('');
                          }}
                          type="button"
                          className="px-6 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleChangePassword}
                          type="button"
                          disabled={isChangingPassword || !currentPassword || !newPassword || !confirmNewPassword}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-bold shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isChangingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
                        </button>
                      </div>
                    </div>
                  )}
                  {activeSettingsCategory !== 'account' && activeSettingsCategory !== 'security' && (
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

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>
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

export default App;