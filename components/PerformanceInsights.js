import React from 'react';
import { BarChart2 } from 'lucide-react';
import { calculateCompletion, formatTime } from '../utils/helpers';

const PerformanceInsights = ({ subjects }) => {
  const getPerformanceData = () => {
    return subjects.map(subject => ({
      name: subject.name,
      time: subject.totalStudyTime || 0,
      completion: calculateCompletion(subject)
    }));
  };

  const performanceData = getPerformanceData();
  const totalStudyTime = performanceData.reduce((sum, subject) => sum + subject.time, 0);
  const averageCompletion = performanceData.length 
    ? (performanceData.reduce((sum, subject) => sum + subject.completion, 0) / performanceData.length).toFixed(1)
    : '0';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex items-center mb-4">
        <BarChart2 className="w-6 h-6 mr-2 text-violet-600 dark:text-violet-400" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Performance Insights</h2>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-violet-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">Total Study Time</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {formatTime(totalStudyTime)}
            </p>
          </div>
          
          <div className="bg-cyan-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">Average Completion</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {averageCompletion}%
            </p>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-md font-semibold mb-2 text-gray-700 dark:text-gray-200">Subject Breakdown</h3>
          {performanceData.map((subject, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between py-2 border-b last:border-b-0 border-gray-200 dark:border-gray-700"
            >
              <span className="text-sm text-gray-600 dark:text-gray-300">{subject.name}</span>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatTime(subject.time)}
                </span>
                <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
                  {subject.completion}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceInsights;