import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import CreatePostModal from './CreatePostModal';
import { 
  Users, 
  Plus, 
  MoreHorizontal, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Image as ImageIcon, 
  Smile,
  MapPin,
  Calendar,
  Camera,
  Flag,
  Heart,
  Mail,
  Phone
} from 'lucide-react';
import profileAPI from '../api/profileAPI';
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

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dữ liệu bài viết mẫu
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: 'Ngọc Hồng',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hong',
      time: '13 tháng 6, 2022',
      content: '“ Ngọn cỏ không chạm được vào mây, nhưng cỏ không vì vậy mà ngừng vươn lên ”',
      likes: 152,
      comments: 24,
      liked: false,
    }
  ]);

  // Hàm lấy dữ liệu từ Backend
  const fetchProfile = async () => {
    try {
      const response = await profileAPI.getMe();
      console.log("Dữ liệu nhận được:", response);
      setUserProfile(response);
    } catch (error) {
      console.error("Lỗi tải profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleNewPost = (data: any) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5012';
    const newPost: Post = {
      id: data.id,
      author: userProfile?.fullName || userProfile?.userName || 'Bạn',
      avatar: userProfile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.userName}`,
      time: data.createdAt ? new Date(data.createdAt).toLocaleString('vi-VN') : 'Vừa xong',
      content: data.content || '',
      image: data.imageUrl ? `${API_BASE_URL}${data.imageUrl}` : undefined,
      likes: data.likes?.length ?? 0,
      comments: data.comments?.length ?? 0,
      liked: false,
    };

    setPosts(prev => [newPost, ...prev]);
  };

  // Xử lý định dạng ngày sinh chuẩn tiếng Việt
  const formatBirthday = (dateString?: string) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Chưa cập nhật";
    return `${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F0F2F5]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#0866FF] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-gray-500">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  // Lấy tên cuối cùng để chào hỏi (Ví dụ: "Nguyễn Văn A" -> "A")
  const displayName = userProfile?.fullName || userProfile?.userName || "bạn";
  const firstName = displayName.split(' ').pop();

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-[#1C1E21]">
      <Navbar />

      <div className="pt-14 pb-10">
        {/* --- PROFILE HEADER --- */}
        <div className="bg-white shadow-sm pt-8">
          <div className="max-w-[1095px] mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center md:items-end pb-6 gap-4 px-4 md:px-8">
              <div className="relative group/avatar">
                <div className="w-40 h-40 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg relative z-10">
                  <img 
                    src={userProfile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.userName}`} 
                    className="w-full h-full object-cover" 
                    alt="avatar" 
                  />
                </div>
                <button className="absolute bottom-2 right-2 p-2 bg-gray-200 hover:bg-gray-300 rounded-full border-2 border-white shadow-sm z-20 transition-all">
                  <Camera size={20} />
                </button>
              </div>

              <div className="flex-1 text-center md:text-left mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {userProfile?.fullName || userProfile?.userName}
                </h1>
                <p className="text-gray-500 font-semibold">{userProfile?.email || 'Chưa cập nhật email'}</p>
                {userProfile?.bio && (
                  <p className="text-gray-600 mt-2 leading-relaxed">{userProfile.bio}</p>
                )}
              </div>

              <div className="flex gap-2 mb-4">
                <button className="bg-[#0866FF] hover:bg-[#0759E0] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md">
                  <Plus size={18} /> Thêm vào tin
                </button>
              </div>
            </div>

            {/* Tabs Bar */}
            <div className="flex border-t border-gray-100 items-center justify-between">
              <div className="flex overflow-x-auto no-scrollbar">
                {['Tất cả', 'Giới thiệu', 'Bạn bè', 'Ảnh'].map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-5 font-bold text-sm transition-all border-b-4 ${activeTab === tab ? 'text-[#0866FF] border-[#0866FF]' : 'text-[#65676B] border-transparent hover:bg-gray-100 rounded-lg m-1'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-[#65676B]"><MoreHorizontal size={20}/></button>
            </div>
          </div>
        </div>

        {/* --- PROFILE CONTENT BODY --- */}
        <div className="max-w-[1095px] mx-auto px-4 mt-4 grid grid-cols-1 lg:grid-cols-5 gap-4">
          
          {/* CỘT TRÁI - GIỚI THIỆU */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-20">
              <h3 className="text-xl font-bold mb-4">Giới thiệu</h3>
              <div className="space-y-4">
                <DetailRow 
                    icon={<Mail size={20} className="text-gray-500" />} 
                    text={`Email: ${userProfile?.email || "Chưa cập nhật"}`} 
                />
                <DetailRow 
                    icon={<Phone size={20} className="text-gray-500" />} 
                    text={`SĐT: ${userProfile?.phoneNumber || "Chưa cập nhật"}`} 
                />
                <DetailRow 
                    icon={<MapPin size={20} className="text-gray-500" />} 
                    text="Sống tại " 
                    bold={userProfile?.address || "Chưa cập nhật"} 
                />
                <DetailRow 
                    icon={<Calendar size={20} className="text-gray-500" />} 
                    text={`Sinh ngày ${formatBirthday(userProfile?.dateOfBirth)}`} 
                />
                <DetailRow 
                    icon={<Users size={20} className="text-gray-500" />} 
                    text={`Giới tính: ${userProfile?.gender || "Chưa xác định"}`} 
                />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI - DÒNG THỜI GIAN */}
          <div className="lg:col-span-3 space-y-4">
            {/* Thanh tạo bài viết */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex gap-3 mb-4">
                <img 
                  src={userProfile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.userName}`} 
                  className="w-10 h-10 rounded-full" 
                  alt="avatar" 
                />
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] text-left px-4 py-2.5 rounded-full text-[17px] transition-colors"
                >
                    {firstName} ơi, bạn đang nghĩ gì thế?
                </button>
              </div>
              <div className="flex border-t border-gray-100 pt-2 gap-1">
                <PostTypeBtn icon={<ImageIcon className="text-[#45BD62]" size={20}/>} label="Ảnh/video" />
                <PostTypeBtn icon={<Flag className="text-[#05A5F2]" size={20}/>} label="Cột mốc" />
                <PostTypeBtn icon={<Smile className="text-[#EAB308]" size={20}/>} label="Cảm xúc" />
              </div>
            </div>

            <CreatePostModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              userData={userProfile}
              onPostSuccess={(data: any) => {
                handleNewPost(data);
                setIsModalOpen(false);
              }}
            />

            {/* Danh sách bài viết */}
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 flex justify-between items-start">
                  <div className="flex gap-3">
                    <img src={post.avatar} className="w-10 h-10 rounded-full" alt="author" />
                    <div>
                      <h4 className="font-bold text-[15px] hover:underline cursor-pointer">{post.author}</h4>
                      <p className="text-[13px] text-gray-500 hover:underline cursor-pointer">{post.time} • 🌏</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><MoreHorizontal size={20}/></button>
                </div>

                <div className="px-4 pb-3 text-[15px] leading-relaxed text-gray-900">
                  {post.content}
                </div>

                <div className="px-4 py-2.5 flex justify-between items-center text-sm text-[#65676B] border-t border-gray-50">
                  <div className="flex items-center gap-1.5 cursor-pointer">
                    <div className="flex -space-x-1">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white ring-2 ring-white">
                        <ThumbsUp size={10} className="fill-current"/>
                      </div>
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white ring-2 ring-white">
                        <Heart size={10} className="fill-current"/>
                      </div>
                    </div>
                    <span className="hover:underline font-medium">{post.likes}</span>
                  </div>
                  <div className="font-medium hover:underline cursor-pointer">
                    {post.comments} bình luận
                  </div>
                </div>

                <div className="mx-4 mb-2 p-1 flex gap-1 border-t border-gray-100">
                  <ActionButton icon={<ThumbsUp size={20} />} text="Thích" />
                  <ActionButton icon={<MessageSquare size={20} />} text="Bình luận" />
                  <ActionButton icon={<Share2 size={20} />} text="Chia sẻ" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CÁC THÀNH PHẦN GIAO DIỆN PHỤ ---

const DetailRow: React.FC<{ icon: React.ReactNode; text: string; bold?: string }> = ({ icon, text, bold }) => (
  <div className="flex items-center gap-3 text-[15px] text-gray-700">
    <div className="flex-shrink-0">{icon}</div>
    <p>{text}{bold && <span className="font-bold">{bold}</span>}</p>
  </div>
);

const PostTypeBtn: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg transition-colors font-semibold text-[#65676B] text-[15px]">
    {icon} {label}
  </button>
);

const ActionButton: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg font-bold text-[15px] hover:bg-gray-100 transition-colors text-[#65676B]">
    {icon} {text}
  </button>
);

export default App;