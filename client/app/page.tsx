import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, MessageSquare, Upload } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Transform Sermons into Powerful Study Notes
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Our AI-powered platform transcribes sermons and generates comprehensive study notes, helping you deepen your understanding and spiritual growth.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="/upload">Upload a Sermon</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/how-it-works">How It Works</Link>
                </Button>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[500px] lg:max-w-none">
              <div className="aspect-video overflow-hidden rounded-xl bg-muted/30">
                <img
                  src="https://images.unsplash.com/photo-1616763355548-1b606f439f86?q=80&w=1470&auto=format&fit=crop"
                  alt="Person studying Bible with notes"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Powerful Features
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Everything you need to get more from every sermon
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-8">
            <Card className="bg-background">
              <CardHeader className="pb-2">
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-6 w-6" />
                </div>
                <CardTitle>Transcription</CardTitle>
                <CardDescription>
                  Accurate sermon transcription powered by advanced AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Upload audio or video files, or paste a YouTube/Facebook URL to get a precise transcription in minutes.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" asChild className="w-full">
                  <Link href="/transcription">Learn More</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card className="bg-background">
              <CardHeader className="pb-2">
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <BookOpen className="h-6 w-6" />
                </div>
                <CardTitle>Study Notes</CardTitle>
                <CardDescription>
                  Comprehensive study materials from every sermon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get key points, scripture references, summaries, and discussion questions automatically generated.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" asChild className="w-full">
                  <Link href="/study-notes">Learn More</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card className="bg-background">
              <CardHeader className="pb-2">
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <CardTitle>Discussion Questions</CardTitle>
                <CardDescription>
                  Deepen understanding with thoughtful questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  AI-generated discussion questions to help you reflect on the sermon's message and application.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" asChild className="w-full">
                  <Link href="/discussion-questions">Learn More</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background border-t">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Get Started?
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Upload your first sermon and see the power of SermonScribe
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg">
                <Link href="/upload">Upload a Sermon</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}