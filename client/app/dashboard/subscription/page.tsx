"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, CheckCircle, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { paymentService } from "@/lib/paymentService";
import { authService } from "@/lib/authService";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SubscriptionManagementPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<{
    plan: string;
    status: string;
    subscriptionId?: string;
    storageLimit?: number;
    nextBillingDate?: string;
  } | null>(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      // Only fetch if user is authenticated
      if (!authService.isAuthenticated()) {
        router.push("/auth/login");
        return;
      }

      try {
        setLoading(true);
        const status = await paymentService.getSubscriptionStatus();
        setSubscription(status);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch subscription status:", err);
        setError("Failed to load subscription information");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [router]);

  const handleCancelSubscription = async () => {
    if (!subscription?.subscriptionId) {
      toast({
        title: "Error",
        description: "Subscription ID not found",
        variant: "destructive",
      });
      return;
    }

    try {
      setCancelLoading(true);
      await paymentService.cancelSubscription(subscription.subscriptionId);
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully. You will have access until the end of your billing period.",
      });
      
      // Refresh subscription status
      const status = await paymentService.getSubscriptionStatus();
      setSubscription(status);
    } catch (err) {
      console.error("Failed to cancel subscription:", err);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const handleUpgradeSubscription = (plan: string) => {
    router.push(`/pricing/subscribe?plan=${plan.toLowerCase()}`);
  };

  if (loading) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6 flex justify-center items-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>Loading subscription information...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center text-red-500">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Format plan name for display
  const planName = subscription?.plan ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : "Free";
  
  // For now, we'll use a placeholder for next billing date
  // In a real implementation, this would come from the API
  const nextBillingDate = subscription?.nextBillingDate || 
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString();

  // Define available plans for upgrade/downgrade
  const availablePlans = [
    { name: "Free", features: ["5 sermon transcriptions per month", "Basic study notes generation", "500MB storage"] },
    { name: "Pro", features: ["25 sermon transcriptions per month", "Advanced study notes", "5GB storage", "Priority processing"] },
    { name: "Church", features: ["Unlimited sermon transcriptions", "Advanced study notes", "25GB storage", "Priority processing"] },
  ];

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter">Subscription Management</h1>
          <p className="text-muted-foreground">View and manage your current subscription plan</p>
        </div>

        {/* Current Subscription Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-xl">
              <CheckCircle className="h-5 w-5 text-primary mr-2" />
              Current Subscription
            </CardTitle>
            <CardDescription>
              Your active subscription details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Plan</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-lg font-semibold">{planName}</span>
                    <Badge className="ml-2 bg-primary/20 text-primary">
                      {subscription?.status === "active" ? "Active" : subscription?.status || "Inactive"}
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

              {subscription?.storageLimit && (
                <div>
                  <h3 className="font-medium">Storage Limit</h3>
                  <p className="mt-1">{subscription.storageLimit}GB</p>
                </div>
              )}

              {subscription?.plan !== "free" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Cancel Subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will cancel your subscription at the end of your current billing period. 
                        You will still have access to all features until then.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleCancelSubscription}
                        disabled={cancelLoading}
                      >
                        {cancelLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          "Yes, cancel subscription"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Plan Options */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tighter">Change Plan</h2>
          <Tabs defaultValue={subscription?.plan || "free"} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="free">Free</TabsTrigger>
              <TabsTrigger value="pro">Pro</TabsTrigger>
              <TabsTrigger value="church">Church</TabsTrigger>
            </TabsList>

            {availablePlans.map((plan) => (
              <TabsContent key={plan.name.toLowerCase()} value={plan.name.toLowerCase()} className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>{plan.name} Plan</CardTitle>
                    <CardDescription>
                      {plan.name === "Free" ? "Basic features for getting started" : 
                       plan.name === "Pro" ? "Advanced features for individuals" : 
                       "Complete features for churches and organizations"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-primary mr-2" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {subscription?.plan !== plan.name.toLowerCase() ? (
                      <Button 
                        className="w-full" 
                        onClick={() => handleUpgradeSubscription(plan.name)}
                        disabled={plan.name.toLowerCase() === "free"} // Can't directly downgrade to free
                      >
                        {subscription?.plan && 
                         ((plan.name.toLowerCase() === "pro" && subscription.plan === "church") || 
                          (plan.name.toLowerCase() === "free" && (subscription.plan === "pro" || subscription.plan === "church"))) ? 
                          "Downgrade to " + plan.name : 
                          "Upgrade to " + plan.name}
                      </Button>
                    ) : (
                      <Button className="w-full" disabled>
                        Current Plan
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Billing History - Placeholder for future implementation */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              View your past invoices and payment history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Billing history will be available soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}