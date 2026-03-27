import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminMovies from './pages/AdminMovies';
import AdminShowtimes from './pages/AdminShowtimes';
import AdminRooms from './pages/AdminRooms';
import Bookings from './pages/Bookings';
import Movies from './pages/Movies';
import Showtimes from './pages/Showtimes';
import SeatSelection from './pages/SeatSelection';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import useAuthStore from './store/authStore';
import AdminOrders from './pages/AdminOrders';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const App: React.FC = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Toaster position="top-right" />
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/showtimes" element={<Showtimes />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> {/* ✅ Đã chuyển ra ngoài */}
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected user routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/seat-selection" element={<SeatSelection />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
          </Route>
          
          {/* Protected admin routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/rooms" element={<AdminRooms />} />
            <Route path="/admin/movies" element={<AdminMovies />} />
            <Route path="/admin/showtimes" element={<AdminShowtimes />} />
          </Route>
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;