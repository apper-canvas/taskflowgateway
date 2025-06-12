import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';

function TaskForm({ categories, showAddForm, onAddTask, onCancel }) {
  const [newTask, setNewTask] = useState({
    title: '',
    category: '',
    priority: 'medium',
    dueDate: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    await onAddTask(newTask);
    setNewTask({ title: '', category: '', priority: 'medium', dueDate: '' });
  };

  const handleCancel = () => {
    setNewTask({ title: '', category: '', priority: 'medium', dueDate: '' });
    onCancel();
  };

  return (
    <AnimatePresence>
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-surface-200">
            <div className="space-y-4">
              <FormField>
                <Input
                  type="text"
                  placeholder="What needs to be done?"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  autoFocus
                />
              </FormField>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                    className="px-4 py-3 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </FormField>
                <FormField>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                    className="px-4 py-3 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </FormField>
                <FormField>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </FormField>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-surface-600 hover:text-surface-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transform hover:scale-105 active:scale-95"
                >
                  Add Task
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TaskForm;