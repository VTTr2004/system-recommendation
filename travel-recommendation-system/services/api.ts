
import { User, Place, Comment, RecommendationRequest } from '../types';
import * as MOCK from '../mock';

const BASE_URL = 'http://localhost:5000';

// Helper function to handle fetch with fallback
async function fetchWithFallback<T,>(url: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${url}`);
    if (!response.ok) throw new Error('API request failed');
    return await response.json();
  } catch (error) {
    console.warn(`Falling back to mock data for: ${url}`, error);
    return fallback;
  }
}

export const apiService = {
  // Authentication mock logic
  async login(username: string): Promise<User | null> {
    const users = await fetchWithFallback('/users', MOCK.MOCK_USERS);
    return users.find(u => u.user_name === username) || null;
  },

  async getPlaces(): Promise<Place[]> {
    return fetchWithFallback('/places', MOCK.MOCK_PLACES);
  },

  async getVisitedPlaces(userId: string): Promise<string[]> {
    const userPlaces = await fetchWithFallback(`/user_place?user_id=${userId}`, 
      MOCK.MOCK_USER_PLACES.filter(up => up.user_id === userId)
    );
    return userPlaces.map(up => up.place_id);
  },

  async getRecommendations(req: RecommendationRequest): Promise<Place[]> {
    // Both content-based and ID-based go to same endpoint
    const queryParams = new URLSearchParams({
      user_id: req.user_id,
      ...(req.query ? { query: req.query } : {})
    });
    
    try {
      const response = await fetch(`${BASE_URL}/recommendations?${queryParams.toString()}`);
      if (!response.ok) throw new Error();
      return await response.json();
    } catch {
      // Logic mock: nến không có query thì trả về danh sách chưa đi
      const all = MOCK.MOCK_PLACES;
      const visitedIds = MOCK.MOCK_USER_PLACES.filter(up => up.user_id === req.user_id).map(up => up.place_id);
      return all.filter(p => !visitedIds.includes(p.place_id));
    }
  },

  async getCommentsByPlace(placeId: string): Promise<Comment[]> {
    return fetchWithFallback(`/comments?place_id=${placeId}`, 
      MOCK.MOCK_COMMENTS.filter(c => c.place_id === placeId)
    );
  },

  async getCommentsByUser(username: string): Promise<Comment[]> {
    return fetchWithFallback(`/comments?username=${username}`, 
      MOCK.MOCK_COMMENTS.filter(c => c.username === username)
    );
  },

  async getAllComments(): Promise<Comment[]> {
    return fetchWithFallback('/comments', MOCK.MOCK_COMMENTS);
  },

  // Added helper to calculate ratings mapping
  async getPlaceRatings(): Promise<Record<string, { avg: string; count: number }>> {
    const comments = await this.getAllComments();
    const ratings: Record<string, { total: number; count: number }> = {};
    
    comments.forEach(c => {
      if (!ratings[c.place_id]) {
        ratings[c.place_id] = { total: 0, count: 0 };
      }
      ratings[c.place_id].total += c.rating;
      ratings[c.place_id].count += 1;
    });

    const result: Record<string, { avg: string; count: number }> = {};
    Object.keys(ratings).forEach(id => {
      result[id] = {
        avg: (ratings[id].total / ratings[id].count).toFixed(1),
        count: ratings[id].count
      };
    });
    return result;
  }
};
