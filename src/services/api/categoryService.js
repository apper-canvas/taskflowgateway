import categoriesData from '../mockData/categories.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class CategoryService {
  constructor() {
    this.categories = this.loadFromStorage() || [...categoriesData];
    this.saveToStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('taskflow_categories');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('taskflow_categories', JSON.stringify(this.categories));
    } catch (error) {
      console.warn('Failed to save categories to localStorage:', error);
    }
  }

  async getAll() {
    await delay(150);
    return [...this.categories];
  }

  async getById(id) {
    await delay(100);
    const category = this.categories.find(c => c.id === id);
    if (!category) {
      throw new Error('Category not found');
    }
    return { ...category };
  }

  async create(categoryData) {
    await delay(200);
    const newCategory = {
      id: Date.now().toString(),
      name: categoryData.name,
      color: categoryData.color || '#6B7280',
      taskCount: 0,
      ...categoryData
    };
    
    this.categories.push(newCategory);
    this.saveToStorage();
    return { ...newCategory };
  }

  async update(id, updates) {
    await delay(200);
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }
    
    this.categories[index] = { ...this.categories[index], ...updates };
    this.saveToStorage();
    return { ...this.categories[index] };
  }

  async delete(id) {
    await delay(150);
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }
    
    this.categories.splice(index, 1);
    this.saveToStorage();
    return true;
  }
}

export default new CategoryService();