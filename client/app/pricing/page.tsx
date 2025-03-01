"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, HelpCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const pricingPlans = [
  {
    name: "Free",
    description: "Perfect for getting started with sermon transcription",
    price: "$0",
    duration: "forever",
    features: [
      "5 sermon transcriptions per month",
      "Basic study notes generation",
      "Standard transcription quality",
      "Manual sermon uploads",
      "500MB storage",
    ],
    limitations: [
      "No API access",
      "No batch processing",
      "No advanced AI features",
    ],
    buttonText: "Get Started",
    buttonVariant: "outline" as const,
    highlighted: false,
  },
  {
    name: "Pro",
    description: "For individuals and small churches",
    price: "$19",
    duration: "per month",
    features: [
      "25 sermon transcriptions per month",
      "Advanced study notes generation",
      "Premium transcription quality",
      "YouTube/URL imports",
      "5GB storage",
      "Priority processing",
      "Discussion guide generation",
      "Email support",
    ],
    buttonText: "Start Free Trial",
    buttonVariant: "default" as const,
    highlighted: true,
    badge: "Popular",
  },
  {
    name: "Church",
    description: "For churches and ministries",
    price: "$49",
    duration: "per month",
    features: [
      "Unlimited sermon transcriptions",
      "Advanced study notes generation",
      "Premium transcription quality",
      "YouTube/URL imports",
      "25GB storage",
      "Priority processing",
      "Discussion guide generation",
      "API access",
      "Batch processing",
      "Custom branding",
      "Priority support",
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
    highlighted: false,
  },
];

const frequentlyAskedQuestions = [
  {
    question: "How accurate are the transcriptions?",
    answer: "Our transcription service uses state-of-the-art AI models to achieve up to 95% accuracy for clear audio. The Pro and Church plans offer enhanced accuracy with our premium transcription engine.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at the start of your next billing cycle.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and for Church plans, we can also accommodate purchase orders and bank transfers.",
  },
  {
    question: "Is there a limit to the length of sermons I can upload?",
    answer: "Free plan users can upload sermons up to 60 minutes in length. Pro and Church plans support sermons up to 3 hours in length.",
  },
  {
    question: "How long does it take to process a sermon?",
    answer: "Processing time depends on the length of the sermon and your plan. Free plan users can expect processing to take 30-60 minutes. Pro and Church plans have priority processing, typically completing in 15-30 minutes.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time. You'll continue to have access to your plan features until the end of your current billing period.",
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="container py-12 space-y-16">
      <div className="space-y-6 text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Simple, Transparent Pricing</h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Choose the plan that's right for you and your ministry
        </p>
      </div>

      <div className="flex justify-center">
        <Tabs defaultValue="monthly" className="w-[300px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly" onClick={() => setBillingCycle("monthly")}>Monthly</TabsTrigger>
            <TabsTrigger value="yearly" onClick={() => setBillingCycle("yearly")}>Yearly <Badge variant="outline" className="ml-2 bg-primary/20">Save 20%</Badge></TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {pricingPlans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col ${plan.highlighted ? 'border-primary shadow-md' : ''}`}>
            {plan.badge && (
              <div className="px-6 pt-6">
                <Badge className="bg-primary text-primary-foreground">{plan.badge}</Badge>
              </div>
            )}
            <CardHeader className={!plan.badge ? 'pt-6' : 'pt-2'}>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{billingCycle === "yearly" ? plan.name === "Free" ? "$0" : `$${parseInt(plan.price.replace('$', '')) * 0.8 * 12}` : plan.price}</span>
                <span className="ml-1 text-muted-foreground">{plan.name === "Free" ? "forever" : billingCycle === "yearly" ? "/year" : "/month"}</span>
              </div>
              {billingCycle === "yearly" && plan.name !== "Free" && (
                <p className="mt-1 text-sm text-muted-foreground">Billed annually</p>
              )}
              <Separator className="my-4" />
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.limitations && plan.limitations.map((limitation) => (
                  <li key={limitation} className="flex items-center text-muted-foreground">
                    <Check className="mr-2 h-4 w-4 text-muted-foreground opacity-50" />
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant={plan.buttonVariant} className="w-full" asChild>
                <Link href={plan.name === "Free" ? "/signup" : plan.name === "Pro" ? "/signup?plan=pro" : "/contact"}>
                  {plan.buttonText}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
          <p className="mt-2 text-muted-foreground">
            Have questions? We're here to help.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {frequentlyAskedQuestions.map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <HelpCircle className="mr-2 h-5 w-5 text-primary" />
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[800px] text-center">
        <Card>
          <CardHeader>
            <CardTitle>Need a custom solution?</CardTitle>
            <CardDescription>
              We offer custom plans for larger organizations and special use cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Contact our sales team to discuss your specific needs, including custom integrations, 
              dedicated support, and volume discounts for larger ministries and organizations.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}