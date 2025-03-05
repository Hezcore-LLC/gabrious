"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp, FileText, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HowItWorksPage() {
  const steps = [
    {
      icon: <FileUp className="h-12 w-12" />,
      title: "Upload Your Sermon",
      description: "Upload your sermon audio/video file or paste a URL from YouTube, Facebook, or other platforms. We support various formats including MP3, MP4, WAV, and M4A.",
      color: "text-blue-500"
    },
    {
      icon: <FileText className="h-12 w-12" />,
      title: "AI Transcription",
      description: "Our advanced AI technology transcribes your sermon with high accuracy, identifying speakers and key moments. Choose between free and premium transcription options.",
      color: "text-green-500"
    },
    {
      icon: <BookOpen className="h-12 w-12" />,
      title: "Generate Study Notes",
      description: "The AI analyzes the transcription to create comprehensive study notes, including key points, scripture references, and discussion questions.",
      color: "text-purple-500"
    }
  ];

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="container py-12 px-4 max-w-6xl mx-auto">
      <motion.div 
        className="text-center space-y-4 mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          How Gabrious Works
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Transform your sermons into comprehensive study materials in three simple steps
        </p>
      </motion.div>

      <motion.div 
        className="grid gap-8 md:grid-cols-3 mb-16"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            variants={fadeIn}
            whileHover={{ y: -5 }}
          >
            <Card className="relative h-full">
              <CardHeader>
                <div className={`${step.color} mb-4`}>
                  {step.icon}
                </div>
                <CardTitle className="text-xl mb-2">{step.title}</CardTitle>
                <CardDescription className="text-base">
                  {step.description}
                </CardDescription>
              </CardHeader>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                  <ArrowRight className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        className="space-y-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">Features & Benefits</CardTitle>
            <CardDescription>What makes Gabrious special</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "High-Quality Transcription",
                  description: "Advanced AI technology ensures accurate transcription with speaker detection and timestamps."
                },
                {
                  title: "Comprehensive Study Notes",
                  description: "Automatically generate structured study materials with key points and scripture references."
                },
                {
                  title: "Discussion Questions",
                  description: "AI-generated questions to facilitate deeper understanding and group discussions."
                },
                {
                  title: "Multiple Format Support",
                  description: "Upload audio/video files or paste URLs from popular platforms like YouTube and Facebook."
                },
                {
                  title: "Fast Processing",
                  description: "Quick turnaround times with our efficient processing pipeline."
                },
                {
                  title: "Easy Sharing",
                  description: "Share study materials with your congregation or study group with just a click."
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + (index * 0.1), duration: 0.5 }}
                  className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
                >
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
          <p className="text-muted-foreground">Try Gabrious today and experience the power of AI-enhanced sermon study.</p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/upload">Upload Your First Sermon</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}