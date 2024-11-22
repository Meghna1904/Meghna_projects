// utils/helpers.js
export const calculateCompletion = (item) => {
  if (!item.modules || item.modules.length === 0) return 0;
  
  let totalItems = 0;
  let completedItems = 0;
  
  item.modules.forEach(module => {
    if (module.subtopics && module.subtopics.length > 0) {
      // Count each subtopic as a completion item
      totalItems += module.subtopics.length;
      completedItems += module.subtopics.filter(subtopic => subtopic.completed).length;
    } else {
      // If no subtopics, count the module itself
      totalItems += 1;
      if (module.completed) {
        completedItems += 1;
      }
    }
  });
  
  return Math.round((completedItems / totalItems) * 100);
};

export const formatTime = (seconds) => {
  if (!seconds) return '0h 0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};