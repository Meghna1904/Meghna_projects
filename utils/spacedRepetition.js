export const calculateNextReview = (lastReview, reviewCount) => {
    const intervals = [1, 3, 7, 14, 30, 90]; // Days between reviews
    const interval = intervals[Math.min(reviewCount, intervals.length - 1)];
    
    const nextDate = new Date(lastReview);
    nextDate.setDate(nextDate.getDate() + interval);
    return nextDate;
  };
  
  export const getDueTopics = (topics) => {
    const now = new Date();
    return topics.filter(topic => 
      topic.completed && 
      topic.nextReview && 
      new Date(topic.nextReview) <= now
    );
  };