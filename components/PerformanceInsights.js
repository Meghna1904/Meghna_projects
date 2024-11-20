import React, { useMemo } from 'react';
import { BarChart2, Clock, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PerformanceInsights = ({ subjects, currentSession }) => {
  const getPerformanceData = useMemo(() => {
    return subjects.map(subject => {
      // Calculate completion percentage
      const topics = subject.topics || [];
      const completion = topics.length 
        ? (topics.filter(topic => topic.completed).length / topics.length) * 100
        : 0;

      return {
        name: subject.name,
        completion: Math.round(completion)
      };
    });
  }, [subjects]);

  const averageCompletion = useMemo(() => 
    getPerformanceData.length 
      ? (getPerformanceData.reduce((sum, subject) => sum + subject.completion, 0) / getPerformanceData.length).toFixed(1)
      : '0',
    [getPerformanceData]
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex items-center mb-6">
        <BarChart2 className="w-6 h-6 mr-2 text-violet-600 dark:text-violet-400" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Performance Insights</h2>
      </div>
      
      <div className="space-y-6">
        {/* Summary Card */}
        <div className="bg-cyan-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Target className="w-4 h-4 mr-2 text-cyan-600 dark:text-cyan-400" />
            <p className="text-sm text-gray-600 dark:text-gray-300">Average Completion</p>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {averageCompletion}%
          </p>
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