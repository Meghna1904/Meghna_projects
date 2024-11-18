export default function TopicForm({ newTopic, setNewTopic, addTopic }) {
    return (
      <form onSubmit={addTopic} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="Enter a new topic"
            className="flex-1 p-2 rounded border"
          />
          <button 
            type="submit"
            className="buttonPrimary"
          >
            Add Topic
          </button>
        </div>
      </form>
    );
  }
  
