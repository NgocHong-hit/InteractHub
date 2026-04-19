import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  initialContent: string;
  isLoading?: boolean;
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialContent,
  isLoading = false,
}) => {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (content.trim()) {
      onSave(content.trim());
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
