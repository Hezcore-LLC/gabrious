import { API_BASE_URL } from './utils';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  faith_context: 'christian' | 'jewish' | 'muslim' | 'general';
  preferred_depth_mode: 'beginner' | 'intermediate' | 'advanced' | 'scholar';
  is_verified: boolean;
  created_at: string;
}

export interface ProfileUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface PreferencesUpdate {
  faith_context?: 'christian' | 'jewish' | 'muslim' | 'general';
  preferred_depth_mode?: 'beginner' | 'intermediate' | 'advanced' | 'scholar';
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const profileService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await fetch(`${API_BASE_URL}/api/profile/me`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch profile');
    }

    return response.json();
  },

  updateProfile: async (data: ProfileUpdate): Promise<UserProfile> => {
    const response = await fetch(`${API_BASE_URL}/api/profile/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update profile');
    }

    return response.json();
  },

  updatePreferences: async (data: PreferencesUpdate): Promise<UserProfile> => {
    const response = await fetch(`${API_BASE_URL}/api/profile/preferences`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update preferences');
    }

    return response.json();
  },

  changePassword: async (data: PasswordChange): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/profile/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to change password');
    }
  },

  deleteAccount: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/profile/me`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete account');
    }
  },
};
