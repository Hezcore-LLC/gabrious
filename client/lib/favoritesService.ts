interface StudyNotes {
  id: string;
  title: string;
  content: string;
  // Add other required properties based on your application needs
}

export type { StudyNotes };
import { authService } from "./authService";
import { API_BASE_URL } from './utils';

export const favoritesService = {
  async addToFavorites(notesId: string): Promise<{ message: string }> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_BASE_URL}/favorites/${notesId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to add to favorites');
    }

    return response.json();
  },

  async removeFromFavorites(notesId: string): Promise<{ message: string }> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_BASE_URL}/favorites/${notesId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to remove from favorites');
    }

    return response.json();
  },

  async getFavorites(): Promise<StudyNotes[]> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch favorites');
    }

    return response.json();
  }
};