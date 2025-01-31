import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { HiMoon, HiSun } from 'react-icons/hi';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

    
  const handleCollabSpace = () => {
    navigate('/collab_space')
  }
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUser(user);
      setPhotoURL(user.photoURL || '/default-avatar.png');
      generateGreeting();
    }
  }, []);

  useEffect(() => {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, [darkMode]);

  const generateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const storageRef = ref(storage, `profile_pictures/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL: url });
      setPhotoURL(url);
    }
  };
  useEffect(() => {
    if (user) {
        // console.log("Current user:", user); // Debug 
        // console.log("Display name:", user.displayName); // Debug 
    }
}, [user]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-4xl mx-auto ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`"
    >
        <button
                onClick={() => setDarkMode(!darkMode)}
                className="fixed top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700"
              >
                {darkMode ? (
                  <HiSun className="w-6 h-6 text-yellow-500" />
                ) : (
                  <HiMoon className="w-6 h-6 text-gray-700" />
                )}
              </button>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative group"
          >
            <img 
              src={photoURL} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-500"
            />
            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="hidden"
              />
              <span className="text-white text-sm">Change Photo</span>
            </label>
          </motion.div>
          
          <div>
            <motion.h1 
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              className="text-3xl font-bold dark:text-white"
            >
              {greeting}, {user?.displayName || 'User'}!
            </motion.h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Let's make today productive
            </p>
          </div>
        </div>

      
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white"
          >
            <h3 className="text-xl font-semibold mb-2">Focus Mode</h3>
            <p>Enable distraction-free task management with ambient sounds</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 text-white"
          >
            <h3 className="text-xl font-semibold mb-2">Task Insights</h3>
            <p>View your productivity patterns and task completion trends</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:cursor-pointer"
            onClick={handleCollabSpace}
          >
            <h3 className="text-xl font-semibold mb-2">Collaborative Spaces</h3>
            <p>Create shared workspaces for team tasks and projects</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white"
          >
            <h3 className="text-xl font-semibold mb-2">AI Task Assistant</h3>
            <p>Get smart suggestions for task prioritization and scheduling</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
