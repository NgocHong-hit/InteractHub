import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Image as ImageIcon, Globe } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5012';

const CreatePostModal = ({ isOpen, onClose, userData, onPostSuccess }: any) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  if (!isOpen) return null;

  const displayName = userData?.fullName || userData?.name || 'Bạn';

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: any) => {
    if (!data.content?.trim()) {
      alert('Vui lòng nhập nội dung bài viết');
      return;
    }

    const formData = new FormData();
    formData.append('Content', data.content.trim());
    if (selectedImage) {
      formData.append('Image', selectedImage);
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Bạn chưa đăng nhập');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const responseText = await response.text();
      let newPost;

      try {
        newPost = JSON.parse(responseText);
      } catch (e) {
        console.error('Response:', responseText);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error('Failed to create post', newPost?.message || responseText);
        alert(`Lỗi: ${newPost?.message || 'Không thể tạo bài viết'}`);
        return;
      }

      console.log('Post created successfully:', newPost);
      onPostSuccess(newPost);
      reset();
      removeImage();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      alert(`Lỗi: ${error instanceof Error ? error.message : 'Không thể tạo bài viết'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-[520px] rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div />
          <h3 className="text-lg font-semibold">Tạo bài viết</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div className="flex gap-3 items-center">
            <img src={userData?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <div className="text-sm font-semibold text-slate-900">{displayName}</div>
              <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                <Globe size={12} /> Công khai
              </div>
            </div>
          </div>

          <textarea
            {...register('content', { required: 'Bạn chưa nhập gì cả!' })}
            placeholder={`${displayName} ơi, bạn đang nghĩ gì thế?`}
            className="w-full min-h-[140px] rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none resize-none focus:border-blue-500"
          />
          {errors.content && <p className="text-sm text-red-500">{errors.content.message as string}</p>}

          {imagePreview && (
            <div className="relative">
              <img src={imagePreview} alt="preview" className="w-full max-h-[360px] rounded-3xl object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-3 right-3 rounded-full bg-black/70 p-1 text-white hover:bg-black"
              >
                <X size={18} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between rounded-3xl border border-slate-200 px-4 py-3">
            <span className="text-sm font-semibold text-slate-700">Thêm vào bài viết</span>
            <label className="flex cursor-pointer items-center gap-2 text-green-600 hover:text-green-700">
              <ImageIcon size={22} />
              <span className="text-sm">Ảnh</span>
              <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-3xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:bg-slate-400"
          >
            {isSubmitting ? 'Đang đăng...' : 'Đăng'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
