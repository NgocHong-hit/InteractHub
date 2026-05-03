import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, Mail, Lock, User, Phone, 
  Loader2, MapPin, Calendar, Users 
} from 'lucide-react';
import accountAPI from '../api/accountAPI';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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
        // Extract user data from response
        const userData = {
          id: 0, // ID will be set from token if needed
          userName: response.userName || '',
          fullName: response.fullName,
          email: response.email,
        };
        
        // Use AuthContext's login method to properly store user data
        login(response.token, userData as any);
        navigate('/homepages');
      }
    } catch (error: any) {
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
                  {...register("fullName", { required: "Vui lòng nhập thông tin" })}
                  disabled={isLoading}
                  placeholder="Họ và tên"
                  className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border ${errors.fullName ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:border-[#0866FF] outline-none text-sm`}
                />
                {errors.fullName && <p className="text-red-500 text-[10px] mt-1 ml-2">{errors.fullName.message as string}</p>}
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  {...register("phoneNumber", { 
                    required: "Vui lòng nhập thông tin",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Số điện thoại phải gồm 10 số"
                    }
                  })}
                  disabled={isLoading}
                  placeholder="Số điện thoại"
                  className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:border-[#0866FF] outline-none text-sm`}
                />
                {errors.phoneNumber && <p className="text-red-500 text-[10px] mt-1 ml-2">{errors.phoneNumber.message as string}</p>}
              </div>
            </div>

            {/* Giới tính & Ngày sinh */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select 
                  {...register("gender", { required: "Vui lòng nhập thông tin" })}
                  disabled={isLoading}
                  className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border ${errors.gender ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:border-[#0866FF] outline-none text-sm appearance-none`}
                >
                  <option value="">Giới tính</option>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
                {errors.gender && <p className="text-red-500 text-[10px] mt-1 ml-2">{errors.gender.message as string}</p>}
              </div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="date"
                  {...register("dateOfBirth", { 
                    required: "Vui lòng nhập thông tin",
                    validate: (value) => {
                      const today = new Date();
                      const birthDate = new Date(value);
                      let age = today.getFullYear() - birthDate.getFullYear();
                      const m = today.getMonth() - birthDate.getMonth();
                      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                      }
                      return age >= 13 || "Bạn phải từ 13 tuổi trở lên";
                    }
                  })}
                  disabled={isLoading}
                  className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:border-[#0866FF] outline-none text-sm`}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-[10px] mt-1 ml-2">{errors.dateOfBirth.message as string}</p>}
              </div>
            </div>

            {/* Địa chỉ */}
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                {...register("address", { required: "Vui lòng nhập thông tin" })}
                disabled={isLoading}
                placeholder="Địa chỉ (Tỉnh/Thành phố)"
                className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border ${errors.address ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:border-[#0866FF] outline-none text-sm`}
              />
              {errors.address && <p className="text-red-500 text-[10px] mt-1 ml-2">{errors.address.message as string}</p>}
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                {...register("email", { 
                  required: "Vui lòng nhập thông tin",
                  pattern: { value: /^\S+@\S+\.\S+$/i, message: "Email sai định dạng" }
                })}
                disabled={isLoading}
                placeholder="Địa chỉ Email"
                className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:border-[#0866FF] outline-none text-sm`}
              />
              {errors.email && <p className="text-red-500 text-[10px] mt-1 ml-2">{errors.email.message as string}</p>}
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="password"
                {...register("password", { 
                  required: "Vui lòng nhập thông tin", 
                  minLength: { value: 6, message: "Mật khẩu phải từ 6 kí tự trở lên" } 
                })}
                disabled={isLoading}
                placeholder="Mật khẩu"
                className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:border-[#0866FF] outline-none text-sm`}
              />
              {errors.password && <p className="text-red-500 text-[10px] mt-1 ml-2">{errors.password.message as string}</p>}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="password"
                {...register("confirmPassword", { 
                  required: "Vui lòng nhập thông tin",
                  validate: v => v === password || "Mật khẩu không khớp" 
                })}
                disabled={isLoading}
                placeholder="Xác nhận mật khẩu"
                className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:border-[#0866FF] outline-none text-sm`}
              />
              {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1 ml-2">{errors.confirmPassword.message as string}</p>}
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold py-3 rounded-2xl transition duration-200 shadow-lg flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Đăng ký"}
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