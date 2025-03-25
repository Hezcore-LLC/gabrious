# Stripe Integration Guide

## Overview

This document provides a comprehensive guide to the Stripe integration in the Gabrious application, covering both frontend and backend implementations. It explains the complete payment flow, subscription management, webhook handling, and security considerations.

## Prerequisites

Before implementing Stripe integration, you need:

1. A Stripe account (sandbox for testing, production for live payments)
2. Stripe API keys (publishable and secret)
3. Webhook endpoint configuration in the Stripe dashboard

## Environment Configuration

The application requires the following environment variables for Stripe integration:

```
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs
STRIPE_PRICE_PRO_MONTHLY=price_123
STRIPE_PRICE_PRO_YEARLY=price_456
STRIPE_PRICE_CHURCH_MONTHLY=price_789
STRIPE_PRICE_CHURCH_YEARLY=price_012
```

## Backend Implementation

### API Endpoints

The backend provides the following Stripe-related endpoints:

1. **Create Payment Intent** (`POST /payment/create-payment-intent`)
   - Creates a Stripe PaymentIntent for one-time payments
   - Returns a client secret for frontend processing

2. **Create Subscription** (`POST /payment/create-subscription`)
   - Creates a Stripe subscription for recurring payments
   - Handles customer creation/retrieval
   - Updates the database with subscription details

3. **Get Subscription Status** (`GET /payment/subscription-status`)
   - Returns the current subscription status for a user
   - Includes plan details, storage limits, and next billing date

4. **Cancel Subscription** (`POST /payment/cancel-subscription`)
   - Cancels a subscription at the end of the current billing period
   - Updates the database to reflect cancellation

5. **Reactivate Subscription** (`POST /payment/reactivate-subscription`)
   - Reactivates a previously canceled subscription
   - Updates the database to reflect reactivation

6. **Stripe Webhook** (`POST /payment/webhook`)
   - Handles Stripe webhook events
   - Processes subscription lifecycle events

### Database Models

The application uses the following database model for subscription management:

```python
class SubscriptionPlan(models.Model):
    id = fields.UUIDField(pk=True)
    user = fields.ForeignKeyField('models.User', related_name='subscription')
    plan_tier = fields.CharEnumField(PlanTier, default=PlanTier.FREE)
    storage_limit = fields.IntField(default=1024 * 1024 * 1024)  # Default 1GB in bytes
    subscription_id = fields.CharField(max_length=255, null=True)  # Stripe subscription ID
    is_canceled = fields.BooleanField(default=False)  # Whether subscription is canceled
    cancel_at = fields.DatetimeField(null=True)  # When subscription will end
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
```

### Webhook Handling

The backend processes the following Stripe webhook events:

1. `checkout.session.completed` - Processes completed checkout sessions
2. `invoice.paid` - Handles successful subscription payments
3. `invoice.payment_failed` - Handles failed subscription payments
4. `customer.subscription.deleted` - Processes subscription cancellations

Webhook handlers update the database to reflect changes in subscription status, ensuring the application state remains in sync with Stripe.

## Frontend Implementation

### Payment Service

The frontend includes a payment service (`paymentService.ts`) that provides methods for interacting with the backend payment API:

```typescript
export const paymentService = {
  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<{ clientSecret: string }> {
    // Implementation
  },
  
  async createSubscription(data: CreateSubscriptionRequest): Promise<SubscriptionResponse> {
    // Implementation
  },
  
  async getSubscriptionStatus(): Promise<SubscriptionStatusResponse> {
    // Implementation
  },
  
  async cancelSubscription(subscriptionId: string): Promise<{ status: string }> {
    // Implementation
  },
  
  async reactivateSubscription(subscriptionId: string): Promise<{ status: string }> {
    // Implementation
  }
};
```

### Stripe Elements Integration

The frontend uses Stripe Elements to securely collect payment information:

1. Load the Stripe.js library
2. Initialize Stripe with the publishable key
3. Create a payment element using the client secret
4. Handle form submission and payment confirmation

### Subscription Flow

The subscription flow in the frontend follows these steps:

1. User selects a subscription plan (Pro or Church) and billing cycle (monthly or yearly)
2. User enters payment information using Stripe Elements
3. Frontend calls the backend to create a subscription
4. Backend creates a Stripe subscription and returns the client secret
5. Frontend confirms the payment using the client secret
6. User is redirected to a success page or shown an error message

### Subscription Management

The frontend provides a subscription management interface that allows users to:

1. View their current subscription status
2. Cancel their subscription
3. Reactivate a canceled subscription
4. Upgrade or downgrade their subscription plan

## Complete Payment Flow

### One-Time Payment Flow

1. **Frontend**: Initialize Stripe Elements with the publishable key
2. **Frontend**: Call `paymentService.createPaymentIntent()` with the payment amount
3. **Backend**: Create a Stripe PaymentIntent and return the client secret
4. **Frontend**: Use the client secret to confirm the payment with Stripe Elements
5. **Frontend**: Handle the payment result (success or failure)

### Subscription Flow

1. **Frontend**: User selects a subscription plan and billing cycle
2. **Frontend**: Initialize Stripe Elements with the publishable key
3. **Frontend**: Collect payment method details using Stripe Elements
4. **Frontend**: Call `paymentService.createSubscription()` with plan details and payment method ID
5. **Backend**: Create or retrieve a Stripe customer
6. **Backend**: Create a Stripe subscription for the customer
7. **Backend**: Update the database with subscription details
8. **Backend**: Return the subscription ID and client secret
9. **Frontend**: Handle the subscription result (success or failure)

### Webhook Flow

1. **Stripe**: Send webhook events to the configured endpoint
2. **Backend**: Verify the webhook signature using the webhook secret
3. **Backend**: Process the webhook event based on its type
4. **Backend**: Update the database to reflect changes in subscription status
5. **Frontend**: Reflect subscription changes in the UI when the user refreshes or navigates

## Security Considerations

1. **API Keys**: Never expose the Stripe secret key in the frontend code
2. **Webhook Signatures**: Always verify webhook signatures to prevent fraudulent requests
3. **HTTPS**: Ensure all communication with Stripe is over HTTPS
4. **PCI Compliance**: Use Stripe Elements to handle payment information securely
5. **Error Handling**: Implement proper error handling for payment failures

## Testing

1. **Test Mode**: Use Stripe test mode for development and testing
2. **Test Cards**: Use Stripe test cards for testing different payment scenarios
3. **Webhook Testing**: Use the Stripe CLI to test webhook events locally

## Troubleshooting

1. **Payment Failures**: Check the Stripe dashboard for detailed error messages
2. **Webhook Failures**: Verify the webhook endpoint is correctly configured
3. **Subscription Issues**: Check the subscription status in the Stripe dashboard

## References

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Elements Documentation](https://stripe.com/docs/stripe-js)
- [Stripe Webhook Documentation](https://stripe.com/docs/webhooks)