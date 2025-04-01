import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { checkAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // Get the session from URL
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        // Check for the session
        if (sessionError) {
          throw sessionError;
        }
        
        if (!sessionData.session) {
          // If there's no session, try to exchange the code for a session
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');
          
          if (!code) {
            // No code parameter, which means no auth flow was initiated or it failed
            throw new Error("No authentication code provided");
          }
          
          // Exchange the code for a session
          // This is handled automatically by Supabase when the page loads
          // We just need to check if we have a session now
          const { data, error } = await supabase.auth.getUser();
          
          if (error) {
            throw error;
          }
          
          if (!data.user) {
            throw new Error("Failed to get user data after authentication");
          }
        }
        
        // At this point, we should have a valid session and user
        // Let's sync with our backend
        const user = await checkAuth();
        
        if (user) {
          // Successful authentication
          toast({
            title: "Successfully signed in",
            description: `Welcome ${user.firstName || 'back'}!`,
          });
          
          // Redirect to home page or intended destination
          setLocation("/");
        } else {
          // No user from our backend even though Supabase auth succeeded
          throw new Error("Failed to sync authenticated user with our system");
        }
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setError(err.message || "Authentication failed");
        
        toast({
          title: "Authentication Failed",
          description: err.message || "There was a problem signing in",
          variant: "destructive",
        });
        
        // Redirect to login after a short delay
        setTimeout(() => {
          setLocation("/auth");
        }, 3000);
      }
    }
    
    handleAuthCallback();
  }, [setLocation, toast, checkAuth]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      {error ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Authentication Failed</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p>Redirecting you to login...</p>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Signing you in...</h1>
          <p className="text-muted-foreground">Please wait while we complete the authentication process.</p>
        </div>
      )}
    </div>
  );
}