import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { toast } from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">🎬 MovieBooking</span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link to="/movies" className="text-gray-700 hover:text-blue-600 transition">
  Phim
</Link>

              <Link to="/showtimes" className="text-gray-700 hover:text-blue-600 transition">
                Lịch chiếu
              </Link>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* Dashboard Link - Cho tất cả user */}
                  <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 transition">
                    Dashboard
                  </Link>
                  
                  <span className="text-gray-700">
                    Xin chào, <span className="font-semibold">{user?.fullName}</span>
                  </span>
                  
                  <Link to="/bookings" className="text-gray-700 hover:text-blue-600 transition">
                    Vé của tôi
                  </Link>
                  
                  {/* Admin Panel - Chỉ hiển thị cho admin */}
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                      Admin Panel
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 transition"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">MovieBooking</h3>
              <p className="text-gray-300">Đặt vé xem phim trực tuyến dễ dàng và nhanh chóng</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Liên hệ</h3>
              <p className="text-gray-300">Email: support@moviebooking.com</p>
              <p className="text-gray-300">Hotline: 1900 1234</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Theo dõi</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white">Facebook</a>
                <a href="#" className="text-gray-300 hover:text-white">Instagram</a>
                <a href="#" className="text-gray-300 hover:text-white">Twitter</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 MovieBooking. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;