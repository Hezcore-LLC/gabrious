import { studyNotesService } from '@/lib/studyNotesService';

export async function generateStaticParams() {
  try {
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