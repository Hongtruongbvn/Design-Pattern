import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Booking {
  _id: string;
  bookingCode: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
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
  };
  seats: string[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

const AdminOrders: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      const url = activeTab === 'pending' 
        ? '/bookings/admin/pending' 
        : '/bookings/admin/all';
      const response = await api.get(url);
      setBookings(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (bookingId: string) => {
    const note = prompt('Nhập ghi chú (nếu có):');
    try {
      await api.post(`/bookings/admin/${bookingId}/confirm`, { note });
      toast.success('Đã xác nhận thanh toán');
      fetchBookings();
    } catch (error) {
      toast.error('Xác nhận thất bại');
    }
  };

  const rejectBooking = async (bookingId: string) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason) return;
    try {
      await api.post(`/bookings/admin/${bookingId}/reject`, { reason });
      toast.success('Đã từ chối đơn hàng');
      fetchBookings();
    } catch (error) {
      toast.error('Từ chối thất bại');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ xác nhận' },
      confirmed: { color: 'bg-green-100 text-green-800', text: 'Đã xác nhận' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Đã hủy' },
      completed: { color: 'bg-blue-100 text-blue-800', text: 'Hoàn thành' },
    };
    const info = statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.color}`}>{info.text}</span>;
  };

  // Hàm format date an toàn
  const formatDateSafe = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Hàm format date chỉ hiển thị giờ
  const formatTimeSafe = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid time';
      return format(date, 'HH:mm', { locale: vi });
    } catch (error) {
      return 'Invalid time';
    }
  };

  // Hàm format date chỉ hiển thị ngày
  const formatDateOnlySafe = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'dd/MM/yyyy', { locale: vi });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
        <p className="text-gray-600">Xác nhận thanh toán và quản lý đơn hàng</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-2 px-4 ${activeTab === 'pending' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-500'}`}
        >
          ⏳ Chờ xác nhận
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-2 px-4 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-500'}`}
        >
          📋 Tất cả đơn hàng
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">Không có đơn hàng nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{booking.showtimeId?.movieId?.title || 'N/A'}</h3>
                  <p className="text-gray-600 text-sm">Mã đơn: {booking.bookingCode || 'N/A'}</p>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-500">Khách hàng</p>
                  <p className="font-medium">{booking.userId?.fullName || 'N/A'}</p>
                  <p className="text-xs text-gray-400">{booking.userId?.phoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Suất chiếu</p>
                  <p className="font-medium">
                    {formatDateSafe(booking.showtimeId?.startTime)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Rạp</p>
                  <p className="font-medium">
                    {booking.showtimeId?.theater || 'N/A'} - {booking.showtimeId?.room || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Ghế</p>
                  <p className="font-medium">{booking.seats?.join(', ') || 'N/A'}</p>
                </div>
              </div>

              {/* Hiển thị thêm thông tin thời gian chi tiết nếu có */}
              {booking.showtimeId?.startTime && booking.showtimeId?.endTime && (
                <div className="text-xs text-gray-400 mb-3">
                  <span>⏰ {formatDateOnlySafe(booking.showtimeId.startTime)}</span>
                  <span className="mx-2">•</span>
                  <span>{formatTimeSafe(booking.showtimeId.startTime)} - {formatTimeSafe(booking.showtimeId.endTime)}</span>
                </div>
              )}

              <div className="flex justify-between items-center border-t pt-4">
                <div>
                  <p className="text-gray-500">Tổng tiền</p>
                  <p className="text-2xl font-bold text-blue-600">{booking.totalAmount?.toLocaleString() || 0}đ</p>
                </div>
                {booking.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmPayment(booking._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      ✅ Xác nhận thanh toán
                    </button>
                    <button
                      onClick={() => rejectBooking(booking._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      ❌ Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;