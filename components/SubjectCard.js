import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle 
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SubjectCard = ({ subject, onUpdate, onDelete, theme }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newTopic, setNewTopic] = useState('');

  const addTopic = () => {
    if (newTopic.trim()) {
      const updatedSubject = {
        ...subject,
        topics: [
          ...(subject.topics || []),
          { 
            id: Date.now().toString(), 
            name: newTopic.trim(), 
            completed: false,
            studyTime: 0
          }
        ]
      };
      onUpdate(updatedSubject);
      setNewTopic('');
    }
  };

  const toggleTopicCompletion = (topicId) => {
    const updatedSubject = {
      ...subject,
      topics: (subject.topics || []).map(topic => 
        topic.id === topicId 
          ? { ...topic, completed: !topic.completed }
          : topic
      )
    };
    onUpdate(updatedSubject);
  };

  const deleteTopic = (topicId) => {
    const updatedSubject = {
      ...subject,
      topics: (subject.topics || []).filter(topic => topic.id !== topicId)
    };
    onUpdate(updatedSubject);
  };

  const updateTopicStudyTime = (topicId, time) => {
    const updatedSubject = {
      ...subject,
      topics: (subject.topics || []).map(topic => 
        topic.id === topicId 
          ? { ...topic, studyTime: (topic.studyTime || 0) + time }
          : topic
      )
    };
    onUpdate(updatedSubject);
  };

  const calculateCompletion = () => {
    const topics = subject.topics || [];
    if (topics.length === 0) return 0;
    const completedTopics = topics.filter(topic => topic.completed).length;
    return Math.round((completedTopics / topics.length) * 100);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 relative"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {subject.name}
          </h2>
          <div className="flex items-center mt-2">
            <div 
              className="h-2 bg-violet-200 dark:bg-gray-700 rounded-full w-32 mr-2"
            >
              <div 
                className="h-2 bg-violet-600 rounded-full" 
                style={{ width: `${calculateCompletion()}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {calculateCompletion()}%
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Total Study Time: {formatTime(subject.totalStudyTime || 0)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDelete}
            className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900"
          >
            <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Add new topic"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTopic()}
                className="flex-grow dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <Button onClick={addTopic} disabled={!newTopic.trim()}>
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>

            {(subject.topics || []).map((topic) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleTopicCompletion(topic.id)}
                    className={`p-1 rounded-full ${
                      topic.completed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </motion.button>
                  <span 
                    className={`text-sm ${
                      topic.completed 
                        ? 'line-through text-gray-500' 
                        : 'text-gray-800 dark:text-white'
                    }`}
                  >
                    {topic.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-300">
                    {formatTime(topic.studyTime || 0)}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteTopic(topic.id)}
                    className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SubjectCard;