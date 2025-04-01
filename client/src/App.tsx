import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Listings from "@/pages/listings";
import MapView from "@/pages/map-view";
import Guidelines from "@/pages/guidelines";
import Profile from "@/pages/profile";
import AuthPage from "@/pages/auth-page";
import AuthCallback from "@/pages/auth-callback";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ProtectedRoute from "@/components/protected-route";
import { AuthProvider } from "./context/auth-context";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load these components since they're not needed for the initial page load
const CreateListing = lazy(() => import("@/pages/create-listing"));
const MyListings = lazy(() => import("@/pages/my-listings"));
const EditListing = lazy(() => import("@/pages/edit-listing"));
const Messages = lazy(() => import("@/pages/messages"));

// New advanced feature pages
const AIMatching = lazy(() => import("@/pages/ai-matching"));
const RentCalculator = lazy(() => import("@/pages/rent-calculator"));
const LandlordTools = lazy(() => import("@/pages/landlord-tools"));


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/listings" component={Listings} />
      <Route path="/map-view" component={MapView} />
      <Route path="/guidelines" component={Guidelines} />
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/create-listing">
        <ProtectedRoute>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }>
            <CreateListing />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/my-listings">
        <ProtectedRoute>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }>
            <MyListings />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/edit-listing/:id">
        <ProtectedRoute>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }>
            <EditListing />
          </Suspense>
        </ProtectedRoute>
      </Route>
      <Route path="/messages">
        <ProtectedRoute>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }>
            <Messages />
          </Suspense>
        </ProtectedRoute>
      </Route>

      {/* New Advanced Features Routes */}
      <Route path="/ai-matching">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <AIMatching />
        </Suspense>
      </Route>
      
      <Route path="/rent-calculator">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <RentCalculator />
        </Suspense>
      </Route>
      
      <Route path="/landlord-tools">
        <ProtectedRoute>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }>
            <LandlordTools />
          </Suspense>
        </ProtectedRoute>
      </Route>
      
      <Route path="/auth" component={AuthPage} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize auth check will happen in the AuthProvider
  // We don't need to call checkAuth here as it's already done in the AuthProvider

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
