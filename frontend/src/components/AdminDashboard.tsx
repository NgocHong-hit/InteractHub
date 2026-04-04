import React, { useState } from 'react';
import { 
  Users, Image as ImageIcon, AlertTriangle, BarChart3, 
  Flag, CheckCircle, Trash2, ShieldCheck, Filter, 
  Search, MoreVertical, LogOut 
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Thành phần hiển thị các thẻ thống kê tóm tắt
const AdminStatCard = ({ icon, label, value, trend, highlight = false }: any) => (
  <div className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md ${highlight ? 'ring-2 ring-red-50' : ''}`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${highlight ? 'bg-red-50' : 'bg-blue-50'}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      {trend && (
        <span className={`text-[10px] font-black px-2 py-1 rounded-full ${trend.includes('+') ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
      <h3 className="text-3xl font-black text-gray-900">{value}</h3>
    </div>
  </div>
);

const App: React.FC = () => {
  // 1. Dữ liệu mẫu cho các chỉ số thống kê
  const [stats] = useState({
    totalUsers: '12,842',
    totalPosts: '85,420',
    reportsPending: 14,
  });

  // 2. Danh sách các bài viết bị người dùng báo cáo vi phạm
  const [reportedPosts, setReportedPosts] = useState([
    { 
      id: 1, 
      author: 'Nguyễn Văn A', 
      content: 'Nội dung chứa thông tin sai lệch về y tế...', 
      reason: 'Tin giả', 
      reporter: 'ngoc_hong12', 
      severity: 'high', 
      time: '10 phút trước' 
    },
    { 
      id: 2, 
      author: 'Trần Thị B', 
      content: 'Hình ảnh không phù hợp với tiêu chuẩn cộng đồng', 
      reason: 'Nội dung nhạy cảm', 
      reporter: 'minh_quan_dev', 
      severity: 'medium', 
      time: '1 giờ trước' 
    },
    { 
      id: 3, 
      author: 'Lê Văn C', 
      content: 'Xúc phạm người khác trong phần bình luận', 
      reason: 'Quấy rối', 
      reporter: 'hoang_nam_it', 
      severity: 'low', 
      time: '3 giờ trước' 
    },
  ]);

  // 3. Xử lý các tác vụ quản trị
  const handleDismissReport = (id: number) => {
    setReportedPosts(reportedPosts.filter(post => post.id !== id));
  };

  const handleDeletePost = (id: number) => {
    // Lưu ý: Không dùng alert/confirm trong môi trường thực tế, nên dùng modal UI tùy chỉnh
    if(window.confirm("Bạn có chắc chắn muốn xóa bài viết vi phạm này không?")) {
      setReportedPosts(reportedPosts.filter(post => post.id !== id));
    }
  };

  const handleLogout = () => {
    if(window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị?")) {
      console.log("Admin đã đăng xuất");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-[1200px] mx-auto px-4 animate-in fade-in duration-500 pb-10">
        
        {/* THANH TIÊU ĐỀ (HEADER) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Hệ thống Quản trị</h1>
            <p className="text-slate-500 font-medium">Bảng điều khiển dành cho Quản trị viên</p>
          </div>
          <Link to ="/login" >
          <div className="flex items-center gap-3">
            {/* Nút Đăng xuất - Giữ lại như yêu cầu trước đó */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 border border-red-100 rounded-2xl font-bold text-sm hover:bg-red-50 transition-all shadow-sm active:scale-95"
            >
              <LogOut size={18} />
              Đăng xuất
            </button>
          </div>
          </Link>
        </div>

        {/* CÁC THẺ THỐNG KÊ TỔNG QUAN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <AdminStatCard icon={<Users className="text-blue-600" />} label="Tổng người dùng" value={stats.totalUsers}  />
          <AdminStatCard icon={<ImageIcon className="text-green-600" />} label="Tổng bài viết" value={stats.totalPosts}  />
          <AdminStatCard icon={<AlertTriangle className="text-red-600" />} label="Báo cáo chờ xử lý" value={stats.reportsPending} highlight />
        </div>

        {/* KHU VỰC QUẢN LÝ NỘI DUNG VI PHẠM */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          
          {/* Thanh công cụ của bảng */}
          <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/20">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Flag size={20} className="text-red-500" /> Nội dung bị báo cáo
            </h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Tìm tác giả..." 
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                <Filter size={16} /> Lọc
              </button>
            </div>
          </div>

          {/* Bảng danh sách bài viết */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] uppercase tracking-widest text-slate-400 font-black border-b border-slate-50 bg-slate-50/30">
                  <th className="px-6 py-4">Người đăng</th>
                  <th className="px-6 py-4">Nội dung tóm lược</th>
                  <th className="px-6 py-4">Lý do báo cáo</th>
                  <th className="px-6 py-4 text-center">Mức độ</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reportedPosts.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{report.author}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{report.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 max-w-xs truncate italic">"{report.content}"</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-red-500">{report.reason}</div>
                      <div className="text-[10px] text-slate-400 font-medium">Bởi: {report.reporter}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase inline-block ${
                        report.severity === 'high' ? 'bg-red-50 text-red-600 border border-red-100' :
                        report.severity === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {report.severity === 'high' ? 'Khẩn cấp' : report.severity === 'medium' ? 'Cảnh báo' : 'Thấp'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => handleDismissReport(report.id)}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                          title="Bỏ qua báo cáo"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button 
                          onClick={() => handleDeletePost(report.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Xóa vĩnh viễn"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Trạng thái khi không có báo cáo nào */}
            {reportedPosts.length === 0 && (
              <div className="py-24 text-center flex flex-col items-center">
                <div className="bg-green-50 p-6 rounded-full mb-4 ring-8 ring-green-50/50">
                  <ShieldCheck size={60} className="text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Hệ thống an toàn!</h3>
                <p className="text-slate-500 mt-1 max-w-xs mx-auto">Hiện tại không có bài viết vi phạm nào cần bạn phê duyệt.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;