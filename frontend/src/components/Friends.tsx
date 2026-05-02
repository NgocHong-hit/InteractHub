import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus, UserCheck, UserX, Search,
  Users2, Clock, X, CheckCircle2
} from 'lucide-react';
import Navbar from './Navbar';
import friendAPI from '../api/friendAPI';
import { toast } from 'react-hot-toast';

// ─── Type definitions ────────────────────────────────────────────────────────
interface SuggestionUser {
  id: number;
  userName: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  friendshipStatus: 'none' | 'sent' | 'received' | 'friends';
  friendshipId?: number | null;
}

interface FriendItem {
  userId: number;
  userName: string;
  fullName?: string;
  avatarUrl?: string;
  friendsSince?: string;
}

interface RequestItem {
  friendshipId: number;
  senderId: number;
  senderUserName: string;
  senderFullName?: string;
  senderAvatarUrl?: string;
  receiverId: number;
  receiverUserName: string;
  receiverFullName?: string;
  receiverAvatarUrl?: string;
  createdAt: string;
}

type ActiveTab = 'suggestions' | 'friends' | 'requests' | 'sent';

// ─── Avatar helper ────────────────────────────────────────────────────────────
const Avatar = ({ url, seed, size = 'lg' }: { url?: string; seed?: string; size?: 'sm' | 'lg' }) => {
  const cls = size === 'lg' ? 'w-24 h-24' : 'w-10 h-10';
  const src = url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed ?? 'user'}`;
  return <img src={src} className={`${cls} rounded-full object-cover`} alt="avatar" />;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Friends = ({ userData }: any) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>('suggestions');
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionUser[]>([]);
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [sentRequests, setSentRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch all data upfront so switching tabs is instant ──
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sugRes, frRes, rqRes, snRes] = await Promise.all([
        friendAPI.getAllUsers(),
        friendAPI.getFriends(),
        friendAPI.getPendingRequests(),
        friendAPI.getSentRequests(),
      ]);
      setSuggestions(sugRes.data ?? []);
      setFriends(frRes.data ?? []);
      setRequests(rqRes.data ?? []);
      setSentRequests(snRes.data ?? []);
    } catch {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ── Generic action wrapper ──
  const handleAction = async (action: () => Promise<any>, successMsg: string) => {
    try {
      const res = await action();
      if (res.success) {
        toast.success(successMsg);
        fetchAll(); // refresh everything
      } else {
        toast.error(res.message || 'Thao tác thất bại');
      }
    } catch {
      toast.error('Lỗi kết nối Server');
    }
  };

  // ── Filter helpers ──
  const filterBySearch = (name?: string, userName?: string) => {
    const q = searchTerm.toLowerCase();
    return (name ?? '').toLowerCase().includes(q) ||
           (userName ?? '').toLowerCase().includes(q);
  };

  const filteredSuggestions = suggestions.filter(u =>
    filterBySearch(u.fullName, u.userName) && u.id !== userData?.id
  );
  const filteredFriends = friends.filter(f =>
    filterBySearch(f.fullName, f.userName)
  );
  const filteredRequests = requests.filter(r =>
    filterBySearch(r.senderFullName, r.senderUserName)
  );
  const filteredSent = sentRequests.filter(r =>
    filterBySearch(r.receiverFullName, r.receiverUserName)
  );

  const currentList = () => {
    switch (activeTab) {
      case 'suggestions': return filteredSuggestions;
      case 'friends':     return filteredFriends;
      case 'requests':    return filteredRequests;
      case 'sent':        return filteredSent;
    }
  };

  const tabs: { id: ActiveTab; label: string; count?: number }[] = [
    { id: 'suggestions', label: 'Gợi ý kết bạn' },
    { id: 'friends',     label: 'Bạn bè',   count: friends.length },
    { id: 'requests',    label: 'Lời mời',   count: requests.length },
    { id: 'sent',        label: 'Đã gửi',    count: sentRequests.length },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Navbar />

      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-12 mb-8 gap-4">
          <div className="relative w-full md:w-70">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* TABS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 p-1">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                  ${activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {tab.label}
                {tab.count != null && tab.count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                    ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
          </div>
        ) : currentList().length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* ─── SUGGESTIONS ─── */}
            {activeTab === 'suggestions' && filteredSuggestions.map(user => (
              <SuggestionCard
                key={user.id}
                user={user}
                onNavigate={() => navigate(`/profile/${user.id}`)}
                onSendRequest={() => handleAction(
                  () => friendAPI.sendRequest(user.id),
                  'Đã gửi lời mời kết bạn!'
                )}
                onCancelRequest={() => handleAction(
                  () => friendAPI.removeFriend(user.id),
                  'Đã hủy yêu cầu kết bạn'
                )}
                onUnfriend={() => handleAction(
                  () => friendAPI.removeFriend(user.id),
                  'Đã hủy kết bạn'
                )}
              />
            ))}

            {/* ─── FRIENDS ─── */}
            {activeTab === 'friends' && filteredFriends.map(friend => (
              <FriendCard
                key={friend.userId}
                friend={friend}
                onNavigate={() => navigate(`/profile/${friend.userId}`)}
                onUnfriend={() => handleAction(
                  () => friendAPI.removeFriend(friend.userId),
                  'Đã hủy kết bạn'
                )}
              />
            ))}

            {/* ─── INCOMING REQUESTS ─── */}
            {activeTab === 'requests' && filteredRequests.map(req => (
              <RequestCard
                key={req.friendshipId}
                name={req.senderFullName || req.senderUserName}
                userName={req.senderUserName}
                avatarUrl={req.senderAvatarUrl}
                createdAt={req.createdAt}
                onNavigate={() => navigate(`/profile/${req.senderId}`)}
                onAccept={() => handleAction(
                  () => friendAPI.acceptRequest(req.friendshipId),
                  'Đã chấp nhận lời mời!'
                )}
                onReject={() => handleAction(
                  () => friendAPI.rejectRequest(req.friendshipId),
                  'Đã từ chối lời mời'
                )}
                mode="incoming"
              />
            ))}

            {/* ─── SENT REQUESTS ─── */}
            {activeTab === 'sent' && filteredSent.map(req => (
              <RequestCard
                key={req.friendshipId}
                name={req.receiverFullName || req.receiverUserName}
                userName={req.receiverUserName}
                avatarUrl={req.receiverAvatarUrl}
                createdAt={req.createdAt}
                onNavigate={() => navigate(`/profile/${req.receiverId}`)}
                onCancel={() => handleAction(
                  () => friendAPI.removeFriend(req.receiverId),
                  'Đã hủy yêu cầu kết bạn'
                )}
                mode="sent"
              />
            ))}
          </div>
        ) : (
          <EmptyState tab={activeTab} />
        )}
      </div>
    </div>
  );
};

// ─── Suggestion Card ──────────────────────────────────────────────────────────
const SuggestionCard = ({
  user,
  onNavigate,
  onSendRequest,
  onCancelRequest,
  onUnfriend,
}: {
  user: SuggestionUser;
  onNavigate: () => void;
  onSendRequest: () => void;
  onCancelRequest: () => void;
  onUnfriend: () => void;
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
    <div className="h-20 bg-gradient-to-r from-blue-400 to-indigo-500" />
    <div className="px-5 pb-6 flex flex-col items-center">
      <div className="-mt-10 mb-3 ring-4 ring-white rounded-full cursor-pointer" onClick={onNavigate}>
        <Avatar url={user.avatarUrl} seed={user.userName} />
      </div>
      <h3 className="font-bold text-lg text-gray-900 text-center hover:underline cursor-pointer" onClick={onNavigate}>{user.fullName || user.userName}</h3>
      <p className="text-sm text-gray-500 mb-5 font-medium">@{user.userName}</p>

      <div className="flex gap-2 w-full">
        {user.friendshipStatus === 'none' && (
          <button
            onClick={onSendRequest}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <UserPlus size={15} /> Kết bạn
          </button>
        )}

        {user.friendshipStatus === 'sent' && (
          <button
            onClick={onCancelRequest}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <Clock size={15} /> Đã gửi lời mời
          </button>
        )}

        {user.friendshipStatus === 'received' && (
          <span className="w-full bg-green-50 text-green-700 py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 size={15} /> Đã gửi cho bạn
          </span>
        )}

        {user.friendshipStatus === 'friends' && (
          <>
            <span className="flex-1 bg-blue-50 text-blue-700 py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
              <UserCheck size={15} /> Bạn bè
            </span>
            <button
              onClick={onUnfriend}
              className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"
              title="Hủy kết bạn"
            >
              <UserX size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  </div>
);

// ─── Friend Card ──────────────────────────────────────────────────────────────
const FriendCard = ({
  friend,
  onNavigate,
  onUnfriend,
}: {
  friend: FriendItem;
  onNavigate: () => void;
  onUnfriend: () => void;
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
    <div className="h-20 bg-gradient-to-r from-green-400 to-emerald-500" />
    <div className="px-5 pb-6 flex flex-col items-center">
      <div className="-mt-10 mb-3 ring-4 ring-white rounded-full cursor-pointer" onClick={onNavigate}>
        <Avatar url={friend.avatarUrl} seed={friend.userName} />
      </div>
      <h3 className="font-bold text-lg text-gray-900 text-center hover:underline cursor-pointer" onClick={onNavigate}>{friend.fullName || friend.userName}</h3>
      <p className="text-sm text-gray-500 mb-1 font-medium">@{friend.userName}</p>
      {friend.friendsSince && (
        <p className="text-xs text-gray-400 mb-4">
          Bạn bè từ {new Date(friend.friendsSince).toLocaleDateString('vi-VN')}
        </p>
      )}

      <div className="flex gap-2 w-full">
        <span className="flex-1 bg-green-50 text-green-700 py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
          <UserCheck size={15} /> Bạn bè
        </span>
        <button
          onClick={onUnfriend}
          className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"
          title="Hủy kết bạn"
        >
          <UserX size={16} />
        </button>
      </div>
    </div>
  </div>
);

// ─── Request Card (used for both incoming & sent) ─────────────────────────────
const RequestCard = ({
  name,
  userName,
  avatarUrl,
  createdAt,
  onAccept,
  onReject,
  onCancel,
  onNavigate,
  mode,
}: {
  name: string;
  userName: string;
  avatarUrl?: string;
  createdAt: string;
  onAccept?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  onNavigate?: () => void;
  mode: 'incoming' | 'sent';
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
    <div className={`h-20 bg-gradient-to-r ${mode === 'incoming' ? 'from-purple-400 to-pink-500' : 'from-orange-400 to-amber-500'}`} />
    <div className="px-5 pb-6 flex flex-col items-center">
      <div className="-mt-10 mb-3 ring-4 ring-white rounded-full cursor-pointer" onClick={onNavigate}>
        <Avatar url={avatarUrl} seed={userName} />
      </div>
      <h3 className="font-bold text-lg text-gray-900 text-center hover:underline cursor-pointer" onClick={onNavigate}>{name}</h3>
      <p className="text-sm text-gray-500 mb-1 font-medium">@{userName}</p>
      <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
        <Clock size={11} />
        {new Date(createdAt).toLocaleDateString('vi-VN')}
      </p>

      <div className="flex gap-2 w-full">
        {mode === 'incoming' && (
          <>
            <button
              onClick={onAccept}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <UserCheck size={14} /> Xác nhận
            </button>
            <button
              onClick={onReject}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <X size={14} /> Xóa
            </button>
          </>
        )}
        {mode === 'sent' && (
          <button
            onClick={onCancel}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <X size={14} /> Hủy yêu cầu
          </button>
        )}
      </div>
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const emptyMessages: Record<ActiveTab, { title: string; desc: string }> = {
  suggestions: { title: 'Không có gợi ý', desc: 'Chưa có người dùng nào khác trong hệ thống.' },
  friends:     { title: 'Chưa có bạn bè',  desc: 'Hãy khám phá và kết bạn với mọi người!' },
  requests:    { title: 'Không có lời mời', desc: 'Bạn chưa nhận được lời mời kết bạn nào.' },
  sent:        { title: 'Chưa gửi lời mời', desc: 'Bạn chưa gửi lời mời kết bạn cho ai.' },
};

const EmptyState = ({ tab }: { tab: ActiveTab }) => {
  const { title, desc } = emptyMessages[tab];
  return (
    <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
      <Users2 size={40} className="text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-500 mt-1">{desc}</p>
    </div>
  );
};

export default Friends;