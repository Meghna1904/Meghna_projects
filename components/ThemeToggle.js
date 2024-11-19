import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all"
    >
      {theme === 'dark' ? (
        <Moon className="w-6 h-6 text-indigo-400" />
      ) : (
        <Sun className="w-6 h-6 text-amber-500" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;