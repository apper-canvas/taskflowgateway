import { toast } from 'react-toastify';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class CategoryService {
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
  formatCategoryForDatabase(categoryData, isUpdate = false) {
    const updateableFields = {
      Name: categoryData.name || categoryData.Name,
      color: categoryData.color,
      task_count: categoryData.taskCount || categoryData.task_count || 0,
      Tags: categoryData.Tags || '',
      Owner: categoryData.Owner || null
    };

    // Filter out undefined values
    const filteredData = {};
    Object.keys(updateableFields).forEach(key => {
      if (updateableFields[key] !== undefined) {
        filteredData[key] = updateableFields[key];
      }
    });

    if (isUpdate && categoryData.id) {
      filteredData.Id = parseInt(categoryData.id);
    }

    return filteredData;
  }

  // Format database response for UI
  formatCategoryFromDatabase(dbCategory) {
    return {
      id: dbCategory.Id?.toString() || dbCategory.id?.toString(),
      name: dbCategory.Name || dbCategory.name,
      color: dbCategory.color || '#6B7280',
      taskCount: dbCategory.task_count || 0,
      Name: dbCategory.Name,
      Tags: dbCategory.Tags || '',
      Owner: dbCategory.Owner
    };
  }

  async getAll() {
    try {
      await delay(150);
      
      const params = {
        fields: ['Id', 'Name', 'color', 'task_count', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };

      const response = await this.apperClient.fetchRecords('category', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(category => this.formatCategoryFromDatabase(category));
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
      return [];
    }
  }

  async getById(id) {
    try {
      await delay(100);
      
      const params = {
        fields: ['Id', 'Name', 'color', 'task_count', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };

      const response = await this.apperClient.getRecordById('category', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        throw new Error('Category not found');
      }

      return this.formatCategoryFromDatabase(response.data);
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error);
      throw error;
    }
  }

  async create(categoryData) {
    try {
      await delay(200);
      
      const formattedData = this.formatCategoryForDatabase({
        ...categoryData,
        task_count: 0
      });

      const params = {
        records: [formattedData]
      };

      const response = await this.apperClient.createRecord('category', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create category:${failedRecords}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
          throw new Error('Failed to create category');
        }
        
        if (successfulRecords.length > 0) {
          return this.formatCategoryFromDatabase(successfulRecords[0].data);
        }
      }

      throw new Error('No data returned from create operation');
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  async update(id, updates) {
    try {
      await delay(200);
      
      const formattedData = this.formatCategoryForDatabase({
        id: id,
        ...updates
      }, true);

      const params = {
        records: [formattedData]
      };

      const response = await this.apperClient.updateRecord('category', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update category:${failedUpdates}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
          throw new Error('Failed to update category');
        }
        
        if (successfulUpdates.length > 0) {
          return this.formatCategoryFromDatabase(successfulUpdates[0].data);
        }
      }

      throw new Error('No data returned from update operation');
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await delay(150);
      
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord('category', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete category:${failedDeletions}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
        
        return successfulDeletions.length > 0;
      }

      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }
}

export default new CategoryService();
export default new CategoryService();