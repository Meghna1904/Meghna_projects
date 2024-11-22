import React from 'react';
import { BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProgressDashboard = ({ subjects }) => {
  const calculateOverallProgress = () => {
    if (!subjects.length) return 0;
    const totalProgress = subjects.reduce((acc, subject) => {
      if (!subject.modules || subject.modules.length === 0) return acc;
      
      const completedModules = subject.modules.filter(module => {
        if (module.subtopics && module.subtopics.length > 0) {
          return module.subtopics.every(subtopic => subtopic.completed);
        }
        return module.completed;
      }).length;
      
      return acc + (completedModules / subject.modules.length);
    }, 0);
    return Math.round((totalProgress / subjects.length) * 100);
  };

  const totalStudyTime = subjects.reduce((acc, subject) => 
    acc + (subject.totalStudyTime || 0), 0
  );

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          Progress Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-violet-50 dark:bg-gray-700">
            <p className="text-sm text-violet-600 dark:text-violet-300 mb-1">Overall Progress</p>
            <p className="text-2xl font-bold text-violet-900 dark:text-violet-100">
              {calculateOverallProgress()}%
            </p>
          </div>
          
          <div className="p-4 rounded-xl bg-cyan-50 dark:bg-gray-700">
            <p className="text-sm text-cyan-600 dark:text-cyan-300 mb-1">Active Subjects</p>
            <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">
              {subjects.length}
            </p>
          </div>
          
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-gray-700">
            <p className="text-sm text-emerald-600 dark:text-emerald-300 mb-1">Total Study Time</p>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {Math.round(totalStudyTime / 60)}h
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressDashboard;