import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, isToday, isPast, parseISO } from 'date-fns';
import MainFeature from '../components/MainFeature';
import ApperIcon from '../components/ApperIcon';
import TaskService from '../services/api/taskService';
import CategoryService from '../services/api/categoryService';

function Home() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    category: '',
    priority: 'medium',
    dueDate: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksData, categoriesData] = await Promise.all([
        TaskService.getAll(),
        CategoryService.getAll()
      ]);
      setTasks(tasksData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      const taskData = {
        ...newTask,
        title: newTask.title.trim(),
        dueDate: newTask.dueDate || null,
        category: newTask.category || 'general'
      };
      
      const createdTask = await TaskService.create(taskData);
      setTasks(prev => [createdTask, ...prev]);
      setNewTask({ title: '', category: '', priority: 'medium', dueDate: '' });
      setShowAddForm(false);
      toast.success('Task added successfully');
    } catch (err) {
      toast.error('Failed to add task');
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const updatedTask = await TaskService.update(taskId, {
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null
      });
      
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      
      if (updatedTask.completed) {
        toast.success('Task completed! 🎉');
      } else {
        toast.info('Task marked as incomplete');
      }
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await TaskService.delete(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.size === 0) return;
    
    try {
      await Promise.all(Array.from(selectedTasks).map(id => TaskService.delete(id)));
      setTasks(prev => prev.filter(t => !selectedTasks.has(t.id)));
      setSelectedTasks(new Set());
      setSelectionMode(false);
      toast.success(`${selectedTasks.size} tasks deleted`);
    } catch (err) {
      toast.error('Failed to delete tasks');
    }
  };

  const handleBulkComplete = async () => {
    if (selectedTasks.size === 0) return;
    
    try {
      const updates = Array.from(selectedTasks).map(async (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task.completed) {
          return TaskService.update(id, {
            completed: true,
            completedAt: new Date().toISOString()
          });
        }
        return task;
      });
      
      const updatedTasks = await Promise.all(updates);
      setTasks(prev => prev.map(task => {
        const updated = updatedTasks.find(u => u.id === task.id);
        return updated || task;
      }));
      
      setSelectedTasks(new Set());
      setSelectionMode(false);
      toast.success(`${selectedTasks.size} tasks completed`);
    } catch (err) {
      toast.error('Failed to complete tasks');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || task.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-danger';
      case 'medium': return 'border-l-accent';
      case 'low': return 'border-l-success';
      default: return 'border-l-surface-300';
    }
  };

  const getCategoryColor = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#6B7280';
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const date = parseISO(dueDate);
    return isPast(date) && !isToday(date);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-surface-200 rounded w-48 mb-4"></div>
            <div className="h-12 bg-surface-200 rounded mb-6"></div>
          </div>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-surface-200 rounded w-3/4"></div>
                <div className="h-4 bg-surface-200 rounded w-1/2"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <ApperIcon name="AlertCircle" className="w-16 h-16 text-danger mx-auto mb-4" />
          <h3 className="text-lg font-medium text-surface-900 mb-2">Something went wrong</h3>
          <p className="text-surface-500 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-surface-900 mb-2">TaskFlow</h1>
        <p className="text-surface-600">Stay organized and get things done</p>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {selectionMode && (
              <>
                <button
                  onClick={handleBulkComplete}
                  disabled={selectedTasks.size === 0}
                  className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Complete ({selectedTasks.size})
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedTasks.size === 0}
                  className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Delete ({selectedTasks.size})
                </button>
                <button
                  onClick={() => {
                    setSelectionMode(false);
                    setSelectedTasks(new Set());
                  }}
                  className="px-4 py-2 bg-surface-200 text-surface-700 rounded-lg hover:bg-surface-300 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
            {!selectionMode && (
              <>
                <button
                  onClick={() => setSelectionMode(true)}
                  className="px-4 py-2 bg-surface-200 text-surface-700 rounded-lg hover:bg-surface-300 transition-colors"
                >
                  Select
                </button>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors transform hover:scale-105 active:scale-95"
                >
                  <ApperIcon name="Plus" className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-primary text-white'
                : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
            }`}
          >
            All ({tasks.length})
          </button>
          {categories.map(category => {
            const count = tasks.filter(t => t.category === category.name).length;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category.name
                    ? 'text-white'
                    : 'text-surface-700 hover:opacity-80'
                }`}
                style={{
                  backgroundColor: activeCategory === category.name ? category.color : `${category.color}20`,
                  borderColor: category.color
                }}
              >
                {category.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Task Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <form onSubmit={handleAddTask} className="bg-white rounded-xl p-6 shadow-sm border border-surface-200">
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="What needs to be done?"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                    className="px-4 py-3 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="px-4 py-3 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewTask({ title: '', category: '', priority: 'medium', dueDate: '' });
                    }}
                    className="px-4 py-2 text-surface-600 hover:text-surface-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors transform hover:scale-105 active:scale-95"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks List */}
      <MainFeature 
        tasks={filteredTasks}
        categories={categories}
        selectionMode={selectionMode}
        selectedTasks={selectedTasks}
        onToggleComplete={handleToggleComplete}
        onDeleteTask={handleDeleteTask}
        onToggleSelect={(taskId) => {
          setSelectedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
              newSet.delete(taskId);
            } else {
              newSet.add(taskId);
            }
            return newSet;
          });
        }}
        getPriorityColor={getPriorityColor}
        getCategoryColor={getCategoryColor}
        isOverdue={isOverdue}
      />

      {/* Floating Add Button */}
      {!showAddForm && !selectionMode && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAddForm(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center z-40"
        >
          <ApperIcon name="Plus" className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  );
}

export default Home;