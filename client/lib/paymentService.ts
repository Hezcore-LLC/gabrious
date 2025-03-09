import { API_BASE_URL } from './utils';
import { authService } from './authService';

export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
}

export interface CreateSubscriptionRequest {
  plan: string; // 'pro' or 'church'
  billingCycle: 'monthly' | 'yearly';
  paymentMethodId: string;
}

export interface SubscriptionResponse {
  subscriptionId: string;
  clientSecret?: string;
  status: string;
}

export interface SubscriptionStatusResponse {
  plan: string; // 'free', 'pro', or 'church'
  status: string;
  storageLimit?: number;
  subscriptionId?: string;
  nextBillingDate?: string;
}

export const paymentService = {
  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<{ clientSecret: string }> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/payment/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create payment intent');
    }

    return response.json();
  },

  async createSubscription(data: CreateSubscriptionRequest): Promise<SubscriptionResponse> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/payment/create-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create subscription');
    }

    return response.json();
  },

  async getSubscriptionStatus(): Promise<SubscriptionStatusResponse> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/payment/subscription-status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get subscription status');
    }

    return response.json();
  },

  async cancelSubscription(subscriptionId: string): Promise<{ status: string }> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/payment/cancel-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ subscriptionId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to cancel subscription');
    }

    return response.json();
  },
};