import { useEffect, useState, useRef } from 'react';
import { MoreHorizontal, ThumbsUp, MessageSquare, Plus, X, Share2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import StoriesImport from 'react-insta-stories';
// Handle CJS/ESM interop - react-insta-stories may export differently
const Stories = (StoriesImport as any).default || StoriesImport;
import CreatePostModal from './CreatePostModal';
import EditPostModal from './EditPostModal';
import PostMenu from './PostMenu';
import SharePostModal from './SharePostModal';
import EditSharedPostModal from './EditSharedPostModal';
import postsAPI from '../api/postsAPI';
import commentsAPI from '../api/commentsAPI';
import likesAPI from '../api/likesAPI';
import shareAPI from '../api/shareAPI';
import type { Post, Comment, SharedPost } from '../types';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5012';

const getAvatarUrl = (url?: string, seed?: string) => {
  if (url) return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || 'user'}`;
};

const Feed = ({ stories = [] }: any) => {
  const navigate = useNavigate();
  const { user: userData } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState<Record<number, boolean>>({});
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [visiblePostMenu, setVisiblePostMenu] = useState<number | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const menuButtonRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  
  // --- States cho Shared Posts ---
  const [sharedPosts, setSharedPosts] = useState<SharedPost[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [postToShare, setPostToShare] = useState<Post | null>(null);
  
  const [editingSharedPost, setEditingSharedPost] = useState<SharedPost | null>(null);
  const [isEditSharedModalOpen, setIsEditSharedModalOpen] = useState(false);
  const [visibleSharedPostMenu, setVisibleSharedPostMenu] = useState<number | null>(null);
  const sharedMenuButtonRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  // --- States mới cho chức năng xem Story ---
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  
  // --- THÊM DÒNG NÀY ĐỂ LỌC TRÙNG ---
  const uniqueStories = stories.filter((story: any, index: number, self: any[]) =>
    index === self.findIndex((s) => s.id === story.id)
  );

  useEffect(() => {
    fetchPosts();
  }, []);

  const formattedStories = uniqueStories.map((s: any) => {
  return {
    content: (props: any) => (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden">
        
        {/* --- 1. TỰ VẼ HEADER Ở GÓC TRÁI --- */}
        <div className="absolute top-8 left-4 flex items-center gap-3 z-[1001] w-full px-4">
          <img 
            src={getAvatarUrl(s.user?.avatarUrl || s.avatar, s.name)} 
            className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover" 
            alt="avatar" 
          />
          <div className="flex flex-col">
            <span className="text-white text-[15px] font-bold drop-shadow-md">
              {s.user?.fullName || s.name || 'Người dùng'}
            </span>
            <span className="text-white/80 text-[11px] drop-shadow-sm">Tin tạm thời</span>
          </div>
        </div>

        {/* --- 2. NỀN STORY --- */}
        {(s.mediaUrl || s.thumb) ? (
          <img src={s.mediaUrl || s.thumb} className="w-full h-full object-cover" alt="story" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
        )}

        {/* Lớp phủ tối */}
        <div className="absolute inset-0 bg-black/20" />

        {/* --- 3. NỘI DUNG CHỮ --- */}
        {s.content && (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <p className="text-white text-2xl font-bold text-center drop-shadow-lg whitespace-pre-wrap">
              {s.content}
            </p>
          </div>
        )}
      </div>
    ),
  };
});

  const handleOpenStory = (index: number) => {
    setSelectedStoryIndex(index);
    setIsStoryModalOpen(true);
  };

  const fetchPosts = async () => {
    try {
      const [postsData, sharedPostsData] = await Promise.all([
        postsAPI.getAllPosts(),
        shareAPI.getAllSharedPosts()
      ]);
      setPosts(postsData);
      setSharedPosts(sharedPostsData);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = (newPost: any) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleLike = async (postId: number) => {
    try {
      await likesAPI.toggleLike({ postId });
      await fetchPosts(); // Refresh posts to update like counts
    } catch {
    }
  };

  const toggleComments = async (postId: number) => {
    const isShowing = showComments[postId];
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));

    if (!isShowing && !comments[postId]) {
      try {
        const data = await commentsAPI.getCommentsByPostId(postId);
        setComments(prev => ({ ...prev, [postId]: data }));
      } catch {
      }
    }
  };

  const handleCommentChange = (postId: number, value: string) => {
    setCommentText(prev => ({ ...prev, [postId]: value }));
  };

  const handleComment = async (postId: number) => {
    const content = commentText[postId]?.trim();
    if (!content) {
      alert('Vui lòng nhập bình luận');
      return;
    }

    try {
      await commentsAPI.createComment({ postId, content });
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      // Refresh comments
      const data = await commentsAPI.getCommentsByPostId(postId);
      setComments(prev => ({ ...prev, [postId]: data }));
    } catch {
    }
  };

  const handleEditPost = (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setEditingPost(post);
      setIsEditModalOpen(true);
      setVisiblePostMenu(null);
    }
  };

  const handleUpdatePost = async (updatedContent: string, image?: File | null) => {
    if (!editingPost) return;

    try {
      await postsAPI.updatePost(editingPost.id, {
        content: updatedContent,
        image: image || undefined
      });
      await fetchPosts();
      setIsEditModalOpen(false);
      setEditingPost(null);
      alert('Bài viết đã được cập nhật');
    } catch {
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await postsAPI.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      alert('Bài viết đã được xóa');
    } catch {
    }
  };

  const handleOpenShareModal = (post: Post) => {
    setPostToShare(post);
    setIsShareModalOpen(true);
  };

  const handleShareSubmit = async (content: string) => {
    if (!postToShare) return;
    try {
      await shareAPI.sharePost({ postId: postToShare.id, content });
      await fetchPosts();
      alert('Chia sẻ thành công!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi chia sẻ');
    }
  };

  const handleDeleteSharedPost = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài chia sẻ này?')) return;
    try {
      await shareAPI.deleteSharedPost(id);
      setSharedPosts(prev => prev.filter(sp => sp.id !== id));
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không thể xóa bài chia sẻ');
    }
  };

  const handleEditSharedPost = (sharedPostId: number) => {
    const sp = sharedPosts.find(s => s.id === sharedPostId);
    if (sp) {
      setEditingSharedPost(sp);
      setIsEditSharedModalOpen(true);
      setVisibleSharedPostMenu(null);
    }
  };

  const handleUpdateSharedPost = async (id: number, content: string) => {
    try {
      await shareAPI.updateSharedPost(id, content);
      await fetchPosts();
      setIsEditSharedModalOpen(false);
      setEditingSharedPost(null);
    } catch {
      alert('Không thể cập nhật bài chia sẻ');
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center py-10">Đang tải bài viết...</div>;
  }

  const displayName = userData?.fullName || userData?.name || 'Bạn';

  const allFeedItems = [
    ...posts.map(p => ({ type: 'post', data: p, date: new Date(p.createdAt).getTime() })),
    ...sharedPosts.map(sp => ({ type: 'shared', data: sp, date: new Date(sp.createdAt).getTime() }))
  ].sort((a, b) => b.date - a.date);

  return (
    <main className="flex-1 flex flex-col gap-5 max-w-[600px] mx-auto py-4 px-2">
      {/* --- PHẦN STORY BAR --- */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
        <Link to="/create-story" className="flex-shrink-0 no-underline">
          <div className="relative w-28 h-48 rounded-xl overflow-hidden cursor-pointer group bg-white border border-gray-200 shadow-sm transition-all hover:bg-gray-50">
            <div className="h-[70%] overflow-hidden bg-gray-100">
              <img
                src={getAvatarUrl(userData?.avatarUrl, userData?.userName || 'User')}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                alt="Tạo tin"
              />
            </div>
            <div className="absolute bottom-0 w-full h-[30%] bg-white flex flex-col items-center justify-center">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#0866FF] rounded-full border-4 border-white flex items-center justify-center text-white shadow-md">
                <Plus size={16} />
              </div>
              <span className="text-[12px] font-bold text-gray-900 mt-2">Tạo tin</span>
            </div>
          </div>
        </Link>

        {uniqueStories.map((story: any, index: number) => (
          <div 
            // SỬA KEY Ở ĐÂY: Kết hợp ID và Index để đảm bảo duy nhất tuyệt đối
            key={`story-${story.id}-${index}`} 
            onClick={() => handleOpenStory(index)} 
            className="relative w-28 h-48 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer group shadow-sm border border-gray-200"
          >
            <img 
              src={story.thumb || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200'} 
              className="w-full h-full object-cover transition-transform group-hover:scale-110" 
              alt="story" 
            />
            
            {/* Hiển thị nội dung chữ trên Thumbnail story */}
            {story.content && (
              <div className="absolute inset-0 flex items-center justify-center p-2 bg-black/10">
                <p className="text-white text-[10px] font-bold text-center line-clamp-4 drop-shadow-md">
                  {story.content}
                </p>
              </div>
            )}

            <div className="absolute top-2 left-2 p-0.5 bg-[#0866FF] rounded-full border-2 border-white z-10">
              <img 
                src={getAvatarUrl(story.avatar, story.name)} 
                className="w-7 h-7 rounded-full object-cover" 
                alt="avatar" 
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
            <span className="absolute bottom-2 left-2 right-2 text-[11px] font-bold text-white truncate">
              {story.name || 'Người dùng'}
            </span>
          </div>
        ))}
      </div>

      {/* --- MODAL XEM STORY CHI TIẾT --- */}
      {isStoryModalOpen && formattedStories.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center">
          <button 
            onClick={() => setIsStoryModalOpen(false)}
            className="absolute top-6 right-6 text-white p-2 z-[1000]"
          >
            <X size={32} />
          </button>
          
          <div className="relative shadow-2xl rounded-xl overflow-hidden">
            {typeof Stories === 'function' || typeof Stories === 'object' ? (
              <Stories
                stories={formattedStories}
                defaultInterval={5000}
                width={380}
                height={675}
                currentIndex={selectedStoryIndex}
                onAllStoriesEnd={() => setIsStoryModalOpen(false)}
              />
            ) : (
              <div className="text-white p-4">Lỗi nạp thư viện</div>
            )}
          </div>
        </div>
      )}

      {/* --- CÁC PHẦN DƯỚI ĐÂY GIỮ NGUYÊN 100% --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mt-2">
        <div className="flex gap-3 mb-4">
          <img src={getAvatarUrl(userData?.avatarUrl, userData?.userName || 'User')} className="w-10 h-10 rounded-full object-cover" alt="" />
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-[#F0F2F5] hover:bg-gray-200 text-gray-500 text-left px-4 py-2.5 rounded-full text-[15px] transition-colors"
          >
            {displayName} ơi, bạn đang nghĩ gì thế?
          </button>
        </div>
      </div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userData={userData}
        onPostSuccess={handleNewPost}
      />

      <div className="flex flex-col gap-4">
        {allFeedItems.map((item: any) => {
          const isShared = item.type === 'shared';
          const post = isShared ? item.data.post : item.data;
          if (!post) return null; // Safe check
          
          const sharedPost = isShared ? item.data : null;
          const displayId = isShared ? `shared-${sharedPost.id}` : `post-${post.id}`;
          const hasLiked = post.likes?.some((l: any) => l.userId === userData?.id);

          return (
          <div key={displayId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header của Share (nếu là bài share) */}
            {isShared && (
              <div className="p-3 pb-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Share2 size={14} />
                    <span className="font-semibold cursor-pointer hover:underline text-gray-800" onClick={() => navigate(`/profile/${sharedPost.userId}`)}>
                      {sharedPost.user?.fullName || sharedPost.user?.userName}
                    </span>
                    <span>đã chia sẻ một bài viết</span>
                  </div>
                  {sharedPost.userId === userData?.id && (
                    <div className="relative">
                      <button 
                        ref={(el) => { if (el) sharedMenuButtonRefs.current[sharedPost.id] = el; }}
                        onClick={() => setVisibleSharedPostMenu(visibleSharedPostMenu === sharedPost.id ? null : sharedPost.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      <PostMenu
                        postId={sharedPost.id}
                        isVisible={visibleSharedPostMenu === sharedPost.id}
                        onClose={() => setVisibleSharedPostMenu(null)}
                        onEdit={handleEditSharedPost}
                        onDelete={handleDeleteSharedPost}
                        canEdit={true}
                        buttonRef={{ current: sharedMenuButtonRefs.current[sharedPost.id] || null }}
                      />
                    </div>
                  )}
                </div>
                {sharedPost.content && (
                  <p className="text-[15px] mb-2 px-1">{sharedPost.content}</p>
                )}
              </div>
            )}

            {/* Bọc bài viết gốc nếu là Share */}
            <div className={isShared ? "mx-3 mb-3 border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50" : ""}>
              <div className="p-4 flex justify-between items-start">
                <div className="flex gap-3">
                  <img
                    src={getAvatarUrl(post.user?.avatarUrl, post.user?.userName || 'User')}
                    className="w-10 h-10 rounded-full border border-gray-100 object-cover cursor-pointer"
                    alt=""
                    onClick={() => navigate(`/profile/${post.userId}`)}
                  />
                  <div>
                    <h4 className="font-bold text-sm hover:underline cursor-pointer" onClick={() => navigate(`/profile/${post.userId}`)}>
                      {post.user?.fullName || post.user?.userName || 'Người dùng'}
                    </h4>
                    <span className="text-[11px] text-gray-500 font-medium">{new Date(post.createdAt).toLocaleString('vi-VN')} • 🌏</span>
                  </div>
                </div>
                {!isShared && post.userId === userData?.id && (
                  <div className="relative">
                    <button
                      ref={(el) => {
                        if (el) menuButtonRefs.current[post.id] = el;
                      }}
                      onClick={() => setVisiblePostMenu(visiblePostMenu === post.id ? null : post.id)}
                      className="text-gray-400 cursor-pointer hover:bg-gray-100 rounded-full p-2 transition-colors"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    <PostMenu
                      postId={post.id}
                      isVisible={visiblePostMenu === post.id}
                      onClose={() => setVisiblePostMenu(null)}
                      onEdit={handleEditPost}
                      onDelete={handleDeletePost}
                      canEdit={true}
                      buttonRef={{ current: menuButtonRefs.current[post.id] || null }}
                    />
                  </div>
                )}
              </div>

              <div className="px-4 pb-3 text-[15px] leading-relaxed text-gray-800">{post.content}</div>
              {/* Hashtag badges */}
              {post.postHashtags && post.postHashtags.length > 0 && (
                <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                  {post.postHashtags.map((ph: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => navigate(`/hashtags?tag=${encodeURIComponent(ph.hashtag?.name || '')}`)}
                      className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      {ph.hashtag?.name}
                    </button>
                  ))}
                </div>
              )}
              {post.imageUrl && (
                <img
                  src={`${API_BASE_URL}${post.imageUrl}`}
                  className="w-full max-h-[450px] object-cover border-y border-gray-50"
                  alt="post"
                />
              )}
            </div>

            <div className="px-4 py-2 flex items-center justify-between border-t border-gray-50 mx-2">
              <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                <div className="bg-blue-500 p-1 rounded-full"><ThumbsUp size={10} className="text-white fill-current" /></div>
                <span className="font-medium">{post.likes?.length || 0}</span>
              </div>
              <span className="text-gray-500 text-xs font-medium">{post.comments?.length || 0} bình luận</span>
            </div>

            <div className="px-2 pb-1 flex border-t border-gray-100 mx-2 mb-1">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 font-bold text-[13px] hover:bg-gray-100 rounded-lg transition-colors ${
                  hasLiked ? 'text-[#0866FF]' : 'text-gray-600'
                }`}
              >
                <ThumbsUp size={18} /> Thích
              </button>
              <button
                onClick={() => toggleComments(post.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 font-bold text-[13px] hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MessageSquare size={18} /> Bình luận
              </button>
              <button
                onClick={() => handleOpenShareModal(post)}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 font-bold text-[13px] hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Share2 size={18} /> Chia sẻ
              </button>
            </div>

            {showComments[post.id] && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="flex gap-2 mt-3">
                  <img src={getAvatarUrl(userData?.avatarUrl, userData?.userName || 'User')} className="w-8 h-8 rounded-full object-cover" alt="" />
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={commentText[post.id] ?? ''}
                      onChange={(e) => handleCommentChange(post.id, e.target.value)}
                      placeholder="Viết bình luận..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleComment(post.id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleComment(post.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700"
                    >
                      Đăng
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-3">
                  {(comments[post.id] || []).map((comment: Comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <img
                        src={getAvatarUrl(comment.user?.avatarUrl, comment.user?.userName || 'User')}
                        className="w-8 h-8 rounded-full object-cover cursor-pointer"
                        alt=""
                        onClick={() => navigate(`/profile/${comment.userId}`)}
                      />
                      <div className="flex-1">
                        <div className="bg-gray-100 px-3 py-2 rounded-2xl">
                          <p className="font-medium text-sm hover:underline cursor-pointer" onClick={() => navigate(`/profile/${comment.userId}`)}>{comment.user?.fullName || comment.user?.userName || 'Người dùng'}</p>
                          <p className="text-sm text-gray-800">{comment.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 ml-3">{new Date(comment.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          );
        })}
      </div>

      <EditPostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdatePost}
        initialContent={editingPost?.content || ''}
        initialImage={editingPost?.imageUrl ? `${API_BASE_URL}${editingPost.imageUrl}` : undefined}
      />

      <SharePostModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        postToShare={postToShare}
        onShare={handleShareSubmit}
      />

      <EditSharedPostModal
        isOpen={isEditSharedModalOpen}
        onClose={() => setIsEditSharedModalOpen(false)}
        sharedPost={editingSharedPost}
        onSave={handleUpdateSharedPost}
      />
    </main>
  );
};

export default Feed;