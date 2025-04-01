import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type UserProfile = {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  coverPhoto?: string;
  dateOfBirth?: string;
  authProvider: string;
  userType?: 'student' | 'landlord';
  bio?: string;
  education?: string;
  graduationYear?: number;
  major?: string;
  socialLinks?: Record<string, string>;
  phoneNumber?: string;
};

export const signInWithGoogle = async (): Promise<UserProfile | null> => {
  try {
    // Check if we're in development and enable a fallback
    const isDev = import.meta.env.DEV;
    
    // Try the OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account' // Forces Google to show the account selector
        }
      }
    });

    if (error) {
      console.error("Google sign-in error:", error);
      
      // If Google provider isn't enabled yet, show a more helpful error
      if (error.message.includes("provider is not enabled")) {
        throw new Error("Google sign-in is not configured. Please enable it in Supabase dashboard: Authentication > Providers > Google");
      }
      
      throw error;
    }

    // The user data will be received via the callback URL after successful OAuth
    return null;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<UserProfile | null> => {
  try {
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error("Email sign-in error:", error);
      throw error;
    }

    if (!data.user) {
      return null;
    }

    // For simplicity in this demo version, we'll create a user profile directly
    // instead of calling our API since we haven't fully set up the backend integration yet
    const userProfile: UserProfile = {
      id: parseInt(data.user.id.substring(0, 8), 16) || 1, // Convert part of UUID to number (just for demo)
      email: data.user.email || '',
      firstName: data.user.user_metadata?.first_name,
      lastName: data.user.user_metadata?.last_name,
      profilePicture: data.user.user_metadata?.avatar_url,
      userType: data.user.user_metadata?.user_type || 'student',
      authProvider: 'email'
    };
    
    return userProfile;
    
    // In a complete implementation, we would fetch/create the user profile from our API:
    /*
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.user.email,
        providerId: data.user.id,
        authProvider: 'email'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get user profile');
    }

    const userProfile: UserProfile = await response.json();
    return userProfile;
    */
  } catch (error) {
    console.error("Error signing in with email:", error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const registerWithEmail = async (
  email: string, 
  password: string, 
  userProfile: { firstName: string; lastName: string; dateOfBirth: string; userType?: 'student' | 'landlord' }
): Promise<UserProfile | null> => {
  try {
    // Register with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userProfile.firstName,
          last_name: userProfile.lastName,
          date_of_birth: userProfile.dateOfBirth,
          user_type: userProfile.userType || 'student'
        }
      }
    });

    if (error) {
      console.error("Registration error:", error);
      throw error;
    }

    if (!data.user) {
      return null;
    }

    // For simplicity in this demo version, we'll create a user profile directly
    // This approach works for demos but in production we'd save to our database
    const newUserProfile: UserProfile = {
      id: parseInt(data.user.id.substring(0, 8), 16) || 1, // Convert part of UUID to number (just for demo)
      email: data.user.email || '',
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      dateOfBirth: userProfile.dateOfBirth,
      userType: userProfile.userType || 'student',
      authProvider: 'email'
    };
    
    return newUserProfile;
    
    // In a complete implementation, we would create the user profile via our API:
    /*
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.user.email,
        providerId: data.user.id,
        authProvider: 'email',
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        dateOfBirth: userProfile.dateOfBirth
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create user profile');
    }

    const newUserProfile: UserProfile = await response.json();
    return newUserProfile;
    */
  } catch (error) {
    console.error("Error registering with email:", error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) {
      return null;
    }

    // For simplicity in this demo version, we'll create a user profile directly
    // based on the Supabase user data without making an API call to our backend
    const userProfile: UserProfile = {
      id: parseInt(data.user.id.substring(0, 8), 16) || 1, // Convert part of UUID to number (just for demo)
      email: data.user.email || '',
      firstName: data.user.user_metadata?.first_name,
      lastName: data.user.user_metadata?.last_name,
      profilePicture: data.user.user_metadata?.avatar_url,
      dateOfBirth: data.user.user_metadata?.date_of_birth,
      userType: data.user.user_metadata?.user_type || 'student',
      authProvider: data.user.app_metadata?.provider || 'email'
    };
    
    return userProfile;
    
    // In a complete implementation, we would fetch the user profile from our API:
    /*
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.user.email,
        providerId: data.user.id,
        authProvider: data.user.app_metadata?.provider || 'email'
      }),
    });

    if (!response.ok) {
      return null;
    }

    const userProfile: UserProfile = await response.json();
    return userProfile;
    */
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};
