import React from 'react';
import { useForm } from 'react-hook-form';
import { X, Image as ImageIcon, Smile, User, Globe } from 'lucide-react';

const CreatePostModal = ({ isOpen, onClose, userData, onPostSuccess }: any) => {
  // 1. Khởi tạo React Hook Form
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  if (!isOpen) return null;

  // 2. Hàm xử lý khi nhấn nút "Đăng"
  const onSubmit = (data: any) => {
    console.log("Nội dung bài viết mới:", data);
    // Giả lập gửi dữ liệu thành công
    onPostSuccess(data.content); 
    reset(); // Xóa trắng form sau khi đăng
    onClose(); // Đóng modal
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Lớp nền mờ */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" onClick={onClose}></div>

      {/* Khung Modal chính */}
      <div className="relative bg-white w-full max-w-[500px] rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="w-8"></div>
          <h3 className="text-xl font-bold text-gray-900">Tạo bài viết</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4">
          {/* Thông tin người đăng */}
          <div className="flex gap-3 mb-4">
            <img src={userData.avatar} className="w-10 h-10 rounded-full" alt="avatar" />
            <div>
              <p className="font-bold text-[15px]">{userData.name}</p>
              <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md w-fit mt-0.5">
                <Globe size={12} className="text-gray-600" />
                <span className="text-[12px] font-bold text-gray-600">Công khai</span>
              </div>
            </div>
          </div>

          {/* Ô nhập nội dung (Sử dụng register của React Hook Form) */}
          <textarea 
            {...register("content", { required: "Bạn chưa nhập gì cả!" })}
            placeholder={`${userData.name} ơi, bạn đang nghĩ gì thế?`}
            className="w-full min-h-[150px] text-xl outline-none resize-none placeholder:text-gray-500"
            autoFocus
          ></textarea>
          {errors.content && <p className="text-red-500 text-xs mb-2">*{errors.content.message as string}</p>}

          {/* Thanh công cụ bổ sung */}
          <div className="border border-gray-200 rounded-lg p-3 flex justify-between items-center mb-4">
            <span className="text-[15px] font-bold text-gray-700">Thêm vào bài viết</span>
            <div className="flex gap-2">
              <button type="button" className="p-2 hover:bg-gray-100 rounded-full text-[#45BD62]"><ImageIcon size={24} /></button>
              <button type="button" className="p-2 hover:bg-gray-100 rounded-full text-[#EAB308]"><Smile size={24} /></button>
            </div>
          </div>

          {/* Nút Đăng */}
          <button 
            type="submit"
            className="w-full bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold py-2 rounded-lg transition-all active:scale-[0.98]"
          >
            Đăng
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;