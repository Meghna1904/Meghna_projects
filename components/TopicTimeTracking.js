import React, { useState } from 'react';
import { Clock, ArrowUp, X, Bookmark, BookmarkCheck } from 'lucide-react';
import { Dialog, Tab } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';

const TopicTimeTracking = ({ open, onClose, subjects, onReviewLater }) => {
  const [selectedTab, setSelectedTab] = useState('most-studied');

  // Get all topics with their study time and subject name
  const getAllTopics = () => {
    const allTopics = [];
    subjects.forEach(subject => {
      subject.topics.forEach(topic => {
        allTopics.push({
          name: topic.name,
          studyTime: topic.studyTime || 0,
          subjectName: subject.name,
          lastStudied: topic.lastStudied,
          forReview: topic.forReview || false,
          id: topic.id
        });
      });
    });
    
    return allTopics;
  };

  const topics = getAllTopics();
  const mostStudiedTopics = [...topics].sort((a, b) => b.studyTime - a.studyTime);
  const reviewTopics = topics.filter(topic => topic.forReview);

  // Format time in hours and minutes
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const TopicList = ({ topics, showRank = false }) => (
    <div className="space-y-4">
      {topics.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {showRank 
            ? "No topics studied yet. Start studying to see your progress!"
            : "No topics marked for review. Click the bookmark icon on any topic to add it here."}
        </p>
      ) : (
        topics.map((topic, index) => (
          <div 
            key={`${topic.name}-${topic.subjectName}`}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {showRank && index < 3 && (
                  <ArrowUp 
                    className={`w-4 h-4 ${
                      index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-gray-400' :
                      'text-amber-600'
                    }`}
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {topic.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {topic.subjectName}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium text-violet-600 dark:text-violet-400">
                  {formatTime(topic.studyTime)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last: {formatDate(topic.lastStudied)}
                </p>
              </div>
              <button
                onClick={() => onReviewLater(topic.subjectName, topic.name)}
                className={`p-1.5 rounded-lg transition-colors ${
                  topic.forReview
                    ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400'
                    : 'hover:bg-gray-100 text-gray-400 dark:hover:bg-gray-800 dark:text-gray-500'
                }`}
                title={topic.forReview ? "Remove from review list" : "Add to review later"}
              >
                {topic.forReview ? (
                  <BookmarkCheck className="w-5 h-5" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <Dialog.Panel className="relative w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <Dialog.Title className="text-lg font-semibold dark:text-violet-100">
              Topics Overview
            </Dialog.Title>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <Tab.Group selectedIndex={selectedTab === 'most-studied' ? 0 : 1} onChange={index => setSelectedTab(index === 0 ? 'most-studied' : 'review')}>
            <Tab.List className="flex">
              <Tab className={({ selected }) => `
                flex-1 py-3 px-4 text-sm font-medium outline-none
                ${selected 
                  ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400'
                }
              `}>
                Most Studied
              </Tab>
              <Tab className={({ selected }) => `
                flex-1 py-3 px-4 text-sm font-medium outline-none
                ${selected 
                  ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400'
                }
              `}>
                Review Later ({reviewTopics.length})
              </Tab>
            </Tab.List>
          </Tab.Group>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {selectedTab === 'most-studied' ? (
                <TopicList topics={mostStudiedTopics} showRank={true} />
              ) : (
                <TopicList topics={reviewTopics} showRank={false} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default TopicTimeTracking;
