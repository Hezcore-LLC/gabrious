"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Clock, Download, FileText, Heart, MoreHorizontal, Search, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

// Default fallback image for sermons without thumbnails
const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1470&auto=format&fit=crop";

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Helper function to calculate progress based on status
const getProgressFromStatus = (status: string) => {
  switch (status) {
    case 'pending': return 10;
    case 'downloading': return 30;
    case 'processing': return 60;
    case 'generating_notes': return 80;
    case 'completed': return 100;
    case 'failed': return 0;
    default: return 50;
  }
};

// Helper function to format status for display
const formatStatus = (status: string) => {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Helper to determine if a status is considered "processing"
const isProcessingStatus = (status: string) => {
  return ['pending', 'downloading', 'processing', 'generating_notes'].includes(status);
};

// Helper to format duration
const formatDuration = (seconds: number | null) => {
  if (!seconds) return "--:--";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const favoriteSermons = [
  {
    id: "1",
    title: "Finding Peace in Troubled Times",
    pastor: "Pastor John Smith",
    date: "May 15, 2025",
    thumbnail: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1470&auto=format&fit=crop"
  },
  {
    id: "4",
    title: "The Grace of God",
    pastor: "Pastor David Lee",
    date: "April 24, 2025",
    thumbnail: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=1470&auto=format&fit=crop"
  }
];

import { transcriptionService, Transcription } from '@/lib/transcriptionService';
import { studyNotesService, StudyNotes } from '@/lib/studyNotesService';
import { statisticsService } from '@/lib/statisticsService';
import { favoritesService } from '@/lib/favoritesService';
import { storageService, StorageStats } from '@/lib/storageService';
import { useEffect } from 'react';
import Image from 'next/image';

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [studyNotes, setStudyNotes] = useState<StudyNotes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [statistics, setStatistics] = useState({
    total_sermons: 0,
    sermons_last_month: 0,
    total_notes: 0,
    notes_last_month: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<StudyNotes[]>([]);
  const [storageData, setStorageData] = useState<StorageStats>({ 
    used: 0, 
    total: 0, 
    percentage: 0, 
    used_formatted: '0 MB', 
    total_formatted: '0 GB' 
  });
  const [isLoadingStorage, setIsLoadingStorage] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await statisticsService.getDashboardStatistics();
        setStatistics(data);
      } catch (err) {
        setStatsError('Failed to fetch statistics');
        console.error('Error fetching statistics:', err);
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    const fetchStorageData = async () => {
      try {
        const data = await storageService.getStorageUsage();
        setStorageData(data);
      } catch (err) {
        setStorageError('Failed to fetch storage data');
        console.error('Error fetching storage data:', err);
      } finally {
        setIsLoadingStorage(false);
      }
    };

    const fetchTranscriptions = async () => {
      try {
        const data = await transcriptionService.getRecentTranscriptions();
        setTranscriptions(data);
      } catch (err) {
        setError('Failed to fetch transcriptions');
        console.error('Error fetching transcriptions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchStudyNotes = async () => {
      try {
        const data = await studyNotesService.getRecentStudyNotes();
        setStudyNotes(data);
      } catch (err) {
        setNotesError('Failed to fetch study notes');
        console.error('Error fetching study notes:', err);
      } finally {
        setIsLoadingNotes(false);
      }
    };

    const fetchFavorites = async () => {
      try {
        const data = await favoritesService.getFavorites();
        setFavorites(data);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        toast({
          title: 'Error',
          description: 'Failed to load favorites. Please try again.',
          variant: 'destructive',
        });
      }
    };

    fetchStatistics();
    fetchTranscriptions();
    fetchStudyNotes();
    fetchFavorites();
    fetchStorageData();
  }, []);

  return (
    <div className="container py-6 md:py-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload Sermon
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Sermons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_sermons}</div>
              <p className="text-xs text-muted-foreground">+{statistics.sermons_last_month} from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Study Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_notes}</div>
              <p className="text-xs text-muted-foreground">+{statistics.notes_last_month} from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Saved Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_favorites}</div>
              <p className="text-xs text-muted-foreground">+{statistics.favorites_last_month} from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStorage ? (
                <div className="space-y-2">
                  <div className="h-6 w-24 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                  <div className="mt-2 h-2 bg-muted animate-pulse rounded"></div>
                </div>
              ) : storageError ? (
                <div className="text-sm text-destructive">{storageError}</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{storageData.used_formatted}</div>
                  <p className="text-xs text-muted-foreground">of {storageData.total_formatted}</p>
                  <Progress value={storageData.percentage} className="mt-2 h-2" />
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search sermons..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="recent">
          <TabsList>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="sermons">Sermons</TabsTrigger>
            <TabsTrigger value="notes">Study Notes</TabsTrigger>
            <TabsTrigger value="favorites">
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-2" />
                Favorites
              </div>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="recent" className="mt-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                <div className="col-span-full flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground">Loading transcriptions...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-sm text-destructive">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : transcriptions.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-sm text-muted-foreground">No transcriptions found</p>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href="/upload">Upload Your First Sermon</Link>
                  </Button>
                </div>
              ) : transcriptions.map((sermon) => (
                <Card key={sermon.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={sermon.thumbnail || DEFAULT_THUMBNAIL}
                      alt={sermon.title || 'Sermon'}
                      className="object-cover w-full h-full"
                    />
                    {isProcessingStatus(sermon.status) && (
                      <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center p-4">
                        <p className="text-sm font-medium mb-2">{formatStatus(sermon.status)}: {getProgressFromStatus(sermon.status)}%</p>
                        <Progress value={getProgressFromStatus(sermon.status)} className="w-full h-2" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{sermon.title || 'Untitled Sermon'}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Heart className="mr-2 h-4 w-4" />
                            Add to favorites
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            View transcript
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>
                      {sermon.video_url && (
                        <span className="truncate block">{new URL(sermon.video_url).hostname}</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      <Badge variant="outline" className="text-xs">{formatStatus(sermon.status)}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{formatDate(sermon.created_at)}</div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="sermons" className="mt-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                <div className="col-span-full flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground">Loading transcriptions...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-sm text-destructive">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : transcriptions.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-sm text-muted-foreground">No transcriptions found</p>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href="/upload">Upload Your First Sermon</Link>
                  </Button>
                </div>
              ) : transcriptions.map((sermon) => (
                <Card key={sermon.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={sermon.thumbnail}
                      alt={sermon.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{sermon.title}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Heart className="mr-2 h-4 w-4" />
                            Add to favorites
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            View transcript
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>{sermon.pastor}</CardDescription>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {sermon.duration}
                    </div>
                    <div className="text-sm text-muted-foreground">{sermon.date}</div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          {/* Study notes  */}
          <TabsContent value="notes" className="mt-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {isLoadingNotes ? (
                <div className="col-span-full flex justify-center items-center py-12">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground">Loading study notes...</p>
                  </div>
                </div>
              ) : notesError ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-sm text-destructive">{notesError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : studyNotes.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-sm text-muted-foreground">No study notes available yet</p>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href="/upload">Upload a sermon to generate notes</Link>
                  </Button>
                </div>
              ) : studyNotes.map((note) => (
                <Card key={note.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{note.title || 'Untitled Sermon'} - Study Notes</CardTitle>
                        <CardDescription>{note.church}</CardDescription>
                      </div>
                      <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">Key Points:</h4>
                        {note.keyPoints.length > 3 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-xs" 
                            onClick={() => {
                              const expanded = {...expandedNotes};
                              expanded[note.id] = !expanded[note.id];
                              setExpandedNotes(expanded);
                            }}
                          >
                            {expandedNotes[note.id] ? "Show Less" : `+${note.keyPoints.length - 3} More`}
                          </Button>
                        )}
                      </div>
                      <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                        {(expandedNotes[note.id] ? note.keyPoints : note.keyPoints.slice(0, 3)).map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">{formatDate(note.created_at)}</div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/study-notes/${note.id}`}>View Full Notes</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          {/* End Study Notes  */}
          <TabsContent value="favorites" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">Loading favorites...</p>
                </div>
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
                <p className="text-gray-500 mb-4">You haven't added any study notes to your favorites.</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/study-notes">Browse Study Notes</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}