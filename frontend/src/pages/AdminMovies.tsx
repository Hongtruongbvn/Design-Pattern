import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

interface Movie {
  _id: string;
  title: string;
  description: string;
  duration: number;
  genre: string[];
  posterUrl: string;
  isShowing: boolean;
  roomId?: {
    _id: string;
    name: string;
    theater: string;
  };
}

interface Room {
  _id: string;
  name: string;
  theater: string;
  capacity: number;
  type: string;
}

const AdminMovies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 0,
    genre: '',
    posterUrl: '',
    roomId: '',
  });

  useEffect(() => {
    fetchMovies();
    fetchRooms();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await api.get('/movies');
      setMovies(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách phim');
    } finally {
      setLoading(false);
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
      const data = {
        ...formData,
        genre: formData.genre.split(',').map(g => g.trim()),
        roomId: formData.roomId,
      };
      if (editingMovie) {
        await api.patch(`/movies/${editingMovie._id}`, data);
        toast.success('Cập nhật phim thành công');
      } else {
        await api.post('/movies', data);
        toast.success('Thêm phim thành công');
      }
      fetchMovies();
      setShowForm(false);
      setEditingMovie(null);
      setFormData({ title: '', description: '', duration: 0, genre: '', posterUrl: '', roomId: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa phim này?')) {
      try {
        await api.delete(`/movies/${id}`);
        toast.success('Xóa phim thành công');
        fetchMovies();
      } catch (error) {
        toast.error('Xóa phim thất bại');
      }
    }
  };

  const handleRemoveFromCinema = async (id: string) => {
    if (confirm('Gỡ phim này khỏi rạp?')) {
      try {
        await api.post(`/movies/${id}/remove-from-cinema`);
        toast.success('Đã gỡ phim khỏi rạp');
        fetchMovies();
      } catch (error) {
        toast.error('Gỡ phim thất bại');
      }
    }
  };

  const handleEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description,
      duration: movie.duration,
      genre: movie.genre.join(', '),
      posterUrl: movie.posterUrl,
      roomId: movie.roomId?._id || '',
    });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý phim</h1>
        <button
          onClick={() => {
            setEditingMovie(null);
            setFormData({ title: '', description: '', duration: 0, genre: '', posterUrl: '', roomId: '' });
            setShowForm(!showForm);
          }}
          className="btn-primary"
        >
          {showForm ? 'Đóng' : '+ Thêm phim'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">{editingMovie ? 'Sửa phim' : 'Thêm phim mới'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên phim</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thời lượng (phút)</label>
              <input
                type="number"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thể loại (cách nhau bằng dấu phẩy)</label>
              <input
                type="text"
                required
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="input-field"
                placeholder="Hành động, Hài, Tình cảm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phòng chiếu</label>
              <select
                required
                value={formData.roomId}
                onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                className="input-field"
              >
                <option value="">Chọn phòng chiếu</option>
                {rooms.map(room => (
                  <option key={room._id} value={room._id}>
                    {room.theater} - {room.name} ({room.type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL Poster</label>
              <input
                type="url"
                required
                value={formData.posterUrl}
                onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                className="input-field"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              {editingMovie ? 'Cập nhật' : 'Thêm phim'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <div key={movie._id} className="card">
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-48 object-cover rounded-lg mb-4" />
              <h3 className="font-bold text-lg mb-2">{movie.title}</h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{movie.description}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {movie.genre.map((g, i) => (
                  <span key={i} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                    {g}
                  </span>
                ))}
              </div>
              {movie.roomId && (
                <p className="text-sm text-gray-500 mb-2">
                  Phòng: {movie.roomId.theater} - {movie.roomId.name}
                </p>
              )}
              <p className="text-sm text-gray-500 mb-4">Thời lượng: {movie.duration} phút</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(movie)}
                  className="flex-1 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Sửa
                </button>
                {movie.isShowing && (
                  <button
                    onClick={() => handleRemoveFromCinema(movie._id)}
                    className="flex-1 bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
                  >
                    Gỡ khỏi rạp
                  </button>
                )}
                <button
                  onClick={() => handleDelete(movie._id)}
                  className="flex-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Xóa
                </button>
              </div>
              {movie.isShowing && (
                <div className="mt-2 text-center">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Đang chiếu</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMovies;