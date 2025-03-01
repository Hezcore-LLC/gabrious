import { toast } from "@/hooks/use-toast";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const studyNotesService = {
  getStudyNotes: async (id: string): Promise<StudyNotes> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/study-notes/${id}`);
      console.log(response)
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
      const response = await fetch(`${API_BASE_URL}/api/study-notes`);
      
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