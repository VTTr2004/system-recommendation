import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Place } from '../types';
import { apiService } from '../services/api';

interface DiscoveryProps {
  user: User;
}

const Discovery: React.FC<DiscoveryProps> = ({ user }) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [ratings, setRatings] = useState<Record<string, { avg: string; count: number }>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  const fetchData = async (query?: string) => {
    setLoading(true);
    const [recResults, ratingResults] = await Promise.all([
      apiService.getRecommendations({
        user_id: user.user_id,
        query: query || undefined
      }),
      apiService.getPlaceRatings()
    ]);
    setPlaces(recResults);
    setRatings(ratingResults);
    setLoading(false);
  };

  // Khi route /discovery được truy cập hoặc user.user_id thay đổi
  useEffect(() => {
    if (location.pathname === '/discovery') {
      setAiQuery('');
      setSearchTerm('');
      fetchData(); // gọi lại API từ đầu
    }
  }, [location.pathname, user.user_id]);

  const handleAiSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(aiQuery);
  };

  // Filter local
  const filteredPlaces = places.filter(p =>
    p.place_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (avg: string) => {
    const rating = parseFloat(avg) || 0;
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < Math.floor(rating) ? "text-yellow-400 text-sm" : "text-gray-300 text-sm"}>
            ★
          </span>
        ))}
        <span className="text-xs font-bold text-gray-600 ml-1">{avg}</span>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* AI Search Form */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Khám phá vùng đất mới</h1>
        <p className="opacity-80">Những địa điểm bạn chưa từng đặt chân đến đang chờ đợi.</p>
        <form onSubmit={handleAiSearch} className="mt-6 flex flex-col md:flex-row gap-2">
          <input
            type="text"
            placeholder="Bạn muốn đi đâu? (Tìm kiếm bằng AI...)"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            className="flex-1 p-4 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-300"
          />
          <button
            type="submit"
            className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg"
          >
            {aiQuery ? 'Tìm kiếm AI' : 'Gợi ý cho tôi'}
          </button>
        </form>
      </div>

      {/* Filter + Xóa bộ lọc */}
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Danh sách đề xuất</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Lọc theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border p-2 pl-8 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-2 top-2.5 opacity-40">🔍</span>
          </div>
          <button
            onClick={async () => {
              setSearchTerm('');
              setAiQuery('');
              const allPlaces = await apiService.getPlaces();
              setPlaces(allPlaces);
            }}
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Place list */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Đang tìm kiếm những nơi tốt nhất...</div>
      ) : filteredPlaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlaces.map(place => {
            const placeRating = ratings[place.place_id] || { avg: '0.0', count: 0 };
            return (
              <div key={place.place_id} className="bg-white rounded-2xl overflow-hidden shadow-md border hover:shadow-xl transition flex flex-col group">
                <div className="relative overflow-hidden h-48">
                  <img
                    src={place.thumb_url}
                    alt={place.place_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-white/95 px-2 py-1 rounded-md shadow-sm">
                    {renderStars(placeRating.avg)}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-bold">{place.place_name}</h3>
                  </div>
                  <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">
                    <span>📍</span> {place.address}
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">{place.description}</p>
                  <div className="mt-auto pt-4 border-t flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">{placeRating.count} đánh giá</span>
                    <Link
                      to={`/place/${place.place_id}`}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition text-sm font-bold"
                    >
                      Chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed">
          <p className="text-gray-500 text-lg">Không tìm thấy địa điểm nào phù hợp.</p>
        </div>
      )}
    </div>
  );
};

export default Discovery;
