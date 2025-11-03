      {/* Regenerate Dialog - Enhanced with Depth Modes */}
      <Dialog open={isRegenerateDialogOpen} onOpenChange={(open) => {
        setIsRegenerateDialogOpen(open);
        if (open && studyNotes) {
          setSelectedFormat(studyNotes.format);
          setSelectedDepth(studyNotes.depthMode || "intermediate");
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <RefreshCw className="h-6 w-6" />
              Regenerate Study Notes
            </DialogTitle>
            <DialogDescription className="text-base">
              Customize your study notes by selecting a format and depth level. The AI will regenerate your notes based on these settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Format Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  1. Choose Format
                </h3>
                <Badge variant="outline" className="text-xs">
                  Current: {studyNotes?.format}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={selectedFormat === "christian" ? "default" : "outline"}
                  className="h-auto py-4 flex-col items-start gap-2"
                  onClick={() => setSelectedFormat("christian")}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Church className="h-5 w-5" />
                    <span className="font-semibold">Christian</span>
                  </div>
                  <span className="text-xs text-left opacity-80">
                    Traditional sermon format with biblical references
                  </span>
                </Button>
                
                <Button
                  variant={selectedFormat === "jewish" ? "default" : "outline"}
                  className="h-auto py-4 flex-col items-start gap-2"
                  onClick={() => setSelectedFormat("jewish")}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Scroll className="h-5 w-5" />
                    <span className="font-semibold">Jewish</span>
                  </div>
                  <span className="text-xs text-left opacity-80">
                    Torah study with commentary and historical notes
                  </span>
                </Button>
              </div>
            </div>

            <Separator />

            {/* Depth Mode Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  2. Choose Depth Level
                </h3>
                <Badge variant="outline" className="text-xs">
                  Current: {studyNotes?.depthMode || "intermediate"}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={selectedDepth === "basic" ? "default" : "outline"}
                  className="h-auto py-4 flex-col items-start gap-2"
                  onClick={() => setSelectedDepth("basic")}
                >
                  <div className="flex items-center gap-2 w-full">
                    <FileText className="h-4 w-4" />
                    <span className="font-semibold text-sm">Basic</span>
                  </div>
                  <span className="text-xs text-left opacity-80">
                    Summary, key points, scriptures
                  </span>
                  <Badge variant="secondary" className="text-xs mt-1">
                    Quick Reference
                  </Badge>
                </Button>
                
                <Button
                  variant={selectedDepth === "intermediate" ? "default" : "outline"}
                  className="h-auto py-4 flex-col items-start gap-2"
                  onClick={() => setSelectedDepth("intermediate")}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Lightbulb className="h-4 w-4" />
                    <span className="font-semibold text-sm">Intermediate</span>
                  </div>
                  <span className="text-xs text-left opacity-80">
                    + Discussion questions, application
                  </span>
                  <Badge variant="secondary" className="text-xs mt-1">
                    Recommended
                  </Badge>
                </Button>
                
                <Button
                  variant={selectedDepth === "advanced" ? "default" : "outline"}
                  className="h-auto py-4 flex-col items-start gap-2"
                  onClick={() => setSelectedDepth("advanced")}
                >
                  <div className="flex items-center gap-2 w-full">
                    <GraduationCap className="h-4 w-4" />
                    <span className="font-semibold text-sm">Advanced</span>
                  </div>
                  <span className="text-xs text-left opacity-80">
                    + Commentary, historical notes
                  </span>
                  <Badge variant="secondary" className="text-xs mt-1">
                    Deep Study
                  </Badge>
                </Button>
              </div>
            </div>

            <Separator />

            {/* Preview of what will be included */}
            <div className="space-y-2 p-4 rounded-lg bg-muted/50">
              <h4 className="text-sm font-semibold">What's Included:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Summary</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Key Points</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>Scripture References</span>
                </div>
                {selectedDepth !== "basic" && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Discussion Questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Application Points</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Ethical Insights</span>
                    </div>
                  </>
                )}
                {selectedDepth === "advanced" && selectedFormat === "jewish" && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Commentary Layer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Historical Notes</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsRegenerateDialogOpen(false)}
                disabled={isRegenerating}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={async () => {
                  if (studyNotes?.format === selectedFormat && studyNotes?.depthMode === selectedDepth) {
                    toast({
                      title: "No Changes",
                      description: "The selected format and depth are already applied to these notes.",
                    });
                    return;
                  }
                  
                  setIsRegenerating(true);
                  try {
                    await studyNotesService.regenerateStudyNotes(params.id, selectedFormat, selectedDepth);
                    toast({
                      title: "Regenerating Notes",
                      description: `Your study notes are being regenerated in ${selectedFormat} format with ${selectedDepth} depth. This may take 1-3 minutes.`,
                      duration: 5000,
                    });
                    setIsRegenerateDialogOpen(false);
                    
                    // Show progress indicator
                    setTimeout(() => {
                      toast({
                        title: "Still Processing...",
                        description: "Your notes are being generated. The page will refresh automatically when ready.",
                      });
                    }, 10000);
                    
                    // Reload after delay
                    setTimeout(() => {
                      window.location.reload();
                    }, 30000);
                  } catch (error: any) {
                    console.error("Error regenerating notes:", error);
                    toast({
                      title: "Regeneration Failed",
                      description: error?.message || "Failed to regenerate study notes. Please try again.",
                      variant: "destructive",
                    });
                    setIsRegenerating(false);
                  }
                }}
                disabled={isRegenerating}
              >
                {isRegenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Regenerate Notes
                  </>
                )}
              </Button>
            </div>

            {/* Warning */}
            <p className="text-xs text-muted-foreground text-center">
              ⚠️ This will replace your current study notes. Your original transcript will be preserved.
            </p>
          </div>
        </DialogContent>
      </Dialog>
