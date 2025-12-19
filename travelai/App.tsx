import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { api } from './services/api';
import { User, Place, Comment } from './types';
import { LogIn, MapPin, Calendar, MessageSquare, User as UserIcon, Wand2, ArrowLeft } from 'lucide-react';

// --- Shared Components ---

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Pages ---

// 1. LOGIN PAGE
const LoginPage = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryContent, setSummaryContent] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    try {
      const res = await api.login(username);
      onLogin(res.user);
    } catch (err) {
      console.error(err);
      alert('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoClick = async () => {
    setShowSummary(true);
    setSummaryLoading(true);
    try {
      const res = await api.getSummary();
      setSummaryContent(res.content);
    } catch (error) {
      setSummaryContent('Failed to load summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50">
      {/* 1.1 Logo */}
      <div 
        onClick={handleLogoClick}
        className="cursor-pointer mb-8 text-center transition-transform hover:scale-105"
      >
        <div className="bg-blue-600 text-white p-4 rounded-full inline-block mb-2 shadow-lg">
          <MapPin size={48} />
        </div>
        <h1 className="text-4xl font-bold text-blue-900">TravelAI</h1>
        <p className="text-blue-500 text-sm mt-1">Click logo for info</p>
      </div>

      {/* 1.2 Login Form */}
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Welcome Back</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isLoading ? 'Logging in...' : <><LogIn size={20} /> Login</>}
          </button>
        </form>
      </div>

      <Modal isOpen={showSummary} onClose={() => setShowSummary(false)} title="About TravelAI">
        {summaryLoading ? <LoadingSpinner /> : (
          <div className="prose prose-sm text-gray-700">
            <ReactMarkdown>{summaryContent}</ReactMarkdown>
          </div>
        )}
      </Modal>
    </div>
  );
};

// 2. DASHBOARD PAGE
const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'visited' | 'new'>('visited');
  const [visitedPlaces, setVisitedPlaces] = useState<Place[]>([]);
  const [newPlaces, setNewPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommending, setRecommending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userData, visitedData, placesData] = await Promise.all([
          api.getProfile(),
          api.getVisitedPlaces(),
          api.getPlaces()
        ]);
        setUser(userData);
        setVisitedPlaces(visitedData);
        setNewPlaces(placesData);
      } catch (error) {
        console.error("Dashboard fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAIRecommend = async () => {
    setRecommending(true);
    try {
      const recommendations = await api.getRecommendations();
      // Thay vì append, ghi đè luôn
      setNewPlaces(recommendations);
    } catch (error) {
      console.error(error);
      alert('AI Recommendation failed');
    } finally {
      setRecommending(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 2.1 User Profile Header (20% height approx) */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-6 flex items-center gap-4">
          <img 
            src={user?.avatar_url || 'https://via.placeholder.com/150'} 
            alt="Avatar" 
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-sm"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.full_name}</h2>
            <p className="text-gray-500 text-sm">@{user?.user_name}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-6 flex gap-8">
          <button
            onClick={() => setActiveTab('visited')}
            className={`pb-3 font-medium text-sm transition border-b-2 ${
              activeTab === 'visited' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            History Visited
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`pb-3 font-medium text-sm transition border-b-2 ${
              activeTab === 'new' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            New Trip
          </button>
        </div>
      </div>

      {/* 2.2 Main Content (80%) */}
      <div className="max-w-4xl mx-auto p-6">
        {activeTab === 'visited' ? (
          <div className="space-y-4">
            {visitedPlaces.length === 0 && <p className="text-gray-500 italic">No visited places yet.</p>}
            {visitedPlaces.map(place => (
              <Link to={`/places/${place.place_id}`} key={place.place_id} className="block group">
                 <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
                    <div className="bg-green-100 p-2 rounded-lg text-green-600">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition">{place.place_name}</h3>
                      <p className="text-sm text-gray-500 truncate">{place.address}</p>
                    </div>
                 </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Explore Destinations</h3>
              <button 
                onClick={handleAIRecommend}
                disabled={recommending}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition disabled:opacity-50"
              >
                {recommending ? <LoadingSpinner /> : <><Wand2 size={16} /> AI Recommend</>}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {newPlaces.map(place => (
                <Link to={`/places/${place.place_id}`} key={place.place_id} className="block group">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition h-full flex flex-col">
                    <div className="h-40 overflow-hidden">
                      <img src={place.thumb_url} alt={place.place_name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-gray-800 text-lg mb-1">{place.place_name}</h3>
                      <p className="text-sm text-gray-500 mb-2 flex items-start gap-1">
                        <MapPin size={14} className="mt-1 flex-shrink-0" /> {place.address}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">{place.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 3. PLACE DETAIL PAGE
const PlaceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [place, setPlace] = useState<Place | null>(null);
  const [content, setContent] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [info, contentRes, commentsRes] = await Promise.all([
          api.getPlaceInfo(id),
          api.getPlaceContent(id),
          api.getPlaceComments(id)
        ]);
        setPlace(info);
        setContent(contentRes.content);
        setComments(commentsRes);
      } catch (error) {
        console.error("Detail fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!place) return <div className="text-center p-10">Place not found.</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Image */}
      <div className="h-64 md:h-80 w-full relative">
        <img src={place.thumb_url} alt={place.place_name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 md:p-10">
          <button 
            onClick={() => navigate(-1)} 
            className="absolute top-6 left-6 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{place.place_name}</h1>
          <p className="text-gray-200 flex items-center gap-2"><MapPin size={18} /> {place.address}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* 3.2 Content (Markdown) */}
        <div className="md:col-span-2 space-y-8">
          <div className="prose prose-blue max-w-none break-words whitespace-pre-wrap">
            {content}
          </div>
        </div>

        {/* 3.3 Comments Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-gray-50 rounded-xl p-6 sticky top-6">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <MessageSquare size={20} /> Comments
            </h3>
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm text-gray-900">@{comment.username}</span>
                    <span className="text-xs text-gray-400">{comment.date}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{comment.content}</p>
                </div>
              ))}
              {comments.length === 0 && <p className="text-gray-400 text-sm">No comments yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Router & Auth Handling ---

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Simple "Auth" check - if no user, render Login
  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/places/:id" element={<PlaceDetailPage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;