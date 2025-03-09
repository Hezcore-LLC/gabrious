from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from fastapi.responses import JSONResponse
import stripe
import os
from dotenv import load_dotenv
import json
from typing import Optional, Literal
from pydantic import BaseModel, Field

from models.user import User
from models.subscription import SubscriptionPlan, PlanTier
from api.auth import get_current_user

# Load environment variables
load_dotenv()

# Initialize Stripe with the API key
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')

# Create router
router = APIRouter()

# Price IDs for different plans
PRICE_IDS = {
    'pro_monthly': os.getenv('STRIPE_PRICE_PRO_MONTHLY'),
    'pro_yearly': os.getenv('STRIPE_PRICE_PRO_YEARLY'),
    'church_monthly': os.getenv('STRIPE_PRICE_CHURCH_MONTHLY'),
    'church_yearly': os.getenv('STRIPE_PRICE_CHURCH_YEARLY'),
}

# Plan mapping
PLAN_MAPPING = {
    'pro': PlanTier.BASIC,
    'church': PlanTier.PREMIUM,
}

class PaymentIntentRequest(BaseModel):
    amount: int
    currency: str = 'usd'

@router.post("/create-payment-intent")
async def create_payment_intent(request: PaymentIntentRequest, current_user: User = Depends(get_current_user)):
    """Create a PaymentIntent for a one-time payment"""
    try:
        # Pydantic already validated the request body
        amount = request.amount
        currency = request.currency
        
        # If amount is 0, create a SetupIntent instead of PaymentIntent
        if amount == 0:
            intent = stripe.SetupIntent.create(
                metadata={
                    'user_id': str(current_user.id)
                }
            )
        else:
            # Create a PaymentIntent for actual payments
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                metadata={
                    'user_id': str(current_user.id)
                }
            )
        
        return {"clientSecret": intent.client_secret}
    
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {e.user_message}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

class SubscriptionRequest(BaseModel):
    plan: str
    billingCycle: Literal['monthly', 'yearly'] = 'monthly'
    paymentMethodId: str

