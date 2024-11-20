import React, { useMemo } from 'react';
import { BarChart2, Clock, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PerformanceInsights = ({ subjects, studySessions }) => {
  // Format time to show hours and minutes
  const formatTimeSpent = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.floor(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ''}`;
    }
    return `${remainingMinutes}m`;
  };

  const getPerformanceData = useMemo(() => {
    return subjects.map(subject => {
      // Calculate completion percentage
      const topics = subject.topics || [];
      const completion = topics.length 
        ? (topics.filter(topic => topic.completed).length / topics.length) * 100
        : 0;

      return {
        name: subject.name,
        completion: Math.round(completion),
        totalTime: subject.totalStudyTime || 0
      };
    });
  }, [subjects]);

  const averageCompletion = useMemo(() => 
    getPerformanceData.length 
      ? (getPerformanceData.reduce((sum, subject) => sum + subject.completion, 0) / getPerformanceData.length).toFixed(1)
      : '0',
    [getPerformanceData]
  );

  const totalStudyTime = useMemo(() => 
    getPerformanceData.reduce((sum, subject) => sum + subject.totalTime, 0),
    [getPerformanceData]
  );

  // Prepare data for the time-based graph
  const timeChartData = useMemo(() => {
    // Get the last 7 days including today
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0); // Set to start of day
      date.setDate(date.getDate() - (6 - i)); // 6 days ago to today
      return date;
    });

    // Initialize data structure for each day and subject
    const dailyData = last7Days.map(date => ({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: date,
      ...subjects.reduce((acc, subject) => {
        acc[subject.name] = 0;
        return acc;
      }, {})
    }));

    // Process study sessions
    if (studySessions && studySessions.length > 0) {
      studySessions.forEach(session => {
        const sessionDate = new Date(session.timestamp);
        sessionDate.setHours(0, 0, 0, 0); // Set to start of day

        // Find the corresponding day in our data
        const dayIndex = dailyData.findIndex(day => 
          day.fullDate.getTime() === sessionDate.getTime()
        );

        if (dayIndex !== -1) {
          const subject = subjects.find(s => s.id === session.subjectId);
          if (subject) {
            dailyData[dayIndex][subject.name] += session.duration;
          }
        }
      });
    }

    // Remove the fullDate property before returning
    return dailyData.map(({ fullDate, ...rest }) => rest);
  }, [studySessions, subjects]);

  // Generate colors for subjects
  const subjectColors = useMemo(() => {
    const colors = [
      '#8b5cf6', // violet
      '#06b6d4', // cyan
      '#10b981', // emerald
      '#f59e0b', // amber
      '#ef4444', // red
      '#ec4899', // pink
      '#6366f1', // indigo
    ];
    
    return subjects.reduce((acc, subject, index) => {
      acc[subject.name] = colors[index % colors.length];
      return acc;
    }, {});
  }, [subjects]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex items-center mb-6">
        <BarChart2 className="w-6 h-6 mr-2 text-violet-600 dark:text-violet-400" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Performance Insights</h2>
      </div>
      
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-cyan-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Target className="w-4 h-4 mr-2 text-cyan-600 dark:text-cyan-400" />
              <p className="text-sm text-gray-600 dark:text-gray-300">Average Completion</p>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {averageCompletion}%
            </p>
          </div>

          <div className="bg-violet-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Clock className="w-4 h-4 mr-2 text-violet-600 dark:text-violet-400" />
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Study Time</p>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {formatTimeSpent(totalStudyTime)}
            </p>
          </div>
        </div>

        {/* Study Time Graph */}
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-md font-semibold mb-4 text-gray-700 dark:text-gray-200">Subject Study Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeChartData}>
                <XAxis 
                  dataKey="date" 
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}m`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    border: 'none',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value, name) => [`${value} minutes`, name]}
                />
                {subjects.map((subject) => (
                  <Line
                    key={subject.name}
                    type="monotone"
                    dataKey={subject.name}
                    stroke={subjectColors[subject.name]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4">
            {subjects.map((subject) => (
              <div key={subject.name} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: subjectColors[subject.name] }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {subject.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceInsights;