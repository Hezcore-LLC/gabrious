import { authService } from "./authService";

export interface DashboardStatistics {
  total_sermons: number;
  sermons_last_month: number;
  total_notes: number;
  notes_last_month: number;
  total_favorites: number;
  favorites_last_month: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const statisticsService = {
  getDashboardStatistics: async (): Promise<DashboardStatistics> => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/statistics/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw error;
    }
  }
};