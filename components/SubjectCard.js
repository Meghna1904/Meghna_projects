import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  Bookmark, 
  BookmarkCheck
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

  // Calculate progress percentage
  const calculateProgress = useMemo(() => {
    if (!subject.topics || subject.topics.length === 0) return 0;
    const completedTopics = subject.topics.filter(topic => topic.completed).length;
    return Math.round((completedTopics / subject.topics.length) * 100);
  }, [subject.topics]);

  const addTopic = () => {
    if (newTopic.trim()) {
      // Split topics by semicolon and trim whitespace
      const topicsToAdd = newTopic
        .split(';')
        .map(topic => topic.trim())
        .filter(topic => topic.length > 0); // Remove empty topics

      if (topicsToAdd.length > 0) {
        const updatedSubject = {
          ...subject,
          topics: [
            ...(subject.topics || []),
            ...topicsToAdd.map(topicName => ({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Ensure unique IDs
              name: topicName,
              completed: false,
              studyTime: 0,
              forReview: false
            }))
          ]
        };
        onUpdate(updatedSubject);
        setNewTopic('');
      }
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

  const toggleTopicReview = (topicId) => {
    const updatedSubject = {
      ...subject,
      topics: (subject.topics || []).map(topic => 
        topic.id === topicId 
          ? { ...topic, forReview: !topic.forReview }
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
      layout
      className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-violet-100 dark:border-gray-700 p-6 ${
        isExpanded ? 'col-span-2 row-span-2' : ''
      } hover:shadow-md transition-all duration-300`}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-violet-950 dark:text-white">
              {subject.name}
            </h2>
            {/* Progress Bar */}
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm text-violet-700 dark:text-violet-300">
                <span>{calculateProgress}% Complete</span>
                <span>{subject.topics?.filter(t => t.completed).length}/{subject.topics?.length} Topics</span>
              </div>
              <div className="w-full bg-violet-100 dark:bg-violet-900/30 rounded-full h-2.5">
                <div
                  className="bg-violet-500 dark:bg-violet-400 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${calculateProgress}%` }}
                ></div>
              </div>
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
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Add topics (separate by semicolon ;)"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTopic()}
                    className="flex-grow dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400"
                  />
                  <Button 
                    onClick={addTopic} 
                    disabled={!newTopic.trim()}
                    className="bg-violet-500 hover:bg-violet-600 text-white dark:bg-violet-600 dark:hover:bg-violet-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  Note: Use semicolon (;) to add multiple topics at once. Example: "Topic 1; Topic 2, with comma; Topic 3"
                </p>
              </div>

              {studyTimeData.topics.map((topic) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    topic.completed 
                      ? 'bg-green-100/50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                      : 'bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  } hover:shadow-md transition-all duration-300`}
                >
                  <div className="flex items-center space-x-3 flex-grow">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleTopicCompletion(topic.id)}
                      className={`p-1 rounded-full transition-colors ${
                        topic.completed
                          ? 'text-green-500 dark:text-green-400'
                          : 'text-gray-400 dark:text-gray-500 hover:text-violet-500 dark:hover:text-violet-400'
                      }`}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </motion.button>
                    <span className={`flex-grow ${
                      topic.completed
                        ? 'text-green-700 dark:text-green-300 line-through'
                        : 'text-gray-700 dark:text-gray-200'
                    }`}>
                      {topic.name}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      {formatTime(topic.studyTime || 0)}
                      {currentSession?.selectedTopic?.id === topic.id && isActive && (
                        <span className="text-green-500 dark:text-green-400 ml-1">
                          (+{formatTime(Math.floor(currentSession.accumulatedTime / 60))})
                        </span>
                      )}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleTopicReview(topic.id)}
                      className={`p-1 rounded-full transition-colors ${
                        topic.forReview
                          ? 'text-violet-500 dark:text-violet-400'
                          : 'text-gray-400 dark:text-gray-500 hover:text-violet-500 dark:hover:text-violet-400'
                      }`}
                    >
                      {topic.forReview ? (
                        <BookmarkCheck className="w-5 h-5" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteTopic(topic.id)}
                    className="ml-2 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SubjectCard;