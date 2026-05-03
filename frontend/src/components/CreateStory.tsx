import React, { useState, useRef } from 'react';
import { X, Settings, ChevronLeft, Type, Palette, Plus, Send, Globe, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { Rnd } from 'react-rnd';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import storyAPI from '../api/storyAPI';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5012';

const getAvatarUrl = (url?: string, seed?: string) => {
  if (url) return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || 'user'}`;
};

// Bảng ánh xạ Tailwind gradient class → màu CSS thật
const gradientColorMap: Record<string, [string, string]> = {
  "from-purple-500 to-pink-500": ["#a855f7", "#ec4899"],
  "from-blue-400 to-emerald-400": ["#60a5fa", "#34d399"],
  "from-orange-400 to-red-500": ["#fb923c", "#ef4444"],
  "from-indigo-600 to-blue-700": ["#4f46e5", "#1d4ed8"],
  "from-gray-900 to-gray-600": ["#111827", "#4b5563"],
  "from-rose-400 to-orange-300": ["#fb7185", "#fdba74"],
};

const CreateStory = ({ userData = {}, setView }: any) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bgGradient, setBgGradient] = useState("from-purple-500 to-pink-500");
  const [isSharing, setIsSharing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = user || userData;
  const profileName = 
    currentUser?.fullName ||
    currentUser?.userName || 
    "Người dùng";
  const gradients = [
    "from-purple-500 to-pink-500", "from-blue-400 to-emerald-400",
    "from-orange-400 to-red-500", "from-indigo-600 to-blue-700",
    "from-gray-900 to-gray-600", "from-rose-400 to-orange-300"
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setSelectedFile(file);
    }
  };

  // Vẽ story bằng Canvas API gốc — không phụ thuộc html2canvas
  const generateStoryImage = (): Promise<Blob> => {
    return new Promise(async (resolve, reject) => {
      try {
        const W = 1080;
        const H = 1920;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d')!;

        // 1. Vẽ nền gradient
        const colors = gradientColorMap[bgGradient] || ["#a855f7", "#ec4899"];
        const gradient = ctx.createLinearGradient(0, 0, W, H);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        // 2. Vẽ ảnh nếu có
        if (selectedImage) {
          await new Promise<void>((imgResolve, imgReject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              // Vẽ ảnh cover vào nửa trên
              const imgAspect = img.width / img.height;
              const targetH = H * 0.5;
              const targetW = W;
              let drawW = targetW;
              let drawH = targetW / imgAspect;
              if (drawH < targetH) {
                drawH = targetH;
                drawW = targetH * imgAspect;
              }
              const drawX = (targetW - drawW) / 2;
              const drawY = (targetH - drawH) / 2;
              ctx.drawImage(img, drawX, drawY, drawW, drawH);
              imgResolve();
            };
            img.onerror = () => imgResolve(); // Bỏ qua lỗi ảnh, vẫn tạo story
            img.src = selectedImage;
          });
        }

        // 3. Vẽ text nếu có
        if (text) {
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'white';
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 15;

          // Tính font size tự động
          let fontSize = 72;
          ctx.font = `bold ${fontSize}px "Segoe UI", Arial, sans-serif`;
          
          // Chia nhỏ text thành các dòng
          const maxWidth = W - 120;
          const words = text.split(/\s+/);
          let lines: string[] = [];
          let currentLine = '';
          
          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (ctx.measureText(testLine).width > maxWidth && currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) lines.push(currentLine);

          // Giảm font nếu quá nhiều dòng
          if (lines.length > 6) fontSize = 48;
          else if (lines.length > 4) fontSize = 56;
          ctx.font = `bold ${fontSize}px "Segoe UI", Arial, sans-serif`;
          
          // Tính lại lines với font mới
          lines = [];
          currentLine = '';
          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (ctx.measureText(testLine).width > maxWidth && currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          if (currentLine) lines.push(currentLine);

          const lineHeight = fontSize * 1.3;
          const totalTextH = lines.length * lineHeight;
          const textY = selectedImage ? (H * 0.5 + (H * 0.5 - totalTextH) / 2) : (H - totalTextH) / 2;

          lines.forEach((line, i) => {
            ctx.fillText(line, W / 2, textY + i * lineHeight + lineHeight / 2);
          });
          ctx.restore();
        }

        // 4. Xuất ra blob
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Không thể tạo hình ảnh"));
        }, 'image/jpeg', 0.92);
      } catch (err) {
        reject(err);
      }
    });
  };

  const handleShare = async () => {
    if (!text && !selectedImage) {
      alert("Vui lòng thêm văn bản hoặc hình ảnh trước khi chia sẻ!");
      return; 
    }

    setIsSharing(true);
    try {
      const blob = await generateStoryImage();

      const formData = new FormData();
      formData.append('Image', blob, 'story.jpg');

      await storyAPI.createStory(formData);
      
      setShowSuccessMessage(true);
      setText("");
      setSelectedImage(null);
      setSelectedFile(null);
      
      setTimeout(() => {
        navigate('/homepages');
      }, 2000);
    } catch (error) {
      console.error('Story share error:', error);
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
              <img src={getAvatarUrl(currentUser?.avatarUrl, currentUser?.userName)} className="w-12 h-12 rounded-full border" alt="me" />
              <div>
                <p className="font-bold">{profileName}</p>
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
            <button className="flex-1 p-0 overflow-hidden rounded-lg">
              <Link to="/homepages" className="w-full h-full py-3 block text-gray-500 font-bold bg-gray-100">
                Hủy
              </Link>
            </button>          
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
                <img src={getAvatarUrl(currentUser?.avatarUrl, currentUser?.userName)} className="w-8 h-8 rounded-full border border-white" alt="" />
                <span className="text-white text-[11px] font-bold">{profileName}</span>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateStory;