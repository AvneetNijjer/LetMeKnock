import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import AuthModal from "@/components/auth/auth-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  User, 
  LogOut, 
  Home, 
  MapPin, 
  FileText, 
  BookOpen, 
  Plus, 
  Building, 
  ListPlus, 
  MessageSquare,
  Sparkles,
  Calculator,
  LayoutDashboard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import MessageIndicator from "./messaging/message-indicator";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navLinks = [
    { href: "/", label: "Home", icon: <Home className="h-4 w-4 mr-2" /> },
    { href: "/listings", label: "Listings", icon: <BookOpen className="h-4 w-4 mr-2" /> },
    { href: "/map-view", label: "Map View", icon: <MapPin className="h-4 w-4 mr-2" /> },
    { href: "/guidelines", label: "Guidelines", icon: <FileText className="h-4 w-4 mr-2" /> },
    { href: "/ai-matching", label: "AI Matching", icon: <Sparkles className="h-4 w-4 mr-2" /> },
    { href: "/rent-calculator", label: "Rent Calculator", icon: <Calculator className="h-4 w-4 mr-2" /> },
    { href: "/landlord-tools", label: "Landlord Tools", icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-2">
        <AnimatePresence>
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "max-w-7xl mx-auto rounded-full px-5 py-3 flex items-center justify-between transition-all duration-300",
              isScrolled
                ? "nav-scrolled shadow-md"
                : "nav-blur"
            )}
          >
            <div className="flex items-center">
              <Link href="/">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`flex items-center gap-2 font-bold ${isScrolled ? 'text-primary' : 'text-white'} font-poppins cursor-pointer`}
                >
                  <motion.div
                    animate={{ rotate: [0, 15, 0, -15, 0] }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 5
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-key">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                    </svg>
                  </motion.div>
                  <span>Let Me Knock</span>
                </motion.div>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
              {navLinks.map((link, index) => (
                <Link key={link.href} href={link.href}>
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                      "transition-colors cursor-pointer px-3 py-1 rounded-full",
                      location === link.href 
                        ? isScrolled 
                          ? "text-primary font-medium bg-blue-50" 
                          : "text-white font-medium bg-white/10" 
                        : isScrolled 
                          ? "text-gray-800 hover:text-primary hover:bg-blue-50" 
                          : "text-white hover:text-gray-200 hover:bg-white/10"
                    )}
                  >
                    {link.label}
                  </motion.div>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {isAuthenticated && user && (
                <div>
                  <MessageIndicator />
                </div>
              )}
              
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profilePicture || ""} alt={user?.firstName || "User"} />
                        <AvatarFallback>
                          {user?.firstName ? user.firstName[0] : user?.email?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 leading-none p-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {user?.firstName && user?.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user?.email}
                        </p>
                        <Badge variant={user?.userType === 'landlord' ? 'default' : 'secondary'} className="ml-2">
                          {user?.userType || 'Student'}
                        </Badge>
                      </div>
                      {user?.email && (
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <div className="w-full flex items-center cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/create-listing">
                        <div className="w-full flex items-center cursor-pointer">
                          <Plus className="mr-2 h-4 w-4" />
                          <span>Create Listing</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/my-listings">
                        <div className="w-full flex items-center cursor-pointer">
                          <Building className="mr-2 h-4 w-4" />
                          <span>My Listings</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/messages">
                        <div className="w-full flex items-center cursor-pointer">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          <span>Messages</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Advanced Features</DropdownMenuLabel>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/ai-matching">
                        <div className="w-full flex items-center cursor-pointer">
                          <Sparkles className="mr-2 h-4 w-4" />
                          <span>AI Matching</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/rent-calculator">
                        <div className="w-full flex items-center cursor-pointer">
                          <Calculator className="mr-2 h-4 w-4" />
                          <span>Rent Calculator</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    
                    {user?.userType === 'landlord' && (
                      <DropdownMenuItem asChild>
                        <Link href="/landlord-tools">
                          <div className="w-full flex items-center cursor-pointer">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Landlord Tools</span>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-primary text-white font-medium px-5 py-2 rounded-full hover:bg-blue-600 transition-all relative overflow-hidden group"
                  >
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <span className="relative z-10">Sign In</span>
                  </Button>
                </motion.div>
              )}
            </div>

            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className={`ml-2 ${isScrolled ? 'text-gray-800' : 'text-white'}`}>
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col space-y-6 mt-8">
                    {navLinks.map((link) => (
                      <Link key={link.href} href={link.href}>
                        <div className={cn(
                          "flex items-center text-base font-medium transition-colors cursor-pointer",
                          location === link.href ? "text-primary" : "text-dark hover:text-primary"
                        )}>
                          {link.icon}
                          {link.label}
                        </div>
                      </Link>
                    ))}
                    {isAuthenticated ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-base font-medium text-dark">
                            {user?.firstName && user?.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user?.email}
                          </div>
                          <Badge variant={user?.userType === 'landlord' ? 'default' : 'secondary'} className="ml-2">
                            {user?.userType || 'Student'}
                          </Badge>
                        </div>
                        
                        <Link href="/profile">
                          <div className="flex items-center text-base font-medium text-dark hover:text-primary cursor-pointer">
                            <User className="h-4 w-4 mr-2" />
                            Profile
                          </div>
                        </Link>
                        
                        <Link href="/create-listing">
                          <div className="flex items-center text-base font-medium text-dark hover:text-primary cursor-pointer">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Listing
                          </div>
                        </Link>
                        
                        <Link href="/my-listings">
                          <div className="flex items-center text-base font-medium text-dark hover:text-primary cursor-pointer">
                            <Building className="h-4 w-4 mr-2" />
                            My Listings
                          </div>
                        </Link>
                        
                        <Link href="/messages">
                          <div className="flex items-center text-base font-medium text-dark hover:text-primary cursor-pointer">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Messages
                          </div>
                        </Link>
                        
                        <div className="border-t pt-4 mt-2">
                          <p className="text-sm font-medium text-muted-foreground mb-3">Advanced Features</p>
                          
                          <Link href="/ai-matching">
                            <div className="flex items-center text-base font-medium text-dark hover:text-primary cursor-pointer mb-3">
                              <Sparkles className="h-4 w-4 mr-2" />
                              AI Matching
                            </div>
                          </Link>
                          
                          <Link href="/rent-calculator">
                            <div className="flex items-center text-base font-medium text-dark hover:text-primary cursor-pointer mb-3">
                              <Calculator className="h-4 w-4 mr-2" />
                              Rent Calculator
                            </div>
                          </Link>
                          
                          {user?.userType === 'landlord' && (
                            <Link href="/landlord-tools">
                              <div className="flex items-center text-base font-medium text-dark hover:text-primary cursor-pointer mb-3">
                                <LayoutDashboard className="h-4 w-4 mr-2" />
                                Landlord Tools
                              </div>
                            </Link>
                          )}
                        </div>
                        
                        <Button
                          variant="outline"
                          onClick={logout}
                          className="flex items-center justify-start mt-2"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Log out
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => {
                          setIsAuthModalOpen(true);
                        }}
                        className="bg-primary text-white"
                      >
                        Sign In
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </motion.nav>
        </AnimatePresence>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
