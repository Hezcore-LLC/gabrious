import { StudyNotes } from "./types";
import { authService } from "./authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const favoritesService = {
  async addToFavorites(notesId: string): Promise<{ message: string }> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_URL}/api/favorites/${notesId}`, {
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
    
    const response = await fetch(`${API_URL}/api/favorites/${notesId}`, {
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
    
    const response = await fetch(`${API_URL}/api/favorites`, {
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