import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface Stats {
  users: { total: number; active: number };
  movies: { total: number; showing: number };
  showtimes: { total: number; upcoming: number };
  revenue: { totalRevenue: number; totalBookings: number; totalTickets: number };
  bookings: { totalThisMonth: number; active: number };
}

interface User {
  _id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  phoneNumber: string;
  loyaltyPoints: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users'>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/bookings/admin/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Không thể tải thống kê');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/bookings/admin/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await api.patch(`/bookings/admin/users/${userId}/status`, { isActive });
      toast.success(`Đã ${isActive ? 'kích hoạt' : 'vô hiệu hóa'} người dùng`);
      fetchUsers();
    } catch (error) {
      toast.error('Cập nhật thất bại');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Quản lý hệ thống đặt vé xem phim</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pb-2 px-4 ${activeTab === 'dashboard' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-500'}`}
        >
          📊 Dashboard
        </button>
        <Link to="/admin/orders" className="pb-2 px-4 text-gray-500 hover:text-blue-600">
  📦 Quản lý đơn hàng
</Link>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-500'}`}
        >
          👥 Quản lý người dùng
        </button>
        <Link to="/admin/rooms" className="pb-2 px-4 text-gray-500 hover:text-blue-600">
          🏢 Quản lý phòng
        </Link>
        <Link to="/admin/movies" className="pb-2 px-4 text-gray-500 hover:text-blue-600">
          🎬 Quản lý phim
        </Link>
        <Link to="/admin/showtimes" className="pb-2 px-4 text-gray-500 hover:text-blue-600">
          🎫 Quản lý suất chiếu
        </Link>
      </div>

      {/* Rest of the component remains the same */}
      {activeTab === 'dashboard' && stats && (
        // ... giữ nguyên phần dashboard stats
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <p className="text-sm opacity-90">Tổng người dùng</p>
              <p className="text-3xl font-bold mt-2">{stats.users.total}</p>
              <p className="text-sm mt-2">Hoạt động: {stats.users.active}</p>
            </div>
            <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
              <p className="text-sm opacity-90">Tổng phim</p>
              <p className="text-3xl font-bold mt-2">{stats.movies.total}</p>
              <p className="text-sm mt-2">Đang chiếu: {stats.movies.showing}</p>
            </div>
            <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <p className="text-sm opacity-90">Suất chiếu</p>
              <p className="text-3xl font-bold mt-2">{stats.showtimes.total}</p>
              <p className="text-sm mt-2">Sắp chiếu: {stats.showtimes.upcoming}</p>
            </div>
            <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <p className="text-sm opacity-90">Doanh thu tháng này</p>
              <p className="text-3xl font-bold mt-2">{stats.revenue.totalRevenue.toLocaleString()}đ</p>
              <p className="text-sm mt-2">{stats.bookings.totalThisMonth} đơn hàng</p>
            </div>
          </div>

          {/* Revenue Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h3 className="font-semibold mb-3">Chi tiết doanh thu</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng doanh thu:</span>
                  <span className="font-semibold">{stats.revenue.totalRevenue.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng số vé đã bán:</span>
                  <span className="font-semibold">{stats.revenue.totalTickets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trung bình giá vé:</span>
                  <span className="font-semibold">{Math.round(stats.revenue.totalRevenue / (stats.revenue.totalTickets || 1)).toLocaleString()}đ</span>
                </div>
              </div>
            </div>
            <div className="card">
              <h3 className="font-semibold mb-3">Thống kê đặt vé</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng số đơn hàng:</span>
                  <span className="font-semibold">{stats.revenue.totalBookings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Đơn hàng trong tháng:</span>
                  <span className="font-semibold">{stats.bookings.totalThisMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Đơn hàng đang hoạt động:</span>
                  <span className="font-semibold">{stats.bookings.active}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Danh sách người dùng</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Họ tên</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">SĐT</th>
                    <th className="px-4 py-2 text-left">Vai trò</th>
                    <th className="px-4 py-2 text-left">Điểm</th>
             
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">{user.fullName}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">{user.phoneNumber}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{user.loyaltyPoints}</td>
                      <td className="px-4 py-3">
                       
                      </td>
                     
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;