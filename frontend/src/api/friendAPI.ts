import axios from 'axios';

const API_URL = 'http://localhost:5012/api/Friendship'; 

// 2. Hàm lấy Token từ LocalStorage (đã lưu khi Login)
const getToken = () => localStorage.getItem('token');

// 3. Tạo instance Axios riêng cho Friendship
const axiosFriend = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 4. Tự động đính kèm Token vào Header của mọi yêu cầu
axiosFriend.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const friendAPI = {
  // Lấy tất cả người dùng để "Khám phá"
  getAllUsers: async () => {
    const response = await axiosFriend.get('/all-users');
    return response.data; // Trả về { success: true, data: [...] }
  },

  // Lấy danh sách bạn bè đã đồng ý
  getFriends: async () => {
    const response = await axiosFriend.get('/friends');
    return response.data;
  },

  // Lấy lời mời kết bạn ĐẾN (Pending)
  getPendingRequests: async () => {
    const response = await axiosFriend.get('/pending-requests');
    return response.data;
  },

  // Lấy lời mời mình đã GỬI ĐI
  getSentRequests: async () => {
    const response = await axiosFriend.get('/sent-requests');
    return response.data;
  },

  // Gửi lời mời kết bạn (Body chứa receiverId)
  sendRequest: async (receiverId: number) => {
    const response = await axiosFriend.post('/send-request', { receiverId });
    return response.data;
  },

  // Chấp nhận lời mời (Body chứa friendshipId)
  acceptRequest: async (friendshipId: number) => {
    const response = await axiosFriend.post('/accept', { friendshipId });
    return response.data;
  },

  // Từ chối lời mời
  rejectRequest: async (friendshipId: number) => {
    const response = await axiosFriend.post('/reject', { friendshipId });
    return response.data;
  },

  // Xóa bạn bè hoặc hủy lời mời
  removeFriend: async (friendId: number) => {
    const response = await axiosFriend.delete(`/remove/${friendId}`);
    return response.data;
  },

  // Kiểm tra trạng thái nhanh với 1 User cụ thể
  checkStatus: async (userId: number) => {
    const response = await axiosFriend.get(`/check-status/${userId}`);
    return response.data;
  }
};

export default friendAPI;