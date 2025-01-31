// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import Auth from './Components/Auth';
import Dashboard from './Components/Dashboard';
import Sidebar from './Components/Sidebar';
import Tasks from './Components/Tasks';
import CollaborativeTask from './Components/CollaborativeTask';
// import Analytics from './Components/Analytics';
import Focus from './Components/Focus';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="h-screen flex">
        {user && (
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} user={user} />
        )}
        <div className={`flex-1 transition-all duration-300 ${user ? (sidebarOpen ? 'ml-64' : 'ml-20') : ''}`}>
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/" />} />
            <Route path="/tasks" element={user ? <Tasks user={user} /> : <Navigate to="/" />} />
            <Route path="/collab_space" element={user ? <CollaborativeTask user={user} /> : <Navigate to="/" />} />
            {/* <Route path="/analytics" element={user ? <Analytics user={user} /> : <Navigate to="/" />} /> */}
            <Route path="/focus" element={user ? <Focus user={user} /> : <Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
