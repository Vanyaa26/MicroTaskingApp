// components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiOutlineViewGrid,
  HiOutlineClipboardList,
  HiOutlineChartBar,
  HiOutlineLightningBolt,
  HiOutlineMenu,
  HiOutlineCog
} from 'react-icons/hi';
import {auth} from "../firebase"

const Sidebar = ({ isOpen, setIsOpen, user }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: HiOutlineViewGrid, label: 'Dashboard' },
    { path: '/tasks', icon: HiOutlineClipboardList, label: 'Tasks' },
    { path: '/collab_space', icon: HiOutlineChartBar, label: 'Collab Space' },
    { path: '/focus', icon: HiOutlineLightningBolt, label: "Let's Focus" },
  ];

  return (
    <motion.div 
      initial={{ x: -200 }}
      animate={{ x: 0 }}
      className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4">
          {isOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold text-gray-800 dark:text-white"
            >
              MicroTasking
            </motion.span>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <HiOutlineMenu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="px-4 mt-6">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center py-3 px-4 rounded-lg mb-2 transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <item.icon className="w-6 h-6" />
                {isOpen && (
                  <span className="ml-3">{item.label}</span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t dark:border-gray-700">
          <div className="flex items-center">
            <img
              src={user.photoURL || '/default-avatar.png'}
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            {isOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {user.displayName}
                </p>
                <button
                  onClick={() => auth.signOut()}
                  className="text-xs text-gray-500 hover:text-red-500"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
