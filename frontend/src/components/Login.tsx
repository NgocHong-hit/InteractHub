import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import accountAPI from '../api/accountAPI';

const App: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    setErrorMessage(null);
    try {
      const response = await accountAPI.login({
        userName: data.email,
        password: data.password,
      });

      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response));

        if (response.role === 'Admin') {
          navigate('/admin');
        } else {
          navigate('/homepages');
        }
      }
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || error.response?.data || 'Đăng nhập thất bại. Vui lòng thử lại.';
      setErrorMessage(typeof serverMessage === 'string' ? serverMessage : JSON.stringify(serverMessage));
      console.error('Lỗi đăng nhập:', error.response?.data || error);
    }
  };

  return (
    // SỬA: min-h-screen thành h-screen và thêm overflow-hidden để triệt tiêu thanh cuộn
    <div className="h-screen w-full flex flex-col lg:flex-row font-sans overflow-hidden bg-white">
      
      {/* PHẦN BÊN TRÁI: NỀN TRẮNG */}
      <div className="lg:w-1/2 bg-white flex flex-col justify-center items-center p-8 lg:p-12 animate-in fade-in slide-in-from-left duration-700">
        <div className="max-w-md w-full">
          {/* SỬA: Giảm size chữ một chút để không chiếm quá nhiều không gian dọc */}
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-6 text-center lg:text-left">
            Connect with friends and the world around you
          </h1>

          {/* SỬA: Giảm h-64 xuống h-48 hoặc h-56 để tiết kiệm diện tích */}
          <div className="relative w-full h-48 lg:h-56 flex justify-center lg:justify-start">
             <svg viewBox="0 0 400 300" className="w-full h-full max-w-xs">
                <defs>
                  <linearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#DBEAFE', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:'#BFDBFE', stopOpacity:1}} />
                  </linearGradient>
                </defs>
                <path fill="url(#blobGrad)" d="M40.2,-58.5C52.7,-51.9,64,-42.6,71.1,-30.5C78.2,-18.3,81.1,-3.4,78.5,10.6C75.8,24.7,67.6,37.8,57.1,48.2C46.6,58.7,33.8,66.4,20,70.9C6.2,75.4,-8.6,76.7,-22.4,72.7C-36.2,68.7,-49,59.3,-58.6,47.8C-68.2,36.2,-74.6,22.4,-77.3,7.9C-79.9,-6.6,-78.9,-21.8,-71.8,-34.7C-64.7,-47.5,-51.6,-57.9,-37.9,-63.9C-24.3,-70,-12.2,-71.6,0.3,-72C12.7,-72.4,25.4,-71.6,40.2,-58.5Z" transform="translate(200 150)" />
                <circle cx="160" cy="190" r="50" fill="#0866FF" />
                <path d="M160 130 L145 190 L175 190 Z" fill="#2563EB" />
                <rect x="185" y="155" width="8" height="15" rx="2" fill="#1E40AF" transform="rotate(20 185 155)" />
                <circle cx="160" cy="120" r="12" fill="#FEE2E2" />
             </svg>
          </div>
        </div>
      </div>

      {/* PHẦN BÊN PHẢI: NỀN XANH */}
      <div className="lg:w-1/2 bg-[#0866FF] flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-700">
        
        {/* SỬA: Giảm padding p-8/p-12 xuống p-6/p-10 để form gọn hơn */}
        <div className="bg-white p-6 lg:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white/10 transform transition-all hover:scale-[1.01]">
          
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Log In</h2>
            <p className="text-gray-500 mt-1 text-sm">Welcome back to InteractHub</p>
          </div>
          {/* SỬA: Giảm space-y-6 xuống space-y-4 */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-9">
            {errorMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={18} />
              </div>
              <input 
                type="text"
                {...register("email", { 
                  required: "Email hoặc username không được để trống",
                })}
                placeholder="Email or username"
                className={`w-full pl-11 pr-4 py-3 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#0866FF] outline-none transition-all text-sm`}
              />
              {errors.email && <p className="text-red-500 text-[10px] mt-1 absolute font-medium">{errors.email.message as string}</p>}
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={18} />
              </div>
              <input 
                type="password"
                {...register("password", { 
                  required: "Mật khẩu không được để trống",
                  minLength: { value: 6, message: "Mật khẩu phải ít nhất 6 ký tự" }
                })}
                placeholder="Password"
                className={`w-full pl-11 pr-4 py-3 bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-[#0866FF] outline-none transition-all text-sm`}
              />
              {errors.password && <p className="text-red-500 text-[10px] mt-1 absolute font-medium">{errors.password.message as string}</p>}
            </div>

            <div className="text-right">
              <a href="#" className="text-xs font-bold text-[#0866FF] hover:underline">Forgot Password?</a>
            </div>

            <button 
              type="submit" 
              className="w-full flex items-center justify-center gap-2 bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-lg shadow-blue-500/20 active:scale-[0.98]"
            >
              <LogIn size={18} />
              Sign In
            </button>
          </form>

          <div className="text-center mt-6 text-xs text-gray-500">
            Don't have an account?{' '}
            <button 
              onClick={() => navigate('/register')}
              className="font-extrabold text-[#0866FF] hover:underline flex items-center gap-1 mx-auto mt-1"
            >
              <ArrowRight size={14} /> Sign up
            </button>          
            </div>

        </div>
      </div> 
    </div>
  );
};

export default App;