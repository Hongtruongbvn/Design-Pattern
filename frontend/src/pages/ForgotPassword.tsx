import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authService } from '../services/auth.service';

const schema = yup.object({
  email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
});

type ForgotPasswordFormData = {
  email: string;
};

const ForgotPassword: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    console.log('Sending forgot password request for:', data.email); // Debug
    
    try {
      const response = await authService.forgotPassword(data);
      console.log('Response:', response); // Debug
      setSubmitted(true);
      toast.success('Email đặt lại mật khẩu đã được gửi!');
    } catch (error: any) {
      console.error('Error:', error); // Debug
      console.error('Error response:', error.response); // Debug
      toast.error(error.response?.data?.message || 'Gửi yêu cầu thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    const email = getValues('email');
    return (
      <div className="max-w-md mx-auto">
        <div className="card text-center">
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-2xl font-bold mb-4">Kiểm tra email của bạn</h2>
          <p className="text-gray-600 mb-4">
            Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu đến <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Vui lòng kiểm tra hộp thư (cả spam) và làm theo hướng dẫn.
          </p>
          <Link to="/login" className="btn-primary inline-block w-full text-center">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-center mb-6">Quên mật khẩu</h2>
        
        <p className="text-gray-600 text-center mb-6">
          Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register('email')}
              className="input-field"
              placeholder="example@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-sm text-primary-600 hover:underline">
              Quay lại đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;