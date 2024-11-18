  // components/TopicList.js
  export default function TopicList({ topics, toggleCompletion }) {
    return (
      <div className="grid gap-4">
        {topics.map(topic => (
          <div key={topic.id} className="topicCard">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={topic.completed}
                onChange={() => toggleCompletion(topic.id)}
                className="h-5 w-5"
              />
              <span className={topic.completed ? 'line-through text-gray-500' : ''}>
                {topic.name}
              </span>
            </div>
            {topic.nextReview && (
              <span className="text-sm text-gray-500">
                Next review: {new Date(topic.nextReview).toLocaleDateString()}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }
  