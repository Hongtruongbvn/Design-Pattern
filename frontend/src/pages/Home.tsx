import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl overflow-hidden mb-12">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative px-6 py-16 md:py-24 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Trải Nghiệm Xem Phim Tuyệt Vời
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Đặt vé xem phim trực tuyến dễ dàng, nhanh chóng và tiện lợi
          </p>
          <Link
            to="/movies"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Đặt vé ngay
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="text-4xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold mb-2">Phim đa dạng</h3>
          <p className="text-gray-600">Hàng ngàn bộ phim hay nhất, cập nhật liên tục</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="text-4xl mb-4">🎫</div>
          <h3 className="text-xl font-semibold mb-2">Đặt vé dễ dàng</h3>
          <p className="text-gray-600">Chọn ghế và thanh toán nhanh chóng chỉ vài phút</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="text-4xl mb-4">⭐</div>
          <h3 className="text-xl font-semibold mb-2">Ưu đãi hấp dẫn</h3>
          <p className="text-gray-600">Nhiều chương trình khuyến mãi và tích điểm thưởng</p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-50 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Sẵn sàng để đặt vé?</h2>
        <p className="text-gray-600 mb-6">Đăng ký ngay để nhận nhiều ưu đãi hấp dẫn</p>
        <Link
          to="/register"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium inline-block"
        >
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
};

export default Home;