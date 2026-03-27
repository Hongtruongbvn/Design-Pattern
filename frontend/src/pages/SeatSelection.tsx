import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';

interface Showtime {
  _id: string;
  movieId: {
    _id: string;
    title: string;
    posterUrl: string;
    duration: number;
  };
  roomId: {
    _id: string;
    name: string;
    theater: string;
  };
  startTime: string;
  endTime: string;
  basePrice: number;
  seats: Record<string, string>;
}

const SeatSelection: React.FC = () => {
  const [searchParams] = useSearchParams();
  const showtimeId = searchParams.get('showtime');
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đặt vé');
      navigate('/login');
      return;
    }
    if (showtimeId) {
      fetchShowtime();
    } else {
      toast.error('Không tìm thấy suất chiếu');
      navigate('/movies');
    }
  }, [showtimeId]);

  const fetchShowtime = async () => {
    try {
      const response = await api.get(`/showtimes/${showtimeId}`);
      console.log('Showtime data:', response.data);
      console.log('Seats data:', response.data.seats);
      
      const seats = response.data.seats;
      const bookedSeats = Object.keys(seats).filter(seat => seats[seat] === 'booked');
      const pendingSeats = Object.keys(seats).filter(seat => seats[seat] === 'pending');
      console.log('Booked seats:', bookedSeats);
      console.log('Pending seats:', pendingSeats);
      
      setShowtime(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Không thể tải thông tin suất chiếu');
      navigate('/movies');
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seat: string) => {
    const status = getSeatStatus(seat);
    if (status !== 'available') return;
    
    setSelectedSeats(prev => 
      prev.includes(seat) 
        ? prev.filter(s => s !== seat)
        : [...prev, seat]
    );
  };

  const getSeatStatus = (seat: string) => {
    const seatStatus = showtime?.seats[seat];
    
    if (seatStatus === 'booked') return 'booked';
    if (seatStatus === 'pending') return 'pending';
    if (selectedSeats.includes(seat)) return 'selected';
    return 'available';
  };

  const getSeatClass = (seat: string) => {
    const status = getSeatStatus(seat);
    switch (status) {
      case 'selected':
        return 'bg-green-500 text-white hover:bg-green-600 shadow-lg transform scale-105';
      case 'booked':
        return 'bg-red-500 text-white cursor-not-allowed opacity-60 line-through';
      case 'pending':
        return 'bg-yellow-500 text-white cursor-not-allowed opacity-60';
      default:
        return 'bg-gray-200 hover:bg-blue-200 cursor-pointer transition-all duration-200';
    }
  };

  const getSeatTooltip = (seat: string) => {
    const status = getSeatStatus(seat);
    switch (status) {
      case 'selected':
        return 'Đang chọn';
      case 'booked':
        return 'Đã được đặt';
      case 'pending':
        return 'Đang được giữ (chờ thanh toán)';
      default:
        return 'Ghế trống - Click để chọn';
    }
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Vui lòng chọn ghế');
      return;
    }

    setSubmitting(true);
    try {
      const bookingData = {
        showtimeId: showtimeId,
        seats: selectedSeats,
      };
      
      console.log('Sending booking data:', bookingData);
      
      const response = await api.post('/bookings', bookingData);

      console.log('Booking response:', response.data);
      const booking = response.data;
      toast.success('Đã tạo đơn đặt vé!');
      
      navigate(`/checkout?booking=${booking._id}`);
    } catch (error: any) {
      console.error('Booking error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Đặt vé thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!showtime) {
    return null;
  }

  const totalAmount = selectedSeats.length * showtime.basePrice;
  
  const seatKeys = Object.keys(showtime.seats);
  const rows = [...new Set(seatKeys.map(seat => seat.charAt(0)))].sort();
  const maxCol = Math.max(...seatKeys.map(seat => parseInt(seat.substring(1))), 0);

  const bookedSeats = seatKeys.filter(seat => showtime.seats[seat] === 'booked').length;
  const pendingSeats = seatKeys.filter(seat => showtime.seats[seat] === 'pending').length;
  const availableSeats = seatKeys.filter(seat => showtime.seats[seat] === 'available').length;

  return (
    <div>
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h1 className="text-xl font-bold">{showtime.movieId.title}</h1>
        <div className="text-gray-600 mt-2">
          <p>{showtime.roomId.theater} - {showtime.roomId.name}</p>
          <p>{new Date(showtime.startTime).toLocaleString('vi-VN')}</p>
          <p>Giá vé: {showtime.basePrice.toLocaleString()}đ</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="bg-gray-300 h-4 w-full rounded-t-lg"></div>
        <div className="text-center text-gray-500 text-sm mt-2">MÀN HÌNH</div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg text-center">
        <div className="flex justify-center gap-6 text-sm">
          <span>🟢 Ghế trống: {availableSeats}</span>
          <span>🟡 Đang giữ: {pendingSeats}</span>
          <span>🔴 Đã đặt: {bookedSeats}</span>
        </div>
      </div>

      <div className="flex justify-center mb-8 overflow-x-auto">
        <div className="inline-block">
          {rows.map(row => (
            <div key={row} className="flex mb-2">
              <div className="w-8 text-center font-bold flex items-center justify-center">{row}</div>
              {Array.from({ length: maxCol }, (_, i) => i + 1).map(col => {
                const seatNumber = `${row}${col}`;
                if (!showtime.seats[seatNumber]) return null;
                
                return (
                  <button
                    key={seatNumber}
                    onClick={() => toggleSeat(seatNumber)}
                    title={getSeatTooltip(seatNumber)}
                    className={`w-8 h-8 m-1 rounded text-xs font-medium transition-all duration-200 ${getSeatClass(seatNumber)}`}
                    disabled={getSeatStatus(seatNumber) === 'booked' || getSeatStatus(seatNumber) === 'pending'}
                  >
                    {col}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-6 mb-8 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded shadow"></div>
          <span className="text-sm">Ghế trống</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded shadow"></div>
          <span className="text-sm">Đang chọn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-500 rounded shadow opacity-60"></div>
          <span className="text-sm">Đã đặt</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-500 rounded shadow opacity-60"></div>
          <span className="text-sm">Đang giữ</span>
        </div>
      </div>

      <div className="card bg-gray-50 sticky bottom-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-gray-600">Ghế đã chọn:</p>
            <p className="font-bold text-lg">
              {selectedSeats.length === 0 ? 'Chưa có' : selectedSeats.join(', ')}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Tổng tiền:</p>
            <p className="text-2xl font-bold text-blue-600">
              {totalAmount.toLocaleString()}đ
            </p>
          </div>
          <button
            onClick={handleBooking}
            disabled={selectedSeats.length === 0 || submitting}
            className="btn-primary px-8 py-3 disabled:opacity-50"
          >
            {submitting ? 'Đang xử lý...' : 'Tiến hành đặt vé'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;