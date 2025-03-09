"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle, Loader2 } from "lucide-react";
import { paymentService } from "@/lib/paymentService";
import { authService } from "@/lib/authService";
import Link from "next/link";

export interface SubscriptionStatusProps {
  onStatusLoaded?: (hasActiveSubscription: boolean) => void;
}

export default function SubscriptionStatus({ onStatusLoaded }: SubscriptionStatusProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<{
    plan: string;
    status: string;
    storageLimit?: number;
    nextBillingDate?: string; // This would need to be added to the API response
  } | null>(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      // Only fetch if user is authenticated
      if (!authService.isAuthenticated()) {
        setLoading(false);
        if (onStatusLoaded) onStatusLoaded(false);
        return;
      }

      try {
        const status = await paymentService.getSubscriptionStatus();
        setSubscription(status);
        
        // Notify parent component about subscription status
        if (onStatusLoaded) {
          onStatusLoaded(status.plan !== "free");
        }
      } catch (err) {
        console.error("Failed to fetch subscription status:", err);
        setError("Failed to load subscription information");
        if (onStatusLoaded) onStatusLoaded(false);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [onStatusLoaded]);

  if (!authService.isAuthenticated()) {
    return null; // Don't show anything if not authenticated
  }

  if (loading) {
    return (
      <Card className="mb-8">
        <CardContent className="pt-6 flex justify-center items-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span>Loading subscription information...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-8 border-red-200">
        <CardContent className="pt-6">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // If no subscription or free plan, don't show the status card
  if (!subscription || subscription.plan === "free") {
    return null;
  }

  // Format plan name for display
  const planName = subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1);
  
  // For now, we'll use a placeholder for next billing date
  // In a real implementation, this would come from the API
  const nextBillingDate = subscription.nextBillingDate || 
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

  return (
    <Card className="mb-8 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-xl">
          <CheckCircle className="h-5 w-5 text-primary mr-2" />
          Current Subscription
        </CardTitle>
        <CardDescription>
          Your subscription details and management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Plan</h3>
              <div className="flex items-center mt-1">
                <span className="text-lg font-semibold">{planName}</span>
                <Badge className="ml-2 bg-primary/20 text-primary">
                  {subscription.status === "active" ? "Active" : subscription.status}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <h3 className="font-medium">Next billing date</h3>
              <div className="flex items-center mt-1 justify-end">
                <CalendarDays className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{nextBillingDate}</span>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/subscription">Manage Subscription</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}