@router.post("/create-subscription")
async def create_subscription(request: SubscriptionRequest, current_user: User = Depends(get_current_user)):
    """Create a subscription for a user"""
    try:
        # Pydantic already validated the request body
        plan_type = request.plan
        billing_cycle = request.billingCycle
        payment_method_id = request.paymentMethodId
        
        # Get the price ID based on plan and billing cycle
        price_key = f"{plan_type}_{billing_cycle}"
        price_id = PRICE_IDS.get(price_key)
        
        if not price_id:
            raise HTTPException(status_code=400, detail="Invalid plan or billing cycle")
        
        # Create or get customer
        customers = stripe.Customer.list(email=current_user.email)
        if customers.data:
            customer = customers.data[0]
        else:
            # Create customer without payment method if not provided
            # When using PaymentElement, the payment method is collected during confirmation
            customer_data = {
                'email': current_user.email,
                'metadata': {
                    'user_id': str(current_user.id)
                }
            }
            
            # Only add payment method if provided
            if payment_method_id:
                customer_data['payment_method'] = payment_method_id
                customer_data['invoice_settings'] = {
                    'default_payment_method': payment_method_id,
                }
                
            customer = stripe.Customer.create(**customer_data)
        
        # Create the subscription
        subscription_data = {
            'customer': customer.id,
            'items': [
                {"price": price_id},
            ],
            'expand': ["latest_invoice.payment_intent"],
            'metadata': {
                'user_id': str(current_user.id),
                'plan_type': plan_type,
                'billing_cycle': billing_cycle
            }
        }
        
        # If payment method is provided, use it for the subscription
        if payment_method_id:
            subscription_data['default_payment_method'] = payment_method_id
            
        subscription = stripe.Subscription.create(**subscription_data)
        
        # Update user's subscription plan in our database
        plan_tier = PLAN_MAPPING.get(plan_type, PlanTier.FREE)
        subscription_plan = await SubscriptionPlan.filter(user_id=current_user.id).first()
        
        if subscription_plan:
            subscription_plan.plan_tier = plan_tier
            subscription_plan.storage_limit = SubscriptionPlan.get_plan_storage_limit(plan_tier)
            await subscription_plan.save()
        else:
            await SubscriptionPlan.create(
                user_id=current_user.id,
                plan_tier=plan_tier,
                storage_limit=SubscriptionPlan.get_plan_storage_limit(plan_tier)
            )
        
        return {
            "subscriptionId": subscription.id,
            "clientSecret": subscription.latest_invoice.payment_intent.client_secret if hasattr(subscription, 'latest_invoice') and hasattr(subscription.latest_invoice, 'payment_intent') else None,
            "status": subscription.status
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/subscription-status")
async def get_subscription_status(current_user: User = Depends(get_current_user)):
    """Get the current subscription status for a user"""
    try:
        # Get the user's subscription from our database
        subscription_plan = await SubscriptionPlan.filter(user_id=current_user.id).first()
        
        if not subscription_plan:
            return {"plan": "free", "status": "active"}
        
        # Map our plan tiers to frontend plan names
        plan_name_mapping = {
            PlanTier.FREE: "free",
            PlanTier.BASIC: "pro",
            PlanTier.PREMIUM: "church"
        }
        
        return {
            "plan": plan_name_mapping.get(subscription_plan.plan_tier, "free"),
            "status": "active",  # We would need to check with Stripe for actual status
            "storageLimit": subscription_plan.storage_limit_gb
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class CancelSubscriptionRequest(BaseModel):
    subscriptionId: str

@router.post("/cancel-subscription")
async def cancel_subscription(request: CancelSubscriptionRequest, current_user: User = Depends(get_current_user)):
    """Cancel a user's subscription"""
    try:
        # Pydantic already validated the request body
        subscription_id = request.subscriptionId
        
        # Cancel the subscription at period end
        stripe.Subscription.modify(
            subscription_id,
            cancel_at_period_end=True,
        )
        
        return {"status": "subscription_canceled"}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class StripeWebhookData(BaseModel):
    object: dict

class StripeWebhookEvent(BaseModel):
    id: str
    type: str
    data: StripeWebhookData

@router.post("/webhook")
async def stripe_webhook(request: Request, background_tasks: BackgroundTasks):
    """Handle Stripe webhook events"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
        # Convert to Pydantic model for validation
        webhook_event = StripeWebhookEvent(**event)
    except ValueError as e:
        # Invalid payload
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception as e:
        # Validation error
        raise HTTPException(status_code=400, detail=f"Invalid event format: {str(e)}")
    
    # Handle the event
    if webhook_event.type == 'checkout.session.completed':
        session = webhook_event.data.object
        # Process the checkout session
        background_tasks.add_task(handle_checkout_session, session)
    elif webhook_event.type == 'invoice.paid':
        invoice = webhook_event.data.object
        # Process the successful payment
        background_tasks.add_task(handle_invoice_paid, invoice)
    elif webhook_event.type == 'invoice.payment_failed':
        invoice = webhook_event.data.object
        # Process the failed payment
        background_tasks.add_task(handle_invoice_payment_failed, invoice)
    elif webhook_event.type == 'customer.subscription.deleted':
        subscription = webhook_event.data.object
        # Process subscription cancellation
        background_tasks.add_task(handle_subscription_deleted, subscription)
    
    return JSONResponse(content={"status": "success"})

async def handle_checkout_session(session):
    """Process a completed checkout session"""
    # Extract user_id from metadata
    user_id = session.get('metadata', {}).get('user_id')
    if not user_id:
        return
    
    # Update user's subscription plan
    plan_type = session.get('metadata', {}).get('plan_type')
    if not plan_type:
        return
    
    plan_tier = PLAN_MAPPING.get(plan_type, PlanTier.FREE)
    subscription_plan = await SubscriptionPlan.filter(user_id=user_id).first()
    
    if subscription_plan:
        subscription_plan.plan_tier = plan_tier
        subscription_plan.storage_limit = SubscriptionPlan.get_plan_storage_limit(plan_tier)
        await subscription_plan.save()
    else:
        await SubscriptionPlan.create(
            user_id=user_id,
            plan_tier=plan_tier,
            storage_limit=SubscriptionPlan.get_plan_storage_limit(plan_tier)
        )

async def handle_invoice_paid(invoice):
    """Process a paid invoice"""
    # Extract subscription and customer information
    subscription_id = invoice.get('subscription')
    customer_id = invoice.get('customer')
    
    if not subscription_id or not customer_id:
        return
    
    # Get subscription details
    subscription = stripe.Subscription.retrieve(subscription_id)
    user_id = subscription.get('metadata', {}).get('user_id')
    
    if not user_id:
        # Try to get user_id from customer metadata
        customer = stripe.Customer.retrieve(customer_id)
        user_id = customer.get('metadata', {}).get('user_id')
    
    if not user_id:
        return
    
    # Update subscription status in our database if needed
    # This is a good place to extend subscription end dates, etc.

async def handle_invoice_payment_failed(invoice):
    """Process a failed invoice payment"""
    # Extract subscription and customer information
    subscription_id = invoice.get('subscription')
    customer_id = invoice.get('customer')
    
    if not subscription_id or not customer_id:
        return
    
    # Get subscription details
    subscription = stripe.Subscription.retrieve(subscription_id)
    user_id = subscription.get('metadata', {}).get('user_id')
    
    if not user_id:
        # Try to get user_id from customer metadata
        customer = stripe.Customer.retrieve(customer_id)
        user_id = customer.get('metadata', {}).get('user_id')
    
    if not user_id:
        return
    
    # You might want to notify the user about the failed payment
    # or downgrade their plan if multiple payment attempts fail

async def handle_subscription_deleted(subscription):
    """Process a canceled subscription"""
    user_id = subscription.get('metadata', {}).get('user_id')
    
    if not user_id:
        return
    
    # Downgrade the user to the free plan
    subscription_plan = await SubscriptionPlan.filter(user_id=user_id).first()
    
    if subscription_plan:
        subscription_plan.plan_tier = PlanTier.FREE
        subscription_plan.storage_limit = SubscriptionPlan.get_plan_storage_limit(PlanTier.FREE)
        await subscription_plan.save()