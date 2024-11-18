// components/ModuleForm.js
const ModuleForm = ({ onSubmit }) => {
    const [name, setName] = useState('');
    
    const handleSubmit = (e) => {
      e.preventDefault();
      if (name.trim()) {
        onSubmit({
          id: Date.now(),
          name: name.trim(),
          topics: [],
          completed: false,
          studyTime: 0
        });
        setName('');
      }
    };
  
    return (
      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New module name"
          className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          maxLength="50"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          Add Module
        </button>
      </form>
    );
  };

  export default ModuleForm;