import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';

interface PaymentInfo {
  bookingId: string;
  bookingCode: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  transactionId: string;
  paidAt: string;
  qrCode: string;
  showtime: {
    movie: string;
    theater: string;
    room: string;
    startTime: string;
    seats: string[];
  };
}

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking');
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (bookingId) {
      fetchPaymentInfo();
    } else {
      navigate('/movies');
    }
  }, [bookingId]);

  const fetchPaymentInfo = async () => {
    try {
      const response = await api.get(`/bookings/${bookingId}/info`);
      setPaymentInfo(response.data);
    } catch (error) {
      toast.error('Không thể tải thông tin thanh toán');
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = async () => {
    try {
      const response = await api.get(`/bookings/${bookingId}/ticket`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket_${paymentInfo?.bookingCode}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Đang tải vé...');
    } catch (error) {
      toast.error('Không thể tải vé');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!paymentInfo) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-green-600 mb-4">Thanh toán thành công!</h1>
        
        {/* QR Code */}
        {paymentInfo.qrCode && (
          <div className="mb-6">
            <p className="text-gray-600 mb-2">QR Code vé của bạn:</p>
            <img src={paymentInfo.qrCode} alt="Ticket QR Code" className="mx-auto w-48 h-48" />
          </div>
        )}
        
        {/* Booking Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold mb-3">Thông tin vé:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Mã vé:</span>
              <span className="font-mono font-semibold">{paymentInfo.bookingCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phim:</span>
              <span className="font-semibold">{paymentInfo.showtime?.movie}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Suất chiếu:</span>
              <span>{new Date(paymentInfo.showtime?.startTime).toLocaleString('vi-VN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rạp:</span>
              <span>{paymentInfo.showtime?.theater} - {paymentInfo.showtime?.room}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ghế:</span>
              <span className="font-semibold">{paymentInfo.showtime?.seats?.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tổng tiền:</span>
              <span className="font-bold text-blue-600">{paymentInfo.totalAmount.toLocaleString()}đ</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={downloadTicket}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            📄 Tải vé PDF
          </button>
          <button
            onClick={() => navigate('/bookings')}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            📋 Xem lịch sử đặt vé
          </button>
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <p className="text-sm text-gray-500">
            Vui lòng xuất trình vé (bản giấy hoặc điện tử) tại quầy để vào rạp.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Mã giao dịch: {paymentInfo.transactionId}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;