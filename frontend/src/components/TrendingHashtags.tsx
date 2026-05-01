import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { TrendingUp, ChevronRight, Flame, BarChart2, ArrowUpRight, Search, ArrowLeft, Heart, Loader2, Hash } from 'lucide-react';
import Navbar from './Navbar';
import { hashtagAPI } from '../api/hashtagAPI';
import type { Hashtag, HashtagPost } from '../api/hashtagAPI';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5012';

const TrendingHashtags = ({ userData }: any) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [trendingData, setTrendingData] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search / filter state
  const [selectedTag, setSelectedTag] = useState<string | null>(searchParams.get('tag'));
  const [tagPosts, setTagPosts] = useState<HashtagPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Fetch trending on mount
  useEffect(() => {
    fetchTrending();
  }, []);

  // When selectedTag changes, fetch posts
  useEffect(() => {
    if (selectedTag) {
      fetchPostsByTag(selectedTag);
    }
  }, [selectedTag]);

  // Sync URL query param
  useEffect(() => {
    const tagFromUrl = searchParams.get('tag');
    if (tagFromUrl && tagFromUrl !== selectedTag) {
      setSelectedTag(tagFromUrl);
    }
  }, [searchParams]);

  const fetchTrending = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hashtagAPI.getTrendingHashtags(10);
      setTrendingData(data);
    } catch {
      setError('Không thể tải hashtag xu hướng');
    } finally {
      setLoading(false);
    }
  };

  const fetchPostsByTag = async (tagName: string) => {
    try {
      setPostsLoading(true);
      const posts = await hashtagAPI.searchPostsByHashtag(tagName);
      setTagPosts(posts);
    } catch {
      setTagPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleTagClick = (tagName: string) => {
    // Remove leading # if present
    const cleanName = tagName.startsWith('#') ? tagName : `#${tagName}`;
    setSelectedTag(cleanName);
    navigate(`/hashtags?tag=${encodeURIComponent(cleanName)}`, { replace: true });
  };

  const handleBackToTrending = () => {
    setSelectedTag(null);
    setTagPosts([]);
    navigate('/hashtags', { replace: true });
  };

  const formatPostCount = (count: number): string => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-10">
      <Navbar userData={userData} />

      <div className="max-w-[1100px] mx-auto pt-20 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* HEADER BANNER */}
        <div className="bg-gradient-to-r from-[#0866FF] to-[#1877F2] rounded-[2rem] p-8 mb-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-md">
              <Flame size={16} className="text-orange-300 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest">Trending Now</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Khám phá Xu hướng</h1>
            <p className="text-blue-100 font-medium max-w-md">Cập nhật những gì thế giới đang thảo luận ngay lúc này trên nền tảng của chúng tôi.</p>
          </div>
          <TrendingUp size={180} className="absolute -right-10 -bottom-10 text-white/10 rotate-12" />
        </div>

        {/* MAIN CONTENT */}
        {selectedTag ? (
          /* ═══════ POST LIST VIEW (when a hashtag is selected) ═══════ */
          <div>
            <button
              onClick={handleBackToTrending}
              className="flex items-center gap-2 text-[#0866FF] font-bold text-sm mb-6 hover:underline cursor-pointer bg-transparent border-none"
            >
              <ArrowLeft size={18} /> Quay lại Xu hướng
            </button>

            <div className="bg-white rounded-[1.5rem] p-6 mb-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <Hash className="text-[#0866FF]" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{selectedTag}</h2>
                  <p className="text-sm text-gray-400 font-medium">{tagPosts.length} bài viết được tìm thấy</p>
                </div>
              </div>
            </div>

            {postsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#0866FF]" size={32} />
                <span className="ml-3 text-gray-500 font-medium">Đang tải bài viết...</span>
              </div>
            ) : tagPosts.length === 0 ? (
              <div className="text-center py-20">
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-400 font-bold text-lg">Chưa có bài viết nào cho hashtag này</p>
                <p className="text-gray-300 text-sm mt-1">Hãy là người đầu tiên đăng bài với {selectedTag}!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tagPosts.map((post) => (
                  <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 flex justify-between items-start">
                      <div className="flex gap-3">
                        <img
                          src={post.user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                          className="w-10 h-10 rounded-full border border-gray-100 object-cover"
                          alt=""
                        />
                        <div>
                          <h4 className="font-bold text-sm">{post.user?.fullName || post.user?.userName || 'Người dùng'}</h4>
                          <span className="text-[11px] text-gray-500 font-medium">
                            {new Date(post.createdAt).toLocaleString('vi-VN')} • 🌏
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 pb-3 text-[15px] leading-relaxed text-gray-800">{post.content}</div>

                    {/* Hashtag badges */}
                    {post.postHashtags && post.postHashtags.length > 0 && (
                      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                        {post.postHashtags.map((ph: any, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => handleTagClick(ph.hashtag?.name || '')}
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

                    <div className="px-4 py-2 flex items-center justify-between border-t border-gray-50 mx-2">
                      <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                        <div className="bg-blue-500 p-1 rounded-full"><Heart size={10} className="text-white" /></div>
                        <span className="font-medium">{post.likes?.length || 0}</span>
                      </div>
                      <span className="text-gray-500 text-xs font-medium">{post.comments?.length || 0} bình luận</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ═══════ TRENDING VIEW (default) ═══════ */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT COLUMN: HASHTAG LIST (2/3) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="font-bold text-gray-500 uppercase text-xs tracking-widest">Bảng xếp hạng chủ đề</h3>
                <button onClick={fetchTrending} className="text-[#0866FF] text-xs font-bold hover:underline cursor-pointer bg-transparent border-none">Làm mới</button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="animate-spin text-[#0866FF]" size={32} />
                  <span className="ml-3 text-gray-500 font-medium">Đang tải xu hướng...</span>
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <p className="text-red-500 font-bold">{error}</p>
                  <button onClick={fetchTrending} className="mt-4 px-6 py-2 bg-[#0866FF] text-white rounded-full text-sm font-bold hover:bg-blue-700 transition-colors">
                    Thử lại
                  </button>
                </div>
              ) : trendingData.length === 0 ? (
                <div className="text-center py-20">
                  <Hash size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-400 font-bold text-lg">Chưa có hashtag nào</p>
                  <p className="text-gray-300 text-sm mt-1">Hãy tạo bài viết với #hashtag để bắt đầu xu hướng!</p>
                </div>
              ) : (
                trendingData.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => handleTagClick(item.name)}
                    className="group bg-white p-5 rounded-[1.5rem] border border-transparent shadow-sm hover:shadow-xl hover:border-blue-100 transition-all flex items-center justify-between cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`text-3xl font-black italic ${index < 3 ? 'text-[#0866FF]' : 'text-gray-200'}`}>
                        {String(index + 1).padStart(2, '0')}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-extrabold text-gray-900 group-hover:text-[#0866FF] transition-colors">
                            {item.name.startsWith('#') ? item.name : `#${item.name}`}
                          </span>
                          {index < 3 && (
                            <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md animate-bounce">HOT</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-400 font-bold uppercase tracking-tight">
                          {formatPostCount(item.postCount)} bài viết tương tác
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="flex items-center gap-1 font-black text-green-500">
                          <ArrowUpRight size={16} />
                          {formatPostCount(item.postCount)}
                        </div>
                        <div className="text-[10px] text-gray-300 font-bold">BÀI VIẾT</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* RIGHT COLUMN: STATS WIDGET (1/3) */}
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                  <div className="p-3 bg-blue-50 w-fit rounded-2xl mb-4">
                    <BarChart2 className="text-[#0866FF]" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Số liệu hôm nay</h3>
                  <div className="space-y-4 mt-6">
                    <div className="flex justify-between items-end">
                      <span className="text-gray-400 text-sm font-bold uppercase">Tổng hashtag</span>
                      <span className="text-2xl font-black text-gray-900">{trendingData.length}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full shadow-inner transition-all duration-700"
                        style={{ width: `${Math.min(trendingData.length * 10, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-gray-400 text-sm font-bold uppercase">Tổng bài viết</span>
                      <span className="text-2xl font-black text-gray-900">
                        {trendingData.reduce((sum, h) => sum + (h.postCount || 0), 0)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 italic">Dữ liệu thời gian thực từ hệ thống.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingHashtags;