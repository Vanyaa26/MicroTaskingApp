import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';

import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { HiMoon, HiSun } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  const letterVariants = {
    initial: { y: 100, opacity: 0 },
    animate: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
      },
    }),
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/tasks');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isSignUp) {
        console.log("username is", username)
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
            displayName: username
        });
        await userCredential.user.reload();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/tasks');
    } catch (error) {
      setError(error.message);
    }
};

  return (
    <div className={`h-screen gap-[-20rem] flex flex-col items-center transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
    
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
      <div className="w-full flex justify-center items-center mt-8">
  <motion.div 
    className="flex items-center gap-2 relative"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div className="flex">
      {['M', 'I', 'C', 'R', 'O'].map((letter, i) => (
        <motion.span
          key={i}
          variants={letterVariants}
          initial="initial"
          animate="animate"
          custom={i}
          className="text-6xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          {letter}
        </motion.span>
      ))}
    </motion.div>
    <motion.div className="flex">
      {['T', 'A', 'S', 'K', 'I', 'N', 'G'].map((letter, i) => (
        <motion.span
          key={i}
          variants={letterVariants}
          initial="initial"
          animate="animate"
          custom={i + 5}
          className="text-6xl font-bold text-transparent stroke-current"
          style={{
            WebkitTextStroke: darkMode ? '2px #fff' : '2px #000',
            textShadow: darkMode 
              ? '0 0 20px rgba(255,255,255,0.1)' 
              : '0 0 20px rgba(0,0,0,0.1)'
          }}
        >
          {letter}
        </motion.span>
      ))}
    </motion.div>
    
    {/* Decorative elements */}
    <motion.div
      className="absolute -z-10"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1.2, duration: 0.5 }}
    >
      <div className="w-4 h-4 rounded-full bg-blue-500 absolute -top-6 -right-8 animate-pulse" />
      <div className="w-3 h-3 rounded-full bg-purple-500 absolute -bottom-4 -left-6 animate-bounce" />
      <div className="w-2 h-2 rounded-full bg-pink-500 absolute top-2 -left-4 animate-ping" />
    </motion.div>
  </motion.div>
</div>
     
      <div className="h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ">
      
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl ">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
              </p>
            </motion.div>

            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleGoogleSignIn}
              className="mt-6 w-full flex justify-center items-center gap-3 py-3 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <FcGoogle className="w-5 h-5" />
              <span className="text-gray-700 dark:text-gray-200">Continue with Google</span>
            </motion.button>

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with email
                </span>
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleAuth}>
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                    placeholder="Username"
                  />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                    placeholder="Full Name"
                  />
                </motion.div>
              )}

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                placeholder="Email address"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                placeholder="Password"
              />

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </motion.button>
            </form>

            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="mt-4 w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
