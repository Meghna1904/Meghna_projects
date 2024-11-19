import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle, 
  Clock
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SubjectCard = ({ 
  subject, 
  onUpdate, 
  onDelete, 
  currentSession 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newTopic, setNewTopic] = useState('');

  // Calculate real-time study time including current session
  const studyTimeData = useMemo(() => {
    let totalTime = subject.totalStudyTime || 0;
    const topics = [...(subject.topics || [])];

    // Add current session time if this subject is active
    if (currentSession?.selectedSubject?.id === subject.id && !currentSession.isBreak) {
      totalTime += Math.floor(currentSession.accumulatedTime / 60);
      
      // Update specific topic time if one is selected
      if (currentSession.selectedTopic) {
        const topicIndex = topics.findIndex(t => t.id === currentSession.selectedTopic.id);
        if (topicIndex !== -1) {
          topics[topicIndex] = {
            ...topics[topicIndex],
            studyTime: (topics[topicIndex].studyTime || 0) + Math.floor(currentSession.accumulatedTime / 60)
          };
        }
      }
    }

    return { totalTime, topics };
  }, [subject, currentSession]);

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

  // Check if this subject is currently active
  const isActive = currentSession?.selectedSubject?.id === subject.id && !currentSession?.isBreak;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 relative"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {subject.name}
            </h2>
            {isActive && (
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full animate-pulse">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center mt-2">
            <div 
              className="h-2 bg-violet-200 dark:bg-gray-700 rounded-full w-32 mr-2"
            >
              <div 
                className="h-2 bg-violet-600 rounded-full transition-all duration-300" 
                style={{ width: `${calculateCompletion()}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {calculateCompletion()}%
            </span>
          </div>
          <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            <span>
              {formatTime(studyTimeData.totalTime)}
              {isActive && (
                <span className="text-green-500 dark:text-green-400 ml-1">
                  (+{formatTime(Math.floor(currentSession.accumulatedTime / 60))})
                </span>
              )}
            </span>
          </div>
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

            {studyTimeData.topics.map((topic) => (
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
                    {isActive && currentSession.selectedTopic?.id === topic.id && (
                      <span className="text-green-500 dark:text-green-400 ml-1">
                        (+{formatTime(Math.floor(currentSession.accumulatedTime / 60))})
                      </span>
                    )}
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