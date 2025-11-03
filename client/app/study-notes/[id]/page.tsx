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
  RefreshCw,
  Scroll,
  BookText,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Menu,
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
  const [isRegenerateDialogOpen, setIsRegenerateDialogOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"christian" | "jewish">("christian");
  const [selectedDepth, setSelectedDepth] = useState<"basic" | "intermediate" | "advanced">("intermediate");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    keyPoints: true,
    scriptures: true,
    application: true,
    discussion: true,
    commentary: true,
    ethical: true,
    historical: true,
  });
  const [showSidebar, setShowSidebar] = useState(true);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    // Only fetch on client side
    if (typeof window === 'undefined') return;
    
    const fetchStudyNotes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await studyNotesService.getStudyNotes(params.id);
        setStudyNotes(data);
      } catch (err: any) {
        console.error("Error fetching study notes:", err);
        const errorMessage = err?.message || "Failed to load study notes";
        
        if (errorMessage.includes("Authentication")) {
          setError("Please log in to view study notes.");
        } else if (errorMessage.includes("not found")) {
          setError("Study notes not found. It may have been deleted.");
        } else {
          setError("Failed to load study notes. Please try again.");
        }
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
        <Card className="border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="rounded-full bg-destructive/10 p-4">
              <FileText className="h-12 w-12 text-destructive" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">
                {error?.includes("Authentication") ? "Authentication Required" : 
                 error?.includes("not found") ? "Study Notes Not Found" :
                 "Unable to Load Study Notes"}
              </h3>
              <p className="text-muted-foreground max-w-md">
                {error || "The study notes you're looking for could not be found or loaded."}
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => window.location.reload()} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            </div>
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
                variant="default"
                size="sm"
                onClick={() => setIsRegenerateDialogOpen(true)}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate Notes
              </Button>
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

        {/* Floating Action Button - Expand/Collapse All */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="shadow-lg"
            onClick={() => {
              const allExpanded = Object.values(expandedSections).every(v => v);
              const newState = !allExpanded;
              setExpandedSections({
                summary: newState,
                keyPoints: newState,
                scriptures: newState,
                application: newState,
                discussion: newState,
                commentary: newState,
                ethical: newState,
                historical: newState,
                mainText: newState,
              });
            }}
          >
            {Object.values(expandedSections).every(v => v) ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Collapse All
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Expand All
              </>
            )}
          </Button>
        </div>

        {/* Main Content Grid with Sidebar Navigation */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Sticky Sidebar Navigation - Hidden on mobile, shown on lg+ */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-6 space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Jump to Section
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => scrollToSection("summary-section")}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Summary
                </button>
                {studyNotes.format === "jewish" && studyNotes.mainText && (
                  <button
                    onClick={() => scrollToSection("main-text-section")}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <Scroll className="h-3.5 w-3.5" />
                    Main Text
                  </button>
                )}
                <button
                  onClick={() => scrollToSection("key-points-section")}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  Key Points
                </button>
                <button
                  onClick={() => scrollToSection("scriptures-section")}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Scriptures
                </button>
                <button
                  onClick={() => scrollToSection("application-section")}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Application
                </button>
                <button
                  onClick={() => scrollToSection("discussion-section")}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Discussion
                </button>
                {studyNotes.format === "jewish" && studyNotes.commentaryLayer && studyNotes.commentaryLayer.length > 0 && (
                  <button
                    onClick={() => scrollToSection("commentary-section")}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <BookText className="h-3.5 w-3.5" />
                    Commentary
                  </button>
                )}
                {studyNotes.format === "jewish" && studyNotes.ethicalInsight && (
                  <button
                    onClick={() => scrollToSection("ethical-section")}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <GraduationCap className="h-3.5 w-3.5" />
                    Ethical Insight
                  </button>
                )}
                {studyNotes.format === "jewish" && studyNotes.historicalNotes && studyNotes.historicalNotes.length > 0 && (
                  <button
                    onClick={() => scrollToSection("historical-section")}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <BookMarked className="h-3.5 w-3.5" />
                    Historical Notes
                  </button>
                )}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Study Notes - Collapsible Sections */}
            
            {/* Summary Section */}
            <Card id="summary-section" className="border-2 shadow-lg scroll-mt-6">
              <CardHeader 
                className="border-b bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection("summary")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>Summary</CardTitle>
                  </div>
                  {expandedSections.summary ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <CardDescription>
                  Overview of the main message
                </CardDescription>
              </CardHeader>
              {expandedSections.summary && (
                <CardContent className="pt-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-base leading-relaxed text-foreground/90">
                      {studyNotes.summary}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Main Text Section (Jewish only) */}
            {studyNotes.format === "jewish" && studyNotes.mainText && (
              <Card id="main-text-section" className="border-2 shadow-lg scroll-mt-6">
                <CardHeader 
                  className="border-b bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSection("mainText")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scroll className="h-5 w-5 text-primary" />
                      <CardTitle>Main Text (Parashah)</CardTitle>
                    </div>
                    {expandedSections.mainText ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <CardDescription>
                    Primary Torah portion or source text
                  </CardDescription>
                </CardHeader>
                {expandedSections.mainText && (
                  <CardContent className="pt-6">
                    <div className="p-6 rounded-lg bg-muted/50 border-2 border-primary/20">
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-base leading-relaxed">
                          {studyNotes.mainText}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Key Points Section */}
            <Card id="key-points-section" className="border-2 shadow-lg scroll-mt-6">
              <CardHeader 
                className="border-b bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection("keyPoints")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <CardTitle>Key Points</CardTitle>
                  </div>
                  {expandedSections.keyPoints ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <CardDescription>
                  Main takeaways and insights
                </CardDescription>
              </CardHeader>
              {expandedSections.keyPoints && (
                <CardContent className="pt-6">
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
                </CardContent>
              )}
            </Card>

            {/* Scriptures Section */}
            <Card id="scriptures-section" className="border-2 shadow-lg scroll-mt-6">
              <CardHeader 
                className="border-b bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection("scriptures")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <CardTitle>Scripture References</CardTitle>
                  </div>
                  {expandedSections.scriptures ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <CardDescription>
                  Biblical texts referenced in this teaching
                </CardDescription>
              </CardHeader>
              {expandedSections.scriptures && (
                <CardContent className="pt-6">
                  <div className="space-y-6">
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
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Application Section */}
            <Card id="application-section" className="border-2 shadow-lg scroll-mt-6">
              <CardHeader 
                className="border-b bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection("application")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle>Practical Application</CardTitle>
                  </div>
                  {expandedSections.application ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <CardDescription>
                  Ways to apply these teachings
                </CardDescription>
              </CardHeader>
              {expandedSections.application && (
                <CardContent className="pt-6">
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
                </CardContent>
              )}
            </Card>

            {/* Old Tabs Section - Remove this */}
            <Card className="border-2 shadow-lg hidden">
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
                  <TabsList className={`grid w-full ${studyNotes.format === "jewish" ? "grid-cols-5" : "grid-cols-4"}`}>
                    <TabsTrigger value="summary" className="gap-1.5">
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:inline">Summary</span>
                    </TabsTrigger>
                    {studyNotes.format === "jewish" && (
                      <TabsTrigger value="main-text" className="gap-1.5">
                        <Scroll className="h-4 w-4" />
                        <span className="hidden sm:inline">Main Text</span>
                      </TabsTrigger>
                    )}
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

                  {studyNotes.format === "jewish" && studyNotes.mainText && (
                    <TabsContent value="main-text" className="mt-6 space-y-4">
                      <div className="space-y-4">
                        <div className="p-6 rounded-lg bg-muted/50 border-2 border-primary/20">
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Scroll className="h-5 w-5 text-primary" />
                            Parashah / Source Text
                          </h3>
                          <div className="prose dark:prose-invert max-w-none">
                            <p className="text-base leading-relaxed">
                              {studyNotes.mainText}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  )}

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
            <Card id="discussion-section" className="border-2 shadow-lg scroll-mt-6">
              <CardHeader 
                className="border-b bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection("discussion")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <CardTitle>Discussion Questions</CardTitle>
                  </div>
                  {expandedSections.discussion ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <CardDescription>
                  {studyNotes.format === "jewish" 
                    ? "Questions for chavruta (paired) or group study"
                    : "Questions for personal reflection or group discussion"}
                </CardDescription>
              </CardHeader>
              {expandedSections.discussion && (
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
              )}
            </Card>

            {/* Jewish-specific: Commentary Layer */}
            {studyNotes.format === "jewish" && studyNotes.commentaryLayer && studyNotes.commentaryLayer.length > 0 && (
              <Card id="commentary-section" className="border-2 shadow-lg scroll-mt-6">
                <CardHeader 
                  className="border-b bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSection("commentary")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookText className="h-5 w-5 text-primary" />
                      <CardTitle>Commentary</CardTitle>
                    </div>
                    {expandedSections.commentary ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <CardDescription>
                    Rabbinic insights and commentary notes
                  </CardDescription>
                </CardHeader>
                {expandedSections.commentary && (
                  <CardContent className="pt-6">
                  <div className="space-y-6">
                    {studyNotes.commentaryLayer?.map((commentary, index) => (
                      <div key={index} className="space-y-3 p-5 rounded-lg bg-muted/50 border">
                        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                          <BookText className="h-4 w-4" />
                          {commentary.source}
                        </h3>
                        <p className="text-base leading-relaxed italic">
                          {commentary.text}
                        </p>
                        {index < (studyNotes.commentaryLayer?.length || 0) - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}
                  </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Jewish-specific: Ethical Insight */}
            {studyNotes.format === "jewish" && studyNotes.ethicalInsight && (
              <Card id="ethical-section" className="border-2 shadow-lg scroll-mt-6">
                <CardHeader 
                  className="border-b bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSection("ethical")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <CardTitle>Ethical Insight (Mussar)</CardTitle>
                    </div>
                    {expandedSections.ethical ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <CardDescription>
                    Moral and life reflection takeaway
                  </CardDescription>
                </CardHeader>
                {expandedSections.ethical && (
                  <CardContent className="pt-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-base leading-relaxed">
                      {studyNotes.ethicalInsight}
                    </p>
                  </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Jewish-specific: Historical Notes */}
            {studyNotes.format === "jewish" && studyNotes.historicalNotes && studyNotes.historicalNotes.length > 0 && (
              <Card id="historical-section" className="border-2 shadow-lg scroll-mt-6">
                <CardHeader 
                  className="border-b bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSection("historical")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookMarked className="h-5 w-5 text-primary" />
                      <CardTitle>Historical & Linguistic Notes</CardTitle>
                    </div>
                    {expandedSections.historical ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <CardDescription>
                    Etymology, context, and historical commentary
                  </CardDescription>
                </CardHeader>
                {expandedSections.historical && (
                  <CardContent className="pt-6">
                  <div className="space-y-4">
                    {studyNotes.historicalNotes?.map((note, index) => (
                      <div key={index} className="space-y-2 p-4 rounded-lg bg-muted/50 border">
                        <h3 className="text-base font-semibold text-primary">
                          {note.term}
                        </h3>
                        <p className="text-base leading-relaxed">
                          {note.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                  </CardContent>
                )}
              </Card>
            )}
          </div>

          {/* Right Column - Quick Actions Sidebar */}
          <div className="lg:col-span-3 space-y-6">
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

      {/* Regenerate Dialog */}
      <Dialog open={isRegenerateDialogOpen} onOpenChange={setIsRegenerateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Regenerate Study Notes</DialogTitle>
            <DialogDescription className="text-base">
              Choose the format and depth level for your study notes. This will regenerate the notes with your selected structure.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Format Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                1. Choose Format
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                variant={studyNotes?.format === "christian" ? "default" : "outline"}
                className="w-full justify-start gap-3 h-auto py-4"
                onClick={async () => {
                  if (studyNotes?.format === "christian") {
                    toast({
                      title: "Already in Christian format",
                      description: "These notes are already in Christian sermon format.",
                    });
                    return;
                  }
                  setIsRegenerating(true);
                  try {
                    await studyNotesService.regenerateStudyNotes(params.id, "christian");
                    toast({
                      title: "Regenerating Notes",
                      description: "Your study notes are being regenerated in Christian format. This may take a few minutes.",
                    });
                    setIsRegenerateDialogOpen(false);
                    setTimeout(() => {
                      window.location.reload();
                    }, 3000);
                  } catch (error) {
                    console.error("Error regenerating notes:", error);
                    toast({
                      title: "Error",
                      description: "Failed to regenerate study notes",
                      variant: "destructive",
                    });
                  } finally {
                    setIsRegenerating(false);
                  }
                }}
                disabled={isRegenerating}
              >
                <Church className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Christian Sermon Format</div>
                  <div className="text-xs text-muted-foreground font-normal">
                    Summary, Key Points, Scriptures, Application
                  </div>
                </div>
                </Button>
                
                <Button
                variant={studyNotes?.format === "jewish" ? "default" : "outline"}
                className="w-full justify-start gap-3 h-auto py-4"
                onClick={async () => {
                  if (studyNotes?.format === "jewish") {
                    toast({
                      title: "Already in Jewish format",
                      description: "These notes are already in Jewish teaching format.",
                    });
                    return;
                  }
                  setIsRegenerating(true);
                  try {
                    await studyNotesService.regenerateStudyNotes(params.id, "jewish");
                    toast({
                      title: "Regenerating Notes",
                      description: "Your study notes are being regenerated in Jewish teaching format. This may take a few minutes.",
                    });
                    setIsRegenerateDialogOpen(false);
                    setTimeout(() => {
                      window.location.reload();
                    }, 3000);
                  } catch (error) {
                    console.error("Error regenerating notes:", error);
                    toast({
                      title: "Error",
                      description: "Failed to regenerate study notes",
                      variant: "destructive",
                    });
                  } finally {
                    setIsRegenerating(false);
                  }
                }}
                disabled={isRegenerating}
              >
                <Scroll className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Jewish Teaching Format</div>
                  <div className="text-xs text-muted-foreground font-normal">
                    Main Text, Commentary, Mussar, Historical Notes
                  </div>
                </div>
                </Button>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground pt-2">
              Current format: <span className="font-semibold capitalize">{studyNotes?.format}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
