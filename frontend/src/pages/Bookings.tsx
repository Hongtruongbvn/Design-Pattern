import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface Booking {
  _id: string;
  bookingCode: string;
  showtimeId: {
    _id: string;
    startTime: string;
    endTime: string;
    theater: string;
    room: string;
    basePrice: number;
    movieId: {
      title: string;
      posterUrl: string;
      duration: number;
    };
  };
  seats: string[];
  totalAmount: number;
  status: string;
  createdAt: string;
  ticketDetails?: {
    qrCode: string;
    bookingCode: string;
  };
  paymentDetails?: {
    method: string;
    transactionId: string;
    paidAt: string;
  };
}

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my-bookings');
      console.log('Bookings data:', response.data);
      setBookings(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách đặt vé');
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = async (bookingId: string, bookingCode: string) => {
    setDownloading(bookingId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}/ticket`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể tải vé');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket_${bookingCode}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Đang tải vé...');
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error(error.message || 'Không thể tải vé');
    } finally {
      setDownloading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string; icon: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ xác nhận', icon: '⏳' },
      confirmed: { color: 'bg-green-100 text-green-800', text: 'Đã xác nhận', icon: '✅' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Đã hủy', icon: '❌' },
      completed: { color: 'bg-blue-100 text-blue-800', text: 'Hoàn thành', icon: '🎬' },
    };
    const info = statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: status, icon: '📋' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.color}`}>
        {info.icon} {info.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Vé của tôi</h1>
      
      {bookings.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🎫</div>
          <h3 className="text-xl font-semibold mb-2">Chưa có vé nào</h3>
          <p className="text-gray-600 mb-4">Bạn chưa đặt vé xem phim nào</p>
          <Link to="/movies" className="btn-primary inline-block">
            Đặt vé ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="card hover:shadow-lg transition">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-32">
                  <img 
                    src={booking.showtimeId?.movieId?.posterUrl || '/placeholder.jpg'} 
                    alt={booking.showtimeId?.movieId?.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{booking.showtimeId?.movieId?.title}</h3>
                      <p className="text-gray-600 text-sm">Mã vé: {booking.bookingCode}</p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                    <div>
                      <p className="text-gray-500">Suất chiếu</p>
                      <p className="font-medium">
                        {booking.showtimeId && format(new Date(booking.showtimeId.startTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Rạp</p>
                      <p className="font-medium">{booking.showtimeId?.theater} - {booking.showtimeId?.room}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Ghế</p>
                      <p className="font-medium">{booking.seats.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tổng tiền</p>
                      <p className="font-medium text-blue-600">{booking.totalAmount.toLocaleString()}đ</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t flex items-center justify-between flex-wrap gap-3">
                    {booking.status === 'confirmed' && booking.ticketDetails?.qrCode && (
                      <div className="flex items-center gap-3">
                        <img 
                          src={booking.ticketDetails.qrCode} 
                          alt="QR Code" 
                          className="w-16 h-16 rounded-lg border"
                        />
                        <div className="text-xs text-gray-500">
                          QR code vé
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2 ml-auto">
                      {booking.status === 'pending' && (
                        <Link
                          to={`/checkout?booking=${booking._id}`}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
                        >
                          💳 Thanh toán qua QR
                        </Link>
                      )}
                      
                      {(booking.status === 'confirmed' || booking.status === 'completed') && (
                        <button
                          onClick={() => downloadTicket(booking._id, booking.bookingCode)}
                          disabled={downloading === booking._id}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          {downloading === booking._id ? 'Đang tải...' : '📄 Tải vé PDF'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {booking.status === 'pending' && (
                    <div className="mt-3 p-2 bg-yellow-50 rounded-lg text-xs text-yellow-700">
                      ⏳ Đơn hàng đang chờ admin xác nhận thanh toán. Vui lòng chờ trong giây lát.
                    </div>
                  )}
                  
                  {booking.paymentDetails?.paidAt && (
                    <div className="mt-2 text-xs text-gray-400">
                      Thanh toán lúc: {new Date(booking.paymentDetails.paidAt).toLocaleString('vi-VN')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;