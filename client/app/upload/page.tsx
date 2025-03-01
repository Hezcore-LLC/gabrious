"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { FileUp, Link as LinkIcon, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { transcriptionService } from "@/lib/transcriptionService";

export default function UploadPage() {
  const [uploadMethod, setUploadMethod] = useState("file");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [transcriptionTier, setTranscriptionTier] = useState("free");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [transcriptionId, setTranscriptionId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadMethod === "file" && !file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    if (uploadMethod === "url" && !url) {
      toast({
        title: "No URL provided",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      if (uploadMethod === "url") {
        // Use the transcription service to submit the URL
        const response = await transcriptionService.submitUrl(url);
        setTranscriptionId(response.id);
        
        // Simulate progress for better UX
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              return 100;
            }
            return prev + 5;
          });
        }, 300);
        
        // After progress reaches 100%, redirect to dashboard
        setTimeout(() => {
          clearInterval(interval);
          setIsUploading(false);
          toast({
            title: "URL submitted successfully!",
            description: "Your sermon is being processed. You can check the status on the dashboard.",
          });
          router.push('/dashboard');
        }, 6000);
      } else {
        // File upload not implemented yet - using simulation for now
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsUploading(false);
              toast({
                title: "Upload complete!",
                description: "Your sermon is being processed. We'll notify you when it's ready.",
              });
              return 100;
            }
            return prev + 5;
          });
        }, 300);
      }
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: "Error submitting URL",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-12 max-w-3xl">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Upload a Sermon</h1>
          <p className="text-muted-foreground">
            Upload a sermon audio or video file, or provide a URL to generate a transcription and study notes.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Options</CardTitle>
            <CardDescription>
              Choose how you want to upload your sermon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="file" onValueChange={setUploadMethod}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file">File Upload</TabsTrigger>
                <TabsTrigger value="url">URL</TabsTrigger>
              </TabsList>
              <TabsContent value="file" className="mt-4 space-y-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="sermon-file">Upload sermon file</Label>
                  <div className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => document.getElementById('sermon-file')?.click()}>
                    <div className="flex flex-col items-center gap-2">
                      <FileUp className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {file ? file.name : "Drag and drop your file here or click to browse"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supports MP3, MP4, WAV, M4A (max 500MB)
                      </p>
                    </div>
                    <Input
                      id="sermon-file"
                      type="file"
                      className="hidden"
                      accept=".mp3,.mp4,.wav,.m4a"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="url" className="mt-4 space-y-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="sermon-url">Sermon URL</Label>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="sermon-url"
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={url}
                      onChange={handleUrlChange}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supports YouTube, Facebook, Vimeo, and other video platforms
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Transcription Options</h3>
                <RadioGroup defaultValue="free" value={transcriptionTier} onValueChange={setTranscriptionTier}>
                  <div className="flex items-start space-x-2 mb-3">
                    <RadioGroupItem value="free" id="free" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="free" className="font-medium">Free Transcription</Label>
                      <p className="text-sm text-muted-foreground">
                        Basic transcription with standard accuracy. Processing time: ~30 minutes.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="premium" id="premium" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="premium" className="font-medium">Premium Transcription</Label>
                      <p className="text-sm text-muted-foreground">
                        Enhanced accuracy with speaker detection and timestamps. Processing time: ~15 minutes.
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {isUploading && (
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
            <Button className="w-full" onClick={handleSubmit} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Start Transcription"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}