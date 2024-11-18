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
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  useEffect(() => {
    const savedData = localStorage.getItem('syllabus-data');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setSubjects(parsedData.subjects || []);
      setTheme(parsedData.theme || 'light');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('syllabus-data', JSON.stringify({
        subjects,
        theme
      }));
    }
  }, [subjects, theme, loading]);

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
  onTimeUpdate={(timeData) => {
    // Update subjects state with precise tracking
    setSubjects(prevSubjects => 
      prevSubjects.map(subject => {
        if (subject.id === timeData.subjectId) {
          return {
            ...subject,
            totalStudyTime: (subject.totalStudyTime || 0) + 
              (timeData.type === 'work' ? timeData.time : 0),
            topics: subject.topics.map(topic => 
              topic.id === timeData.topicId
                ? { 
                    ...topic, 
                    studyTime: (topic.studyTime || 0) + 
                      (timeData.type === 'work' ? timeData.time : 0)
                  }
                : topic
            )
          };
        }
        return subject;
      })
    );
  }}
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