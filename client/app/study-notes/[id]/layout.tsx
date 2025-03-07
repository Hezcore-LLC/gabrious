import { studyNotesService } from '@/lib/studyNotesService';
import { authService } from '@/lib/authService';

export async function generateStaticParams() {
  try {
    // Check if we can authenticate during static generation
    const token = authService.getToken();
    
    // If no token is available during static generation, return empty array
    // This prevents errors during build while still allowing dynamic routes
    if (!token) {
      console.log('No authentication token available during static generation');
      return [];
    }
    
    // Fetch all study notes from the API
    const studyNotes = await studyNotesService.getRecentStudyNotes();
    
    // Map the study notes to the required format for generateStaticParams
    return studyNotes.map((note) => ({
      id: note.id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params for study notes:', error);
    // Return empty array as fallback to prevent build failures
    return [];
  }
}

export default function StudyNotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}