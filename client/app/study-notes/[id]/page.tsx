"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronLeft, Copy, Download, FileText, Printer, Share2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function StudyNotesPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("summary");

  // Mock data for demonstration
  const sermon = {
    id: params.id,
    title: "Finding Peace in Troubled Times",
    pastor: "Pastor John Smith",
    church: "Grace Community Church",
    date: "May 15, 2025",
    duration: "42:18",
    thumbnail: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1470&auto=format&fit=crop",
    summary: "In this powerful sermon, Pastor John explores the concept of finding and maintaining peace during life's most challenging moments. Drawing from Scripture and personal experiences, he provides practical guidance for believers seeking God's peace that surpasses all understanding.",
    keyPoints: [
      "Peace is not the absence of trouble, but the presence of God in the midst of trouble",
      "Philippians 4:6-7 offers a practical formula for experiencing God's peace",
      "Prayer and thanksgiving are essential components to maintaining peace",
      "God's peace is supernatural and beyond human comprehension",
      "Peace is a fruit of the Spirit that grows as we abide in Christ"
    ],
    scriptures: [
      { reference: "Philippians 4:6-7", text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus." },
      { reference: "John 14:27", text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid." },
      { reference: "Isaiah 26:3", text: "You will keep in perfect peace those whose minds are steadfast, because they trust in you." },
      { reference: "Romans 5:1", text: "Therefore, since we have been justified through faith, we have peace with God through our Lord Jesus Christ." }
    ],
    discussionQuestions: [
      "How have you experienced God's peace in difficult circumstances in your own life?",
      "What practical steps can you take this week to cultivate more peace in your daily routine?",
      "How does the world's definition of peace differ from God's peace as described in Scripture?",
      "Which of the Scripture passages shared today resonates most with you and why?",
      "What obstacles in your life are currently preventing you from experiencing God's peace?"
    ],
    applicationPoints: [
      "Set aside 10 minutes each morning for prayer and thanksgiving",
      "Memorize Philippians 4:6-7 this week",
      "Identify one worry in your life and practice surrendering it to God daily",
      "Share with a friend or family member how God has given you peace in a difficult situation",
      "Create a 'peace playlist' of worship songs that remind you of God's presence"
    ]
  };

  const handleCopyToClipboard = () => {
    const content = `
# ${sermon.title}
## ${sermon.pastor} | ${sermon.church} | ${sermon.date}

### Summary
${sermon.summary}

### Key Points
${sermon.keyPoints.map(point => `- ${point}`).join('\n')}

### Scripture References
${sermon.scriptures.map(scripture => `- ${scripture.reference}: "${scripture.text}"`).join('\n')}

### Discussion Questions
${sermon.discussionQuestions.map((question, index) => `${index + 1}. ${question}`).join('\n')}

### Application Points
${sermon.applicationPoints.map(point => `- ${point}`).join('\n')}
    `;
    
    navigator.clipboard.writeText(content).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Study notes have been copied to your clipboard",
      });
    });
  };

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
              <h1 className="text-3xl font-bold tracking-tight">{sermon.title}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-muted-foreground">
                <span>{sermon.pastor}</span>
                <span>•</span>
                <span>{sermon.church}</span>
                <span>•</span>
                <span>{sermon.date}</span>
                <span>•</span>
                <span>{sermon.duration}</span>
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
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Study Notes</CardTitle>
                  <CardDescription>
                    AI-generated study notes from the sermon
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
                        <p className="text-base leading-relaxed">{sermon.summary}</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="key-points" className="mt-4 space-y-4">
                      <ul className="space-y-3">
                        {sermon.keyPoints.map((point, index) => (
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
                        {sermon.scriptures.map((scripture, index) => (
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
                          {sermon.applicationPoints.map((point, index) => (
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
                    {sermon.discussionQuestions.map((question, index) => (
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
                      src={sermon.thumbnail}
                      alt={sermon.title}
                      className="object-cover w-full h-full rounded-t-lg"
                    />
                  </div>
                  <CardContent className="pt-4">
                    <div className="flex flex-col gap-4">
                      <Button className="w-full">
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Full Transcript
                      </Button>
                      <Button variant="outline" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        View Original Audio
                      </Button>
                    </div>
                  </CardContent>
                </Card>

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