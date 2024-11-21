import React, { useState, useMemo } from 'react';

import { 
  Trash2, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle, 
  Bookmark, 
  BookmarkCheck,
  GraduationCap
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const SubjectCard = ({ subject, onUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newModule, setNewModule] = useState('');
  const [newSubtopic, setNewSubtopic] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [isBulkImport, setIsBulkImport] = useState(false);
  const [isSubtopicBulkImport, setIsSubtopicBulkImport] = useState(false);
  const [newLearnedItem, setNewLearnedItem] = useState('');
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [expandedLearnedItems, setExpandedLearnedItems] = useState(null);

  const calculateProgress = useMemo(() => {
    if (!subject.modules || subject.modules.length === 0) return 0;
    const completedModules = subject.modules.filter(module => {
      if (module.subtopics && module.subtopics.length > 0) {
        return module.subtopics.every(subtopic => subtopic.completed);
      }
      return module.completed;
    }).length;
    return Math.round((completedModules / subject.modules.length) * 100);
  }, [subject.modules]);

  const calculateReviewItems = useMemo(() => {
    if (!subject.modules) return { modules: 0, subtopics: 0 };
    const reviewCount = {
      modules: subject.modules.filter(m => m.forReview).length,
      subtopics: subject.modules.reduce((count, module) => {
        return count + (module.subtopics?.filter(s => s.forReview).length || 0);
      }, 0)
    };
    return reviewCount;
  }, [subject.modules]);

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

  const addModule = () => {
    if (newModule.trim()) {
      let modulesToAdd = [];
      
      if (isBulkImport) {
        modulesToAdd = newModule
          .split(',')
          .map(module => module.trim())
          .filter(module => module.length > 0);
      } else {
        modulesToAdd = [newModule.trim()];
      }

      if (modulesToAdd.length > 0) {
        const updatedSubject = {
          ...subject,
          modules: [
            ...(subject.modules || []),
            ...modulesToAdd.map(moduleName => ({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              name: moduleName,
              completed: false,
              forReview: false,
              studyTime: 0,
              subtopics: [],
              learnedItems: []
            }))
          ]
        };
        onUpdate(updatedSubject);
        setNewModule('');
      }
    }
  };

  const addSubtopic = (moduleId) => {
    if (newSubtopic.trim()) {
      let subtopicsToAdd = [];
      
      if (isSubtopicBulkImport) {
        subtopicsToAdd = newSubtopic
          .split(',')
          .map(subtopic => subtopic.trim())
          .filter(subtopic => subtopic.length > 0);
      } else {
        subtopicsToAdd = [newSubtopic.trim()];
      }

      if (subtopicsToAdd.length > 0) {
        const updatedSubject = {
          ...subject,
          modules: subject.modules.map(module =>
            module.id === moduleId
              ? {
                  ...module,
                  subtopics: [
                    ...(module.subtopics || []),
                    ...subtopicsToAdd.map(subtopicName => ({
                      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                      name: subtopicName,
                      completed: false,
                      forReview: false,
                      studyTime: 0,
                      learnedItems: []
                    }))
                  ]
                }
              : module
          )
        };
        onUpdate(updatedSubject);
        setNewSubtopic('');
      }
    }
  };

  const toggleModuleCompletion = (moduleId) => {
    const updatedSubject = {
      ...subject,
      modules: subject.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              completed: !module.completed,
              subtopics: module.subtopics?.map(subtopic => ({
                ...subtopic,
                completed: !module.completed
              })) || []
            }
          : module
      )
    };
    onUpdate(updatedSubject);
  };

  const toggleSubtopicCompletion = (moduleId, subtopicId) => {
    const updatedSubject = {
      ...subject,
      modules: subject.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              subtopics: module.subtopics.map(subtopic =>
                subtopic.id === subtopicId
                  ? { ...subtopic, completed: !subtopic.completed }
                  : subtopic
              )
            }
          : module
      )
    };
    onUpdate(updatedSubject);
  };

  const toggleModuleReview = (moduleId) => {
    const updatedSubject = {
      ...subject,
      modules: subject.modules.map(module =>
        module.id === moduleId
          ? { ...module, forReview: !module.forReview }
          : module
      )
    };
    onUpdate(updatedSubject);
  };

  const toggleSubtopicReview = (moduleId, subtopicId) => {
    const updatedSubject = {
      ...subject,
      modules: subject.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              subtopics: module.subtopics.map(subtopic =>
                subtopic.id === subtopicId
                  ? { ...subtopic, forReview: !subtopic.forReview }
                  : subtopic
              )
            }
          : module
      )
    };
    onUpdate(updatedSubject);
  };

  const deleteSubtopic = (moduleId, subtopicId) => {
    const updatedSubject = {
      ...subject,
      modules: subject.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              subtopics: module.subtopics.filter(subtopic => subtopic.id !== subtopicId)
            }
          : module
      )
    };
    onUpdate(updatedSubject);
  };

  const deleteModule = (moduleId) => {
    const updatedSubject = {
      ...subject,
      modules: subject.modules.filter(module => module.id !== moduleId)
    };
    onUpdate(updatedSubject);
  };

  const addLearnedItem = (moduleId, subtopicId) => {
    if (newLearnedItem.trim()) {
      const updatedSubject = {
        ...subject,
        modules: subject.modules.map(module =>
          module.id === moduleId
            ? {
                ...module,
                subtopics: subtopicId
                  ? module.subtopics.map(subtopic =>
                      subtopic.id === subtopicId
                        ? {
                            ...subtopic,
                            learnedItems: [...(subtopic.learnedItems || []), {
                              id: Date.now().toString(),
                              content: newLearnedItem.trim()
                            }]
                          }
                        : subtopic
                    )
                  : {
                      ...module,
                      learnedItems: [...(module.learnedItems || []), {
                        id: Date.now().toString(),
                        content: newLearnedItem.trim()
                      }]
                    }
              }
            : module
        )
      };
      onUpdate(updatedSubject);
      setNewLearnedItem('');
    }
  };

  const deleteLearnedItem = (moduleId, subtopicId, itemId) => {
    const updatedSubject = {
      ...subject,
      modules: subject.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              subtopics: subtopicId
                ? module.subtopics.map(subtopic =>
                    subtopic.id === subtopicId
                      ? {
                          ...subtopic,
                          learnedItems: subtopic.learnedItems.filter(item => item.id !== itemId)
                        }
                      : subtopic
                  )
                : {
                    ...module,
                    learnedItems: module.learnedItems.filter(item => item.id !== itemId)
                  }
            }
          : module
      )
    };
    onUpdate(updatedSubject);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-violet-100 dark:border-gray-700 p-6 ${
        isExpanded ? 'col-span-2 row-span-2' : ''
      } hover:shadow-lg hover:border-violet-200 dark:hover:border-gray-600 transition-all duration-300 ease-in-out`}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold text-violet-950 dark:text-white">
                {subject.name}
                {subject.totalStudyTime > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({Math.floor(subject.totalStudyTime)} min studied)
                  </span>
                )}
              </h2>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm text-violet-700 dark:text-violet-300">
                <span>{calculateProgress}% Complete</span>
                <span>{subject.modules?.filter(m => m.completed).length}/{subject.modules?.length} Modules</span>
              </div>
              <div className="w-full bg-violet-100 dark:bg-violet-900/30 rounded-full h-2.5">
                <div
                  className="bg-violet-500 dark:bg-violet-400 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${calculateProgress}%` }}
                ></div>
              </div>
              {(calculateReviewItems.modules > 0 || calculateReviewItems.subtopics > 0) && (
                <div className="flex items-center gap-2 mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                  <BookmarkCheck className="w-4 h-4" />
                  <span>
                    {calculateReviewItems.modules} {calculateReviewItems.modules === 1 ? 'module' : 'modules'} and {calculateReviewItems.subtopics} {calculateReviewItems.subtopics === 1 ? 'subtopic' : 'subtopics'} marked for review
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900"
            >
              <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder={isBulkImport ? "Add multiple modules (separate by commas)" : "Add a module"}
                  value={newModule}
                  onChange={(e) => setNewModule(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addModule()}
                  className="flex-grow dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                />
                <Button 
                  onClick={addModule} 
                  disabled={!newModule.trim()}
                  className="bg-violet-500 hover:bg-violet-600 text-white dark:bg-violet-600 dark:hover:bg-violet-700"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bulkImport"
                  checked={isBulkImport}
                  onCheckedChange={setIsBulkImport}
                />
                <label
                  htmlFor="bulkImport"
                  className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                >
                  Bulk import mode (separate modules with commas)
                </label>
              </div>
            </div>

            {subject.modules?.map((module) => (
              <div
                key={module.id}
                className={`flex flex-col p-3 rounded-lg ${
                  module.completed 
                    ? 'bg-green-100/50 dark:bg-green-900/20' 
                    : 'bg-blue-50/50 dark:bg-blue-900/20'
                } hover:shadow-md transition-all duration-300`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleModuleCompletion(module.id)}
                      className={`p-1 rounded-full transition-colors ${
                        module.completed
                          ? 'text-green-500 dark:text-green-400'
                          : 'text-gray-400 dark:text-gray-500 hover:text-violet-500'
                      }`}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleModuleReview(module.id)}
                      className={`p-1 rounded-lg transition-colors ${
                        module.forReview
                          ? 'text-yellow-500 dark:text-yellow-400'
                          : 'text-gray-400 hover:text-yellow-500 dark:text-gray-500 dark:hover:text-yellow-400'
                      }`}
                    >
                      {module.forReview ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                    <div className="flex flex-col">
                      <span className={`${module.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                        {module.name}
                      </span>
                      {module.studyTime > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Time spent: {formatTimeSpent(module.studyTime)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedLearnedItems(
                        expandedLearnedItems === `module-${module.id}` 
                          ? null 
                          : `module-${module.id}`
                      )}
                      className={`p-1 rounded-lg transition-colors ${
                        expandedLearnedItems === `module-${module.id}`
                          ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                          : 'text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        <span className="text-xs font-medium">
                          {module.learnedItems?.length || 0} Learned
                        </span>
                        {expandedLearnedItems === `module-${module.id}` ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </div>
                    </Button>
                    <button
                      onClick={() => setExpandedModuleId(
                        expandedModuleId === module.id ? null : module.id
                      )}
                      className={`p-1 rounded-lg transition-colors ${
                        expandedModuleId === module.id
                          ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                          : 'text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400'
                      }`}
                    >
                      {expandedModuleId === module.id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteModule(module.id)}
                      className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expandedLearnedItems === `module-${module.id}` && (
                  <div className="mt-2 pl-6 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={newLearnedItem}
                        onChange={(e) => setNewLearnedItem(e.target.value)}
                        placeholder="Add what you learned in this module..."
                        className="flex-1 text-sm bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                        onKeyPress={(e) => e.key === 'Enter' && addLearnedItem(module.id)}
                      />
                      <Button
                        onClick={() => addLearnedItem(module.id)}
                        disabled={!newLearnedItem.trim()}
                        size="sm"
                        className="bg-violet-500 hover:bg-violet-600 text-white dark:bg-violet-600 dark:hover:bg-violet-700"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {module.learnedItems?.length > 0 && (
                      <div className="space-y-1">
                        {module.learnedItems.map(item => (
                          <div 
                            key={item.id} 
                            className="flex items-center justify-between bg-white dark:bg-gray-700/50 p-2 rounded-lg text-sm border border-gray-100 dark:border-gray-600"
                          >
                            <span className="text-gray-700 dark:text-gray-300">
                              {item.content}
                            </span>
                            <button
                              onClick={() => deleteLearnedItem(module.id, null, item.id)}
                              className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {expandedModuleId === module.id && (
                  <div className="mt-2 pl-6 space-y-2">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={newSubtopic}
                          onChange={(e) => setNewSubtopic(e.target.value)}
                          placeholder={isSubtopicBulkImport ? "Add multiple subtopics (separate by commas)" : "Add subtopic (optional)..."}
                          className="flex-1"
                          onKeyPress={(e) => e.key === 'Enter' && addSubtopic(module.id)}
                        />
                        <Button onClick={() => addSubtopic(module.id)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`subtopicBulkImport-${module.id}`}
                          checked={isSubtopicBulkImport}
                          onCheckedChange={setIsSubtopicBulkImport}
                        />
                        <label
                          htmlFor={`subtopicBulkImport-${module.id}`}
                          className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                        >
                          Bulk import mode (separate subtopics with commas)
                        </label>
                      </div>
                    </div>

                    {module.subtopics?.map(subtopic => (
                      <div key={subtopic.id} className="flex flex-col space-y-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={subtopic.completed}
                              onCheckedChange={() => toggleSubtopicCompletion(module.id, subtopic.id)}
                              className="border-gray-300 dark:border-gray-600"
                            />
                            <button
                              onClick={() => toggleSubtopicReview(module.id, subtopic.id)}
                              className={`p-1 rounded-lg transition-colors ${
                                subtopic.forReview
                                  ? 'text-yellow-500 dark:text-yellow-400'
                                  : 'text-gray-400 hover:text-yellow-500 dark:text-gray-500 dark:hover:text-yellow-400'
                              }`}
                            >
                              {subtopic.forReview ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => deleteSubtopic(module.id, subtopic.id)}
                              className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <span className={`${
                              subtopic.completed 
                                ? 'line-through text-gray-500 dark:text-gray-400' 
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {subtopic.name}
                            </span>
                            {subtopic.studyTime > 0 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                                Time spent: {formatTimeSpent(subtopic.studyTime)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedLearnedItems(
                                expandedLearnedItems === `${module.id}-${subtopic.id}` 
                                  ? null 
                                  : `${module.id}-${subtopic.id}`
                              )}
                              className={`p-1 rounded-lg transition-colors ${
                                expandedLearnedItems === `${module.id}-${subtopic.id}`
                                  ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                                  : 'text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400'
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                <GraduationCap className="w-4 h-4" />
                                <span className="text-xs font-medium">
                                  {subtopic.learnedItems?.length || 0} Learned
                                </span>
                                {expandedLearnedItems === `${module.id}-${subtopic.id}` ? (
                                  <ChevronDown className="w-3 h-3" />
                                ) : (
                                  <ChevronRight className="w-3 h-3" />
                                )}
                              </div>
                            </Button>
                          </div>
                        </div>

                        {expandedLearnedItems === `${module.id}-${subtopic.id}` && (
                          <div className="pl-6 space-y-2">
                            <div className="flex items-center gap-2">
                              <Input
                                type="text"
                                value={newLearnedItem}
                                onChange={(e) => setNewLearnedItem(e.target.value)}
                                placeholder="Add what you learned..."
                                className="flex-1 text-sm bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                                onKeyPress={(e) => e.key === 'Enter' && addLearnedItem(module.id, subtopic.id)}
                              />
                              <Button
                                onClick={() => addLearnedItem(module.id, subtopic.id)}
                                disabled={!newLearnedItem.trim()}
                                size="sm"
                                className="bg-violet-500 hover:bg-violet-600 text-white dark:bg-violet-600 dark:hover:bg-violet-700"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>

                            {subtopic.learnedItems?.length > 0 && (
                              <div className="space-y-1">
                                {subtopic.learnedItems.map(item => (
                                  <div 
                                    key={item.id} 
                                    className="flex items-center justify-between bg-white dark:bg-gray-700/50 p-2 rounded-lg text-sm border border-gray-100 dark:border-gray-600"
                                  >
                                    <span className="text-gray-700 dark:text-gray-300">
                                      {item.content}
                                    </span>
                                    <button
                                      onClick={() => deleteLearnedItem(module.id, subtopic.id, item.id)}
                                      className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectCard;