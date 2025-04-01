import { useEffect } from 'react';
import { useLocation } from 'wouter';
import SignInForm from '@/components/auth/sign-in-form';
import SignUpForm from '@/components/auth/sign-up-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth-context';

export default function AuthPage() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  // If already logged in, redirect to home
  useEffect(() => {
    if (isAuthenticated && user) {
      setLocation('/');
    }
  }, [isAuthenticated, user, setLocation]);

  // If we're still loading, don't redirect
  if (isAuthenticated) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left column - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 py-12 md:py-24">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Welcome to LetMeKnock</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your gateway to finding perfect student housing near McMaster University
            </p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <SignInForm onSuccess={() => setLocation('/')} />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignUpForm onSuccess={() => setLocation('/')} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right column - Hero section */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="h-full flex flex-col justify-center items-center p-12">
          <div className="max-w-md text-center">
            <h2 className="text-3xl font-bold mb-6">Find Your Perfect Student Housing</h2>
            
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Simple & Fast</h3>
                <p>Discover and book quality student housing in minutes, not days.</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Verified Listings</h3>
                <p>Every property is verified to ensure you get exactly what you see.</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Near McMaster</h3>
                <p>Find housing options with convenient access to campus, transit, and amenities.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}