import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ChevronDown,
  ChevronRight,
  Trash2,
  Plus,
  Clock,
  Settings,
  BarChart2,
  Calendar,
  CheckCircle
} from 'lucide-react';
import PomodoroTimer from '../components/PomodoroTimer';
import SubjectCard from '../components/SubjectCard';
import ProgressDashboard from '../components/ProgressDashboard';
import GoalSettings from '../components/GoalSettings';
import PerformanceInsights from '../components/PerformanceInsights';
import AddSubjectModal from '../components/AddSubjectModal';
import ThemeToggle from '../components/ThemeToggle';
import { calculateCompletion, formatTime } from '../utils/helpers';


export default function Home() {
  const [subjects, setSubjects] = useState([]);
  const [showPomodoroTimer, setShowPomodoroTimer] = useState(false);
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [timerState, setTimerState] = useState(null);


  // Load saved data on initial mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('syllabus-data');
      const savedTimer = localStorage.getItem('timer-state');
     
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setSubjects(parsedData.subjects || []);
        setTheme(parsedData.theme || 'light');
      }
     
      if (savedTimer) {
        const parsedTimer = JSON.parse(savedTimer);
        setTimerState(parsedTimer);
        setShowPomodoroTimer(true);
        setActiveSubject(parsedTimer.subjectId);
        setActiveTopicId(parsedTimer.topicId);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
    setLoading(false);
  }, []);


  // Save data whenever it changes
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('syllabus-data', JSON.stringify({
          subjects,
          theme
        }));
      } catch (error) {
        console.error('Error saving data:', error);
      }
    }
  }, [subjects, theme, loading]);


  // Handle timer state persistence
  useEffect(() => {
    if (timerState) {
      try {
        localStorage.setItem('timer-state', JSON.stringify(timerState));
      } catch (error) {
        console.error('Error saving timer state:', error);
      }
    } else {
      localStorage.removeItem('timer-state');
    }
  }, [timerState]);


  const handleSubjectComplete = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (subject && calculateCompletion(subject) === 100) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };


  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      const newSubject = {
        id: Date.now().toString(),
        name: newSubjectName.trim(),
        topics: [],
        totalStudyTime: 0,
        goal: null,
        progress: 0
      };
     
      setSubjects([...subjects, newSubject]);
      setNewSubjectName('');
      setIsAddSubjectModalOpen(false);
    }
  };


  const handleTimeUpdate = (timeData) => {
    // Validate timeData
    if (!timeData || typeof timeData !== 'object') {
      console.error('Invalid timeData received:', timeData);
      return;
    }


    // Default values and validation
    const {
      subjectId = activeSubject,
      topicId = activeTopicId,
      time = 0,
      type = 'work'
    } = timeData;


    // If no subject ID, don't update
    if (!subjectId) {
      console.warn('No subject ID provided for time update');
      return;
    }


    setSubjects(prevSubjects =>
      prevSubjects.map(subject => {
        if (subject.id === subjectId) {
          // Only add time if it's work time (not break time)
          const timeToAdd = type === 'work' ? time : 0;
         
          return {
            ...subject,
            totalStudyTime: (subject.totalStudyTime || 0) + timeToAdd,
            topics: Array.isArray(subject.topics) ? subject.topics.map(topic =>
              topic.id === topicId
                ? {
                    ...topic,
                    studyTime: (topic.studyTime || 0) + timeToAdd
                  }
                : topic
            ) : []
          };
        }
        return subject;
      })
    );


    // Update timer state for persistence
    setTimerState({
      subjectId,
      topicId,
      timestamp: Date.now(),
      ...timeData
    });
  };


  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
        <Head>
          <title>Modern Syllabus Tracker</title>
          <link rel="icon" href="/favicon.ico" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        </Head>


        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <header className="flex items-center justify-between mb-12">
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Syllabus Tracker
            </motion.h1>
           
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddSubjectModalOpen(true)}
                className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
              >
                <Plus className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </motion.button>


              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPomodoroTimer(!showPomodoroTimer)}
                className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
              >
                <Clock className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </motion.button>


              <ThemeToggle theme={theme} setTheme={setTheme} />
            </div>
          </header>


          <AddSubjectModal
            open={isAddSubjectModalOpen}
            onClose={() => setIsAddSubjectModalOpen(false)}
            onSave={handleAddSubject}
            subjectName={newSubjectName}
            setSubjectName={setNewSubjectName}
          />


          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <ProgressDashboard subjects={subjects} />
             
              <div className="space-y-6">
                <AnimatePresence>
                  {subjects.map((subject, index) => (
                    <SubjectCard
                      key={subject.id}
                      subject={subject}
                      onUpdate={(updatedSubject) => {
                        const newSubjects = [...subjects];
                        newSubjects[index] = updatedSubject;
                        setSubjects(newSubjects);
                        handleSubjectComplete(subject.id);
                      }}
                      onDelete={() => {
                        setSubjects(subjects.filter(s => s.id !== subject.id));
                        if (activeSubject === subject.id) {
                          setActiveSubject(null);
                          setActiveTopicId(null);
                          setTimerState(null);
                        }
                      }}
                      theme={theme}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>


            <div className="lg:col-span-4 space-y-8">
              <AnimatePresence>
                {showPomodoroTimer && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
                  >
                    <PomodoroTimer
                      subjects={subjects}
                      activeSubject={activeSubject}
                      activeTopicId={activeTopicId}
                      onTimeUpdate={handleTimeUpdate}
                      initialState={timerState}
                      onSubjectChange={setActiveSubject}
                      onTopicChange={setActiveTopicId}
                    />
                  </motion.div>
                )}
              </AnimatePresence>


              <PerformanceInsights subjects={subjects} />
             
              <GoalSettings
                subjects={subjects}
                onUpdate={(updatedSubjects) => setSubjects(updatedSubjects)}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}









