export default function ReviewSection({ dueTopics = [] }) {
  if (dueTopics.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-2xl mb-4">Due for Review</h2>
      <div className="grid gap-4">
        {dueTopics.map((topic) => (
          <div
            key={topic.id}
            className="bg-yellow-50 rounded-lg p-4 shadow border border-yellow-200"
          >
            <p>{topic.name}</p>
            <p className="text-sm text-gray-500">
              Last reviewed: {new Date(topic.lastReviewed).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
