// utils/helpers.js
export const calculateCompletion = (item) => {
    if (!item.modules) return 0;
    
    const totalTopics = item.modules.reduce((acc, module) => 
      acc + (module.topics?.length || 0), 0);
    
    if (totalTopics === 0) return 0;
    
    const completedTopics = item.modules.reduce((acc, module) => 
      acc + (module.topics?.filter(topic => topic.completed).length || 0), 0);
    
    return Math.round((completedTopics / totalTopics) * 100);
  };
  
  export const formatTime = (seconds) => {
    if (!seconds) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  