import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardHeader,CardTitle  } from '../components/ui/card.tsx'
import { Input } from "../components/ui/input";
import { Button } from "/components/ui/button";

const GoalSettings = ({ subjects, onUpdate }) => {
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [studyGoals, setStudyGoals] = useState({});

  const handleGoalUpdate = (subjectId, goalHours) => {
    const minutes = Math.max(0, parseInt(goalHours) * 60);
    
    const updatedSubjects = subjects.map(subject => 
      subject.id === subjectId
        ? { ...subject, studyGoal: minutes }
        : subject
    );
    
    onUpdate(updatedSubjects);
    setEditingSubjectId(null);
  };

  const calculateProgress = (subject) => {
    if (!subject.studyGoal) return 0;
    return Math.min(100, Math.round((subject.totalStudyTime || 0) / subject.studyGoal * 100));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-violet-600" />
          Study Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {subjects.map(subject => (
          <div key={subject.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium dark:text-white">{subject.name}</span>
              <div className="flex items-center gap-2">
                {editingSubjectId === subject.id ? (
                  <>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Hours"
                      value={studyGoals[subject.id] || ''}
                      onChange={(e) => setStudyGoals({
                        ...studyGoals,
                        [subject.id]: e.target.value
                      })}
                      className="w-20"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleGoalUpdate(subject.id, studyGoals[subject.id])}
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-500">
                      {subject.studyGoal ? `${Math.round(subject.studyGoal / 60)} hours` : 'No goal set'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingSubjectId(subject.id);
                        setStudyGoals({
                          ...studyGoals,
                          [subject.id]: subject.studyGoal ? Math.round(subject.studyGoal / 60) : ''
                        });
                      }}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {subject.studyGoal > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Progress</span>
                  <span>{calculateProgress(subject)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-violet-600 dark:bg-violet-500 rounded-full h-2"
                    initial={{ width: 0 }}
                    animate={{ width: `${calculateProgress(subject)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{Math.round((subject.totalStudyTime || 0) / 60)} hours studied</span>
                  <span>{Math.round(subject.studyGoal / 60)} hours goal</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {subjects.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
            Add subjects to set study goals
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalSettings;