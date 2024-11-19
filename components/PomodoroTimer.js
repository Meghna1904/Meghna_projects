
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';


// Utility functions
const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
};


const loadFromLocalStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Error loading from localStorage:', e);
    return defaultValue;
  }
};


const formatTime = (timeInSeconds) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};


const MinimalistPomodoroTimer = ({
  subjects,
  onTimeUpdate,
  defaultWorkDuration = 25,
  defaultBreakDuration = 5,
  updateSubjects
}) => {
  // Load saved session state from localStorage
  const savedSession = loadFromLocalStorage('pomodoroSession', {
    isActive: false,
    isBreak: false,
    remainingTime: defaultWorkDuration * 60,
    selectedSubjectId: null,
    selectedTopicId: null,
    workDuration: defaultWorkDuration,
    breakDuration: defaultBreakDuration,
    accumulatedTime: 0
  });


  // State initialization
  const [time, setTime] = useState(savedSession.remainingTime);
  const [isActive, setIsActive] = useState(savedSession.isActive);
  const [isBreak, setIsBreak] = useState(savedSession.isBreak);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentSession, setCurrentSession] = useState({
    workDuration: savedSession.workDuration,
    breakDuration: savedSession.breakDuration
  });
  const [accumulatedTime, setAccumulatedTime] = useState(savedSession.accumulatedTime);


  // Timer logic
 // Update time when work or break duration changes
 useEffect(() => {
  if (!isActive) {
    setTime(isBreak ? currentSession.breakDuration * 60 : currentSession.workDuration * 60);
  }
}, [currentSession.workDuration, currentSession.breakDuration, isBreak, isActive]);

useEffect(() => {
  let interval = null;
  if (isActive && time > 0) {
    interval = setInterval(() => {
      setTime((prevTime) => prevTime - 1);
    }, 1000);
  } else if (time === 0) {
    if (!isBreak) {
      // Complete work session
      if (selectedSubject && selectedTopic) {
        onTimeUpdate({
          subjectId: selectedSubject.id,
          topicId: selectedTopic.id,
          time: currentSession.workDuration,
          type: 'work'
        });
        
        // Switch to break
        setTime(currentSession.breakDuration * 60);
        setIsBreak(true);
      }
    } else {
      // Complete break session
      onTimeUpdate({
        subjectId: selectedSubject.id,
        topicId: selectedTopic.id,
        time: currentSession.breakDuration,
        type: 'break'
      });
      
      // Reset to work session
      setTime(currentSession.workDuration * 60);
      setIsBreak(false);
    }
    setIsActive(false);
  }
  return () => clearInterval(interval);
}, [isActive, time, onTimeUpdate, selectedSubject, selectedTopic, currentSession]);

  // Keep selected subject in sync with subjects prop
  useEffect(() => {
    const currentSubject = subjects.find(s => s.id === (selectedSubject?.id || savedSession.selectedSubjectId));
    if (currentSubject) {
      setSelectedSubject(currentSubject);
     
      // Update selected topic if it exists in the updated subject
      const currentTopic = currentSubject.topics?.find(t => t.id === (selectedTopic?.id || savedSession.selectedTopicId));
      setSelectedTopic(currentTopic || null);
    } else {
      setSelectedSubject(null);
      setSelectedTopic(null);
    }
  }, [subjects, savedSession.selectedSubjectId, savedSession.selectedTopicId]);


  // Duration change handlers
  const handleWorkDurationChange = useCallback((newDuration) => {
    setCurrentSession(prev => ({
      ...prev,
      workDuration: Number(newDuration)
    }));
    if (!isActive && !isBreak) {
      setTime(Number(newDuration) * 60);
    }
  }, [isActive, isBreak]);


  const handleBreakDurationChange = useCallback((newDuration) => {
    setCurrentSession(prev => ({
      ...prev,
      breakDuration: Number(newDuration)
    }));
    if (!isActive && isBreak) {
      setTime(Number(newDuration) * 60);
    }
  }, [isActive, isBreak]);


  // Selection handlers
  const handleSubjectChange = (e) => {
    const newSubject = subjects.find(s => s.id === e.target.value);
    setSelectedSubject(newSubject || null);
    setSelectedTopic(null); // Reset topic when subject changes
   
    saveToLocalStorage('pomodoroSession', {
      ...savedSession,
      selectedSubjectId: newSubject?.id || null,
      selectedTopicId: null
    });
  };


  const handleTopicChange = (e) => {
    const newTopic = selectedSubject?.topics?.find(t => t.id === e.target.value);
    setSelectedTopic(newTopic || null);
   
    saveToLocalStorage('pomodoroSession', {
      ...savedSession,
      selectedTopicId: newTopic?.id || null
    });
  };


  // Reset handler
  const handleReset = useCallback(() => {
    setTime(currentSession.workDuration * 60);
    setIsActive(false);
    setIsBreak(false);
    setAccumulatedTime(0);
   
    saveToLocalStorage('pomodoroSession', {
      ...savedSession,
      isActive: false,
      isBreak: false,
      remainingTime: currentSession.workDuration * 60,
      accumulatedTime: 0
    });
  }, [currentSession.workDuration, savedSession]);


  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md mx-auto shadow-2xl space-y-6">
      {/* Timer display section */}
      <div className="text-center">
        <div className={`text-8xl font-extralight tracking-tighter mb-2 ${
          isBreak
            ? 'text-green-600 dark:text-green-400'
            : 'text-violet-600 dark:text-violet-400'
        }`}>
          {formatTime(time)}
        </div>
        <div className={`text-sm uppercase tracking-wider font-semibold ${
          isBreak
            ? 'text-green-500 dark:text-green-300'
            : 'text-violet-500 dark:text-violet-300'
        }`}>
          {isBreak ? 'Break Time' : 'Focus Mode'}
        </div>
      </div>


      {/* Subject and Topic Selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            Select Subject
          </label>
          <select
            value={selectedSubject?.id || ''}
            onChange={handleSubjectChange}
            className="w-full p-3 border-b-2 border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:border-violet-500 dark:focus:border-violet-400 transition-colors"
          >
            <option value="">Choose Subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>


        {selectedSubject && (
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Select Topic
            </label>
            <select
              value={selectedTopic?.id || ''}
              onChange={handleTopicChange}
              disabled={!selectedSubject}
              className="w-full p-3 border-b-2 border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:border-violet-500 dark:focus:border-violet-400 transition-colors disabled:opacity-50"
            >
              <option value="">Choose Topic</option>
              {selectedSubject.topics?.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>


      {/* Timer Controls */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsActive(true)}
            disabled={!selectedSubject || !selectedTopic || isActive}
            className={`p-3 rounded-full transition-colors ${
              selectedSubject && selectedTopic && !isActive
                ? 'bg-violet-500 text-white hover:bg-violet-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Play className="w-6 h-6" />
          </motion.button>


          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsActive(false)}
            disabled={!isActive}
            className={`p-3 rounded-full transition-colors ${
              isActive
                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Pause className="w-6 h-6" />
          </motion.button>
        </div>


        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleReset}
          className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <RotateCcw className="w-6 h-6 text-gray-500 dark:text-gray-300" />
        </motion.button>
      </div>


      {/* Duration Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            Work Duration
          </label>
          <input
            type="number"
            value={currentSession.workDuration}
            onChange={(e) => handleWorkDurationChange(e.target.value)}
            min="5"
            max="60"
            className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-700 p-2 text-center focus:outline-none focus:border-violet-500 dark:focus:border-violet-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            Break Duration
          </label>
          <input
            type="number"
            value={currentSession.breakDuration}
            onChange={(e) => handleBreakDurationChange(e.target.value)}
            min="1"
            max="30"
            className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-700 p-2 text-center focus:outline-none focus:border-violet-500 dark:focus:border-violet-400 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};


export default MinimalistPomodoroTimer;