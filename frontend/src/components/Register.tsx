import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, Mail, Lock, User, Phone, 
  Loader2, MapPin, Calendar, Users 
} from 'lucide-react';
import accountAPI from '../api/accountAPI';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await accountAPI.register({
        userName: data.email.split('@')[0],
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
      });

      alert('Đăng ký thành công!');

      if (response.token) {
        localStorage.setItem('token', response.token);
        navigate('/homepages');
      }
    } catch (error: any) {
      console.error('Lỗi:', error.response?.data);
      const serverMsg = error.response?.data?.message || error.response?.data;
      alert(typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg) || 'Lỗi kết nối!');
    } finally {
      setIsLoading(false);
    }
  };

  const password = watch("password");

  return (
    <div className="h-screen w-screen flex flex-col lg:flex-row font-sans overflow-hidden bg-white">
      
      {/* PHẦN BÊN TRÁI: BRANDING */}
      <div className="lg:w-1/2 bg-white hidden lg:flex flex-col justify-center items-center p-6 lg:p-12 animate-in fade-in slide-in-from-left duration-700">
        <div className="max-w-md w-full text-left">
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-6">
            Connect with friends and the world around you
          </h1>
          <div className="relative w-full h-48 flex justify-center">
             <svg viewBox="0 0 400 300" className="w-full h-full max-w-xs">
                <circle cx="200" cy="150" r="100" fill="#DBEAFE" opacity="0.5" />
                <circle cx="200" cy="130" r="25" fill="#0866FF" />
                <rect x="175" y="160" width="50" height="40" rx="10" fill="#0866FF" />
             </svg>
          </div>
        </div>
      </div>

      {/* PHẦN BÊN PHẢI: FORM ĐĂNG KÝ */}
      <div className="lg:w-1/2 bg-[#0866FF] flex items-center justify-center p-4 lg:p-6 overflow-y-auto">
        <div className="bg-white p-6 lg:p-8 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-white/10 my-8">
          
          <div className="text-center mb-6 flex flex-col items-center">
            <div className="bg-blue-50 text-[#0866FF] p-3 rounded-full mb-2 shadow-inner">
              <UserPlus size={24} />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Create Account</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            
            {/* Họ tên & Số điện thoại */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  {...register("fullName", { required: "Vui lòng nhập tên" })}
                  disabled={isLoading}
                  placeholder="Full Name"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0866FF] outline-none text-sm"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  {...register("phoneNumber")}
                  disabled={isLoading}
                  placeholder="Phone Number"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0866FF] outline-none text-sm"
                />
              </div>
            </div>

            {/* Giới tính & Ngày sinh */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select 
                  {...register("gender", { required: "Chọn giới tính" })}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0866FF] outline-none text-sm appearance-none"
                >
                  <option value="">Gender</option>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
              </div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="date"
                  {...register("dateOfBirth", { required: "Chọn ngày sinh" })}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0866FF] outline-none text-sm"
                />
              </div>
            </div>

            {/* Địa chỉ */}
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                {...register("address")}
                disabled={isLoading}
                placeholder="Address (City, Country)"
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0866FF] outline-none text-sm"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                {...register("email", { 
                  required: "Email là bắt buộc",
                  pattern: { value: /^\S+@\S+$/i, message: "Email sai định dạng" }
                })}
                disabled={isLoading}
                placeholder="Email address"
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0866FF] outline-none text-sm"
              />
              {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email.message as string}</p>}
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="password"
                {...register("password", { required: "Mật khẩu là bắt buộc", minLength: 6 })}
                disabled={isLoading}
                placeholder="Password"
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0866FF] outline-none text-sm"
              />
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="password"
                {...register("confirmPassword", { 
                    validate: v => v === password || "Mật khẩu không khớp" 
                })}
                disabled={isLoading}
                placeholder="Confirm Password"
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0866FF] outline-none text-sm"
              />
              {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1">{errors.confirmPassword.message as string}</p>}
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold py-3 rounded-2xl transition duration-200 shadow-lg flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Create Account"}
            </button>
          </form>

          <div className="text-center mt-4 text-xs text-gray-500">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')}
              className="font-extrabold text-[#0866FF] hover:underline"
            >
              Sign in
            </button>
          </div>

        </div>
      </div> 
    </div>
  );
};

export default Register;