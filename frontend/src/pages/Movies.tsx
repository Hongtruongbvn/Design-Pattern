import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
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

const Movies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  useEffect(() => {
    fetchMovies();
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

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !selectedGenre || movie.genre.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  const allGenres = Array.from(new Set(movies.flatMap(m => m.genre)));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Danh sách phim</h1>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Tìm kiếm phim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field flex-1"
          />
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="input-field w-full md:w-48"
          >
            <option value="">Tất cả thể loại</option>
            {allGenres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy phim nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <div key={movie._id} className="card hover:shadow-xl transition cursor-pointer group">
              <div className="relative overflow-hidden rounded-lg">
                <img 
                  src={movie.posterUrl} 
                  alt={movie.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
                />
                {movie.isShowing && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Đang chiếu
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{movie.title}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{movie.description}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {movie.genre.slice(0, 3).map((g, i) => (
                    <span key={i} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                      {g}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-gray-500">{movie.duration} phút</span>
                  <Link
                    to={`/showtimes?movie=${movie._id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                  >
                    Đặt vé
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Movies;