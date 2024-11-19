import React, { useMemo } from 'react';
import { BarChart2, Clock, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PerformanceInsights = ({ subjects, currentSession }) => {
  const getPerformanceData = useMemo(() => {
    return subjects.map(subject => {
      // Calculate base study time from completed sessions
      let totalTime = subject.totalStudyTime || 0;
      
      // Add current active session time if applicable
      if (currentSession?.selectedSubject?.id === subject.id && !currentSession.isBreak) {
        totalTime += Math.floor(currentSession.accumulatedTime / 60);
      }
      
      // Calculate completion percentage
      const topics = subject.topics || [];
      const completion = topics.length 
        ? (topics.filter(topic => topic.completed).length / topics.length) * 100
        : 0;

      return {
        name: subject.name,
        time: totalTime,
        completion: Math.round(completion)
      };
    });
  }, [subjects, currentSession]);

  const totalStudyTime = useMemo(() => 
    getPerformanceData.reduce((sum, subject) => sum + subject.time, 0),
    [getPerformanceData]
  );

  const averageCompletion = useMemo(() => 
    getPerformanceData.length 
      ? (getPerformanceData.reduce((sum, subject) => sum + subject.completion, 0) / getPerformanceData.length).toFixed(1)
      : '0',
    [getPerformanceData]
  );

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex items-center mb-6">
        <BarChart2 className="w-6 h-6 mr-2 text-violet-600 dark:text-violet-400" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Performance Insights</h2>
      </div>
      
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-violet-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Clock className="w-4 h-4 mr-2 text-violet-600 dark:text-violet-400" />
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Study Time</p>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {formatTime(totalStudyTime)}
            </p>
          </div>
          
          <div className="bg-cyan-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Target className="w-4 h-4 mr-2 text-cyan-600 dark:text-cyan-400" />
              <p className="text-sm text-gray-600 dark:text-gray-300">Average Completion</p>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {averageCompletion}%
            </p>
          </div>
        </div>

        {/* Study Time Chart */}
        <div className="h-48">
          <h3 className="text-md font-semibold mb-4 text-gray-700 dark:text-gray-200">Study Time Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getPerformanceData}>
              <XAxis 
                dataKey="name" 
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `${Math.floor(value / 60)}h`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#F3F4F6'
                }}
                formatter={(value) => [formatTime(value), 'Study Time']}
              />
              <Line 
                type="monotone" 
                dataKey="time" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Breakdown */}
        <div>
          <h3 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-200">Subject Progress</h3>
          <div className="space-y-3">
            {getPerformanceData.map((subject, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {subject.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTime(subject.time)}
                  </span>
                </div>
                <div className="relative h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                  <div 
                    className="absolute h-2 bg-violet-600 rounded-full transition-all duration-300"
                    style={{ width: `${subject.completion}%` }}
                  />
                </div>
                <div className="mt-1 text-right">
                  <span className="text-xs font-medium text-violet-600 dark:text-violet-400">
                    {subject.completion}% Complete
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceInsights;