import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { X, Image as ImageIcon, Globe, Hash } from 'lucide-react';
import postsAPI from '../api/postsAPI';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5012';

const getAvatarUrl = (url?: string, seed?: string) => {
  if (url) return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || 'user'}`;
};

const CreatePostModal = ({ isOpen, onClose, userData, onPostSuccess }: any) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [contentValue, setContentValue] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, watch } = useForm();

  // Extract hashtags from content
  const extractHashtags = (text: string): string[] => {
    const regex = /#[\w]+/g;
    const matches = text.match(regex) || [];
    return Array.from(new Set(matches)); // Remove duplicates
  };

  const hashtags = useMemo(() => {
    return extractHashtags(contentValue);
  }, [contentValue]);

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

    try {
      const newPost = await postsAPI.createPost({
        content: data.content.trim(),
        image: selectedImage || undefined
      });
      onPostSuccess(newPost);
      reset();
      removeImage();
      onClose();
    } catch (error) {
      alert(`Lỗi: ${error instanceof Error ? error.message : 'Không thể tạo bài viết'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-[520px] max-h-[90vh] rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div />
          <h3 className="text-lg font-semibold">Tạo bài viết</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex gap-3 items-center">
            <img src={getAvatarUrl(userData?.avatarUrl, userData?.userName)} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <div className="text-sm font-semibold text-slate-900">{displayName}</div>
              <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                <Globe size={12} /> Công khai
              </div>
            </div>
          </div>

          <textarea
            {...register('content', { required: 'Bạn chưa nhập gì cả!' })}
            onChange={(e) => {
              setContentValue(e.target.value);
              register('content').onChange?.(e);
            }}
            placeholder={`${displayName} ơi, bạn đang nghĩ gì thế?`}
            className="w-full min-h-[140px] rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none resize-none focus:border-blue-500"
          />
          {errors.content && <p className="text-sm text-red-500">{errors.content.message as string}</p>}

          {/* Hashtags Preview */}
          {hashtags.length > 0 && (
            <div className="bg-blue-50 rounded-2xl p-3 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Hash size={16} className="text-blue-600" />
                <span className="text-xs font-semibold text-blue-900">Hashtags Detected ({hashtags.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, idx) => (
                  <span key={idx} className="inline-block px-3 py-1 bg-white text-blue-600 rounded-full text-xs font-medium border border-blue-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {imagePreview && (
            <div className="relative">
              <img src={imagePreview} alt="preview" className="w-full max-h-[260px] rounded-3xl object-cover" />
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
          </div>

          <div className="p-4 pt-2 border-t border-gray-100 flex-shrink-0">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-3xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:bg-slate-400"
            >
              {isSubmitting ? 'Đang đăng...' : 'Đăng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
