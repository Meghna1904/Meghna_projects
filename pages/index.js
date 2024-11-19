import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Plus,
  Clock,
  ChartBar,
  Timer,
  Sun,
  Moon,
  BarChart2
} from 'lucide-react';
import PomodoroTimer from '../components/PomodoroTimer';
import SubjectCard from '../components/SubjectCard';
import ProgressDashboard from '../components/ProgressDashboard';
import GoalSettings from '../components/GoalSettings';
import PerformanceInsights from '../components/PerformanceInsights';
import AddSubjectModal from '../components/AddSubjectModal';
import StudyStatistics from '../components/StudyStatistics';
import TopicTimeTracking from '../components/TopicTimeTracking';
import { calculateCompletion } from '../utils/helpers';

// Utility functions for localStorage
const saveToLocalStorage = (key, value) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
};

const loadFromLocalStorage = (key, defaultValue) => {
  try {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    }
    return defaultValue;
  } catch (e) {
    console.error('Error loading from localStorage:', e);
    return defaultValue;
  }
};

export default function Home() {
  // State management with persistence
  const [subjects, setSubjects] = useState([]);
  const [showPomodoroTimer, setShowPomodoroTimer] = useState(false);
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [isTopicsModalOpen, setIsTopicsModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [studySessionActive, setStudySessionActive] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [studySessions, setStudySessions] = useState([]);
  const [showStats, setShowStats] = useState(false);

  // Load saved data on initial render
  useEffect(() => {
    const savedSubjects = loadFromLocalStorage('subjects', []);
    const savedTheme = loadFromLocalStorage('theme', 'light');
    const savedShowTimer = loadFromLocalStorage('showTimer', false);
    const savedSessions = loadFromLocalStorage('studySessions', []);
    const savedShowTopics = loadFromLocalStorage('showTopics', false);

    setSubjects(savedSubjects);
    setTheme(savedTheme);
    setShowPomodoroTimer(savedShowTimer);
    setStudySessions(savedSessions);
    setLoading(false);
  }, []);

  // Save state changes to localStorage
  useEffect(() => {
    if (!loading) {
      saveToLocalStorage('subjects', subjects);
      saveToLocalStorage('theme', theme);
      saveToLocalStorage('showTimer', showPomodoroTimer);
      saveToLocalStorage('studySessions', studySessions);
    }
  }, [subjects, theme, showPomodoroTimer, studySessions, loading]);

  // Update study sessions when new ones are added
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'studySessions') {
        setStudySessions(JSON.parse(e.newValue || '[]'));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handle subject completion with confetti
  const handleSubjectComplete = (subjectId) => {
    const subject = subjects.find((s) => s.id === subjectId);
    if (subject && calculateCompletion(subject) === 100) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#06B6D4', '#ffffff'],
      });
    }
  };

  // Add new subject
  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      const newSubject = {
        id: Date.now().toString(),
        name: newSubjectName.trim(),
        topics: [],
        totalStudyTime: 0,
        goal: null,
        progress: 0,
        createdAt: new Date().toISOString(),
      };

      setSubjects((prevSubjects) => [...prevSubjects, newSubject]);
      setNewSubjectName('');
      setIsAddSubjectModalOpen(false);
    }
  };

  // Update subject study time
  const handleTimeUpdate = (timeData) => {
    setSubjects((prevSubjects) =>
      prevSubjects.map((subject) => {
        if (subject.id === timeData.subjectId) {
          const updatedSubject = {
            ...subject,
            totalStudyTime: (subject.totalStudyTime || 0) +
              (timeData.type === 'work' ? timeData.time : 0),
            topics: subject.topics.map((topic) =>
              topic.id === timeData.topicId
                ? {
                    ...topic,
                    studyTime: (topic.studyTime || 0) +
                      (timeData.type === 'work' ? timeData.time : 0),
                    lastStudied: new Date().toISOString(),
                  }
                : topic
            ),
            lastStudied: new Date().toISOString(),
          };
          return updatedSubject;
        }
        return subject;
      })
    );
  };

  // Delete subject with confirmation
  const handleDeleteSubject = (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
      setSubjects((prevSubjects) =>
        prevSubjects.filter((subject) => subject.id !== subjectId)
      );
    }
  };

  // Update subject
  const handleUpdateSubject = (updatedSubject) => {
    setSubjects((prevSubjects) =>
      prevSubjects.map((subject) =>
        subject.id === updatedSubject.id ? updatedSubject : subject
      )
    );
    handleSubjectComplete(updatedSubject.id);
  };

  // Handle marking topics for review
  const handleReviewLater = (subjectName, topicName) => {
    setSubjects(prevSubjects => {
      return prevSubjects.map(subject => {
        if (subject.name === subjectName) {
          return {
            ...subject,
            topics: subject.topics.map(topic => {
              if (topic.name === topicName) {
                return {
                  ...topic,
                  forReview: !topic.forReview
                };
              }
              return topic;
            })
          };
        }
        return subject;
      });
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-950' : 'bg-violet-50/30'}`}>
      <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-blue-50/50 to-green-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Top Bar with Animation */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center mb-8"
          >
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold text-violet-950 dark:text-violet-100 tracking-tight"
            >
              Syllabus Tracker
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex space-x-3"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowStats(!showStats)}
                className="p-2.5 rounded-lg transition-colors
                  bg-violet-100/80 text-violet-700 hover:bg-violet-200/80
                  dark:bg-violet-900/50 dark:text-violet-200 dark:hover:bg-violet-900/70"
                title="Statistics"
              >
                <ChartBar className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsTopicsModalOpen(true)}
                className="p-2.5 rounded-lg transition-colors
                  bg-indigo-100/80 text-indigo-700 hover:bg-indigo-200/80
                  dark:bg-indigo-900/50 dark:text-indigo-200 dark:hover:bg-indigo-900/70"
                title="Most Studied Topics"
              >
                <BarChart2 className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPomodoroTimer(!showPomodoroTimer)}
                className="p-2.5 rounded-lg transition-colors
                  bg-blue-100/80 text-blue-700 hover:bg-blue-200/80
                  dark:bg-blue-900/50 dark:text-blue-200 dark:hover:bg-blue-900/70"
                title="Timer"
              >
                <Timer className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-lg transition-colors
                  bg-gray-100/80 text-gray-700 hover:bg-gray-200/80
                  dark:bg-gray-900/50 dark:text-gray-200 dark:hover:bg-gray-900/70"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddSubjectModalOpen(true)}
                className="p-2.5 rounded-lg transition-colors
                  bg-green-500 text-white hover:bg-green-600
                  dark:bg-green-900/50 dark:text-green-200 dark:hover:bg-green-900/70"
                title="Add Subject"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.div>

          <div className="space-y-8">
            {/* Statistics Modal */}
            <AnimatePresence>
              {showStats && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-8 p-4"
                >
                  <StudyStatistics studySessions={studySessions} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="p-4"
                >
                  <ProgressDashboard subjects={subjects} />
                </motion.div>

                <div className="space-y-6">
                  <AnimatePresence mode="popLayout">
                    {subjects.map((subject, index) => (
                      <motion.div
                        key={subject.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 * index }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <SubjectCard
                          subject={subject}
                          onAddTopic={(subjectId, topicName) => {
                            const updatedSubjects = subjects.map(s =>
                              s.id === subjectId
                                ? {
                                    ...s,
                                    topics: [
                                      ...(s.topics || []),
                                      {
                                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                                        name: topicName,
                                        studyTime: 0,
                                        forReview: false
                                      }
                                    ]
                                  }
                                : s
                            );
                            setSubjects(updatedSubjects);
                          }}
                          onTopicComplete={(subjectId, topicId) => {
                            const updatedSubjects = subjects.map(s =>
                              s.id === subjectId
                                ? {
                                    ...s,
                                    topics: s.topics.map(t =>
                                      t.id === topicId
                                        ? { ...t, completed: true }
                                        : t
                                    )
                                  }
                                : s
                            );
                            setSubjects(updatedSubjects);
                          }}
                          onReviewLater={(subjectName, topicName) => {
                            setSubjects(prevSubjects =>
                              prevSubjects.map(subject =>
                                subject.name === subjectName
                                  ? {
                                      ...subject,
                                      topics: subject.topics.map(topic =>
                                        topic.name === topicName
                                          ? { ...topic, forReview: !topic.forReview }
                                          : topic
                                      )
                                    }
                                  : subject
                              )
                            );
                          }}
                          onStartStudy={(subjectId, topicName) => {
                            setCurrentSession({
                              subjectId,
                              topicName,
                              startTime: Date.now(),
                              accumulatedTime: 0
                            });
                            setStudySessionActive(true);
                            setShowPomodoroTimer(true);
                          }}
                          onUpdate={handleUpdateSubject}
                          onDelete={() => handleDeleteSubject(subject.id)}
                          theme={theme}
                          studySessionActive={studySessionActive}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-8">
                {/* Pomodoro Timer */}
                <AnimatePresence>
                  {showPomodoroTimer && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4"
                    >
                      <PomodoroTimer
                        subjects={subjects}
                        onTimeUpdate={handleTimeUpdate}
                        updateSubjects={setSubjects}
                        onSessionStateChange={setStudySessionActive}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="p-4"
                >
                  <PerformanceInsights subjects={subjects} />
                </motion.div>

                {/* Most Studied Topics Modal */}
                <TopicTimeTracking 
                  open={isTopicsModalOpen}
                  onClose={() => setIsTopicsModalOpen(false)}
                  subjects={subjects}
                  onReviewLater={handleReviewLater}
                />

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 }}
                  className="p-4"
                >
                  <GoalSettings
                    subjects={subjects}
                    onUpdate={(updatedSubjects) => {
                      setSubjects(updatedSubjects);
                      saveToLocalStorage('subjects', updatedSubjects);
                    }}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Subject Modal */}
      <AnimatePresence>
        {isAddSubjectModalOpen && (
          <AddSubjectModal
            open={isAddSubjectModalOpen}
            onClose={() => setIsAddSubjectModalOpen(false)}
            onSave={handleAddSubject}
            subjectName={newSubjectName}
            setSubjectName={setNewSubjectName}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
