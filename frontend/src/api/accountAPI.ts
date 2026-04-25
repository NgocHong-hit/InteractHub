import axiosClient from './axiosClient';

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role?: string;
  email?: string;
  userName?: string;
  fullName?: string;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;    // Khớp với tên biến Hồng dùng ở setting.tsx
  newPassword: string;
  confirmNewPassword: string;
}

const accountAPI = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const { data } = await axiosClient.post<LoginResponse>('/account/login', payload);
    return data;
  },

  register: async (payload: RegisterRequest): Promise<LoginResponse> => {
    const { data } = await axiosClient.post<LoginResponse>('/account/register', payload);
    return data;
  },

  changePassword: async (payload: ChangePasswordRequest) => {
    const formattedData = {
      oldPassword: payload.currentPassword,
      newPassword: payload.newPassword,
      confirmPassword: payload.confirmNewPassword
    };
    
    console.log('Sending change password request:', formattedData);
    
    try {
      const { data } = await axiosClient.post('/account/change-password', formattedData);
      console.log('Change password response:', data);
      return data;
    } catch (error: any) {
      console.error('Change password error status:', error.response?.status);
      console.error('Change password error data:', JSON.stringify(error.response?.data, null, 2));
      if (Array.isArray(error.response?.data)) {
        error.response.data.forEach((err: any, index: number) => {
          console.error(`Error ${index}:`, err);
        });
      }
      throw error;
    }
  },    
};

export default accountAPI;
