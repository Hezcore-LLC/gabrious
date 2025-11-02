import { authService } from "./authService";
import { API_BASE_URL } from "./utils";

export interface StorageStats {
  used: number;
  total: number;
  percentage: number;
  used_formatted: string;
  total_formatted: string;
}

export const storageService = {
  getStorageUsage: async (): Promise<StorageStats> => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/storage/usage`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch storage usage');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching storage usage:', error);
      throw error;
    }
  },

  checkStorageLimit: async (fileSize: number): Promise<boolean> => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/storage/check-limit?file_size=${fileSize}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 400) {
          // Storage limit exceeded
          return false;
        }
        throw new Error('Failed to check storage limit');
      }

      const data = await response.json();
      return data.has_space;
    } catch (error) {
      console.error('Error checking storage limit:', error);
      throw error;
    }
  }
};