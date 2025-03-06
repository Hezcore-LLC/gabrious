'use client';

import { useEffect, useState } from 'react';
import { StudyNotes } from '@/lib/types';
import { favoritesService } from '@/lib/favoritesService';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/card';
import { Loader2, Clock, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<StudyNotes[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const data = await favoritesService.getFavorites();
        setFavorites(data);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        toast({
          title: 'Error',
          description: 'Failed to load favorites. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [toast]);

  const handleRemoveFromFavorites = async (id: string) => {
    try {
      await favoritesService.removeFromFavorites(id);
      setFavorites(favorites.filter(note => note.id !== id));
      toast({
        title: 'Success',
        description: 'Removed from favorites',
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove from favorites',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Favorites</h1>
      
      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
          <p className="text-gray-500 mb-4">You haven't added any study notes to your favorites.</p>
          <Link href="/dashboard">
            <Button>Browse Study Notes</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((note) => (
            <Card key={note.id} className="flex flex-col h-full">
              <CardHeader className="pb-2">
                <div className="relative w-full h-40 mb-2 rounded-md overflow-hidden">
                  {note.thumbnail ? (
                    <Image 
                      src={note.thumbnail} 
                      alt={note.title} 
                      fill 
                      className="object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No thumbnail</span>
                    </div>
                  )}
                </div>
                <CardTitle className="line-clamp-2">{note.title}</CardTitle>
                <CardDescription>
                  {note.pastor} • {note.duration}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-500 line-clamp-3 mb-2">{note.summary}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{new Date(note.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRemoveFromFavorites(note.id)}
                  >
                    <Heart className="h-4 w-4 mr-1 fill-current" /> Unfavorite
                  </Button>
                  <Link href={`/study-notes/${note.id}`}>
                    <Button size="sm">View</Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}