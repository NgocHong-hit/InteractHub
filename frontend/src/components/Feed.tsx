import { useEffect, useState } from 'react';
import { MoreHorizontal, ThumbsUp, MessageSquare, Plus, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import CreatePostModal from './CreatePostModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5012';

const Feed = ({ stories = [], userData }: any) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState<Record<number, boolean>>({});
  const [commentText, setCommentText] = useState<Record<number, string>>({});

  const parseResponseData = async (response: Response) => {
    const responseText = await response.text();
    try {
      return responseText ? JSON.parse(responseText) : null;
    } catch {
      return { message: responseText || response.statusText };
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        console.error('Failed to fetch posts', await response.text());
        return;
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = (newPost: any) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleLike = async (postId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Bạn chưa đăng nhập');
        return;
      }

      console.log('Toggling like for post:', postId);
      const response = await fetch(`${API_BASE_URL}/api/likes/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ postId })
      });

      const responseData = await parseResponseData(response);
      console.log('Like response:', responseData);

      if (response.ok) {
        await fetchPosts();
      } else {
        console.error('Failed to toggle like', responseData?.message);
        alert(`Lỗi: ${responseData?.message || 'Không thể yêu thích bài viết'}`);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert(`Lỗi: ${error instanceof Error ? error.message : 'Không thể yêu thích bài viết'}`);
    }
  };

  const toggleComments = (postId: number) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
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
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Bạn chưa đăng nhập');
        return;
      }

      console.log('Posting comment:', { postId, content });
      const response = await fetch(`${API_BASE_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ postId, content })
      });

      const responseData = await parseResponseData(response);
      console.log('Comment response:', responseData);

      if (response.ok) {
        setCommentText(prev => ({ ...prev, [postId]: '' }));
        await fetchPosts();
      } else {
        console.error('Failed to post comment', responseData?.message);
        alert(`Lỗi: ${responseData?.message || 'Không thể bình luận'}`);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert(`Lỗi: ${error instanceof Error ? error.message : 'Không thể bình luận'}`);
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center py-10">Đang tải bài viết...</div>;
  }

  const displayName = userData?.fullName || userData?.name || 'Bạn';

  return (
    <main className="flex-1 flex flex-col gap-5 max-w-[600px] mx-auto py-4 px-2">
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
        <Link to="/create-story" className="flex-shrink-0 no-underline">
          <div className="relative w-28 h-48 rounded-xl overflow-hidden cursor-pointer group bg-white border border-gray-200 shadow-sm transition-all hover:bg-gray-50">
            <div className="h-[70%] overflow-hidden bg-gray-100">
              <img
                src={userData?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
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

        {stories.map((story: any) => (
          <div key={story.id} className="relative w-28 h-48 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer group shadow-sm border border-gray-200">
            <img src={story.thumb} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
            <div className="absolute top-2 left-2 p-0.5 bg-[#0866FF] rounded-full border-2 border-white z-10">
              <img src={story.avatar} className="w-7 h-7 rounded-full" alt="" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
            <span className="absolute bottom-2 left-2 right-2 text-[11px] font-bold text-white truncate">{story.name}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mt-2">
        <div className="flex gap-3 mb-4">
          <img src={userData?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'} className="w-10 h-10 rounded-full object-cover" alt="" />
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
        {posts.map((post: any) => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 flex justify-between items-start">
              <div className="flex gap-3">
                <img
                  src={post.user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                  className="w-10 h-10 rounded-full border border-gray-100 object-cover"
                  alt=""
                />
                <div>
                  <h4 className="font-bold text-sm hover:underline cursor-pointer">{post.user?.fullName || post.user?.userName || displayName}</h4>
                  <span className="text-[11px] text-gray-500 font-medium">{new Date(post.createdAt).toLocaleString('vi-VN')} • 🌏</span>
                </div>
              </div>
              <MoreHorizontal className="text-gray-400 cursor-pointer hover:bg-gray-100 rounded-full" size={18} />
            </div>

            <div className="px-4 pb-3 text-[15px] leading-relaxed text-gray-800">{post.content}</div>
            {post.imageUrl && (
              <img
                src={`${API_BASE_URL}${post.imageUrl}`}
                className="w-full max-h-[450px] object-cover border-y border-gray-50"
                alt="post"
              />
            )}

            <div className="px-4 py-2 flex items-center justify-between border-t border-gray-50 mx-2">
              <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                <div className="bg-blue-500 p-1 rounded-full"><Heart size={10} className="text-white" /></div>
                <span className="font-medium">{post.likes?.length || 0}</span>
              </div>
              <span className="text-gray-500 text-xs font-medium">{post.comments?.length || 0} bình luận</span>
            </div>

            <div className="px-2 pb-1 flex border-t border-gray-100 mx-2 mb-1">
              <button
                onClick={() => handleLike(post.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 font-bold text-[13px] hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ThumbsUp size={18} /> Thích
              </button>
              <button
                onClick={() => toggleComments(post.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 font-bold text-[13px] hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MessageSquare size={18} /> Bình luận
              </button>
            </div>

            {showComments[post.id] && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="flex gap-2 mt-3">
                  <img src={userData?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'} className="w-8 h-8 rounded-full object-cover" alt="" />
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
                  {post.comments?.map((comment: any) => (
                    <div key={comment.id} className="flex gap-2">
                      <img
                        src={comment.user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                        className="w-8 h-8 rounded-full object-cover"
                        alt=""
                      />
                      <div className="flex-1">
                        <div className="bg-gray-100 px-3 py-2 rounded-2xl">
                          <p className="font-medium text-sm">{comment.user?.fullName || comment.user?.userName || 'Người dùng'}</p>
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
        ))}
      </div>
    </main>
  );
};

export default Feed;
