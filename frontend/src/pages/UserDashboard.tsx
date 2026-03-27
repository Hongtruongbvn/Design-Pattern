import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
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
    };
  };
  seats: string[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

const UserDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my-bookings');
      setBookings(response.data);
    } catch (error) {
      toast.error('Không thể tải lịch sử đặt vé');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ thanh toán' },
      confirmed: { color: 'bg-green-100 text-green-800', text: 'Đã xác nhận' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Đã hủy' },
      completed: { color: 'bg-blue-100 text-blue-800', text: 'Hoàn thành' },
    };
    const info = statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.color}`}>{info.text}</span>;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Chào mừng {user?.fullName} quay trở lại!</p>
      </div>

      {/* User Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">👤</div>
            <div>
              <p className="text-sm text-gray-500">Họ và tên</p>
              <p className="font-semibold">{user?.fullName}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">📧</div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold">{user?.email}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">📱</div>
            <div>
              <p className="text-sm text-gray-500">Số điện thoại</p>
              <p className="font-semibold">{user?.phoneNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Tổng số vé đã đặt</p>
          <p className="text-3xl font-bold mt-2">{bookings.length}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Tổng chi tiêu</p>
          <p className="text-3xl font-bold mt-2">
            {bookings.reduce((sum, b) => sum + (b.status === 'confirmed' ? b.totalAmount : 0), 0).toLocaleString()}đ
          </p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Điểm tích lũy</p>
          <p className="text-3xl font-bold mt-2">{user?.loyaltyPoints || 0}</p>
        </div>
      </div>

      {/* Booking History */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Lịch sử đặt vé</h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Bạn chưa có đặt vé nào</p>
            <Link to="/movies" className="btn-primary inline-block mt-4">
              Đặt vé ngay
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Mã vé</th>
                  <th className="px-4 py-2 text-left">Phim</th>
                  <th className="px-4 py-2 text-left">Suất chiếu</th>
                  <th className="px-4 py-2 text-left">Ghế</th>
                  <th className="px-4 py-2 text-left">Tổng tiền</th>
                  <th className="px-4 py-2 text-left">Ngày đặt</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">{booking.bookingCode}</td>
                    <td className="px-4 py-3">{booking.showtimeId?.movieId?.title || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">
                      {booking.showtimeId && (
                        <>
                          <div>{format(new Date(booking.showtimeId.startTime), 'dd/MM/yyyy', { locale: vi })}</div>
                          <div className="text-gray-500 text-xs">
                            {format(new Date(booking.showtimeId.startTime), 'HH:mm', { locale: vi })} -{' '}
                            {format(new Date(booking.showtimeId.endTime), 'HH:mm', { locale: vi })}
                          </div>
                          <div className="text-gray-500 text-xs">{booking.showtimeId.theater} - {booking.showtimeId.room}</div>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3">{booking.seats.join(', ')}</td>
                    <td className="px-4 py-3 font-semibold">{booking.totalAmount.toLocaleString()}đ</td>
                    <td className="px-4 py-3">{getStatusBadge(booking.status)}</td>
                    <td className="px-4 py-3 text-sm">
                      {format(new Date(booking.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;