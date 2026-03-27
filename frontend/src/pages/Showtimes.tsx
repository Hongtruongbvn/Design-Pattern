import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Showtime {
  _id: string;
  movieId: {
    _id: string;
    title: string;
    posterUrl: string;
    duration: number;
    description: string;
  };
  roomId: {
    _id: string;
    name: string;
    theater: string;
    type: string;
  };
  startTime: string;
  endTime: string;
  basePrice: number;
  isActive: boolean;
}

const Showtimes: React.FC = () => {
  const [searchParams] = useSearchParams();
  const movieId = searchParams.get('movie');
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (movieId) {
      fetchMovie();
      fetchShowtimes();
    } else {
      toast.error('Vui lòng chọn phim trước');
      navigate('/movies');
    }
  }, [movieId, selectedDate]);

  const fetchMovie = async () => {
    try {
      const response = await api.get(`/movies/${movieId}`);
      setMovie(response.data);
    } catch (error) {
      toast.error('Không thể tải thông tin phim');
    }
  };

  const fetchShowtimes = async () => {
    try {
      let url = `/showtimes/movie/${movieId}`;
      if (selectedDate) {
        url = `/showtimes/date?date=${selectedDate}`;
      }
      const response = await api.get(url);
      setShowtimes(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách suất chiếu');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSeats = (showtimeId: string) => {
    navigate(`/seat-selection?showtime=${showtimeId}`);
  };

  const groupByTheater = showtimes.reduce((acc, showtime) => {
    const theater = showtime.roomId?.theater || 'Unknown';
    if (!acc[theater]) acc[theater] = [];
    acc[theater].push(showtime);
    return acc;
  }, {} as Record<string, Showtime[]>);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy thông tin phim</p>
        <Link to="/movies" className="btn-primary inline-block mt-4">
          Quay lại danh sách phim
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Movie Info */}
      <div className="flex gap-6 mb-8 p-4 bg-white rounded-lg shadow">
        <img 
          src={movie.posterUrl} 
          alt={movie.title} 
          className="w-32 h-48 object-cover rounded-lg"
        />
        <div>
          <h1 className="text-2xl font-bold mb-2">{movie.title}</h1>
          <p className="text-gray-600 mb-2">{movie.duration} phút</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {movie.genre?.map((g: string, i: number) => (
              <span key={i} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                {g}
              </span>
            ))}
          </div>
          <p className="text-gray-500 text-sm line-clamp-2">{movie.description}</p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Chọn ngày xem</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input-field w-full md:w-64"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Showtimes List */}
      {showtimes.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="text-gray-500">Không có suất chiếu cho ngày này</p>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-blue-600 mt-2 hover:underline"
            >
              Xem tất cả suất chiếu
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupByTheater).map(([theater, theaterShowtimes]) => (
            <div key={theater} className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🎬</span> {theater}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {theaterShowtimes.map((showtime) => (
                  <button
                    key={showtime._id}
                    onClick={() => handleSelectSeats(showtime._id)}
                    className="border-2 rounded-lg p-3 hover:border-blue-500 hover:bg-blue-50 transition text-left"
                  >
                    <div className="font-bold text-lg">
                      {format(new Date(showtime.startTime), 'HH:mm', { locale: vi })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(showtime.endTime), 'HH:mm', { locale: vi })}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {showtime.roomId?.name} • {showtime.roomId?.type === 'vip' ? 'VIP' : 'Thường'}
                    </div>
                    <div className="text-blue-600 font-semibold mt-2">
                      {showtime.basePrice.toLocaleString()}đ
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Showtimes;