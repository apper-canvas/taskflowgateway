import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { isToday, isPast, parseISO } from 'date-fns';

import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import TaskList from '@/components/organisms/TaskList';
import TaskForm from '@/components/organisms/TaskForm';
import TaskHeader from '@/components/organisms/TaskHeader';
import CategoryFilter from '@/components/organisms/CategoryFilter';

import TaskService from '@/services/api/taskService';
import CategoryService from '@/services/api/categoryService';

function HomePage() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddTask = async (newTaskData) => {
    try {
      const taskData = {
        ...newTaskData,
        title: newTaskData.title.trim(),
        dueDate: newTaskData.dueDate || null,
        category: newTaskData.category || 'general'
      };
      
      const createdTask = await TaskService.create(taskData);
      setTasks(prev => [createdTask, ...prev]);
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

  const handleToggleSelect = useCallback((taskId) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || task.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getPriorityColor = useCallback((priority) => {
    switch (priority) {
      case 'high': return 'border-l-danger';
      case 'medium': return 'border-l-accent';
      case 'low': return 'border-l-success';
      default: return 'border-l-surface-300';
    }
  }, []);

  const getCategoryColor = useCallback((categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#6B7280';
  }, [categories]);

  const isOverdue = useCallback((dueDate) => {
    if (!dueDate) return false;
    const date = parseISO(dueDate);
    return isPast(date) && !isToday(date);
  }, []);

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
          <Button
            onClick={loadData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary"
          >
            Try Again
          </Button>
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
      <TaskHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectionMode={selectionMode}
        setSelectionMode={(mode) => {
          setSelectionMode(mode);
          if (!mode) setSelectedTasks(new Set()); // Clear selection if selection mode is turned off
        }}
        selectedTasks={selectedTasks}
        onBulkComplete={handleBulkComplete}
        onBulkDelete={handleBulkDelete}
        onShowAddForm={() => setShowAddForm(true)}
      />

      {/* Category Filters */}
      <CategoryFilter
        categories={categories}
        tasks={tasks}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* Add Task Form */}
      <TaskForm
        categories={categories}
        showAddForm={showAddForm}
        onAddTask={handleAddTask}
        onCancel={() => setShowAddForm(false)}
      />

      {/* Tasks List */}
      <TaskList 
        tasks={filteredTasks}
        selectionMode={selectionMode}
        selectedTasks={selectedTasks}
        onToggleComplete={handleToggleComplete}
        onDeleteTask={handleDeleteTask}
        onToggleSelect={handleToggleSelect}
        getPriorityColor={getPriorityColor}
        getCategoryColor={getCategoryColor}
        isOverdue={isOverdue}
        onAddFirstTaskClick={() => setShowAddForm(true)} // Callback for empty state button
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

export default HomePage;