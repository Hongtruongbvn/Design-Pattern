import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { toast } from 'react-hot-toast';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Không tìm thấy token xác thực');
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await authService.verifyEmail({ token: token! });
      setStatus('success');
      setMessage(response.message || 'Xác thực email thành công!');
      toast.success('Xác thực email thành công');
      
      // Auto login after verification
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Xác thực email thất bại');
      toast.error('Xác thực email thất bại');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card text-center">
        {status === 'loading' && (
          <>
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold mb-2">Đang xác thực...</h2>
            <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Xác thực thành công!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-gray-600">Đang chuyển hướng đến trang chủ...</p>
            <Link to="/login" className="btn-primary inline-block mt-4">
              Đăng nhập ngay
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Xác thực thất bại</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <Link to="/login" className="btn-primary inline-block">
              Về trang đăng nhập
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;