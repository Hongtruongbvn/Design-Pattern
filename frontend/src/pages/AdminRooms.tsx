import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

interface Room {
  _id: string;
  name: string;
  theater: string;
  type: string;
  capacity: number;
  isActive: boolean;
  seatLayout: {
    rows: number;
    columns: number;
  };
}

const AdminRooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    theater: '',
    type: 'standard',
    capacity: 80, // Mặc định là 80, không cho sửa
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms');
      setRooms(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách phòng');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await api.patch(`/rooms/${editingRoom._id}`, formData);
        toast.success('Cập nhật phòng thành công');
      } else {
        await api.post('/rooms', formData);
        toast.success('Thêm phòng thành công');
      }
      fetchRooms();
      setShowForm(false);
      setEditingRoom(null);
      setFormData({ name: '', theater: '', type: 'standard', capacity: 80 });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa phòng này? Các suất chiếu liên quan sẽ bị ảnh hưởng.')) {
      try {
        await api.delete(`/rooms/${id}`);
        toast.success('Xóa phòng thành công');
        fetchRooms();
      } catch (error) {
        toast.error('Xóa phòng thất bại');
      }
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      theater: room.theater,
      type: room.type,
      capacity: 80, // Luôn là 80, không cho sửa
    });
    setShowForm(true);
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      standard: { label: 'Tiêu chuẩn', color: 'bg-blue-100 text-blue-800' },
      vip: { label: 'VIP', color: 'bg-purple-100 text-purple-800' },
      imax: { label: 'IMAX', color: 'bg-red-100 text-red-800' },
      _4dx: { label: '4DX', color: 'bg-green-100 text-green-800' },
    };
    const info = types[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.color}`}>{info.label}</span>;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý phòng chiếu</h1>
        <button
          onClick={() => {
            setEditingRoom(null);
            setFormData({ name: '', theater: '', type: 'standard', capacity: 80 });
            setShowForm(!showForm);
          }}
          className="btn-primary"
        >
          {showForm ? 'Đóng' : '+ Thêm phòng'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">{editingRoom ? 'Sửa phòng' : 'Thêm phòng mới'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên phòng</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="Ví dụ: Room 1, Room A, ..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rạp</label>
              <input
                type="text"
                required
                value={formData.theater}
                onChange={(e) => setFormData({ ...formData, theater: e.target.value })}
                className="input-field"
                placeholder="Ví dụ: CGV Vincom, Lotte Mart, ..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Loại phòng</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input-field"
              >
                <option value="standard">Tiêu chuẩn</option>
                <option value="vip">VIP</option>
                <option value="imax">IMAX</option>
                <option value="_4dx">4DX</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sức chứa (số ghế)</label>
              <input
                type="number"
                required
                value={80}
                disabled
                className="input-field bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ Số ghế được cố định là 80 ghế (8 hàng A-H, mỗi hàng 10 ghế)
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Sơ đồ ghế: A1-A10, B1-B10, C1-C10, D1-D10, E1-E10, F1-F10, G1-G10, H1-H10
              </p>
            </div>
            <button type="submit" className="btn-primary w-full">
              {editingRoom ? 'Cập nhật' : 'Thêm phòng'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="text-gray-500">Chưa có phòng chiếu nào</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary mt-4"
          >
            Thêm phòng đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room._id} className="card hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg">{room.name}</h3>
                {getTypeLabel(room.type)}
              </div>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Rạp:</span> {room.theater}
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Sức chứa:</span> 80 ghế (cố định)
              </p>
              <p className="text-gray-600 mb-4">
                <span className="font-medium">Sơ đồ ghế:</span> 8 hàng x 10 ghế
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(room)}
                  className="flex-1 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(room._id)}
                  className="flex-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Xóa
                </button>
              </div>
              {!room.isActive && (
                <div className="mt-2 text-center">
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Đã ngừng hoạt động</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRooms;