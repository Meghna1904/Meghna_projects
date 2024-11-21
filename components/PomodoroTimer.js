import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, RotateCcw, Pause } from 'lucide-react';

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
    isPaused: false,
    isBreak: false,
    remainingTime: defaultWorkDuration * 60,
    selectedSubjectId: null,
    selectedModuleId: null,
    selectedSubtopicId: null,
    workDuration: defaultWorkDuration,
    breakDuration: defaultBreakDuration,
    accumulatedTime: 0
  });

  // State initialization
  const [time, setTime] = useState(savedSession.remainingTime);
  const [isActive, setIsActive] = useState(savedSession.isActive);
  const [isPaused, setIsPaused] = useState(savedSession.isPaused);
  const [isBreak, setIsBreak] = useState(savedSession.isBreak);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [currentSession, setCurrentSession] = useState({
    workDuration: savedSession.workDuration,
    breakDuration: savedSession.breakDuration
  });
  const [accumulatedTime, setAccumulatedTime] = useState(savedSession.accumulatedTime);
  const [studySessionActive, setStudySessionActive] = useState(false);
  const audioContextRef = useRef(null);

  // Initialize audio context
  useEffect(() => {
    // Create AudioContext only on user interaction to comply with browser policies
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
    };

    // Add listener for user interaction
    document.addEventListener('click', initAudio, { once: true });
    return () => document.removeEventListener('click', initAudio);
  }, []);

  // Function to play notification sound
  const playNotification = useCallback((frequency = 440, duration = 0.5) => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    // Set sound properties
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.5;

    // Fade out
    gainNode.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01, 
      audioContextRef.current.currentTime + duration
    );

    // Start and stop
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  }, []);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isActive && !isPaused && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime - 1;
          // Save current session state to localStorage
          saveToLocalStorage('pomodoroSession', {
            isActive,
            isPaused,
            isBreak,
            remainingTime: newTime,
            selectedSubjectId: selectedSubject?.id || null,
            selectedModuleId: selectedModule?.id || null,
            selectedSubtopicId: selectedSubtopic?.id || null,
            workDuration: currentSession.workDuration,
            breakDuration: currentSession.breakDuration,
            accumulatedTime: accumulatedTime + 1
          });
          return newTime;
        });
        setAccumulatedTime(prev => prev + 1);
      }, 1000);
    } else if (time === 0) {
      // Session completed
      if (isBreak) {
        // Break ended
        playNotification(523.25, 0.3);
        setTimeout(() => playNotification(659.25, 0.3), 300);
        setIsBreak(false);
        setTime(currentSession.workDuration * 60);
        setAccumulatedTime(0);
      } else {
        // Work session finished
        playNotification(440, 0.3);
        setTimeout(() => playNotification(523.25, 0.3), 300);
        if (selectedSubject && selectedModule && accumulatedTime > 0) {
          const studyMinutes = Math.floor(accumulatedTime / 60);
          onTimeUpdate({
            subjectId: selectedSubject.id,
            moduleId: selectedModule.id,
            subtopicId: selectedSubtopic?.id,
            time: studyMinutes
          });
        }
        setIsBreak(true);
        setTime(currentSession.breakDuration * 60);
        setAccumulatedTime(0);
      }
      setIsActive(false);
      setIsPaused(false);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, isPaused, time, isBreak, selectedSubject, selectedModule, currentSession, accumulatedTime]);

  // Track study session
  const trackStudySession = useCallback((duration) => {
    const session = {
      timestamp: new Date().toISOString(),
      duration, // in minutes
      subjectId: selectedSubject?.id,
      moduleId: selectedModule?.id,
      subtopicId: selectedSubtopic?.id,
      type: 'work'
    };

    // Get existing sessions from localStorage
    const existingSessions = JSON.parse(localStorage.getItem('studySessions') || '[]');
    const updatedSessions = [...existingSessions, session];
    
    // Keep only last 30 days of sessions
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const filteredSessions = updatedSessions.filter(s => 
      new Date(s.timestamp) > thirtyDaysAgo
    );

    // Save to localStorage
    localStorage.setItem('studySessions', JSON.stringify(filteredSessions));
  }, [selectedSubject?.id, selectedModule?.id, selectedSubtopic?.id]);

  // Handle session completion
  const handleSessionComplete = useCallback(() => {
    if (isBreak) {
      // Break finished, start work session
      setTime(currentSession.workDuration * 60);
      setIsBreak(false);
      setIsActive(false);
      setIsPaused(false);
      setAccumulatedTime(0);
    } else {
      // Work session finished
      if (selectedSubject && selectedModule && accumulatedTime > 0) {
        const studyMinutes = Math.floor(accumulatedTime / 60);
        onTimeUpdate({
          subjectId: selectedSubject.id,
          moduleId: selectedModule.id,
          subtopicId: selectedSubtopic?.id,
          time: studyMinutes
        });
        
        // Track the completed study session
        trackStudySession(studyMinutes);
      }
      
      setTime(currentSession.breakDuration * 60);
      setIsBreak(true);
      setIsActive(false);
      setIsPaused(false);
      setAccumulatedTime(0);
    }
  }, [currentSession.workDuration, currentSession.breakDuration, isBreak, selectedSubject, selectedModule, accumulatedTime, onTimeUpdate, trackStudySession]);

  // Handle stop button press
  const handleStop = useCallback(() => {
    if (selectedSubject && selectedModule && accumulatedTime > 0) {
      const studyMinutes = Math.floor(accumulatedTime / 60);
      onTimeUpdate({
        subjectId: selectedSubject.id,
        moduleId: selectedModule.id,
        subtopicId: selectedSubtopic?.id,
        time: studyMinutes
      });
    }
    
    setIsActive(false);
    setIsPaused(false);
    setTime(currentSession.workDuration * 60);
    setIsBreak(false);
    setAccumulatedTime(0);
    setStudySessionActive(false);
    
    // Clear local storage when stopping
    saveToLocalStorage('pomodoroSession', {
      isActive: false,
      isPaused: false,
      isBreak: false,
      remainingTime: currentSession.workDuration * 60,
      selectedSubjectId: selectedSubject?.id || null,
      selectedModuleId: selectedModule?.id || null,
      selectedSubtopicId: selectedSubtopic?.id || null,
      workDuration: currentSession.workDuration,
      breakDuration: currentSession.breakDuration,
      accumulatedTime: 0
    });
  }, [isActive, selectedSubject, selectedModule, isBreak, currentSession.workDuration, onTimeUpdate, accumulatedTime, trackStudySession]);

  // Update time when work or break duration changes
  useEffect(() => {
    if (!isActive) {
      setTime(isBreak ? currentSession.breakDuration * 60 : currentSession.workDuration * 60);
    }
  }, [currentSession.workDuration, currentSession.breakDuration, isBreak, isActive]);

  // Keep selected subject in sync with subjects prop
  useEffect(() => {
    const currentSubject = subjects.find(s => s.id === (selectedSubject?.id || savedSession.selectedSubjectId));
    if (currentSubject) {
      setSelectedSubject(currentSubject);
     
      // Update selected module if it exists in the updated subject
      const currentModule = currentSubject.modules?.find(m => m.id === (selectedModule?.id || savedSession.selectedModuleId));
      setSelectedModule(currentModule || null);

      // Update selected subtopic if it exists in the updated module
      if (currentModule) {
        const currentSubtopic = currentModule.subtopics?.find(s => s.id === (selectedSubtopic?.id || savedSession.selectedSubtopicId));
        setSelectedSubtopic(currentSubtopic || null);
      } else {
        setSelectedSubtopic(null);
      }
    } else {
      setSelectedSubject(null);
      setSelectedModule(null);
      setSelectedSubtopic(null);
    }
  }, [subjects, savedSession.selectedSubjectId, savedSession.selectedModuleId, savedSession.selectedSubtopicId]);

  // Handle work duration change
  const handleWorkDurationChange = (value) => {
    const duration = parseInt(value, 10);
    if (!isNaN(duration) && duration >= 1) {
      setCurrentSession(prev => ({
        ...prev,
        workDuration: duration
      }));
      if (!isActive) {
        setTime(duration * 60);
      }
    }
  };

  // Handle break duration change
  const handleBreakDurationChange = (value) => {
    const duration = parseInt(value, 10);
    if (!isNaN(duration) && duration >= 1) {
      setCurrentSession(prev => ({
        ...prev,
        breakDuration: duration
      }));
    }
  };

  // Handle reset
  const handleReset = useCallback(() => {
    setTime(currentSession.workDuration * 60);
    setIsActive(false);
    setIsPaused(false);
    setIsBreak(false);
    setAccumulatedTime(0);
   
    saveToLocalStorage('pomodoroSession', {
      isActive: false,
      isPaused: false,
      isBreak: false,
      remainingTime: currentSession.workDuration * 60,
      selectedSubjectId: selectedSubject?.id || null,
      selectedModuleId: selectedModule?.id || null,
      selectedSubtopicId: selectedSubtopic?.id || null,
      workDuration: currentSession.workDuration,
      breakDuration: currentSession.breakDuration,
      accumulatedTime: 0
    });
  }, [currentSession.workDuration, selectedSubject?.id, selectedModule?.id, selectedSubtopic?.id]);

  // Selection handlers
  const handleSubjectChange = (e) => {
    const newSubject = subjects.find(s => s.id === e.target.value);
    setSelectedSubject(newSubject || null);
    setSelectedModule(null);
    setSelectedSubtopic(null);
   
    saveToLocalStorage('pomodoroSession', {
      ...savedSession,
      selectedSubjectId: newSubject?.id || null,
      selectedModuleId: null,
      selectedSubtopicId: null
    });
  };

  const handleModuleChange = (e) => {
    const newModule = selectedSubject.modules.find(m => m.id === e.target.value);
    setSelectedModule(newModule || null);
    setSelectedSubtopic(null);
   
    saveToLocalStorage('pomodoroSession', {
      ...savedSession,
      selectedModuleId: newModule?.id || null,
      selectedSubtopicId: null
    });
  };

  const handleSubtopicChange = (e) => {
    const newSubtopic = selectedModule.subtopics.find(s => s.id === e.target.value);
    setSelectedSubtopic(newSubtopic || null);
   
    saveToLocalStorage('pomodoroSession', {
      ...savedSession,
      selectedSubtopicId: newSubtopic?.id || null
    });
  };

  const updateStudyTime = () => {
    if (selectedSubject && selectedModule) {
      const updatedSubjects = subjects.map(subject => {
        if (subject.id === selectedSubject.id) {
          return {
            ...subject,
            modules: subject.modules.map(module => {
              if (module.id === selectedModule.id) {
                if (selectedSubtopic) {
                  // Update subtopic study time
                  return {
                    ...module,
                    subtopics: module.subtopics.map(subtopic => 
                      subtopic.id === selectedSubtopic.id
                        ? { ...subtopic, studyTime: (subtopic.studyTime || 0) + accumulatedTime }
                        : subtopic
                    )
                  };
                } else {
                  // Update module study time if no subtopic selected
                  return {
                    ...module,
                    studyTime: (module.studyTime || 0) + accumulatedTime
                  };
                }
              }
              return module;
            })
          };
        }
        return subject;
      });

      updateSubjects(updatedSubjects);
      setAccumulatedTime(0);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md mx-auto shadow-2xl space-y-6">
      {/* Timer display section */}
      <div className="text-center">
        <div className={`text-8xl font-extralight tracking-tighter mb-2 ${
          isBreak
            ? 'text-green-600 dark:text-green-400'
            : 'text-violet-600 dark:text-violet-400'
        }`}>
          {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
        </div>
        <div className={`text-sm uppercase tracking-wider font-semibold ${
          isBreak
            ? 'text-green-500 dark:text-green-300'
            : 'text-violet-500 dark:text-violet-300'
        }`}>
          {isBreak ? 'Break Time' : 'Focus Mode'}
        </div>
      </div>

      {/* Subject and Module Selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            Select Subject
          </label>
          <select
            value={selectedSubject?.id || ''}
            onChange={handleSubjectChange}
            disabled={isActive}
            className={`w-full p-2 rounded-lg border ${
              isActive 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400'
                : 'bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100'
            } dark:border-gray-600 focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400`}
          >
            <option value="">Choose a subject...</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}
                className="dark:bg-gray-700 dark:text-gray-100"
              >
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {selectedSubject && (
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Select Module
            </label>
            <select
              value={selectedModule?.id || ''}
              onChange={handleModuleChange}
              disabled={isActive}
              className={`w-full p-2 rounded-lg border ${
                isActive 
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400'
                  : 'bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100'
              } dark:border-gray-600 focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400`}
            >
              <option value="">Choose a module...</option>
              {selectedSubject.modules?.map((module) => (
                <option key={module.id} value={module.id}
                  className="dark:bg-gray-700 dark:text-gray-100"
                >
                  {module.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedModule && selectedModule.subtopics?.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Select Subtopic (Optional)
            </label>
            <select
              value={selectedSubtopic?.id || ''}
              onChange={handleSubtopicChange}
              disabled={isActive}
              className={`w-full p-2 rounded-lg border ${
                isActive 
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400'
                  : 'bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100'
              } dark:border-gray-600 focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400`}
            >
              <option value="">Choose a subtopic...</option>
              {selectedModule.subtopics.map((subtopic) => (
                <option key={subtopic.id} value={subtopic.id}
                  className="dark:bg-gray-700 dark:text-gray-100"
                >
                  {subtopic.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Timer Controls */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          {!isActive || isPaused ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setIsActive(true);
                setIsPaused(false);
              }}
              disabled={!selectedSubject || !selectedModule}
              className={`p-3 rounded-full transition-colors ${
                !selectedSubject || !selectedModule
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                  : 'bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
              }`}
            >
              <Play className="w-6 h-6" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsPaused(true)}
              className="p-3 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 transition-colors"
            >
              <Pause className="w-6 h-6" />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleStop}
            disabled={!isActive}
            className={`p-3 rounded-full transition-colors ${
              !isActive
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
            }`}
          >
            <Square className="w-6 h-6" />
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
          <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-300 mb-2">
            Work Duration (min)
          </label>
          <input
            type="number"
            value={currentSession.workDuration}
            onChange={(e) => handleWorkDurationChange(e.target.value)}
            min="1"
            max="120"
            disabled={isActive}
            className={`w-full p-2 rounded-lg border ${
              isActive 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400'
                : 'bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100'
            } dark:border-gray-600 focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400`}
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-300 mb-2">
            Break Duration (min)
          </label>
          <input
            type="number"
            value={currentSession.breakDuration}
            onChange={(e) => handleBreakDurationChange(e.target.value)}
            min="1"
            max="60"
            disabled={isActive}
            className={`w-full p-2 rounded-lg border ${
              isActive 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400'
                : 'bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100'
            } dark:border-gray-600 focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400`}
          />
        </div>
      </div>
    </div>
  );
};

export default MinimalistPomodoroTimer;