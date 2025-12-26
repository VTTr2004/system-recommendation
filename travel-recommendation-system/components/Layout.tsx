
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="text-xl font-bold text-blue-600">TravelDiscovery</Link>
        <div className="flex items-center gap-6">
          {user ? (
            <>
              {user.role === 'admin' ? (
                <>
                  <Link to="/admin/users" className="hover:text-blue-600 font-medium">Thống kê Người dùng</Link>
                  <Link to="/admin/places" className="hover:text-blue-600 font-medium">Thống kê Địa điểm</Link>
                </>
              ) : (
                <>
                  <Link to="/" className="hover:text-blue-600 font-medium">Trang chủ</Link>
                  <Link to="/discovery" className="hover:text-blue-600 font-medium">Khám phá</Link>
                </>
              )}
              <div className="flex items-center gap-3 border-l pl-6">
                <img src={user.avatar_url} alt="avatar" className="w-8 h-8 rounded-full border" />
                <span className="text-sm font-semibold">{user.full_name}</span>
                <button 
                  onClick={onLogout}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Đăng xuất
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Đăng nhập</Link>
          )}
        </div>
      </nav>
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
      <footer className="bg-gray-100 p-8 text-center text-gray-500 border-t">
        <p>&copy; 2024 Travel Discovery System. Dự án đồ án.</p>
      </footer>
    </div>
  );
};

export default Layout;
