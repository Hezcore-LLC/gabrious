import { toast } from "@/hooks/use-toast";
import { authService } from "./authService";
import { API_BASE_URL } from "./utils";

export interface Scripture {
  reference: string;
  text: string;
}

export interface Commentary {
  source: string;
  text: string;
}

export interface HistoricalNote {
  term: string;
  explanation: string;
}

export interface StudyNotes {
  id: string;
  title: string;
  pastor: string;
  church: string;
  date: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  format: "christian" | "jewish";
  depthMode?: "basic" | "intermediate" | "advanced";
  summary: string;
  keyPoints: string[];
  scriptures: Scripture[];
  discussionQuestions: string[];
  applicationPoints: string[];
  transcriptionId: string;
  created_at: string;
  updated_at: string;
  // Jewish-specific fields
  mainText?: string;
  commentaryLayer?: Commentary[];
  ethicalInsight?: string;
  historicalNotes?: HistoricalNote[];
}

export const studyNotesService = {
  getStudyNotes: async (id: string): Promise<StudyNotes> => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/study-notes/${id}`, {
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

      const response = await fetch(`${API_BASE_URL}/api/study-notes/`, {
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

  getTranscript: async (transcriptionId: string): Promise<string> => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/transcriptions/${transcriptionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Transcript not found');
        }
        throw new Error('Failed to fetch transcript');
      }

      const data = await response.json();
      return data.transcription_text || 'No transcript available';
    } catch (error) {
      console.error('Error fetching transcript:', error);
      throw error;
    }
  },

  updateTranscript: async (transcriptionId: string, transcriptText: string): Promise<void> => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/transcriptions/${transcriptionId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transcription_text: transcriptText })
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Transcript not found');
        }
        throw new Error('Failed to update transcript');
      }
    } catch (error) {
      console.error('Error updating transcript:', error);
      throw error;
    }
  },

  regenerateStudyNotes: async (
    notesId: string, 
    format: "christian" | "jewish",
    depthMode: "basic" | "intermediate" | "advanced" = "intermediate"
  ): Promise<{ task_id: string }> => {
    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/study-notes/${notesId}/regenerate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ format, depth_mode: depthMode })
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Study notes not found');
        }
        throw new Error('Failed to regenerate study notes');
      }

      return response.json();
    } catch (error) {
      console.error('Error regenerating study notes:', error);
      throw error;
    }
  },
};
