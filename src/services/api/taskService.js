import tasksData from '../mockData/tasks.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class TaskService {
  constructor() {
    this.tasks = this.loadFromStorage() || [...tasksData];
    this.saveToStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('taskflow_tasks');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('taskflow_tasks', JSON.stringify(this.tasks));
    } catch (error) {
      console.warn('Failed to save tasks to localStorage:', error);
    }
  }

  async getAll() {
    await delay(200);
    return [...this.tasks].sort((a, b) => {
      // Sort by: incomplete first, then by created date desc
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  async getById(id) {
    await delay(150);
    const task = this.tasks.find(t => t.id === id);
    if (!task) {
      throw new Error('Task not found');
    }
    return { ...task };
  }

  async create(taskData) {
    await delay(300);
    const newTask = {
      id: Date.now().toString(),
      title: taskData.title,
      category: taskData.category || 'general',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || null,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      ...taskData
    };
    
    this.tasks.unshift(newTask);
    this.saveToStorage();
    return { ...newTask };
  }

  async update(id, updates) {
    await delay(250);
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Task not found');
    }
    
    this.tasks[index] = { ...this.tasks[index], ...updates };
    this.saveToStorage();
    return { ...this.tasks[index] };
  }

  async delete(id) {
    await delay(200);
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Task not found');
    }
    
    this.tasks.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  async getByCategory(category) {
    await delay(200);
    return this.tasks.filter(t => t.category === category).map(t => ({ ...t }));
  }

  async getCompleted() {
    await delay(200);
    return this.tasks.filter(t => t.completed).map(t => ({ ...t }));
  }

  async getPending() {
    await delay(200);
    return this.tasks.filter(t => !t.completed).map(t => ({ ...t }));
  }
}

export default new TaskService();