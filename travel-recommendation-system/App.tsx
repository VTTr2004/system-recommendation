
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Discovery from './pages/Discovery';
import PlaceDetail from './pages/PlaceDetail';
import AdminUsers from './pages/AdminUsers';
import AdminPlaces from './pages/AdminPlaces';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('travel_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('travel_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('travel_user');
  };

  return (
    <HashRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />

          {/* User Routes */}
          <Route 
            path="/" 
            element={
              user ? (
                user.role === 'admin' ? <Navigate to="/admin/users" /> : <Profile user={user} />
              ) : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/discovery" 
            element={user && user.role !== 'admin' ? <Discovery user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/place/:id" 
            element={user ? <PlaceDetail /> : <Navigate to="/login" />} 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin/users" 
            element={user && user.role === 'admin' ? <AdminUsers /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/places" 
            element={user && user.role === 'admin' ? <AdminPlaces /> : <Navigate to="/login" />} 
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
