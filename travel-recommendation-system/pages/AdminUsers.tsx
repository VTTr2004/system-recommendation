
import React, { useState } from 'react';
import { apiService } from '../services/api';
import { Comment } from '../types';

const AdminUsers: React.FC = () => {
  const [username, setUsername] = useState('');
  const [stats, setStats] = useState<{ count: number; comments: Comment[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // In reality, these might be 2 parallel calls
    const userComments = await apiService.getCommentsByUser(username);
    const visited = await apiService.getVisitedPlaces(username); // simplified: using username as mock ID if needed
    
    setStats({
      count: visited.length || 0,
      comments: userComments
    });
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold border-b pb-4">Quản lý & Thống kê Người dùng</h1>
      
      <form onSubmit={handleSearch} className="flex gap-2">
        <input 
          type="text" 
          placeholder="Nhập username (ví dụ: user_a)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="flex-1 border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
          Tra cứu
        </button>
      </form>

      {loading && <p>Đang tải dữ liệu...</p>}

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-xl border shadow-sm text-center">
              <h3 className="text-gray-500 text-sm uppercase font-bold tracking-wider">Số địa điểm đã đi</h3>
              <p className="text-5xl font-black text-blue-600 mt-2">{stats.count}</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="font-bold">Nhận xét của người dùng</h3>
              </div>
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {stats.comments.length > 0 ? (
                  stats.comments.map(c => (
                    <div key={c.id} className="p-4 space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-blue-600">{c.place_name || 'Địa điểm #' + c.place_id}</span>
                        <span className="text-xs text-gray-400">{c.date}</span>
                      </div>
                      <div className="flex gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < c.rating ? "text-yellow-400" : "text-gray-200"}>★</span>
                        ))}
                      </div>
                      <p className="text-gray-700">{c.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="p-6 text-center text-gray-500 italic">Người dùng này chưa có bình luận nào.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
