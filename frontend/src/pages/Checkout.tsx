import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';

interface Booking {
  _id: string;
  bookingCode: string;
  showtimeId: {
    _id: string;
    startTime: string;
    endTime: string;
    theater: string;
    room: string;
    movieId: {
      title: string;
      posterUrl: string;
    };
    basePrice: number;
  };
  seats: string[];
  totalAmount: number;
  status: string;
}

const Checkout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentQR, setPaymentQR] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [generatingQR, setGeneratingQR] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    } else {
      toast.error('Không tìm thấy thông tin đặt vé');
      navigate('/movies');
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      setBooking(response.data);
    } catch (error) {
      toast.error('Không thể tải thông tin đặt vé');
      navigate('/movies');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentQR = async () => {
    setGeneratingQR(true);
    try {
      const response = await api.get(`/bookings/${bookingId}/qr`);
      setPaymentQR(response.data.qrCode);
      setShowQR(true);
      toast.success('Đã tạo mã QR thanh toán');
    } catch (error: any) {
      console.error('QR error:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo mã QR thanh toán');
    } finally {
      setGeneratingQR(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Đang tải thông tin đặt vé...</p>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Thanh toán qua chuyển khoản</h1>

      <div className="grid gap-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Thông tin đặt vé</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Mã đặt vé:</span>
              <span className="font-mono">{booking.bookingCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phim:</span>
              <span className="font-semibold">{booking.showtimeId?.movieId?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Suất chiếu:</span>
              <span>
                {booking.showtimeId && new Date(booking.showtimeId.startTime).toLocaleString('vi-VN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rạp:</span>
              <span>{booking.showtimeId?.theater} - {booking.showtimeId?.room}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ghế:</span>
              <span className="font-semibold">{booking.seats.join(', ')}</span>
            </div>
            <div className="flex justify-between pt-3 border-t">
              <span className="text-lg font-bold">Tổng tiền:</span>
              <span className="text-2xl font-bold text-blue-600">
                {booking.totalAmount.toLocaleString()}đ
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Thông tin khách hàng</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Họ tên:</span>
              <span>{user?.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Số điện thoại:</span>
              <span>{user?.phoneNumber}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Quét mã QR để thanh toán</h2>
          
          {!showQR ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📱</div>
              <p className="text-gray-600 mb-4">
                Nhấn nút bên dưới để tạo mã QR thanh toán
              </p>
              <button
                onClick={fetchPaymentQR}
                disabled={generatingQR}
                className="btn-primary px-8 py-3 disabled:opacity-50"
              >
                {generatingQR ? 'Đang tạo QR...' : 'Tạo mã QR thanh toán'}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-6 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Quét mã QR bằng ứng dụng ngân hàng để thanh toán
                </p>
                <img 
                  src={paymentQR || ''} 
                  alt="QR Code" 
                  className="mx-auto w-64 h-64 border-2 border-gray-200 rounded-lg"
                />
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Thông tin thanh toán:</p>
                  <p className="font-semibold text-blue-600">{booking.totalAmount.toLocaleString()}đ</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Nội dung: Thanh toan ve xem phim - Ma ve: {booking.bookingCode}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800 flex items-center gap-2">
                  <span>⚠️</span>
                  Sau khi chuyển khoản, vui lòng chờ admin xác nhận thanh toán.
                  Vé sẽ được cập nhật trong vòng 5-10 phút.
                </p>
              </div>
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowQR(false);
                    setPaymentQR(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Tạo lại QR
                </button>
                <button
                  onClick={() => navigate('/bookings')}
                  className="flex-1 btn-primary"
                >
                  Xem danh sách đơn hàng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;