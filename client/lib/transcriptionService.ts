import { toast } from "@/hooks/use-toast";

export interface Transcription {
  id: string;
  video_url: string;
  title: string | null;
  thumbnail: string | null;
  status: string;
  transcription_text: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const transcriptionService = {
  submitUrl: async (url: string): Promise<{ id: string; status: string; task_id: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/transcriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ video_url: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit URL for transcription');
      }

      return response.json();
    } catch (error) {
      console.error('Error submitting URL:', error);
      throw error;
    }
  },

  getTranscription: async (id: string): Promise<Transcription> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/transcriptions/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transcription');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching transcription:', error);
      throw error;
    }
  },

  getRecentTranscriptions: async (): Promise<Transcription[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/transcriptions`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent transcriptions');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching recent transcriptions:', error);
      throw error;
    }
  },
};