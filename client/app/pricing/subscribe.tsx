"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { paymentService } from "@/lib/paymentService";
import { authService } from "@/lib/authService";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const planDetails = {
  pro: {
    name: "Pro",
    description: "For individuals and small churches",
    monthlyPrice: "$19",
    yearlyPrice: "$182", // 20% discount on yearly
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
  },
  church: {
    name: "Church",
    description: "For churches and ministries",
    monthlyPrice: "$49",
    yearlyPrice: "$470", // 20% discount on yearly
    features: [
      "Unlimited sermon transcriptions",
      "Advanced study notes generation",
      "Premium transcription quality",
      "YouTube/URL imports",
      "25GB storage",
      "Priority processing",
      "Discussion guide generation",
    ],
  },
};

function CheckoutForm({ plan, billingCycle, intentType }: { plan: string; billingCycle: "monthly" | "yearly"; intentType: "payment" | "setup" }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setProcessing(true);
    
    try {
      // Create subscription first to get client secret
      const result = await paymentService.createSubscription({
        plan,
        billingCycle,
        // We'll get the payment method from the PaymentElement during confirmation
        paymentMethodId: '',
      });
      
      if (result.status === "active") {
        setSucceeded(true);
        router.push("/dashboard?subscription=success");
      } else if (result.clientSecret) {
        // Handle confirmation with PaymentElement
        let confirmError;
        
        if (intentType === "setup") {
          // For setup intents
          const { error } = await stripe.confirmSetup({
            elements,
            clientSecret: result.clientSecret,
            confirmParams: {
              return_url: window.location.origin + "/dashboard?subscription=success",
            },
          });
          confirmError = error;
        } else {
          // For payment intents
          const { error } = await stripe.confirmPayment({
            elements,
            clientSecret: result.clientSecret,
            confirmParams: {
              return_url: window.location.origin + "/dashboard?subscription=success",
            },
          });
          confirmError = error;
        }
        
        if (confirmError) {
          setError(confirmError.message || "An error occurred with your payment");
        } else {
          // If we get here, it means the user was redirected to the return_url
          // This code won't execute in most cases as the page will reload
          setSucceeded(true);
          router.push("/dashboard?subscription=success");
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during checkout");
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <PaymentElement />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button 
          type="submit" 
          disabled={!stripe || processing} 
          className="w-full"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing
            </>
          ) : (
            <>Subscribe Now</>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function SubscribePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [intentType, setIntentType] = useState<"payment" | "setup">("payment");
  
  // Get plan from URL params
  const planParam = searchParams.get("plan")?.toLowerCase();
  const plan = planParam && (planParam === "pro" || planParam === "church") ? planParam : "pro";
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = authService.isAuthenticated();
        setIsAuthenticated(isAuth);
        
        if (!isAuth) {
          // Redirect to login with return URL
          router.push(`/auth/login?returnUrl=${encodeURIComponent(`/pricing/subscribe?plan=${plan}`)}`);
          return;
        }
        
        // Initialize Stripe setup
        try {
          // Create a setup intent to get a client secret for Stripe Elements
          const response = await paymentService.createPaymentIntent({
            amount: 0, // Zero amount for setup intent
            currency: 'usd'
          });
          
          setClientSecret(response.clientSecret);
          setIntentType("setup"); // Mark this as a setup intent
        } catch (err) {
          console.error("Failed to initialize payment:", err);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [plan, router]);
  
  const planInfo = plan === "church" ? planDetails.church : planDetails.pro;
  
  if (loading) {
    return (
      <div className="container py-12 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="container py-12 space-y-8">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
          Subscribe to {planInfo.name}
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground">
          {planInfo.description}
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
      
      <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Plan Summary</CardTitle>
            <CardDescription>Review your subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-medium">{planInfo.name}</h3>
                  <div className="text-2xl font-bold">
                    {billingCycle === "yearly" ? planInfo.yearlyPrice : planInfo.monthlyPrice}
                    <span className="text-sm text-muted-foreground ml-1">
                      /{billingCycle === "yearly" ? "year" : "month"}
                    </span>
                  </div>
                </div>
                {billingCycle === "yearly" && (
                  <p className="text-sm text-muted-foreground">Billed annually (20% discount)</p>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium">Features included:</h4>
                <ul className="space-y-1.5">
                  {planInfo.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Secure payment processing by Stripe</CardDescription>
          </CardHeader>
          <CardContent>
            {clientSecret ? (
              <Elements stripe={stripePromise} options={{
                clientSecret,
                appearance: { theme: 'stripe' },
              }}>
                <CheckoutForm plan={plan} billingCycle={billingCycle} intentType={intentType} />
              </Elements>
            ) : (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2">Loading payment form...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}