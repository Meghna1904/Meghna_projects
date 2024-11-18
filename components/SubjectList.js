// components/SubjectList.js
import { useState } from 'react';
import { ChevronDown, ChevronRight, Trash, Plus } from 'lucide-react';

export default function SubjectList({ 
  subjects, 
  onAddModule, 
  onToggleModule, 
  onToggleExpand,
  onDeleteSubject,
  onDeleteModule
}) {
  const [newModules, setNewModules] = useState({});

  const handleAddModule = (subjectId) => {
    const moduleName = newModules[subjectId]?.trim();
    if (moduleName) {
      onAddModule(subjectId, moduleName);
      setNewModules({ ...newModules, [subjectId]: '' });
    }
  };

  return (
    <div className="space-y-4">
      {subjects.map(subject => (
        <div key={subject.id} className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleExpand(subject.id)}
                className="text-gray-500 hover:text-gray-700"
              >
                {subject.expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>
              <h3 className="text-xl font-semibold">{subject.name}</h3>
            </div>
            <button
              onClick={() => onDeleteSubject(subject.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash size={20} />
            </button>
          </div>

          {subject.expanded && (
            <div className="p-4 space-y-4">
              {/* Add Module Form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newModules[subject.id] || ''}
                  onChange={(e) => setNewModules({ 
                    ...newModules, 
                    [subject.id]: e.target.value 
                  })}
                  placeholder="Add new module"
                  className="flex-1 p-2 border rounded"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddModule(subject.id)}
                />
                <button
                  onClick={() => handleAddModule(subject.id)}
                  className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Modules List */}
              <div className="space-y-2">
                {subject.modules.map(module => (
                  <div
                    key={module.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={module.completed}
                        onChange={() => onToggleModule(subject.id, module.id)}
                        className="h-5 w-5"
                      />
                      <span className={module.completed ? 'line-through text-gray-500' : ''}>
                        {module.name}
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteModule(subject.id, module.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Subject Progress */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 rounded-full h-2 transition-all duration-500"
                    style={{
                      width: `${subject.modules.length > 0
                        ? (subject.modules.filter(m => m.completed).length / subject.modules.length) * 100
                        : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
