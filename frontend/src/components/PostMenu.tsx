import React, { useState, useRef, useLayoutEffect } from 'react';
import { Edit2, Trash2, X } from 'lucide-react';

interface PostMenuProps {
  postId: number;
  isVisible: boolean;
  onClose: () => void;
  onEdit: (postId: number) => void;
  onDelete: (postId: number) => void;
  canEdit: boolean;
  buttonRef?: { current: HTMLButtonElement | null };
}

interface Position {
  top: number;
  left: number;
}

const PostMenu: React.FC<PostMenuProps> = ({
  postId,
  isVisible,
  onClose,
  onEdit,
  onDelete,
  canEdit,
  buttonRef,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (isVisible && buttonRef?.current && menuRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      
      const top = buttonRect.bottom + 8;
      const left = buttonRect.right - menuRect.width;
      
      setPosition({ top, left });
    }
  }, [isVisible, buttonRef]);

  if (!isVisible && !showDeleteConfirm) return null;

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(postId);
    setShowDeleteConfirm(false);
    onClose();
  };

  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/30" onClick={() => setShowDeleteConfirm(false)}></div>
        <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Xóa bài viết?</h3>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-gray-600 mb-6">
            Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể được hoàn tác.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 font-medium"
            >
              Hủy
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isVisible) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[250]" 
        onClick={onClose}
        style={{ top: 0, left: 0 }}
      />
      <div 
        ref={menuRef}
        className="fixed bg-white rounded-lg shadow-lg border border-gray-200 z-[300] min-w-[180px] overflow-hidden"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        {canEdit && (
          <>
            <button
              onClick={() => {
                onEdit(postId);
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 font-medium text-left"
            >
              <Edit2 size={16} />
              Chỉnh sửa
            </button>
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600 font-medium border-t border-gray-100 text-left"
            >
              <Trash2 size={16} />
              Xóa
            </button>
          </>
        )}
        {!canEdit && (
          <button className="w-full px-4 py-3 text-gray-600 text-sm">
            Không có tùy chọn
          </button>
        )}
      </div>
    </>
  );
};

export default PostMenu;
