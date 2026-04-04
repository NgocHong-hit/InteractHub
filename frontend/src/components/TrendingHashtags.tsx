import React, { useState } from 'react';
import { TrendingUp, Hash, ChevronRight, Flame, BarChart2, Zap, ArrowUpRight } from 'lucide-react';
import Navbar from './Navbar'; // Import Navbar theo ý bạn

const TrendingHashtags = ({ userData }: any) => {
  // Mock dữ liệu Hashtag 
  const [trendingData] = useState([
    { id: 1, tag: 'InteractHub', posts: '15.4k', growth: '+25%', status: 'hot' },
    { id: 2, tag: 'ReactJS', posts: '8.2k', growth: '+12%', status: 'up' },
    { id: 3, tag: 'DesignSystem', posts: '6.7k', growth: '+18%', status: 'hot' },
    { id: 4, tag: 'LapTrinhVien', posts: '5.1k', growth: '+5%', status: 'up' },
    { id: 5, tag: 'CongNgheMoi', posts: '3.9k', growth: '-2%', status: 'down' },
    { id: 6, tag: 'GenZ_Connect', posts: '2.5k', growth: '+40%', status: 'hot' },
  ]);

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-10">
      {/* 1. HIỂN THỊ NAVBAR TRÊN CÙNG */}
      <Navbar userData={userData} />

      {/* 2. PHẦN NỘI DUNG CHÍNH (Cần pt-20 để không bị Navbar che mất) */}
      <div className="max-w-[1100px] mx-auto pt-20 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* TIÊU ĐỀ TRANG BIẾN TẤU HIỆN ĐẠI */}
        <div className="bg-gradient-to-r from-[#0866FF] to-[#1877F2] rounded-[2rem] p-8 mb-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-md">
              <Flame size={16} className="text-orange-300 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest">Trending Now</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Khám phá Xu hướng</h1>
            <p className="text-blue-100 font-medium max-w-md">Cập nhật những gì thế giới đang thảo luận ngay lúc này trên nền tảng của chúng tôi.</p>
          </div>
          {/* Decor icon mờ phía sau */}
          <TrendingUp size={180} className="absolute -right-10 -bottom-10 text-white/10 rotate-12" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: DANH SÁCH HASHTAG (2/3) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="font-bold text-gray-500 uppercase text-xs tracking-widest">Bảng xếp hạng chủ đề</h3>
              <button className="text-[#0866FF] text-xs font-bold hover:underline">Làm mới</button>
            </div>

            {trendingData.map((item, index) => (
              <div 
                key={item.id} 
                className="group bg-white p-5 rounded-[1.5rem] border border-transparent shadow-sm hover:shadow-xl hover:border-blue-100 transition-all flex items-center justify-between cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-6">
                  {/* Số thứ tự Style xịn */}
                  <div className={`text-3xl font-black italic ${index < 3 ? 'text-[#0866FF]' : 'text-gray-200'}`}>
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-extrabold text-gray-900 group-hover:text-[#0866FF] transition-colors">
                        #{item.tag}
                      </span>
                      {item.status === 'hot' && (
                        <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md animate-bounce">HOT</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-400 font-bold uppercase tracking-tight">{item.posts} bài viết tương tác</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className={`flex items-center gap-1 font-black ${item.status === 'down' ? 'text-red-500' : 'text-green-500'}`}>
                      {item.status !== 'down' ? <ArrowUpRight size={16}/> : null}
                      {item.growth}
                    </div>
                    <div className="text-[10px] text-gray-300 font-bold">TĂNG TRƯỞNG</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CỘT PHẢI: WIDGET PHỤ (1/3) */}
          <div className="space-y-6">
            {/* Thẻ Phân tích */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <div className="p-3 bg-blue-50 w-fit rounded-2xl mb-4">
                  <BarChart2 className="text-[#0866FF]" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Số liệu hôm nay</h3>
                <div className="space-y-4 mt-6">
                  <div className="flex justify-between items-end">
                    <span className="text-gray-400 text-sm font-bold uppercase">Lượt nhắc tới</span>
                    <span className="text-2xl font-black text-gray-900">48.2K</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-full w-[65%] rounded-full shadow-inner"></div>
                  </div>
                  <p className="text-xs text-gray-400 italic">Dựa trên dữ liệu từ 2,400 bài viết mới nhất trong khu vực của bạn.</p>
                </div>
              </div>
            </div>

            
          </div>

        </div>
      </div>
    </div>
  );
};

export default TrendingHashtags;