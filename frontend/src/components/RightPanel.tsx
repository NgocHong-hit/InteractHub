import { Video, Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
function RightPanel({ contacts, userData }: any) {
  const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const persistedUser = storedUser ? JSON.parse(storedUser) : null;
  const currentUser = userData || persistedUser;
  const profileName = currentUser?.fullName || currentUser?.userName || 'Người dùng';
  const profileHandle = currentUser?.userName ? `@${currentUser.userName}` : '@guest';
  const profileSeed = currentUser?.userName || 'User';

  return (
    <aside className="hidden xl:block w-[320px] sticky top-20 h-fit space-y-6">

      {/* --- PHẦN 1: PROFILE CÁ NHÂN (MỚI THÊM) --- */}
      {/* Chuyển thẻ <div> ngoài cùng thành <Link> để nhấp vào bất cứ đâu cũng chuyển trang */}
      <Link
        to="/profile"
        className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-5 group cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
      >
        <div className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-100 p-0.5">

              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profileSeed}`}
                className="w-full h-full rounded-full object-cover"
                alt="My Profile"
              />

            </div>

            <div>

              <h4 className="font-bold text-gray-900 text-sm">{profileName}</h4>

              <p className="text-[11px] text-gray-400 font-medium">{profileHandle}</p>

            </div>
            <div className="grid grid-cols-2 gap-5 pt-5 border-t border-gray-50">
              <div className="text-center py-1 hover:bg-blue-50 rounded-lg transition-colors">
                <p className="text-xs font-bold text-gray-900">1.2k</p>
                <p className="text-[10px] text-gray-400">Bạn bè</p>
              </div>
              <div className="text-center py-1 hover:bg-blue-50 rounded-lg transition-colors">
                <p className="text-xs font-bold text-gray-900">458</p>
                <p className="text-[10px] text-gray-400">Bài viết</p>
              </div>
            </div>

          </div>

        </div>
      </Link>


      {/* --- PHẦN 2: DANH SÁCH ĐANG TRỰC TUYẾN --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex justify-between items-center mb-5 pb-2 border-b border-gray-50">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[1.5px]">Người liên hệ</h3>
          <div className="flex gap-3 text-gray-400">
            <Video size={16} className="cursor-pointer hover:text-blue-600 transition-colors" />
            <Search size={16} className="cursor-pointer hover:text-blue-600 transition-colors" />
          </div>
        </div>

        <div className="space-y-4">
          {contacts.map((contact: any) => (
            <div key={contact.id} className="flex items-center gap-3 cursor-pointer group p-1 hover:bg-gray-50 rounded-xl transition-all">
              <div className="relative">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.name}`}
                  className="w-10 h-10 rounded-full border border-gray-100"
                  alt={contact.name} />
                <div className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white ${contact.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{contact.name}</p>
                {contact.status === 'online' ? (
                  <p className="text-[10px] text-green-500 font-medium">Đang hoạt động</p>
                ) : (
                  <p className="text-[10px] text-gray-400 font-medium">Ngoại tuyến</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-5 py-2 text-[12px] font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-center gap-1">
          Xem tất cả <ChevronRight size={14} />
        </button>
      </div>



    </aside>
  );
}

export default RightPanel;