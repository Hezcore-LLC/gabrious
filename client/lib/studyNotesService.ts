import { toast } from "@/hooks/use-toast";
import { authService } from "./authService";
import { API_BASE_URL } from "./utils";

export interface Scripture {
  reference: string;
  text: string;
}

export interface StudyNotes {
  id: string;
  title: string;
  pastor: string;
  church: string;
  date: string;
  duration: string;
  thumbnail: string;
  summary: string;
  keyPoints: string[];
  scriptures: Scripture[];
  discussionQuestions: string[];
  applicationPoints: string[];
  transcriptionId: string;
  created_at: string;
  updated_at: string;
}

export const studyNotesService = {
  getStudyNotes: async (id: string): Promise<StudyNotes> => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/study-notes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Study notes not found');
        }
        throw new Error('Failed to fetch study notes');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching study notes:', error);
      throw error;
    }
  },

  getRecentStudyNotes: async (): Promise<StudyNotes[]> => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/study-notes/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent study notes');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching recent study notes:', error);
      throw error;
    }
  },
};