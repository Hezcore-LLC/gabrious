import { StudyNotes } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const favoritesService = {
  async addToFavorites(notesId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/api/favorites/${notesId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to add to favorites');
    }

    return response.json();
  },

  async removeFromFavorites(notesId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/api/favorites/${notesId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to remove from favorites');
    }

    return response.json();
  },

  async getFavorites(): Promise<StudyNotes[]> {
    const response = await fetch(`${API_URL}/api/favorites`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch favorites');
    }

    return response.json();
  }
};