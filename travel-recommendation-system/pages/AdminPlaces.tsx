
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Place, Comment } from '../types';

const AdminPlaces: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [minRating, setMinRating] = useState<number>(0);
  const [maxRating, setMaxRating] = useState<number>(5);
  const [places, setPlaces] = useState<Place[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [allPlaces, allComments] = await Promise.all([
      apiService.getPlaces(),
      apiService.getAllComments()
    ]);
    setPlaces(allPlaces);
    setComments(allComments);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculateRating = (placeId: string): number => {
    const placeComments = comments.filter(c => c.place_id === placeId);
    if (placeComments.length === 0) return 0;
    const sum = placeComments.reduce((acc, curr) => acc + curr.rating, 0);
    return parseFloat((sum / placeComments.length).toFixed(1));
  };

  const getCommentCount = (placeId: string) => comments.filter(c => c.place_id === placeId).length;

  const filteredPlaces = places.filter(p => {
    const matchesName = p.place_name.toLowerCase().includes(searchTerm.toLowerCase());
    const rating = calculateRating(p.place_id);
    const matchesRating = rating >= minRating && rating <= maxRating;
    return matchesName && matchesRating;
  });

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const selectedPlace = selectedPlaceId ? places.find(p => p.place_id === selectedPlaceId) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold border-b pb-4">Quản lý & Thống kê Địa điểm</h1>

      {selectedPlace ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row gap-6">
            <img src={selectedPlace.thumb_url} className="w-full md:w-64 h-48 object-cover rounded-lg" alt="thumb" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold">{selectedPlace.place_name}</h2>
                  <p className="text-gray-500 mb-4">{selectedPlace.address}</p>
                </div>
                <button 
                  onClick={() => setSelectedPlaceId(null)}
                  className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                >
                  Đóng chi tiết
                </button>
              </div>
              <div className="flex gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                  <span className="block text-xs uppercase text-yellow-600 font-bold">Đánh giá trung bình</span>
                  <span className="text-3xl font-black text-yellow-700">{calculateRating(selectedPlace.place_id)} / 5.0</span>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <span className="block text-xs uppercase text-blue-600 font-bold">Số lượt nhận xét</span>
                  <span className="text-3xl font-black text-blue-700">{getCommentCount(selectedPlace.place_id)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b font-bold">Lịch sử bình luận</div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {comments.filter(c => c.place_id === selectedPlace.place_id).length > 0 ? (
                comments.filter(c => c.place_id === selectedPlace.place_id).map(c => (
                  <div key={c.id} className="p-4">
                    <div className="flex justify-between font-medium">
                      <span>{c.username}</span>
                      <span className="text-xs text-gray-400">{c.date}</span>
                    </div>
                    <div className="text-yellow-400 text-xs mb-1">
                      {'★'.repeat(c.rating)}{'☆'.repeat(5-c.rating)}
                    </div>
                    <p className="text-gray-700">{c.content}</p>
                  </div>
                ))
              ) : (
                <p className="p-8 text-center text-gray-500 italic">Chưa có bình luận nào cho địa điểm này.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
            <div className="lg:col-span-2 relative">
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Tìm kiếm tên</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Nhập tên địa điểm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border p-3 pl-10 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
                <span className="absolute left-3 top-3.5 opacity-40">🔍</span>
              </div>
            </div>
            
            <div className="lg:col-span-2 bg-white border p-2 rounded-lg shadow-sm">
              <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest px-2">Khoảng đánh giá (0 - 5 ★)</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-gray-50 border rounded px-2">
                  <span className="text-xs text-gray-400 font-bold mr-2">Từ:</span>
                  <input 
                    type="number" 
                    min="0" max="5" step="1"
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full bg-transparent p-1.5 outline-none font-bold text-blue-600"
                  />
                </div>
                <span className="text-gray-300">→</span>
                <div className="flex-1 flex items-center bg-gray-50 border rounded px-2">
                  <span className="text-xs text-gray-400 font-bold mr-2">Đến:</span>
                  <input 
                    type="number" 
                    min="0" max="5" step="1"
                    value={maxRating}
                    onChange={(e) => setMaxRating(Number(e.target.value))}
                    className="w-full bg-transparent p-1.5 outline-none font-bold text-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-500">Hiển thị <strong>{filteredPlaces.length}</strong> kết quả</p>
              {(minRating > 0 || maxRating < 5) && (
                <button 
                  onClick={() => { setMinRating(0); setMaxRating(5); }}
                  className="text-xs text-red-500 hover:underline font-bold"
                >
                  Xóa bộ lọc điểm
                </button>
              )}
            </div>
            <button onClick={loadData} className="text-sm text-blue-600 hover:underline">Làm mới dữ liệu</button>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400">Đang tải dữ liệu...</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold">
                  <tr>
                    <th className="p-4 border-b">Địa điểm</th>
                    <th className="p-4 border-b">Địa chỉ</th>
                    <th className="p-4 border-b text-center">Đánh giá trung bình</th>
                    <th className="p-4 border-b text-center">Số bình luận</th>
                    <th className="p-4 border-b"></th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white">
                  {filteredPlaces.length > 0 ? (
                    filteredPlaces.map(place => {
                      const rating = calculateRating(place.place_id);
                      return (
                        <tr key={place.place_id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-bold">{place.place_name}</td>
                          <td className="p-4 text-gray-500 text-sm">{place.address}</td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full font-bold text-sm ${
                              rating >= 4 ? 'bg-green-100 text-green-700' : 
                              rating >= 3 ? 'bg-yellow-100 text-yellow-700' : 
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {rating} ★
                            </span>
                          </td>
                          <td className="p-4 text-center font-medium text-gray-600">{getCommentCount(place.place_id)}</td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => setSelectedPlaceId(place.place_id)}
                              className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
                            >
                              Thống kê chi tiết
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-gray-400 italic">
                        Không tìm thấy địa điểm nào khớp với tiêu chí lọc.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPlaces;
