import React, { useEffect, useState } from 'react';
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
  };
  roomId: {
    _id: string;
    name: string;
    theater: string;
  };
  startTime: string;
  endTime: string;
  basePrice: number;
  isActive: boolean;
}

interface Movie {
  _id: string;
  title: string;
}

interface Room {
  _id: string;
  name: string;
  theater: string;
}

const AdminShowtimes: React.FC = () => {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<Showtime | null>(null);
  const [formData, setFormData] = useState({
    movieId: '',
    roomId: '',
    startTime: '',
    endTime: '',
    basePrice: 100000,
  });

  useEffect(() => {
    fetchShowtimes();
    fetchMovies();
    fetchRooms();
  }, []);

  const fetchShowtimes = async () => {
    try {
      const response = await api.get('/showtimes');
      setShowtimes(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách suất chiếu');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await api.get('/movies');
      setMovies(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách phim');
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms');
      setRooms(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách phòng');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingShowtime) {
        await api.patch(`/showtimes/${editingShowtime._id}`, formData);
        toast.success('Cập nhật suất chiếu thành công');
      } else {
        await api.post('/showtimes', formData);
        toast.success('Thêm suất chiếu thành công');
      }
      fetchShowtimes();
      setShowForm(false);
      setEditingShowtime(null);
      setFormData({ movieId: '', roomId: '', startTime: '', endTime: '', basePrice: 100000 });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleStart = async (id: string) => {
    if (confirm('Bắt đầu suất chiếu này?')) {
      try {
        await api.post(`/showtimes/${id}/start`);
        toast.success('Đã bắt đầu suất chiếu');
        fetchShowtimes();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Thao tác thất bại');
      }
    }
  };

  const handleEnd = async (id: string) => {
    if (confirm('Kết thúc suất chiếu này?')) {
      try {
        await api.post(`/showtimes/${id}/end`);
        toast.success('Đã kết thúc suất chiếu');
        fetchShowtimes();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Thao tác thất bại');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa suất chiếu này?')) {
      try {
        await api.delete(`/showtimes/${id}`);
        toast.success('Xóa suất chiếu thành công');
        fetchShowtimes();
      } catch (error) {
        toast.error('Xóa suất chiếu thất bại');
      }
    }
  };

  const handleEdit = (showtime: Showtime) => {
    setEditingShowtime(showtime);
    setFormData({
      movieId: showtime.movieId._id,
      roomId: showtime.roomId._id,
      startTime: new Date(showtime.startTime).toISOString().slice(0, 16),
      endTime: new Date(showtime.endTime).toISOString().slice(0, 16),
      basePrice: showtime.basePrice,
    });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý suất chiếu</h1>
        <button
          onClick={() => {
            setEditingShowtime(null);
            setFormData({ movieId: '', roomId: '', startTime: '', endTime: '', basePrice: 100000 });
            setShowForm(!showForm);
          }}
          className="btn-primary"
        >
          {showForm ? 'Đóng' : '+ Thêm suất chiếu'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">{editingShowtime ? 'Sửa suất chiếu' : 'Thêm suất chiếu mới'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phim</label>
              <select
                required
                value={formData.movieId}
                onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
                className="input-field"
              >
                <option value="">Chọn phim</option>
                {movies.map(movie => (
                  <option key={movie._id} value={movie._id}>{movie.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phòng chiếu</label>
              <select
                required
                value={formData.roomId}
                onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                className="input-field"
              >
                <option value="">Chọn phòng</option>
                {rooms.map(room => (
                  <option key={room._id} value={room._id}>{room.theater} - {room.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thời gian bắt đầu</label>
              <input
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thời gian kết thúc</label>
              <input
                type="datetime-local"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Giá vé (VNĐ)</label>
              <input
                type="number"
                required
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: parseInt(e.target.value) })}
                className="input-field"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              {editingShowtime ? 'Cập nhật' : 'Thêm suất chiếu'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Phim</th>
                <th className="px-4 py-3 text-left">Rạp - Phòng</th>
                <th className="px-4 py-3 text-left">Thời gian</th>
                <th className="px-4 py-3 text-left">Giá vé</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {showtimes.map((showtime) => (
                <tr key={showtime._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{showtime.movieId?.title}</div>
                  </td>
                  <td className="px-4 py-3">
                    {showtime.roomId?.theater} - {showtime.roomId?.name}
                  </td>
                  <td className="px-4 py-3">
                    <div>{format(new Date(showtime.startTime), 'dd/MM/yyyy', { locale: vi })}</div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(showtime.startTime), 'HH:mm', { locale: vi })} -{' '}
                      {format(new Date(showtime.endTime), 'HH:mm', { locale: vi })}
                    </div>
                  </td>
                  <td className="px-4 py-3">{showtime.basePrice.toLocaleString()}đ</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      showtime.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {showtime.isActive ? 'Đang chiếu' : 'Chưa chiếu'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {!showtime.isActive && (
                        <button
                          onClick={() => handleStart(showtime._id)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                        >
                          Bắt đầu
                        </button>
                      )}
                      {showtime.isActive && (
                        <button
                          onClick={() => handleEnd(showtime._id)}
                          className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
                        >
                          Kết thúc
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(showtime)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(showtime._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminShowtimes;