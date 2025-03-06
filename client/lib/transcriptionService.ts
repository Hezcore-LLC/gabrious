import { toast } from "@/hooks/use-toast";
import { authService } from "./authService";

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
      const token = authService.getToken();
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/transcriptions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ video_url: url }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout(); // Clear invalid token
          toast({
            title: "Session Expired",
            description: "Please log in again to continue.",
            variant: "destructive",
          });
          throw new Error('Session expired. Please log in again.');
        }
        toast({
          title: "Error",
          description: "Failed to submit URL for transcription. Please try again.",
          variant: "destructive",
        });
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
      const token = authService.getToken();
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/transcriptions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          authService.logout(); // Clear invalid token
          toast({
            title: "Session Expired",
            description: "Please log in again to continue.",
            variant: "destructive",
          });
          throw new Error('Session expired. Please log in again.');
        }
        toast({
          title: "Error",
          description: "Failed to fetch transcription. Please try again.",
          variant: "destructive",
        });
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
      const token = authService.getToken();
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/transcriptions/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          authService.logout(); // Clear invalid token
          toast({
            title: "Session Expired",
            description: "Please log in again to continue.",
            variant: "destructive",
          });
          throw new Error('Session expired. Please log in again.');
        }
        toast({
          title: "Error",
          description: "Failed to fetch recent transcriptions. Please try again.",
          variant: "destructive",
        });
        throw new Error('Failed to fetch recent transcriptions');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching recent transcriptions:', error);
      throw error;
    }
  },
};