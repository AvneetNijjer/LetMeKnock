import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  UserProfile, 
  signInWithGoogle, 
  signInWithEmail, 
  signOut, 
  registerWithEmail, 
  getCurrentUser 
} from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  googleSignIn: () => Promise<UserProfile | null>;
  emailSignIn: (email: string, password: string) => Promise<UserProfile | null>;
  registerWithEmail: (
    email: string, 
    password: string, 
    userProfile: { firstName: string; lastName: string; dateOfBirth: string }
  ) => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: false,
  googleSignIn: async () => null,
  emailSignIn: async () => null,
  registerWithEmail: async () => null,
  logout: async () => {},
  checkAuth: async () => null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const handleGoogleSignIn = async (): Promise<UserProfile | null> => {
    try {
      // For Google sign-in, we'll be redirected to the provider's page
      await signInWithGoogle();
      // User data will be set later in auth callback
      return null;
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Sign in failed",
        description: error.message || "There was a problem signing in with Google.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleEmailSignIn = async (email: string, password: string): Promise<UserProfile | null> => {
    try {
      const user = await signInWithEmail(email, password);
      if (user) {
        setUser(user);
        toast({
          title: "Successfully signed in",
          description: "Welcome back!",
        });
      }
      return user;
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleRegister = async (
    email: string, 
    password: string, 
    userProfile: { firstName: string; lastName: string; dateOfBirth: string }
  ): Promise<UserProfile | null> => {
    try {
      const user = await registerWithEmail(email, password, userProfile);
      if (user) {
        setUser(user);
        toast({
          title: "Account created",
          description: "Your account was created successfully.",
        });
      }
      return user;
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "There was a problem creating your account.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut();
      setUser(null);
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "There was a problem signing out.",
        variant: "destructive",
      });
    }
  };

  const checkAuthStatus = useCallback(async (): Promise<UserProfile | null> => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      setUser(user);
      return user;
    } catch (error) {
      console.error("Error checking authentication status:", error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    googleSignIn: handleGoogleSignIn,
    emailSignIn: handleEmailSignIn,
    registerWithEmail: handleRegister,
    logout: handleLogout,
    checkAuth: checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
