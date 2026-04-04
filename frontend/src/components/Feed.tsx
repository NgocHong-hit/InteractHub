import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Video, Image as ImageIcon, Smile, MoreHorizontal, 
  ThumbsUp, MessageSquare, Globe, X, Plus 
} from 'lucide-react';
import { Link } from 'react-router-dom'; // QUAN TRỌNG: Dùng Link này để chuyển trang

// --- COMPONENT MODAL TẠO BÀI VIẾT ---
const CreatePostModal = ({ isOpen, onClose, onPost, userData }: any) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  if (!isOpen) return null;

  const onSubmit = (data: any) => {
    onPost(data.content);
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-[500px] rounded-xl shadow-2xl border border-gray-200 animate-in zoom-in duration-200">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="w-8" />
          <h3 className="text-lg font-bold text-gray-900">Tạo bài viết</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4">
          <div className="flex gap-3 mb-4">
            <img src={userData?.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
            <div>
              <h4 className="font-bold text-sm">{userData?.name}</h4>
              <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md w-fit mt-0.5">
                <Globe size={12} /> <span className="text-[11px] font-bold">Công khai</span>
              </div>
            </div>
          </div>
          <textarea 
            {...register("content", { required: "Bạn đang nghĩ gì thế?" })}
            placeholder={`${userData?.name} ơi, bạn đang nghĩ gì thế?`}
            className="w-full min-h-[120px] text-lg outline-none resize-none placeholder:text-gray-500"
            autoFocus
          />
          {errors.content && <p className="text-red-500 text-xs mb-2">{errors.content.message as string}</p>}

          <div className="border border-gray-200 rounded-lg p-3 flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-gray-700">Thêm vào bài viết</span>
            <div className="flex gap-2">
              <ImageIcon className="text-green-500 cursor-pointer" size={24}/>
              <Smile className="text-yellow-500 cursor-pointer" size={24}/>
            </div>
          </div>

          <button type="submit" className="w-full bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold py-2 rounded-lg transition-all active:scale-95">
            Đăng
          </button>
        </form>
      </div>
    </div>
  );
};

// --- COMPONENT FEED CHÍNH ---
const Feed = ({ posts: initialPosts = [], stories = [], userData }: any) => {
  const [posts, setPosts] = useState(initialPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNewPost = (content: string) => {
    const newPost = {
      id: Date.now(),
      author: userData?.name || "Người dùng",
      avatar: userData?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=User",
      time: "Vừa xong",
      content: content,
      image: null
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <main className="flex-1 flex flex-col gap-5 max-w-[600px] mx-auto py-4 px-2">
      
      {/* KHU VỰC STORIES */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
        
        {/* Ô TẠO TIN (Cố định ở vị trí đầu tiên) */}
        <Link to="/create-story" className="flex-shrink-0 no-underline">
          <div className="relative w-28 h-48 rounded-xl overflow-hidden cursor-pointer group bg-white border border-gray-200 shadow-sm transition-all hover:bg-gray-50">
            <div className="h-[70%] overflow-hidden bg-gray-100">
              <img 
                src={userData?.avatar} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                alt="Tạo tin" 
              />
            </div>
            <div className="absolute bottom-0 w-full h-[30%] bg-white flex flex-col items-center justify-center">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#0866FF] rounded-full border-4 border-white flex items-center justify-center text-white shadow-md">
                <Plus size={20} strokeWidth={3} />
              </div>
              <span className="text-[12px] font-bold text-gray-900 mt-2">Tạo tin</span>
            </div>
          </div>
        </Link>

        {/* DANH SÁCH STORIES TỪ DỮ LIỆU BẠN BÈ */}
        {stories.map((story: any) => (
          <div key={story.id} className="relative w-28 h-48 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer group shadow-sm border border-gray-200">
            <img src={story.thumb} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
            
            {/* Avatar nhỏ trên story bạn bè */}
            <div className="absolute top-2 left-2 p-0.5 bg-[#0866FF] rounded-full border-2 border-white z-10">
               <img src={story.avatar} className="w-7 h-7 rounded-full" alt="" />
            </div>

            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
            <span className="absolute bottom-2 left-2 right-2 text-[11px] font-bold text-white truncate">{story.name}</span>
          </div>
        ))}
      </div>

      {/* KHU VỰC ĐĂNG BÀI */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mt-2">
        <div className="flex gap-3 mb-4">
          <img src={userData?.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-[#F0F2F5] hover:bg-gray-200 text-gray-500 text-left px-4 py-2.5 rounded-full text-[15px] transition-colors"
          >
            {userData?.name} ơi, bạn đang nghĩ gì thế?
          </button>
        </div>
      </div>

      {/* MODAL */}
      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPost={handleNewPost} 
        userData={userData} 
      />

      {/* DANH SÁCH BÀI VIẾT */}
      <div className="flex flex-col gap-4">
        {posts.map((post: any) => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 flex justify-between items-start">
              <div className="flex gap-3">
                <img src={post.avatar} className="w-10 h-10 rounded-full border border-gray-100 object-cover" alt="" />
                <div>
                  <h4 className="font-bold text-sm hover:underline cursor-pointer">{post.author}</h4>
                  <span className="text-[11px] text-gray-500 font-medium">{post.time} • 🌏</span>
                </div>
              </div>
              <MoreHorizontal className="text-gray-400 cursor-pointer hover:bg-gray-100 rounded-full" size={18} />
            </div>
            <p className="px-4 pb-3 text-[15px] leading-relaxed text-gray-800">{post.content}</p>
            {post.image && <img src={post.image} className="w-full max-h-[450px] object-cover border-y border-gray-50" alt="" />}
            
            <div className="px-4 py-2 flex items-center justify-between border-t border-gray-50 mx-2">
               <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                  <div className="bg-blue-500 p-1 rounded-full"><ThumbsUp size={10} className="text-white fill-current"/></div>
                  <span className="font-medium">12</span>
               </div>
               <span className="text-gray-500 text-xs font-medium">4 bình luận</span>
            </div>

            <div className="px-2 pb-1 flex border-t border-gray-100 mx-2 mb-1">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 font-bold text-[13px] hover:bg-gray-100 rounded-lg transition-colors"><ThumbsUp size={18}/> Thích</button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 font-bold text-[13px] hover:bg-gray-100 rounded-lg transition-colors"><MessageSquare size={18}/> Bình luận</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Feed;