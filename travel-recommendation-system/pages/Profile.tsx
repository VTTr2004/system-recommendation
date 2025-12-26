
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Place } from '../types';
import { apiService } from '../services/api';

interface ProfileProps {
  user: User;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [visitedPlaces, setVisitedPlaces] = useState<Place[]>([]);
  const [ratings, setRatings] = useState<Record<string, { avg: string; count: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [allPlaces, visitedIds, ratingData] = await Promise.all([
        apiService.getPlaces(),
        apiService.getVisitedPlaces(user.user_id),
        apiService.getPlaceRatings()
      ]);
      const filtered = allPlaces.filter(p => visitedIds.includes(p.place_id));
      setVisitedPlaces(filtered);
      setRatings(ratingData);
      setLoading(false);
    };
    loadData();
  }, [user.user_id]);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center gap-6">
        <img src={user.avatar_url} alt="avatar" className="w-24 h-24 rounded-full border-4 border-blue-100" />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{user.full_name}</h1>
          <p className="text-gray-500">@{user.user_name}</p>
          <div className="mt-2 inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
            Thành viên chính thức
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">📍</span> Các địa điểm đã đi
        </h2>
        {loading ? (
          <p className="text-gray-500 italic">Đang tải hành trình của bạn...</p>
        ) : visitedPlaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visitedPlaces.map(place => {
              const r = ratings[place.place_id] || { avg: '0.0', count: 0 };
              return (
                <Link 
                  key={place.place_id} 
                  to={`/place/${place.place_id}`}
                  className="bg-white p-4 rounded-xl shadow-sm border flex flex-col gap-2 hover:border-blue-400 hover:shadow-md transition group"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gray-800 truncate group-hover:text-blue-600 transition">{place.place_name}</span>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold whitespace-nowrap">✓ ĐÃ ĐI</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm font-bold text-gray-700">{r.avg}</span>
                    <span className="text-xs text-gray-400">({r.count} nhận xét)</span>
                  </div>
                  <div className="text-xs text-blue-500 mt-2 font-medium opacity-0 group-hover:opacity-100 transition">Xem chi tiết →</div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 italic">Bạn chưa đánh dấu địa điểm nào đã đi.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
