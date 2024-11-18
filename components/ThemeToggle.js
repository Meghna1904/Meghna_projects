import React from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

const ThemeToggle = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
    >
      <Settings className="w-6 h-6 text-violet-600 dark:text-violet-400" />
    </motion.button>
  );
};

export default ThemeToggle;