"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, MessageSquare, Upload } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <motion.div 
              className="flex flex-col justify-center space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-2">
                <motion.h1 
                  className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Transform Sermons into Powerful Study Notes
                </motion.h1>
                <motion.p 
                  className="max-w-[600px] text-muted-foreground md:text-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Our AI-powered platform transcribes sermons and generates comprehensive study notes, helping you deepen your understanding and spiritual growth.
                </motion.p>
              </div>
              <motion.div 
                className="flex flex-col gap-2 min-[400px]:flex-row"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button asChild size="lg">
                    <Link href="/upload">Upload a Sermon</Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/how-it-works">How It Works</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div 
              className="mx-auto w-full max-w-[500px] lg:max-w-none"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-video overflow-hidden rounded-xl bg-muted/30">
                <motion.img
                  src="https://images.unsplash.com/photo-1616763355548-1b606f439f86?q=80&w=1470&auto=format&fit=crop"
                  alt="Person studying Bible with notes"
                  className="object-cover w-full h-full"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="flex flex-col items-center justify-center space-y-4 text-center"
            {...fadeIn}
          >
            <div className="space-y-2">
              <motion.h2 
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Powerful Features
              </motion.h2>
              <motion.p 
                className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Everything you need to get more from every sermon
              </motion.p>
            </div>
          </motion.div>
          <motion.div 
            className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[{
              icon: <FileText className="h-6 w-6" />,
              title: "Transcription",
              description: "Accurate sermon transcription powered by advanced AI",
              content: "Upload audio or video files, or paste a YouTube/Facebook URL to get a precise transcription in minutes.",
              link: "/transcription"
            }, {
              icon: <BookOpen className="h-6 w-6" />,
              title: "Study Notes",
              description: "Comprehensive study materials from every sermon",
              content: "Get key points, scripture references, summaries, and discussion questions automatically generated.",
              link: "/study-notes"
            }, {
              icon: <MessageSquare className="h-6 w-6" />,
              title: "Discussion Questions",
              description: "Deepen understanding with thoughtful questions",
              content: "AI-generated discussion questions to help you reflect on the sermon's message and application.",
              link: "/discussion-questions"
            }].map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeIn}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="bg-background h-full">
                  <CardHeader className="pb-2">
                    <motion.div 
                      className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.content}</p>
                  </CardContent>
                  <CardFooter>
                    <motion.div 
                      className="w-full"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button variant="ghost" asChild className="w-full">
                        <Link href={feature.link}>Learn More</Link>
                      </Button>
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background border-t">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="flex flex-col items-center justify-center space-y-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-2">
              <motion.h2 
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Ready to Get Started?
              </motion.h2>
              <motion.p 
                className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Upload your first sermon and see the power of Gabrious
              </motion.p>
            </div>
            <motion.div 
              className="flex flex-col gap-2 min-[400px]:flex-row"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button asChild size="lg">
                  <Link href="/upload">Upload a Sermon</Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}