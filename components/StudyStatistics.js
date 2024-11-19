import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { format, subDays, isToday, isSameDay } from 'date-fns';
import { Calendar, Clock, Zap } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StudyStatistics = ({ studySessions }) => {
  // Calculate daily study times for the last 7 days
  const dailyData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        date,
        dateStr: format(date, 'MMM dd'),
        totalMinutes: 0,
      };
    }).reverse();

    // Aggregate study times by day
    studySessions.forEach(session => {
      const sessionDate = new Date(session.timestamp);
      const dayData = last7Days.find(day => isSameDay(day.date, sessionDate));
      if (dayData) {
        dayData.totalMinutes += session.duration;
      }
    });

    return last7Days;
  }, [studySessions]);

  // Calculate current study streak
  const streak = useMemo(() => {
    let currentStreak = 0;
    let today = new Date();
    
    // Check if studied today
    const studiedToday = studySessions.some(session => 
      isToday(new Date(session.timestamp))
    );
    
    if (!studiedToday) {
      today = subDays(today, 1); // Check from yesterday if not studied today
    } else {
      currentStreak = 1;
    }

    // Count consecutive days
    let checkDate = subDays(today, 1);
    while (true) {
      const studiedOnDate = studySessions.some(session => 
        isSameDay(new Date(session.timestamp), checkDate)
      );
      
      if (!studiedOnDate) break;
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    }

    return currentStreak;
  }, [studySessions]);

  // Calculate best study times
  const bestStudyTimes = useMemo(() => {
    const hourCounts = Array(24).fill(0);
    
    studySessions.forEach(session => {
      const hour = new Date(session.timestamp).getHours();
      hourCounts[hour] += session.duration;
    });

    // Get top 3 productive hours
    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(({ hour, count }) => ({
        time: format(new Date().setHours(hour, 0), 'ha'),
        minutes: count
      }));
  }, [studySessions]);

  const chartData = {
    labels: dailyData.map(d => d.dateStr),
    datasets: [
      {
        label: 'Study Time (minutes)',
        data: dailyData.map(d => d.totalMinutes),
        fill: true,
        borderColor: 'rgb(124, 58, 237)',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const minutes = context.raw;
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return hours > 0 
              ? `${hours}h ${mins}m` 
              : `${mins}m`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => {
            const hours = Math.floor(value / 60);
            const mins = value % 60;
            return hours > 0 
              ? `${hours}h ${mins}m` 
              : `${mins}m`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Study Statistics
      </h2>

      {/* Study Streak and Best Times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-violet-700 dark:text-violet-300 mb-2">
            <Zap className="w-5 h-5" />
            <h3 className="font-medium">Current Streak</h3>
          </div>
          <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">
            {streak} {streak === 1 ? 'day' : 'days'}
          </p>
        </div>

        <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-violet-700 dark:text-violet-300 mb-2">
            <Clock className="w-5 h-5" />
            <h3 className="font-medium">Best Study Times</h3>
          </div>
          <div className="space-y-1">
            {bestStudyTimes.map((time, index) => (
              <div key={time.time} className="flex items-center justify-between">
                <span className="text-violet-600 dark:text-violet-400">
                  {time.time}
                </span>
                <span className="text-violet-500 dark:text-violet-300 text-sm">
                  {Math.round(time.minutes / studySessions.length)} min avg
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Study Time Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 mb-4">
          <Calendar className="w-5 h-5" />
          <h3 className="font-medium">Weekly Progress</h3>
        </div>
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default StudyStatistics;
