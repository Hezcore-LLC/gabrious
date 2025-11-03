"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Upload, 
  Sparkles, 
  Zap, 
  Brain, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  Play,
  Star,
  TrendingUp,
  Shield,
  Clock,
  Globe
} from "lucide-react";
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
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section - Modern Gradient */}
      <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        
        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="container relative px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div 
              className="flex flex-col justify-center space-y-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Badge className="inline-flex items-center gap-1 px-3 py-1 text-sm">
                  <Sparkles className="h-3 w-3" />
                  AI-Powered Study Platform
                </Badge>
              </motion.div>

              {/* Headline */}
              <div className="space-y-4">
                <motion.h1 
                  className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  Transform Sermons into
                  <span className="block bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent animate-gradient">
                    Deep Study Notes
                  </span>
                </motion.h1>
                <motion.p 
                  className="text-lg text-muted-foreground md:text-xl max-w-[600px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  Unlock deeper spiritual insights with AI-generated study materials. 
                  Upload any sermon and get comprehensive notes, scripture references, 
                  and discussion questions in minutes.
                </motion.p>
              </div>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Button asChild size="lg" className="text-base gap-2 shadow-lg hover:shadow-xl transition-shadow">
                  <Link href="/upload">
                    <Upload className="h-4 w-4" />
                    Upload Your First Sermon
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="text-base gap-2">
                  <Link href="/how-it-works">
                    <Play className="h-4 w-4" />
                    See How It Works
                  </Link>
                </Button>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                className="flex items-center gap-6 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">1,000+</span> sermons processed
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Image/Video */}
            <motion.div 
              className="relative mx-auto w-full max-w-[600px]"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                
                {/* Main Image */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border-2 border-amber-500/20 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1519791883288-dc8bd696e667?q=80&w=1470&auto=format&fit=crop"
                    alt="Open Bible with study notes - AI-powered sermon study platform"
                    className="object-cover w-full h-full"
                  />
                  {/* Overlay Card */}
                  <motion.div
                    className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-xl p-4 border shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                        <Zap className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">AI Processing Complete</p>
                        <p className="text-xs text-muted-foreground">Study notes ready in 2 minutes</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 bg-muted/30 border-y">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {[
              { value: "1,000+", label: "Sermons Processed", icon: TrendingUp },
              { value: "50+", label: "Churches Served", icon: Users },
              { value: "99%", label: "Accuracy Rate", icon: CheckCircle2 },
              { value: "2 min", label: "Average Processing", icon: Clock }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="flex flex-col items-center text-center space-y-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <stat.icon className="h-8 w-8 text-amber-600 mb-2" />
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section - Modern Cards */}
      <section className="w-full py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="flex flex-col items-center text-center space-y-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              Features
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Everything You Need to
              <span className="block bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">Deepen Your Faith</span>
            </h2>
            <p className="max-w-[800px] text-muted-foreground text-lg">
              Powerful AI tools designed to help you get more from every sermon
            </p>
          </motion.div>

          <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: <Brain className="h-6 w-6" />,
                title: "AI-Powered Transcription",
                description: "Crystal-clear transcription using advanced speech recognition",
                features: ["99% accuracy", "Multiple languages", "Speaker identification"],
                gradient: "from-amber-500/10 to-yellow-500/10"
              },
              {
                icon: <BookOpen className="h-6 w-6" />,
                title: "Smart Study Notes",
                description: "Comprehensive notes with key insights and takeaways",
                features: ["Key points extraction", "Scripture references", "Sermon summaries"],
                gradient: "from-yellow-500/10 to-amber-600/10"
              },
              {
                icon: <MessageSquare className="h-6 w-6" />,
                title: "Discussion Questions",
                description: "Thought-provoking questions for deeper reflection",
                features: ["Group study ready", "Personal reflection", "Application focused"],
                gradient: "from-amber-600/10 to-orange-500/10"
              },
              {
                icon: <FileText className="h-6 w-6" />,
                title: "Multiple Formats",
                description: "Export in various formats for different study styles",
                features: ["PDF export", "Markdown", "Copy to clipboard"],
                gradient: "from-yellow-400/10 to-amber-500/10"
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: "Secure & Private",
                description: "Your sermons and notes are encrypted and protected",
                features: ["End-to-end encryption", "Private storage", "GDPR compliant"],
                gradient: "from-amber-500/10 to-yellow-600/10"
              },
              {
                icon: <Globe className="h-6 w-6" />,
                title: "Multi-Language Support",
                description: "Process sermons in multiple languages",
                features: ["50+ languages", "Auto-detection", "Translation ready"],
                gradient: "from-yellow-500/10 to-amber-400/10"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeIn}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <Card className="h-full border-2 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl">
                  <CardHeader>
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.features.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-20 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6">
          <motion.div 
            className="flex flex-col items-center text-center space-y-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="px-3 py-1">
              <Zap className="h-3 w-3 mr-1" />
              Simple Process
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Get Started in
              <span className="block bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">Three Easy Steps</span>
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Upload Your Sermon",
                description: "Drag and drop audio/video files or paste a YouTube link",
                icon: <Upload className="h-8 w-8" />
              },
              {
                step: "02",
                title: "AI Processing",
                description: "Our AI transcribes and analyzes the sermon content",
                icon: <Brain className="h-8 w-8" />
              },
              {
                step: "03",
                title: "Get Your Notes",
                description: "Receive comprehensive study notes ready to use",
                icon: <BookOpen className="h-8 w-8" />
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-amber-500/50 to-transparent -translate-x-1/2" />
                )}
                <Card className="relative border-2 hover:border-amber-500/50 transition-all">
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
                      {step.icon}
                    </div>
                    <div className="text-4xl font-bold text-amber-600 mb-2">{step.step}</div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                    <CardDescription className="text-base">{step.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Modern Gradient */}
      <section className="relative w-full py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600" />
        <div className="absolute inset-0 bg-grid-white/10" />
        
        <div className="container relative px-4 md:px-6">
          <motion.div 
            className="flex flex-col items-center text-center space-y-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-white/20 text-white border-white/30">
              <Sparkles className="h-3 w-3 mr-1" />
              Start Your Journey
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl max-w-[800px]">
              Ready to Transform Your Sermon Study?
            </h2>
            <p className="max-w-[600px] text-lg text-white/90">
              Join thousands of believers using Gabrious to deepen their understanding of God&apos;s Word
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg" variant="secondary" className="text-base gap-2 shadow-xl">
                <Link href="/upload">
                  <Upload className="h-4 w-4" />
                  Upload Your First Sermon
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Link href="/pricing">
                  View Pricing Plans
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
