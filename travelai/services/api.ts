import { MOCK_USER, MOCK_PLACES, MOCK_COMMENTS, MOCK_SUMMARY } from '../mock';
import { User, Place, Comment } from '../types';

const API_BASE_URL = 'http://localhost:5000'; // Backend URL

// Helper to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Generic request handler with fallback
async function request<T>(path: string, method: 'GET' | 'POST', body?: any): Promise<T> {
  try {
    const token = localStorage.getItem("token");

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}), // <--- chữ A hoa quan trọng
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    };

    const response = await fetch(`${API_BASE_URL}${path}`, options);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return await response.json();

  } catch (error) {
    console.warn(`[API Fail] ${method} ${path} - Falling back to MOCK data.`, error);
    await delay(500);

    // --- MOCK FALLBACK LOGIC ---
    if (path === '/summary') return { content: MOCK_SUMMARY } as T;
    if (path === '/login' && method === 'POST') return { user: MOCK_USER, token: MOCK_USER.user_name } as T;
    if (path === '/user/profile') return MOCK_USER as T;
    if (path === '/user/visited-places') return [MOCK_PLACES[0]] as T;
    if (path === '/places') return MOCK_PLACES.slice(0, 2) as T;
    if (path === '/ai/recommend' && method === 'POST') return [MOCK_PLACES[2]] as T;
    if (path.startsWith('/places/') && path.endsWith('/info')) {
      const id = path.split('/')[2];
      const place = MOCK_PLACES.find(p => p.place_id === id);
      return (place || MOCK_PLACES[0]) as T;
    }
    if (path.startsWith('/places/') && path.endsWith('/content')) {
      const id = path.split('/')[2];
      const place = MOCK_PLACES.find(p => p.place_id === id);
      return { content: place?.content || MOCK_SUMMARY } as T;
    }
    if (path.startsWith('/places/') && path.endsWith('/comments')) return MOCK_COMMENTS as T;

    throw new Error('Endpoint not mocked');
  }
}

// API wrapper
export const api = {
  getSummary: () => request<{ content: string }>('/summary', 'GET'),
  login: async (username: string) => {
    const res = await request<{ user: User, token: string }>('/login', 'POST', { username });
    localStorage.setItem("token", res.token); // <--- lưu token sau login
    return res;
  },
  getProfile: () => request<User>('/user/profile', 'GET'),
  getVisitedPlaces: () => request<Place[]>('/user/visited-places', 'GET'),
  getPlaces: () => request<Place[]>('/places', 'GET'),
  getRecommendations: () => request<Place[]>('/ai/recommend', 'POST'),
  getPlaceInfo: (id: string) => request<Place>(`/places/${id}/info`, 'GET'),
  getPlaceContent: (id: string) => request<{ content: string }>(`/places/${id}/content`, 'GET'),
  getPlaceComments: (id: string) => request<Comment[]>(`/places/${id}/comments`, 'GET'),
};
