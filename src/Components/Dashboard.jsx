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
      className="p-4 lg:p-6 w-full overflow-x-hidden"
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 lg:p-8">
          {/* Profile Section */}
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <img 
                src={photoURL} 
                alt="Profile" 
                className="w-20 h-20 lg:w-24 lg:h-24 rounded-full object-cover ring-4 ring-blue-500"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="hidden"
                />
                <span className="text-white text-xs lg:text-sm">Change Photo</span>
              </label>
            </motion.div>
            
            <div className="text-center lg:text-left">
              <motion.h1 
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                className="text-xl lg:text-3xl font-bold dark:text-white"
              >
                {greeting}, {user?.displayName || 'User'}!
              </motion.h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm lg:text-base">
                Let's make today productive
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-6 lg:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-4 lg:p-6 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:cursor-pointer"
              onClick={handleCollabSpace}
            >
              <h3 className="text-lg lg:text-xl font-semibold mb-2">Collaborative Spaces</h3>
              <p className="text-sm lg:text-base">Create shared workspaces for team tasks and projects</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="p-4 lg:p-6 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white"
            >
              <h3 className="text-lg lg:text-xl font-semibold mb-2">AI Task Assistant</h3>
              <p className="text-sm lg:text-base">Get smart suggestions for task prioritization and scheduling</p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};



export default Dashboard;
