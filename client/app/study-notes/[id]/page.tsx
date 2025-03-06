"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronLeft, Copy, Download, FileText, Printer, Share2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { studyNotesService, StudyNotes } from "@/lib/studyNotesService";
import { favoritesService } from '@/lib/favoritesService';
import { Heart } from 'lucide-react';


export default function StudyNotesPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("summary");
  const [studyNotes, setStudyNotes] = useState<StudyNotes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showingTranscript, setShowingTranscript] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchStudyNotes = async () => {
      try {
        setIsLoading(true);
        const data = await studyNotesService.getStudyNotes(params.id);
        setStudyNotes(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching study notes:', err);
        setError('Failed to load study notes. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudyNotes();
  }, [params.id]);

  // Check if the study note is in favorites
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const favorites = await favoritesService.getFavorites();
        const isFav = favorites.some(fav => fav.id === params.id);
        setIsFavorite(isFav);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    if (params.id) {
      checkFavoriteStatus();
    }
  }, [params.id]);

  const handleCopyToClipboard = () => {
    if (!studyNotes) return;
    
    const content = `
# ${studyNotes.title}
## ${studyNotes.pastor} | ${studyNotes.church} | ${studyNotes.date}

### Summary
${studyNotes.summary}

### Key Points
${studyNotes.keyPoints.map(point => `- ${point}`).join('\n')}

### Scripture References
${studyNotes.scriptures.map(scripture => `- ${scripture.reference}: "${scripture.text}"`).join('\n')}

### Discussion Questions
${studyNotes.discussionQuestions.map((question, index) => `${index + 1}. ${question}`).join('\n')}

### Application Points
${studyNotes.applicationPoints.map(point => `- ${point}`).join('\n')}
    `;
    
    navigator.clipboard.writeText(content).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Study notes have been copied to your clipboard",
      });
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Loading study notes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!studyNotes) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">Study notes not found</p>
              <Button asChild>
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="grid gap-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-2/3">
              <h1 className="text-3xl font-bold tracking-tight">{studyNotes.title}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-muted-foreground">
                <span>{studyNotes.pastor}</span>
                <span>•</span>
                <span>{studyNotes.church}</span>
                <span>•</span>
                <span>{studyNotes.date}</span>
                <span>•</span>
                <span>{studyNotes.duration}</span>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-1/3 md:justify-end">
              <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    if (isFavorite) {
                      await favoritesService.removeFromFavorites(params.id);
                      setIsFavorite(false);
                      toast({
                        title: "Success",
                        description: "Removed from favorites successfully",
                      });
                    } else {
                      await favoritesService.addToFavorites(params.id);
                      setIsFavorite(true);
                      toast({
                        title: "Success",
                        description: "Added to favorites successfully",
                      });
                    }
                  } catch (error) {
                    console.error('Error updating favorites:', error);
                    toast({
                      title: "Error",
                      description: isFavorite ? "Failed to remove from favorites" : "Failed to add to favorites",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Study Notes</CardTitle>
                  <CardDescription>
                    Here is your study notes from the sermon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="summary" onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-4">
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                      <TabsTrigger value="key-points">Key Points</TabsTrigger>
                      <TabsTrigger value="scriptures">Scriptures</TabsTrigger>
                      <TabsTrigger value="application">Application</TabsTrigger>
                    </TabsList>
                    <TabsContent value="summary" className="mt-4 space-y-4">
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-base leading-relaxed">{studyNotes.summary}</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="key-points" className="mt-4 space-y-4">
                      <ul className="space-y-3">
                        {studyNotes.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                              {index + 1}
                            </div>
                            <p className="text-base leading-relaxed">{point}</p>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                    <TabsContent value="scriptures" className="mt-4 space-y-4">
                      <div className="space-y-4">
                        {studyNotes.scriptures.map((scripture, index) => (
                          <div key={index} className="space-y-2">
                            <h3 className="text-lg font-semibold">{scripture.reference}</h3>
                            <blockquote className="border-l-4 border-muted pl-4 italic">
                              "{scripture.text}"
                            </blockquote>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="application" className="mt-4 space-y-4">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Practical Application</h3>
                        <ul className="space-y-2">
                          {studyNotes.applicationPoints.map((point, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="h-5 w-5 shrink-0 rounded-full border border-primary flex items-center justify-center text-xs">
                                ✓
                              </div>
                              <p>{point}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader className="pb-3">
                  <CardTitle>Discussion Questions</CardTitle>
                  <CardDescription>
                    Questions for personal reflection or group discussion
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studyNotes.discussionQuestions.map((question, index) => (
                      <div key={index} className="space-y-2">
                        <h3 className="text-base font-medium">Question {index + 1}</h3>
                        <p className="text-base">{question}</p>
                        <Separator className="my-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Discussion Guide
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              <div className="space-y-6">
                <Card>
                  <div className="aspect-video">
                    <img
                      src={studyNotes.thumbnail}
                      alt={studyNotes.title}
                      className="object-cover w-full h-full rounded-t-lg"
                    />
                  </div>
                  <CardContent className="pt-4">
                    <div className="flex flex-col gap-4">
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          if (showingTranscript) {
                            setShowingTranscript(false);
                          } else {
                            setLoadingTranscript(true);
                            setShowingTranscript(true);
                            // Here you would fetch the transcript using the transcriptionId
                            // For now, we'll simulate loading and then show a placeholder
                            setTimeout(() => {
                              setTranscript("This is the full transcript of the sermon. The actual transcript would be fetched from the API using the transcriptionId: " + studyNotes?.transcriptionId);
                              setLoadingTranscript(false);
                            }, 1000);
                          }
                        }}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        {showingTranscript ? "Hide Transcript" : "View Full Transcript"}
                      </Button>
                      <Button variant="outline" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        View Original Audio
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {showingTranscript && (
                  <Card className="mt-6">
                    <CardHeader className="pb-3">
                      <CardTitle>Full Transcript</CardTitle>
                      <CardDescription>
                        Complete transcript of the sermon
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingTranscript ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="text-center space-y-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                            <p className="text-sm text-muted-foreground">Loading transcript...</p>
                          </div>
                        </div>
                      ) : (
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="text-base leading-relaxed whitespace-pre-line">{transcript}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Related Sermons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="h-12 w-12 rounded overflow-hidden shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=1470&auto=format&fit=crop"
                            alt="Sermon thumbnail"
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">The Power of Faith</h4>
                          <p className="text-xs text-muted-foreground">Pastor Sarah Johnson</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="h-12 w-12 rounded overflow-hidden shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1470&auto=format&fit=crop"
                            alt="Sermon thumbnail"
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Walking in God's Purpose</h4>
                          <p className="text-xs text-muted-foreground">Pastor Michael Williams</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="h-12 w-12 rounded overflow-hidden shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=1470&auto=format&fit=crop"
                            alt="Sermon thumbnail"
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">The Grace of God</h4>
                          <p className="text-xs text-muted-foreground">Pastor David Lee</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {showingTranscript && (
                  <Card className="mt-6">
                    <CardHeader className="pb-3">
                      <CardTitle>Full Transcript</CardTitle>
                      <CardDescription>
                        Complete transcript of the sermon
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingTranscript ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="text-center space-y-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                            <p className="text-sm text-muted-foreground">Loading transcript...</p>
                          </div>
                        </div>
                      ) : (
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="text-base leading-relaxed whitespace-pre-line">{transcript}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Peace</Badge>
                      <Badge variant="secondary">Faith</Badge>
                      <Badge variant="secondary">Prayer</Badge>
                      <Badge variant="secondary">Anxiety</Badge>
                      <Badge variant="secondary">Trust</Badge>
                      <Badge variant="secondary">Philippians</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}