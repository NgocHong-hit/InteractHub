import React, { useState } from 'react';
import { X, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import accountAPI from '../api/accountAPI';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response: any = await accountAPI.forgotPassword(email);
      if (response.success && response.token) {
        setResetToken(response.token);
        setStep(2); // Tự động chuyển qua bước 2 cho môi trường Dev
      } else {
        setError(response.message || 'Không thể lấy mã khôi phục');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi gửi yêu cầu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu phải từ 6 ký tự trở lên');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response: any = await accountAPI.resetPassword({
        email,
        token: resetToken,
        newPassword
      });

      if (response.success) {
        alert('Khôi phục mật khẩu thành công! Vui lòng đăng nhập lại.');
        handleClose();
      } else {
        setError(response.message || 'Không thể đặt lại mật khẩu');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi đặt lại mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              {step === 1 ? 'Khôi phục mật khẩu' : 'Tạo mật khẩu mới'}
            </h2>
            <p className="text-gray-500 text-sm">
              {step === 1 
                ? 'Nhập email của bạn để nhận mã khôi phục tài khoản.' 
                : 'Vui lòng nhập mật khẩu mới cho tài khoản của bạn.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 text-center">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestToken} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập địa chỉ Email"
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0866FF] outline-none transition-all"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#0866FF] hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : (
                  <>Tiếp tục <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0866FF] outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu mới"
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0866FF] outline-none transition-all"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#0866FF] hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Xác nhận đổi mật khẩu'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
