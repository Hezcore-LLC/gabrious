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

// Mock data for demonstration
const recentSermons = [
  {
    id: "1",
    title: "Finding Peace in Troubled Times",
    pastor: "Pastor John Smith",
    date: "May 15, 2025",
    duration: "42:18",
    status: "completed",
    thumbnail: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1470&auto=format&fit=crop"
  },
  {
    id: "2",
    title: "The Power of Faith",
    pastor: "Pastor Sarah Johnson",
    date: "May 8, 2025",
    duration: "38:45",
    status: "completed",
    thumbnail: "https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=1470&auto=format&fit=crop"
  },
  {
    id: "3",
    title: "Walking in God's Purpose",
    pastor: "Pastor Michael Williams",
    date: "May 1, 2025",
    duration: "45:22",
    status: "processing",
    progress: 75,
    thumbnail: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=1470&auto=format&fit=crop"
  }
];

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

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");

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
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Study Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">+3 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Saved Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">+1 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.2 GB</div>
              <p className="text-xs text-muted-foreground">of 5 GB (Free Plan)</p>
              <Progress value={24} className="mt-2 h-2" />
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
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
          <TabsContent value="recent" className="mt-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentSermons.map((sermon) => (
                <Card key={sermon.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={sermon.thumbnail}
                      alt={sermon.title}
                      className="object-cover w-full h-full"
                    />
                    {sermon.status === "processing" && (
                      <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center p-4">
                        <p className="text-sm font-medium mb-2">Processing: {sermon.progress}%</p>
                        <Progress value={sermon.progress} className="w-full h-2" />
                      </div>
                    )}
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
          <TabsContent value="sermons" className="mt-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentSermons.map((sermon) => (
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
          <TabsContent value="notes" className="mt-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentSermons.slice(0, 2).map((sermon) => (
                <Card key={sermon.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{sermon.title} - Study Notes</CardTitle>
                        <CardDescription>{sermon.pastor}</CardDescription>
                      </div>
                      <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Key Points:</h4>
                      <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                        <li>Understanding God's peace in difficult circumstances</li>
                        <li>Practical steps to maintain faith during trials</li>
                        <li>Biblical examples of peace amidst chaos</li>
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">{sermon.date}</div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/study-notes/${sermon.id}`}>View Full Notes</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="favorites" className="mt-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favoriteSermons.map((sermon) => (
                <Card key={sermon.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={sermon.thumbnail}
                      alt={sermon.title}
                      className="object-cover w-full h-full"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-background/50 hover:bg-background/70"
                    >
                      <Heart className="h-4 w-4 fill-primary" />
                    </Button>
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">{sermon.title}</CardTitle>
                    <CardDescription>{sermon.pastor}</CardDescription>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0">
                    <div className="text-sm text-muted-foreground">{sermon.date}</div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}