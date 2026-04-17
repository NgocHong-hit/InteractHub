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

const accountAPI = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const { data } = await axiosClient.post<LoginResponse>('/account/login', payload);
    return data;
  },

  register: async (payload: RegisterRequest): Promise<LoginResponse> => {
    const { data } = await axiosClient.post<LoginResponse>('/account/register', payload);
    return data;
  },
};

export default accountAPI;
