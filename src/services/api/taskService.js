import { toast } from 'react-toastify';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class TaskService {
  constructor() {
    this.apperClient = null;
    this.initializeClient();
  }

  initializeClient() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }

  // Format data for database - only include Updateable fields
  formatTaskForDatabase(taskData, isUpdate = false) {
    const updateableFields = {
      Name: taskData.title || taskData.Name,
      title: taskData.title,
      category: parseInt(taskData.category) || null, // Lookup field - convert to integer
      priority: taskData.priority,
      due_date: taskData.dueDate || taskData.due_date,
      completed: Boolean(taskData.completed),
      created_at: taskData.createdAt || taskData.created_at,
      completed_at: taskData.completedAt || taskData.completed_at,
      Tags: taskData.Tags || '',
      Owner: taskData.Owner || null
    };

    // Filter out undefined values
    const filteredData = {};
    Object.keys(updateableFields).forEach(key => {
      if (updateableFields[key] !== undefined) {
        filteredData[key] = updateableFields[key];
      }
    });

    if (isUpdate && taskData.id) {
      filteredData.Id = parseInt(taskData.id);
    }

    return filteredData;
  }

  // Format database response for UI
  formatTaskFromDatabase(dbTask) {
    return {
      id: dbTask.Id?.toString() || dbTask.id?.toString(),
      title: dbTask.title || dbTask.Name,
      category: dbTask.category?.toString() || 'general',
      priority: dbTask.priority || 'medium',
      dueDate: dbTask.due_date,
      completed: Boolean(dbTask.completed),
      createdAt: dbTask.created_at || dbTask.CreatedOn,
      completedAt: dbTask.completed_at,
      Name: dbTask.Name,
      Tags: dbTask.Tags || '',
      Owner: dbTask.Owner
    };
  }

  async getAll() {
    try {
      await delay(200);
      
      const params = {
        fields: ['Id', 'Name', 'title', 'category', 'priority', 'due_date', 'completed', 'created_at', 'completed_at', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy'],
        orderBy: [
          {
            fieldName: 'completed',
            SortType: 'ASC'
          },
          {
            fieldName: 'created_at',
            SortType: 'DESC'
          }
        ]
      };

      const response = await this.apperClient.fetchRecords('task', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(task => this.formatTaskFromDatabase(task));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
      return [];
    }
  }

  async getById(id) {
    try {
      await delay(150);
      
      const params = {
        fields: ['Id', 'Name', 'title', 'category', 'priority', 'due_date', 'completed', 'created_at', 'completed_at', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };

      const response = await this.apperClient.getRecordById('task', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        throw new Error('Task not found');
      }

      return this.formatTaskFromDatabase(response.data);
    } catch (error) {
      console.error(`Error fetching task with ID ${id}:`, error);
      throw error;
    }
  }

  async create(taskData) {
    try {
      await delay(300);
      
      const formattedData = this.formatTaskForDatabase({
        ...taskData,
        completed: false,
        created_at: new Date().toISOString(),
        completed_at: null
      });

      const params = {
        records: [formattedData]
      };

      const response = await this.apperClient.createRecord('task', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create task:${failedRecords}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
          throw new Error('Failed to create task');
        }
        
        if (successfulRecords.length > 0) {
          return this.formatTaskFromDatabase(successfulRecords[0].data);
        }
      }

      throw new Error('No data returned from create operation');
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  async update(id, updates) {
    try {
      await delay(250);
      
      const formattedData = this.formatTaskForDatabase({
        id: id,
        ...updates
      }, true);

      const params = {
        records: [formattedData]
      };

      const response = await this.apperClient.updateRecord('task', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update task:${failedUpdates}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
          throw new Error('Failed to update task');
        }
        
        if (successfulUpdates.length > 0) {
          return this.formatTaskFromDatabase(successfulUpdates[0].data);
        }
      }

      throw new Error('No data returned from update operation');
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await delay(200);
      
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord('task', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete task:${failedDeletions}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
        
        return successfulDeletions.length > 0;
      }

      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }

  async getByCategory(category) {
    try {
      await delay(200);
      
      const params = {
        fields: ['Id', 'Name', 'title', 'category', 'priority', 'due_date', 'completed', 'created_at', 'completed_at', 'Tags', 'Owner'],
        where: [
          {
            fieldName: 'category',
            operator: 'EqualTo',
            values: [category.toString()]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords('task', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (!response.data) {
        return [];
      }

      return response.data.map(task => this.formatTaskFromDatabase(task));
    } catch (error) {
      console.error("Error fetching tasks by category:", error);
      return [];
    }
  }

  async getCompleted() {
    try {
      await delay(200);
      
      const params = {
        fields: ['Id', 'Name', 'title', 'category', 'priority', 'due_date', 'completed', 'created_at', 'completed_at', 'Tags', 'Owner'],
        where: [
          {
            fieldName: 'completed',
            operator: 'ExactMatch',
            values: ['true']
          }
        ]
      };

      const response = await this.apperClient.fetchRecords('task', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (!response.data) {
        return [];
      }

      return response.data.map(task => this.formatTaskFromDatabase(task));
    } catch (error) {
      console.error("Error fetching completed tasks:", error);
      return [];
    }
  }

  async getPending() {
    try {
      await delay(200);
      
      const params = {
        fields: ['Id', 'Name', 'title', 'category', 'priority', 'due_date', 'completed', 'created_at', 'completed_at', 'Tags', 'Owner'],
        where: [
          {
            fieldName: 'completed',
            operator: 'ExactMatch',
            values: ['false']
          }
        ]
      };

      const response = await this.apperClient.fetchRecords('task', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (!response.data) {
        return [];
      }

      return response.data.map(task => this.formatTaskFromDatabase(task));
    } catch (error) {
      console.error("Error fetching pending tasks:", error);
      return [];
    }
  }
}

export default new TaskService();