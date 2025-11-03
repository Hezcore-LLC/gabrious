"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  ChevronLeft,
  Copy,
  Download,
  FileText,
  Printer,
  Share2,
  Sparkles,
  MessageCircle,
  Lightbulb,
  BookMarked,
  Calendar,
  Clock,
  User,
  Church,
  Heart,
  Play,
  ExternalLink,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { studyNotesService, StudyNotes } from "@/lib/studyNotesService";
import { favoritesService } from "@/lib/favoritesService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function StudyNotesPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [studyNotes, setStudyNotes] = useState<StudyNotes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [editedTranscript, setEditedTranscript] = useState<string>("");
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [isSavingTranscript, setIsSavingTranscript] = useState(false);

  useEffect(() => {
    const fetchStudyNotes = async () => {
      try {
        setIsLoading(true);
        const data = await studyNotesService.getStudyNotes(params.id);
        setStudyNotes(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching study notes:", err);
        setError("Failed to load study notes. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudyNotes();
  }, [params.id]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const favorites = await favoritesService.getFavorites();
        const isFav = favorites.some((fav) => fav.id === params.id);
        setIsFavorite(isFav);
      } catch (error) {
        console.error("Error checking favorite status:", error);
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
${studyNotes.keyPoints.map((point) => `- ${point}`).join("\n")}

### Scripture References
${studyNotes.scriptures
  .map((scripture) => `- ${scripture.reference}: "${scripture.text}"`)
  .join("\n")}

### Discussion Questions
${studyNotes.discussionQuestions
  .map((question, index) => `${index + 1}. ${question}`)
  .join("\n")}

### Application Points
${studyNotes.applicationPoints.map((point) => `- ${point}`).join("\n")}
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">
            Loading study notes...
          </p>
        </div>
      </div>
    );
  }

  if (error || !studyNotes) {
    return (
      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/dashboard">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive mb-4">
              {error || "Study notes not found"}
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container py-6 max-w-7xl">
        {/* Header */}
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/dashboard">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Hero Section */}
        <div className="relative mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 shadow-xl">
          <div
            className="absolute inset-0 bg-grid-white/10"
            style={{
              maskImage: "linear-gradient(0deg,white,rgba(255,255,255,0.5))",
            }}
          />
          <div className="relative p-8 md:p-12">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Left: Title and Meta */}
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Sparkles className="h-3 w-3" />
                  Study Notes
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  {studyNotes.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {studyNotes.pastor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Church className="h-4 w-4" />
                    <span className="text-sm">{studyNotes.church}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{studyNotes.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{studyNotes.duration}</span>
                  </div>
                </div>
              </div>

              {/* Right: Thumbnail */}
              <div className="w-full lg:w-80 shrink-0">
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-background">
                  <img
                    src={studyNotes.thumbnail}
                    alt={studyNotes.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyToClipboard}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button
                variant={isFavorite ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={async () => {
                  try {
                    if (isFavorite) {
                      await favoritesService.removeFromFavorites(params.id);
                      setIsFavorite(false);
                      toast({
                        title: "Success",
                        description: "Removed from favorites",
                      });
                    } else {
                      await favoritesService.addToFavorites(params.id);
                      setIsFavorite(true);
                      toast({
                        title: "Success",
                        description: "Added to favorites",
                      });
                    }
                  } catch (error) {
                    console.error("Error updating favorites:", error);
                    toast({
                      title: "Error",
                      description: "Failed to update favorites",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <Heart
                  className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
                />
                {isFavorite ? "Favorited" : "Favorite"}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Study Notes Tabs */}
            <Card className="border-2 shadow-lg">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5 text-primary" />
                  <CardTitle>Study Notes</CardTitle>
                </div>
                <CardDescription>
                  Comprehensive notes from the sermon
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="summary">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="summary" className="gap-1.5">
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:inline">Summary</span>
                    </TabsTrigger>
                    <TabsTrigger value="key-points" className="gap-1.5">
                      <Lightbulb className="h-4 w-4" />
                      <span className="hidden sm:inline">Key Points</span>
                    </TabsTrigger>
                    <TabsTrigger value="scriptures" className="gap-1.5">
                      <BookOpen className="h-4 w-4" />
                      <span className="hidden sm:inline">Scriptures</span>
                    </TabsTrigger>
                    <TabsTrigger value="application" className="gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      <span className="hidden sm:inline">Application</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="mt-6 space-y-4">
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-base leading-relaxed text-foreground/90">
                        {studyNotes.summary}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="key-points" className="mt-6 space-y-4">
                    <div className="space-y-4">
                      {studyNotes.keyPoints.map((point, index) => (
                        <div
                          key={index}
                          className="flex gap-4 p-4 rounded-lg bg-muted/50 border"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                            {index + 1}
                          </div>
                          <p className="text-base leading-relaxed pt-1">
                            {point}
                          </p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="scriptures" className="mt-6 space-y-6">
                    {studyNotes.scriptures.map((scripture, index) => (
                      <div
                        key={index}
                        className="space-y-3 p-5 rounded-lg bg-muted/50 border"
                      >
                        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          {scripture.reference}
                        </h3>
                        <blockquote className="border-l-4 border-primary pl-4 italic text-foreground/80">
                          &ldquo;{scripture.text}&rdquo;
                        </blockquote>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="application" className="mt-6 space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Practical Application
                      </h3>
                      <div className="space-y-3">
                        {studyNotes.applicationPoints.map((point, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border"
                          >
                            <div className="h-6 w-6 shrink-0 rounded-full border-2 border-primary flex items-center justify-center text-primary">
                              ✓
                            </div>
                            <p className="text-base leading-relaxed pt-0.5">
                              {point}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Discussion Questions */}
            <Card className="border-2 shadow-lg">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <CardTitle>Discussion Questions</CardTitle>
                </div>
                <CardDescription>
                  Questions for personal reflection or group discussion
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {studyNotes.discussionQuestions.map((question, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {index + 1}
                        </div>
                        <h3 className="text-base font-medium">
                          Question {index + 1}
                        </h3>
                      </div>
                      <p className="text-base leading-relaxed pl-10">
                        {question}
                      </p>
                      {index < studyNotes.discussionQuestions.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-2 shadow-lg">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                <Button
                  className="w-full justify-start gap-2"
                  onClick={async () => {
                    setIsTranscriptModalOpen(true);
                    setLoadingTranscript(true);
                    setIsEditingTranscript(false);
                    try {
                      const transcriptText =
                        await studyNotesService.getTranscript(
                          studyNotes.transcriptionId
                        );
                      setTranscript(transcriptText);
                      setEditedTranscript(transcriptText);
                    } catch (error) {
                      console.error("Error fetching transcript:", error);
                      toast({
                        title: "Error",
                        description: "Failed to load transcript",
                        variant: "destructive",
                      });
                      setIsTranscriptModalOpen(false);
                    } finally {
                      setLoadingTranscript(false);
                    }
                  }}
                >
                  <BookOpen className="h-4 w-4" />
                  View Full Transcript
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  asChild
                >
                  <a
                    href={studyNotes.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Play className="h-4 w-4" />
                    Watch Original Video
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Download Study Guide
                </Button>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="border-2 shadow-lg">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-lg">Tags</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-sm">
                    Peace
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    Faith
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    Prayer
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    Anxiety
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    Trust
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    Philippians
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Transcript Modal */}
      <Dialog
        open={isTranscriptModalOpen}
        onOpenChange={setIsTranscriptModalOpen}
      >
        <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl">Full Transcript</DialogTitle>
                <DialogDescription className="text-base">
                  {studyNotes?.title}
                </DialogDescription>
              </div>
              {!loadingTranscript && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isEditingTranscript) {
                      setEditedTranscript(transcript);
                    }
                    setIsEditingTranscript(!isEditingTranscript);
                  }}
                >
                  {isEditingTranscript ? "Cancel" : "Edit"}
                </Button>
              )}
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {loadingTranscript ? (
              <div className="flex justify-center items-center py-16">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Loading transcript...
                  </p>
                </div>
              </div>
            ) : isEditingTranscript ? (
              <div className="space-y-4">
                <textarea
                  value={editedTranscript}
                  onChange={(e) => setEditedTranscript(e.target.value)}
                  className="w-full min-h-[500px] p-8 bg-muted/30 rounded-lg font-serif text-[17px] tracking-wide leading-[1.8] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter transcript text..."
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-8">
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <div className="text-foreground font-serif text-[17px] tracking-wide space-y-6">
                      {transcript.split("\n\n").map((paragraph, index) => {
                        const isTitle =
                          paragraph.length < 100 &&
                          (paragraph === paragraph.toUpperCase() ||
                            /^[A-Z][^.!?]*$/.test(paragraph.trim()));

                        if (isTitle) {
                          return (
                            <h3
                              key={index}
                              className="text-xl font-bold mt-8 mb-4 first:mt-0"
                            >
                              {paragraph}
                            </h3>
                          );
                        }

                        return (
                          <p key={index} className="leading-[1.8] mb-6">
                            {paragraph}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="px-6 py-4 border-t bg-muted/20 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {studyNotes?.pastor} • {studyNotes?.date}
            </p>
            <div className="flex gap-2">
              {isEditingTranscript ? (
                <Button
                  size="sm"
                  disabled={isSavingTranscript}
                  onClick={async () => {
                    setIsSavingTranscript(true);
                    try {
                      await studyNotesService.updateTranscript(
                        studyNotes!.transcriptionId,
                        editedTranscript
                      );
                      setTranscript(editedTranscript);
                      setIsEditingTranscript(false);
                      toast({
                        title: "Saved",
                        description: "Transcript updated successfully",
                      });
                    } catch (error) {
                      console.error("Error saving transcript:", error);
                      toast({
                        title: "Error",
                        description: "Failed to save transcript",
                        variant: "destructive",
                      });
                    } finally {
                      setIsSavingTranscript(false);
                    }
                  }}
                >
                  {isSavingTranscript ? "Saving..." : "Save Changes"}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(transcript);
                    toast({
                      title: "Copied",
                      description: "Transcript copied to clipboard",
                    });
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Transcript
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
