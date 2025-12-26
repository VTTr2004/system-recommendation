
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Place, Comment } from '../types';

const PlaceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [place, setPlace] = useState<Place | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlaceData = async () => {
      if (!id) return;
      setLoading(true);
      const [allPlaces, placeComments] = await Promise.all([
        apiService.getPlaces(),
        apiService.getCommentsByPlace(id)
      ]);
      
      const foundPlace = allPlaces.find(p => p.place_id === id);
      setPlace(foundPlace || null);
      setComments(placeComments);
      setLoading(false);
    };

    loadPlaceData();
  }, [id]);

  if (loading) return <div className="text-center py-20">Đang tải thông tin địa điểm...</div>;
  if (!place) return <div className="text-center py-20 text-red-500">Không tìm thấy địa điểm này.</div>;

  const avgRating = comments.length > 0 
    ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
    : "0.0";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button 
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:underline flex items-center gap-2 font-medium"
      >
        ← Quay lại
      </button>

      <div className="bg-white rounded-2xl overflow-hidden shadow-lg border">
        <img src={place.thumb_url} alt={place.place_name} className="w-full h-[400px] object-cover" />
        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900">{place.place_name}</h1>
              <p className="text-gray-500 text-lg flex items-center gap-2 mt-1">
                <span>📍</span> {place.address}
              </p>
            </div>
            <div className="bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-200 text-center">
              <span className="block text-2xl font-black text-yellow-700">{avgRating} ★</span>
              <span className="text-xs text-yellow-600 font-bold uppercase tracking-tighter">{comments.length} đánh giá</span>
            </div>
          </div>

          <div className="prose max-w-none text-gray-700 space-y-4">
            <p className="text-xl font-medium text-gray-800 leading-relaxed italic border-l-4 border-blue-500 pl-4">
              {place.description}
            </p>
            <div className="pt-4 border-t">
              <h3 className="text-lg font-bold mb-2">Giới thiệu chi tiết</h3>
              <p className="leading-loose whitespace-pre-line">{place.content}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-md border">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span>💬</span> Cộng đồng đánh giá
        </h2>
        
        <div className="space-y-6">
          {comments.length > 0 ? (
            comments.map(comment => (
              <div key={comment.id} className="border-b pb-6 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                      {comment.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">@{comment.username}</p>
                      <div className="flex text-yellow-400 text-sm">
                        {'★'.repeat(comment.rating)}{'☆'.repeat(5 - comment.rating)}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{comment.date}</span>
                </div>
                <p className="text-gray-600 ml-13 pl-13">{comment.content}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 italic py-4">Chưa có đánh giá nào cho địa điểm này. Hãy là người đầu tiên!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceDetail;
