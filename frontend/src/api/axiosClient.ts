import axios from 'axios';

const axiosClient = axios.create({
  // Port 5012 thường là cổng HTTP của ASP.NET Core
  baseURL: 'http://localhost:5012/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Gắn token vào header nếu đã đăng nhập
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;