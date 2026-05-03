import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Post } from '../types';

interface SharePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postToShare: Post | null;
  onShare: (content: string) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5012';

const getAvatarUrl = (url?: string, seed?: string) => {
  if (url) return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || 'user'}`;
};

const SharePostModal: React.FC<SharePostModalProps> = ({ isOpen, onClose, postToShare, onShare }) => {
  const [content, setContent] = useState('');

  if (!isOpen || !postToShare) return null;

  const handleSubmit = () => {
    onShare(content);
    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[500px] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 relative">
          <h2 className="text-xl font-bold mx-auto">Chia sẻ bài viết</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 absolute right-4">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nói gì đó về nội dung này..."
            className="w-full text-[15px] outline-none resize-none min-h-[80px]"
          />

          {/* Original Post Preview */}
          <div className="border border-gray-200 rounded-xl p-3 mt-2 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <img
                src={getAvatarUrl(postToShare.user?.avatarUrl, postToShare.user?.userName || 'User')}
                className="w-8 h-8 rounded-full border border-gray-100 object-cover"
                alt="Avatar"
              />
              <div>
                <p className="font-bold text-sm">{postToShare.user?.fullName || postToShare.user?.userName}</p>
                <p className="text-[11px] text-gray-500">{new Date(postToShare.createdAt).toLocaleString('vi-VN')} • 🌏</p>
              </div>
            </div>
            <p className="text-[14px] mb-2">{postToShare.content}</p>
            {postToShare.imageUrl && (
              <img
                src={`${API_BASE_URL}${postToShare.imageUrl}`}
                className="w-full max-h-[200px] object-cover rounded-lg border border-gray-100"
                alt="Post attachment"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 pt-2">
          <button
            onClick={handleSubmit}
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            Chia sẻ ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharePostModal;
