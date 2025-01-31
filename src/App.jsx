// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import Auth from './Components/Auth';
import Dashboard from './Components/Dashboard';
import Sidebar from './Components/Sidebar';
import Tasks from './Components/Tasks';
import CollaborativeTask from './Components/CollaborativeTask';
import Focus from './Components/Focus';
import WeeklyPlanner from './Components/WeeklyPlanner'
import { HiMoon, HiSun } from 'react-icons/hi';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : true;
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
          <div className="flex h-screen overflow-hidden">
            {user && (
              <>
                {/* Overlay for mobile when sidebar is open */}
                {sidebarOpen && (
                  <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                  />
                )}
                <Sidebar 
                  isOpen={sidebarOpen} 
                  setIsOpen={setSidebarOpen} 
                  user={user}
                />
              </>
            )}
            
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-shrink-0 h-16 flex items-center justify-end px-4">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {darkMode ? (
                    <HiSun className="w-6 h-6 text-yellow-500" />
                  ) : (
                    <HiMoon className="w-6 h-6 text-gray-700" />
                  )}
                </button>
              </div>

              <main className={`flex-1 overflow-y-auto transition-all duration-200 
                ${user ? (sidebarOpen ? 'lg:ml-64' : 'lg:ml-20') : ''}`}
              >
                <div className="container mx-auto px-4 py-6">
                  <Routes>
                    <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
                    <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/" />} />
                    <Route path="/tasks" element={user ? <Tasks user={user} /> : <Navigate to="/" />} />
                    <Route path="/weekly_planner" element={user ? <WeeklyPlanner user={user} /> : <Navigate to="/" />} />
                    <Route path="/collab_space" element={user ? <CollaborativeTask user={user} /> : <Navigate to="/" />} />
                    <Route path="/focus" element={user ? <Focus user={user} /> : <Navigate to="/" />} />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}


export default App;
