import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string, image?: File | null) => void;
  initialContent: string;
  initialImage?: string;
  isLoading?: boolean;
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialContent,
  initialImage,
  isLoading = false,
}) => {
  const [content, setContent] = useState(initialContent);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialImage || null);
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    setContent(initialContent);
    setImagePreview(initialImage || null);
    setSelectedImage(null);
    setRemoveImage(false);
  }, [initialContent, initialImage]);

  if (!isOpen) return null;

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    setRemoveImage(false);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  const handleSubmit = () => {
    if (content.trim()) {
      const imageToSend = removeImage ? null : selectedImage;
      onSave(content.trim(), imageToSend);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-[520px] rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div />
          <h3 className="text-lg font-semibold">Chỉnh sửa bài viết</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nội dung bài viết..."
            className="w-full min-h-[200px] rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none resize-none focus:border-blue-500"
          />

          {imagePreview && (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full rounded-lg" />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
              <ImageIcon size={20} className="text-green-600" />
              <span className="text-sm font-medium">Ảnh</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 rounded-3xl border border-gray-200 font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !content.trim()}
              className="px-6 py-2 rounded-3xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
