export async function generateStaticParams() {
  // Mock data - in a real app, this would come from your API or database
  const sermonIds = ["1", "2", "3", "4"];
  
  return sermonIds.map((id) => ({
    id: id,
  }));
}

export default function StudyNotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}