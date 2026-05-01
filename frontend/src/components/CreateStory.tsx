import React, { useState, useRef } from 'react';
import { X, Settings, ChevronLeft, Type, Palette, Plus, Send, Globe, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { Rnd } from 'react-rnd'; // Thư viện kéo thả & resize
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import storyAPI from '../api/storyAPI';

const CreateStory = ({ userData = {}, setView }: any) => {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [bgGradient, setBgGradient] = useState("from-purple-500 to-pink-500");
  const [isSharing, setIsSharing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const gradients = [
    "from-purple-500 to-pink-500", "from-blue-400 to-emerald-400",
    "from-orange-400 to-red-500", "from-indigo-600 to-blue-700",
    "from-gray-900 to-gray-600", "from-rose-400 to-orange-300"
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setSelectedImage(url);
    }
  };

  const handleShare = async () => {
    if (!text && !selectedImage) {
      alert("Vui lòng thêm văn bản hoặc hình ảnh trước khi chia sẻ!");
      return; 
    }

    setIsSharing(true);
    try {
      // Tạo object để gửi dữ liệu
      const storyData: any = {
        content: text || undefined,
        mediaUrl: undefined,
      };

      // Nếu có hình ảnh, sử dụng URL object (tạm thời)
      // Trong thực tế, nên upload lên server trước rồi lấy URL
      if (selectedImage) {
        // Hiện tại chỉ gửi blob URL, backend có thể xử lý hoặc cập nhật sau
        storyData.mediaUrl = selectedImage;
      }


      // Gọi API tạo story
      const response = await storyAPI.createStory(storyData);
      
      // Hiển thị thông báo thành công
      setShowSuccessMessage(true);
      
      // Reset form
      setText("");
      setSelectedImage(null);
      
      // Tự động redirect sau 2 giây
      setTimeout(() => {
        navigate('/homepages');
      }, 2000);
    } catch {
      alert("Không thể chia sẻ tin, vui lòng thử lại.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#F0F2F5] flex flex-col font-sans overflow-hidden">
      <Navbar />

      {/* Success Notification Modal */}
      {showSuccessMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center animate-in fade-in scale-in duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="text-3xl">✓</div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Thành công!</h3>
            <p className="text-gray-600 mb-6">Tin của bạn đã được chia sẻ thành công. Bạn sẽ quay về trang chủ trong giây lát...</p>
            <div className="flex justify-center">
              <div className="inline-block text-blue-600 font-bold">Đang tải...</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR BÊN TRÁI */}
        <aside className="w-full md:w-[360px] bg-white border-r border-gray-200 flex flex-col shadow-xl z-40">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-800">Tin của bạn</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-8 no-scrollbar">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <img src={userData?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"} className="w-12 h-12 rounded-full border" alt="me" />
              <div>
                <p className="font-bold">{userData?.name || "Người dùng"}</p>
                <span className="text-[11px] text-gray-500">Công khai</span>
              </div>
            </div>

            {/* Input Text */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase"><Type size={16}/> Văn bản</label>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Bắt đầu nhập..."
                className="w-full h-24 p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-sm"
              />
            </div>

            {/* Background Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase"><Palette size={16}/> Phông nền</label>
              <div className="flex flex-wrap gap-2">
                {gradients.map((grad, i) => (
                  <button key={i} onClick={() => setBgGradient(grad)} className={`w-8 h-8 rounded-full bg-gradient-to-br ${grad} border-2 ${bgGradient === grad ? 'border-blue-600' : 'border-white'}`} />
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 p-4 border-2 border-dashed rounded-2xl hover:bg-blue-50 transition-all">
                <Plus className="text-blue-600" />
                <span className="font-bold text-sm">Thêm ảnh vào tin</span>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} accept="image/*" />
              </button>
            </div>
          </div>

          <div className="p-4 border-t bg-white flex gap-2">
            <button onClick={() => navigate('/')} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-all">Hủy</button>
            <button onClick={handleShare} disabled={isSharing} className="flex-[2] py-3 bg-[#0866FF] hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all">
              {isSharing ? 'Đang chia sẻ...' : 'Chia sẻ'}
            </button>
          </div>
        </aside>

        {/* BẢN XEM TRƯỚC (PREVIEW) */}
        <main className="flex-1 flex items-center justify-center p-6 bg-gray-200">
          <div className="relative w-[340px] aspect-[9/16] bg-black rounded-[2.5rem] shadow-2xl border-[8px] border-white overflow-hidden">
            
            {/* Vùng Canvas chứa nội dung */}
            <div id="story-canvas" className={`w-full h-full bg-gradient-to-br ${bgGradient} relative overflow-hidden`}>
              
              {/* 1. HÌNH ẢNH (CÓ THỂ DI CHUYỂN/RESIZE) */}
              {selectedImage && (
                <Rnd
                  default={{ x: 0, y: 0, width: '100%', height: '50%' }}
                  bounds="parent"
                  lockAspectRatio={true}
                >
                  <div className="group relative w-full h-full">
                    <img src={selectedImage} className="w-full h-full object-cover cursor-move select-none" alt="Preview" draggable={false} />
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400 pointer-events-none" />
                  </div>
                </Rnd>
              )}

              {/* 2. VĂN BẢN (CÓ THỂ DI CHUYỂN/RESIZE) */}
              {text && (
                <Rnd
                  default={{ x: 50, y: 300, width: 240, height: 100 }}
                  bounds="parent"
                >
                  <div className="group relative w-full h-full flex items-center justify-center cursor-move">
                    <p className="text-white text-xl font-bold text-center drop-shadow-lg select-none whitespace-pre-wrap">
                      {text}
                    </p>
                    <div className="absolute inset-0 border-2 border-dashed border-transparent group-hover:border-white/50 pointer-events-none" />
                  </div>
                </Rnd>
              )}

              {/* Header cố định */}
              <div className="absolute top-6 left-4 flex items-center gap-2 z-50 pointer-events-none">
                <img src={userData?.avatar} className="w-8 h-8 rounded-full border border-white" alt="" />
                <span className="text-white text-[11px] font-bold">{userData?.name}</span>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateStory;