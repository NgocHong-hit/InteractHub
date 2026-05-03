import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import CreatePostModal from './CreatePostModal';
import PostMenu from './PostMenu';
import EditPostModal from './EditPostModal';
import { 
  Users, 
  Plus, 
  MoreHorizontal, 
  ThumbsUp, 
  MessageSquare, 
  Image as ImageIcon, 
  Smile,
  MapPin,
  Calendar,
  Camera,
  Flag,
  Mail,
  Phone,
  Edit2,
  Share2,
  X
} from 'lucide-react';
import profileAPI from '../api/profileAPI';
import postsAPI from '../api/postsAPI';
import likesAPI from '../api/likesAPI';
import commentsAPI from '../api/commentsAPI';
import friendAPI from '../api/friendAPI';
import shareAPI from '../api/shareAPI';
import type { UserProfile } from '../api/profileAPI';
import type { Post, Comment, SharedPost } from '../types';
import SharePostModal from './SharePostModal';
import EditSharedPostModal from './EditSharedPostModal';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5012';

const Profile: React.FC = () => {
  const { userId: paramUserId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { user: authUser, updateUser } = useAuth();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [visiblePostMenu, setVisiblePostMenu] = useState<number | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showComments, setShowComments] = useState<Record<number, boolean>>({});
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const menuButtonRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [friendStatus, setFriendStatus] = useState<'none' | 'sent' | 'received' | 'friends'>('none');
  const [friendActionLoading, setFriendActionLoading] = useState(false);

  // --- States cho Shared Posts ---
  const [sharedPosts, setSharedPosts] = useState<SharedPost[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [postToShare, setPostToShare] = useState<Post | null>(null);

  const [editingSharedPost, setEditingSharedPost] = useState<SharedPost | null>(null);
  const [isEditSharedModalOpen, setIsEditSharedModalOpen] = useState(false);
  const [visibleSharedPostMenu, setVisibleSharedPostMenu] = useState<number | null>(null);
  const sharedMenuButtonRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  // Xác định có phải profile của mình không
  const isOwnProfile = !paramUserId || (currentUser && Number(paramUserId) === currentUser.id);

  // Fetch dữ liệu
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Luôn fetch current user để so sánh
        const me = await profileAPI.getMe();
        setCurrentUser(me);

        if (paramUserId && Number(paramUserId) !== me.id) {
          // Xem profile người khác
          const otherUser = await profileAPI.getUserById(Number(paramUserId));
          setUserProfile(otherUser);
          await fetchPosts(otherUser.id);
          // Check friend status
          try {
            const statusRes = await friendAPI.checkStatus(Number(paramUserId));
            setFriendStatus(statusRes.data?.status || 'none');
          } catch { setFriendStatus('none'); }
        } else {
          // Xem profile của mình
          setUserProfile(me);
          await fetchPosts(me.id);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [paramUserId]);

  const fetchPosts = async (uid: number) => {
    try {
      const [userPosts, userSharedPosts] = await Promise.all([
        postsAPI.getPostsByUserId(uid),
        shareAPI.getSharedPostsByUserId(uid)
      ]);
      setPosts(userPosts);
      setSharedPosts(userSharedPosts);
    } catch {
    }
  };

  // Avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const result = await profileAPI.uploadAvatar(file);
      setUserProfile(prev => prev ? { ...prev, avatarUrl: result.avatarUrl } : prev);
      
      // Đồng bộ ảnh mới vào AuthContext (để Navbar và mọi nơi khác tự update)
      if (authUser) {
        updateUser({ ...authUser, avatarUrl: result.avatarUrl });
      }
    } catch {
      alert('Không thể cập nhật ảnh đại diện');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Post actions
  const handleNewPost = (data: Post) => {
    setPosts(prev => [data, ...prev]);
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
    if (!editingPost || !userProfile) return;
    try {
      await postsAPI.updatePost(editingPost.id, {
        content: updatedContent,
        image: image || undefined
      });
      await fetchPosts(userProfile.id);
      setIsEditModalOpen(false);
      setEditingPost(null);
    } catch {
      alert('Không thể cập nhật bài viết');
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await postsAPI.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      setVisiblePostMenu(null);
    } catch {
      alert('Không thể xóa bài viết');
    }
  };

  const handleOpenShareModal = (post: Post) => {
    setPostToShare(post);
    setIsShareModalOpen(true);
  };

  const handleShareSubmit = async (content: string) => {
    if (!postToShare || !userProfile) return;
    try {
      await shareAPI.sharePost({ postId: postToShare.id, content });
      await fetchPosts(userProfile.id);
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
    if (!userProfile) return;
    try {
      await shareAPI.updateSharedPost(id, content);
      await fetchPosts(userProfile.id);
      setIsEditSharedModalOpen(false);
      setEditingSharedPost(null);
    } catch {
      alert('Không thể cập nhật bài chia sẻ');
    }
  };

  // Like
  const handleLike = async (postId: number) => {
    if (!userProfile) return;
    try {
      await likesAPI.toggleLike({ postId });
      await fetchPosts(userProfile.id);
    } catch {
    }
  };

  // Comments
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

  const handleComment = async (postId: number) => {
    const content = commentText[postId]?.trim();
    if (!content) return;
    try {
      await commentsAPI.createComment({ postId, content });
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      const data = await commentsAPI.getCommentsByPostId(postId);
      setComments(prev => ({ ...prev, [postId]: data }));
      if (userProfile) await fetchPosts(userProfile.id);
    } catch {
    }
  };

  // Format helpers
  const formatBirthday = (dateString?: string) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Chưa cập nhật";
    return `${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
  };

  const getAvatarUrl = (url?: string, seed?: string) => {
    if (url) return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || 'user'}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F0F2F5]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#0866FF] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-gray-500">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  const displayName = userProfile?.fullName || userProfile?.userName || "bạn";
  const firstName = displayName.split(' ').pop();
  const avatarSrc = getAvatarUrl(userProfile?.avatarUrl, userProfile?.userName);

  const allFeedItems = [
    ...posts.map(p => ({ type: 'post', data: p, date: new Date(p.createdAt).getTime() })),
    ...sharedPosts.map(sp => ({ type: 'shared', data: sp, date: new Date(sp.createdAt).getTime() }))
  ].sort((a, b) => b.date - a.date);

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-[#1C1E21]">
      <Navbar />

      <div className="pt-14 pb-10">
        {/* --- PROFILE HEADER --- */}
        <div className="bg-white shadow-sm pt-8">
          <div className="max-w-[1095px] mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center md:items-end pb-6 gap-4 px-4 md:px-8">
              {/* Avatar */}
              <div className="relative group/avatar">
                <div className="w-40 h-40 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg relative z-10">
                  {uploadingAvatar ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <img 
                      src={avatarSrc} 
                      className="w-full h-full object-cover" 
                      alt="avatar" 
                    />
                  )}
                </div>
                {isOwnProfile && (
                  <>
                    <button 
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute bottom-2 right-2 p-2 bg-gray-200 hover:bg-gray-300 rounded-full border-2 border-white shadow-sm z-20 transition-all"
                      title="Thay đổi ảnh đại diện"
                    >
                      <Camera size={20} />
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {userProfile?.fullName || userProfile?.userName}
                </h1>
                <p className="text-gray-500 font-semibold">{userProfile?.email || 'Chưa cập nhật email'}</p>
                {userProfile?.bio && (
                  <p className="text-gray-600 mt-2 leading-relaxed">{userProfile.bio}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mb-4">
                {isOwnProfile ? (
                  <button 
                    onClick={() => navigate('/settings')}
                    className="bg-[#E4E6EB] text-gray-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all hover:bg-[#D8DADF] active:scale-95"
                  >
                    <Edit2 size={18}/> Chỉnh sửa trang cá nhân
                  </button>
                ) : (
                  <>
                    {friendStatus === 'none' && (
                      <button
                        disabled={friendActionLoading}
                        onClick={async () => {
                          setFriendActionLoading(true);
                          try {
                            const res = await friendAPI.sendRequest(Number(paramUserId));
                            if (res.success) { setFriendStatus('sent'); toast.success('Đã gửi lời mời kết bạn!'); }
                            else toast.error(res.message || 'Thao tác thất bại');
                          } catch { toast.error('Lỗi kết nối Server'); }
                          finally { setFriendActionLoading(false); }
                        }}
                        className="bg-[#0866FF] hover:bg-[#0759E0] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md disabled:opacity-60"
                      >
                        <Plus size={18} /> Thêm bạn bè
                      </button>
                    )}
                    {friendStatus === 'sent' && (
                      <button
                        disabled={friendActionLoading}
                        onClick={async () => {
                          setFriendActionLoading(true);
                          try {
                            const res = await friendAPI.removeFriend(Number(paramUserId));
                            if (res.success) { setFriendStatus('none'); toast.success('Đã hủy lời mời'); }
                          } catch { toast.error('Lỗi kết nối Server'); }
                          finally { setFriendActionLoading(false); }
                        }}
                        className="bg-[#E4E6EB] text-gray-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all hover:bg-[#D8DADF] active:scale-95"
                      >
                        Đã gửi lời mời
                      </button>
                    )}
                    {friendStatus === 'received' && (
                      <button
                        disabled={friendActionLoading}
                        onClick={async () => {
                          setFriendActionLoading(true);
                          try {
                            const statusRes = await friendAPI.checkStatus(Number(paramUserId));
                            const fId = statusRes.data?.friendshipId;
                            if (fId) {
                              const res = await friendAPI.acceptRequest(fId);
                              if (res.success) { setFriendStatus('friends'); toast.success('Đã chấp nhận lời mời!'); }
                            }
                          } catch { toast.error('Lỗi kết nối Server'); }
                          finally { setFriendActionLoading(false); }
                        }}
                        className="bg-[#0866FF] hover:bg-[#0759E0] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md disabled:opacity-60"
                      >
                        Chấp nhận lời mời
                      </button>
                    )}
                    {friendStatus === 'friends' && (
                      <button
                        disabled={friendActionLoading}
                        onClick={async () => {
                          if (!confirm('Bạn có chắc muốn hủy kết bạn?')) return;
                          setFriendActionLoading(true);
                          try {
                            const res = await friendAPI.removeFriend(Number(paramUserId));
                            if (res.success) { setFriendStatus('none'); toast.success('Đã hủy kết bạn'); }
                          } catch { toast.error('Lỗi kết nối Server'); }
                          finally { setFriendActionLoading(false); }
                        }}
                        className="bg-green-50 text-green-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all hover:bg-green-100 active:scale-95 border border-green-200"
                      >
                        <Users size={18} /> Bạn bè
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- PROFILE CONTENT BODY --- */}
        <div className="max-w-[1095px] mx-auto px-4 mt-4 grid grid-cols-1 lg:grid-cols-5 gap-4">
          
          {/* CỘT TRÁI - GIỚI THIỆU */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-20">
              <h3 className="text-xl font-bold mb-4">Giới thiệu</h3>
              <div className="space-y-4">
                <DetailRow 
                    icon={<Mail size={20} className="text-gray-500" />} 
                    text={`Email: ${userProfile?.email || "Chưa cập nhật"}`} 
                />
                <DetailRow 
                    icon={<Phone size={20} className="text-gray-500" />} 
                    text={`SĐT: ${userProfile?.phoneNumber || "Chưa cập nhật"}`} 
                />
                <DetailRow 
                    icon={<MapPin size={20} className="text-gray-500" />} 
                    text="Sống tại " 
                    bold={userProfile?.address || "Chưa cập nhật"} 
                />
                <DetailRow 
                    icon={<Calendar size={20} className="text-gray-500" />} 
                    text={`Sinh ngày ${formatBirthday(userProfile?.dateOfBirth)}`} 
                />
                <DetailRow 
                    icon={<Users size={20} className="text-gray-500" />} 
                    text={`Giới tính: ${userProfile?.gender || "Chưa xác định"}`} 
                />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI - DÒNG THỜI GIAN */}
          <div className="lg:col-span-3 space-y-4">
            {/* Thanh tạo bài viết (chỉ hiện ở profile mình) */}
            {isOwnProfile && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex gap-3 mb-4">
                  <img 
                    src={avatarSrc} 
                    className="w-10 h-10 rounded-full object-cover" 
                    alt="avatar" 
                  />
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#65676B] text-left px-4 py-2.5 rounded-full text-[17px] transition-colors"
                  >
                      {firstName} ơi, bạn đang nghĩ gì thế?
                  </button>
                </div>
                <div className="flex border-t border-gray-100 pt-2 gap-1">
                  <PostTypeBtn icon={<ImageIcon className="text-[#45BD62]" size={20}/>} label="Ảnh/video" />
                  <PostTypeBtn icon={<Flag className="text-[#05A5F2]" size={20}/>} label="Cột mốc" />
                  <PostTypeBtn icon={<Smile className="text-[#EAB308]" size={20}/>} label="Cảm xúc" />
                </div>
              </div>
            )}

            <CreatePostModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              userData={userProfile}
              onPostSuccess={(data: any) => {
                handleNewPost(data);
                setIsModalOpen(false);
              }}
            />

            {/* Danh sách bài viết */}
            {allFeedItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
                <p className="text-gray-400 font-medium">Chưa có bài viết nào</p>
              </div>
            ) : (
              allFeedItems.map((item: any) => {
                const isShared = item.type === 'shared';
                const post = isShared ? item.data.post : item.data;
                if (!post) return null; // Safe check
                
                const sharedPost = isShared ? item.data : null;
                const displayId = isShared ? `shared-${sharedPost.id}` : `post-${post.id}`;
                const hasLiked = post.likes?.some((l: any) => l.userId === currentUser?.id);

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
                        {sharedPost.userId === currentUser?.id && (
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

                  <div className={isShared ? "mx-3 mb-3 border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50" : ""}>
                    <div className="p-4 flex justify-between items-start">
                      <div className="flex gap-3">
                        <img 
                          src={getAvatarUrl(post.user?.avatarUrl, post.user?.userName)} 
                          className="w-10 h-10 rounded-full object-cover cursor-pointer" 
                          alt="author" 
                          onClick={() => navigate(`/profile/${post.userId}`)}
                        />
                        <div>
                          <h4 
                            className="font-bold text-[15px] hover:underline cursor-pointer"
                            onClick={() => navigate(`/profile/${post.userId}`)}
                          >
                            {post.user?.fullName || post.user?.userName}
                          </h4>
                          <p className="text-[13px] text-gray-500">{new Date(post.createdAt).toLocaleString('vi-VN')} • 🌏</p>
                        </div>
                      </div>
                      {isOwnProfile && !isShared && (
                        <div className="relative">
                          <button 
                            ref={el => { if (el) menuButtonRefs.current[post.id] = el; }}
                            onClick={() => setVisiblePostMenu(visiblePostMenu === post.id ? null : post.id)}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                          >
                            <MoreHorizontal size={20}/>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="px-4 pb-3 text-[15px] leading-relaxed text-gray-900">
                      {post.content}
                    </div>

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
                      <img src={`${API_BASE_URL}${post.imageUrl}`} alt="Post image" className="w-full max-h-[450px] object-cover border-y border-gray-50" />
                    )}
                  </div>

                  <div className="px-4 py-2.5 flex justify-between items-center text-sm text-[#65676B] border-t border-gray-50">
                    <div className="flex items-center gap-1.5 cursor-pointer">
                      <div className="flex -space-x-1">
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white ring-2 ring-white">
                          <ThumbsUp size={10} className="fill-current"/>
                        </div>
                      </div>
                      <span className="hover:underline font-medium">{post.likes?.length || 0}</span>
                    </div>
                    <div className="font-medium hover:underline cursor-pointer" onClick={() => toggleComments(post.id)}>
                      {post.comments?.length || 0} bình luận
                    </div>
                  </div>

                  <div className="mx-4 mb-2 p-1 flex gap-1 border-t border-gray-100">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg font-bold text-[15px] hover:bg-gray-100 transition-colors ${
                        hasLiked ? 'text-[#0866FF]' : 'text-[#65676B]'
                      }`}
                    >
                      <ThumbsUp size={20} /> Thích
                    </button>
                    <button 
                      onClick={() => toggleComments(post.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg font-bold text-[15px] hover:bg-gray-100 transition-colors text-[#65676B]"
                    >
                      <MessageSquare size={20} /> Bình luận
                    </button>
                    <button 
                      onClick={() => handleOpenShareModal(post)}
                      className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg font-bold text-[15px] hover:bg-gray-100 transition-colors text-[#65676B]"
                    >
                      <Share2 size={20} /> Chia sẻ
                    </button>
                  </div>

                  {/* Comments section */}
                  {showComments[post.id] && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="flex gap-2 mt-3">
                        <img 
                          src={getAvatarUrl(currentUser?.avatarUrl, currentUser?.userName)} 
                          className="w-8 h-8 rounded-full object-cover" 
                          alt="" 
                        />
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={commentText[post.id] ?? ''}
                            onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
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
                              src={getAvatarUrl(comment.user?.avatarUrl, comment.user?.userName)}
                              className="w-8 h-8 rounded-full object-cover cursor-pointer"
                              alt=""
                              onClick={() => navigate(`/profile/${comment.userId}`)}
                            />
                            <div className="flex-1">
                              <div className="bg-gray-100 px-3 py-2 rounded-2xl">
                                <p 
                                  className="font-medium text-sm hover:underline cursor-pointer"
                                  onClick={() => navigate(`/profile/${comment.userId}`)}
                                >
                                  {comment.user?.userName || 'Người dùng'}
                                </p>
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
              })
            )}
          </div>
        </div>
      </div>

      {isOwnProfile && (
        <>
          <PostMenu
            postId={visiblePostMenu || 0}
            isVisible={visiblePostMenu !== null}
            buttonRef={{ current: visiblePostMenu ? menuButtonRefs.current[visiblePostMenu] : null }}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
            onClose={() => setVisiblePostMenu(null)}
            canEdit={true}
          />

          <EditPostModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleUpdatePost}
            initialContent={editingPost?.content || ''}
            initialImage={editingPost?.imageUrl ? `${API_BASE_URL}${editingPost.imageUrl}` : undefined}
          />
        </>
      )}
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
    </div>
  );
};

// --- CÁC THÀNH PHẦN GIAO DIỆN PHỤ ---

const DetailRow: React.FC<{ icon: React.ReactNode; text: string; bold?: string }> = ({ icon, text, bold }) => (
  <div className="flex items-center gap-3 text-[15px] text-gray-700">
    <div className="flex-shrink-0">{icon}</div>
    <p>{text}{bold && <span className="font-bold">{bold}</span>}</p>
  </div>
);

const PostTypeBtn: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg transition-colors font-semibold text-[#65676B] text-[15px]">
    {icon} {label}
  </button>
);

export default Profile;