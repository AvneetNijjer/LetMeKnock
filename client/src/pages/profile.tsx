import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User, userTypeEnum } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CalendarIcon, 
  Loader2, 
  Camera, 
  Upload, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Github,
  UserCheck,
  School,
  Mail,
  Phone,
  MapPin,
  LogOut,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import PropertyCard from "@/components/property-card";
import { Property } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

export default function Profile() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    bio: "",
    userType: "student" as "student" | "landlord" | "admin",
    education: "",
    graduationYear: undefined as number | undefined,
    major: "",
    phoneNumber: "",
    contactEmail: "",
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      github: ""
    },
    notificationPreferences: {
      email: true,
      push: true,
      sms: false
    },
    privacySettings: {
      showEmail: false,
      showPhone: false,
      profileVisibility: "public" // public, registered, private
    }
  });
  
  const profilePictureRef = useRef<HTMLInputElement>(null);
  const coverPhotoRef = useRef<HTMLInputElement>(null);

  const { data: userData, isLoading: isUserLoading } = useQuery<User>({
    queryKey: [`/api/users/${user?.id}`],
    enabled: !!user?.id && isAuthenticated,
  });

  const { data: bookmarkedProperties, isLoading: isBookmarksLoading } = useQuery<Property[]>({
    queryKey: [`/api/users/${user?.id}/bookmarks`],
    enabled: !!user?.id && isAuthenticated,
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        dateOfBirth: userData.dateOfBirth || "",
        bio: userData.bio || "",
        userType: (userData.userType as "student" | "landlord" | "admin") || "student",
        education: userData.education || "",
        graduationYear: userData.graduationYear || undefined,
        major: userData.major || "",
        phoneNumber: userData.phoneNumber || "",
        contactEmail: userData.contactEmail || "",
        socialLinks: userData.socialLinks ? JSON.parse(userData.socialLinks as any) : {
          facebook: "",
          instagram: "",
          twitter: "",
          linkedin: "",
          github: ""
        },
        notificationPreferences: userData.notificationPreferences ? 
          JSON.parse(userData.notificationPreferences as any) : {
            email: true,
            push: true,
            sms: false
          },
        privacySettings: userData.privacySettings ? 
          JSON.parse(userData.privacySettings as any) : {
            showEmail: false,
            showPhone: false,
            profileVisibility: "public"
          }
      });

      if (userData.dateOfBirth) {
        setDate(new Date(userData.dateOfBirth));
      }
    }
  }, [userData]);

  const handleUpdateProfile = async () => {
    if (!user?.id) return;

    setIsUpdating(true);
    try {
      // Convert objects to JSON strings for API submission
      const apiData = {
        ...formData,
        dateOfBirth: date ? format(date, "yyyy-MM-dd") : undefined,
        socialLinks: JSON.stringify(formData.socialLinks),
        notificationPreferences: JSON.stringify(formData.notificationPreferences),
        privacySettings: JSON.stringify(formData.privacySettings)
      };

      await apiRequest("PUT", `/api/users/${user.id}`, apiData);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleFileUpload = async (file: File, type: 'profile' | 'cover') => {
    if (!user?.id) return;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    try {
      // Simulate upload progress with toast
      toast({
        title: `Uploading ${type === 'profile' ? 'profile picture' : 'cover photo'}...`,
        description: "Please wait while we upload your image.",
      });
      
      // In a real implementation, you would use fetch to upload the file
      // For now, we'll simulate a delay
      setTimeout(async () => {
        // We'll show a new toast instead of dismissing the old one
        
        // Here we'd normally get the URL from the response
        const imageUrl = URL.createObjectURL(file); // temporary URL for preview
        
        // Update user data
        if (type === 'profile') {
          await apiRequest("PUT", `/api/users/${user.id}`, {
            profilePicture: imageUrl
          });
        } else {
          await apiRequest("PUT", `/api/users/${user.id}`, {
            coverPhoto: imageUrl
          });
        }
        
        toast({
          title: "Image uploaded",
          description: `Your ${type === 'profile' ? 'profile picture' : 'cover photo'} has been updated.`,
        });
      }, 1500);
    } catch (error) {
      console.error(`Error uploading ${type} image:`, error);
      toast({
        title: "Upload failed",
        description: `Failed to upload your ${type === 'profile' ? 'profile picture' : 'cover photo'}.`,
        variant: "destructive",
      });
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading profile...</p>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
                <p className="mb-4">You need to be signed in to view your profile.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 pt-24">
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* Left column - Profile header and tabs */}
        <div className="w-full space-y-6">
          {/* Profile Banner & Image */}
          <Card className="overflow-hidden">
            <div 
              className="h-36 bg-gradient-to-r from-primary/20 to-primary/40 relative"
              style={{
                backgroundImage: user?.coverPhoto ? `url(${user.coverPhoto})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <Button 
                size="sm" 
                variant="ghost" 
                className="absolute right-2 top-2 bg-background/50 hover:bg-background/80"
                onClick={() => coverPhotoRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-1" />
                Cover Photo
              </Button>
              <input
                type="file"
                ref={coverPhotoRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0], 'cover');
                  }
                }}
              />
            </div>
            <CardContent className="pt-0 pb-6 relative">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between -mt-12">
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="relative z-10 flex-shrink-0">
                    <Avatar className="h-24 w-24 border-4 border-background">
                      <AvatarImage src={user?.profilePicture || ""} alt={user?.firstName || "User"} />
                      <AvatarFallback className="text-xl">
                        {user?.firstName ? user.firstName[0] : user?.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="absolute -right-2 -bottom-2 rounded-full h-8 w-8 p-0"
                      onClick={() => profilePictureRef.current?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <input
                      type="file"
                      ref={profilePictureRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0], 'profile');
                        }
                      }}
                    />
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
                    <h3 className="text-xl font-medium">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.email?.split('@')[0]}
                    </h3>
                    <div className="flex items-center mt-1 justify-center md:justify-start">
                      <Badge variant={formData.userType === 'landlord' ? 'default' : 'secondary'} className="text-xs">
                        {formData.userType === 'landlord' ? 'Landlord' : 'Student'}
                      </Badge>
                      {userData?.verified && (
                        <Badge variant="outline" className="ml-2 text-xs flex items-center">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground mt-1 block">{user?.email}</span>
                    
                    {/* Quick bio summary */}
                    {formData.bio && (
                      <p className="text-sm mt-2 max-w-md text-muted-foreground line-clamp-2">
                        {formData.bio}
                      </p>
                    )}
                    
                    {/* Education for students - compact view */}
                    {formData.userType === "student" && formData.education && (
                      <div className="flex items-center mt-2 text-sm text-muted-foreground">
                        <School className="h-3.5 w-3.5 mr-1.5" />
                        <span>
                          {formData.education}
                          {formData.major && ` • ${formData.major}`}
                          {formData.graduationYear && ` • Class of ${formData.graduationYear}`}
                        </span>
                      </div>
                    )}
                    
                    {/* Contact info - compact view */}
                    {formData.phoneNumber && (
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 mr-1.5" />
                        <span>{formData.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Quick actions */}
                <div className="mt-4 md:mt-10 flex gap-2 justify-center md:justify-end">
                  <Button 
                    onClick={handleUpdateProfile} 
                    disabled={isUpdating} 
                    className="px-4"
                  >
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={logout} 
                    size="icon"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for all profile sections */}
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              {formData.userType === "student" && <TabsTrigger value="education">Education</TabsTrigger>}
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="saved">Saved Properties</TabsTrigger>
            </TabsList>
            
            {/* Personal Information Tab */}
            <TabsContent value="personal" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        placeholder="Your first name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        placeholder="Your last name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userType">I am a</Label>
                    <Select 
                      value={formData.userType} 
                      onValueChange={(value) => 
                        setFormData({...formData, userType: value as "student" | "landlord" | "admin"})
                      }
                    >
                      <SelectTrigger id="userType">
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="landlord">Landlord</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Tell others about yourself"
                      className="resize-none min-h-[100px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="dateOfBirth"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Education Tab (only for students) */}
            {formData.userType === "student" && (
              <TabsContent value="education" className="mt-6 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Education</CardTitle>
                    <CardDescription>Share your educational background</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="education">University/College</Label>
                      <Input
                        id="education"
                        value={formData.education}
                        onChange={(e) => setFormData({...formData, education: e.target.value})}
                        placeholder="e.g. McMaster University"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="major">Major/Program</Label>
                        <Input
                          id="major"
                          value={formData.major}
                          onChange={(e) => setFormData({...formData, major: e.target.value})}
                          placeholder="e.g. Computer Science"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="graduationYear">Graduation Year</Label>
                        <Input
                          id="graduationYear"
                          type="number"
                          value={formData.graduationYear || ""}
                          onChange={(e) => setFormData({...formData, graduationYear: e.target.value ? parseInt(e.target.value) : undefined})}
                          placeholder="e.g. 2025"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Contact Tab */}
            <TabsContent value="contact" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                  <CardDescription>How others can reach you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                      placeholder="Alternative email (optional)"
                    />
                    <p className="text-xs text-muted-foreground">Leave blank to use your account email</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      placeholder="Your phone number"
                    />
                  </div>
                  
                  <div className="space-y-4 pt-2">
                    <h4 className="text-sm font-medium">Social Media</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                          <Label htmlFor="facebook" className="sr-only">Facebook</Label>
                          <Input
                            id="facebook"
                            value={formData.socialLinks.facebook}
                            onChange={(e) => setFormData({
                              ...formData, 
                              socialLinks: {...formData.socialLinks, facebook: e.target.value}
                            })}
                            placeholder="Facebook profile URL"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Instagram className="h-4 w-4 mr-2 text-pink-600" />
                          <Label htmlFor="instagram" className="sr-only">Instagram</Label>
                          <Input
                            id="instagram"
                            value={formData.socialLinks.instagram}
                            onChange={(e) => setFormData({
                              ...formData, 
                              socialLinks: {...formData.socialLinks, instagram: e.target.value}
                            })}
                            placeholder="Instagram handle"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                          <Label htmlFor="twitter" className="sr-only">Twitter</Label>
                          <Input
                            id="twitter"
                            value={formData.socialLinks.twitter}
                            onChange={(e) => setFormData({
                              ...formData, 
                              socialLinks: {...formData.socialLinks, twitter: e.target.value}
                            })}
                            placeholder="Twitter handle"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
                          <Label htmlFor="linkedin" className="sr-only">LinkedIn</Label>
                          <Input
                            id="linkedin"
                            value={formData.socialLinks.linkedin}
                            onChange={(e) => setFormData({
                              ...formData, 
                              socialLinks: {...formData.socialLinks, linkedin: e.target.value}
                            })}
                            placeholder="LinkedIn profile URL"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Saved Properties Tab */}
            <TabsContent value="saved" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Properties</CardTitle>
                  <CardDescription>Properties you've bookmarked for later</CardDescription>
                </CardHeader>
                <CardContent>
                  {isBookmarksLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2].map(i => (
                        <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-lg"></div>
                      ))}
                    </div>
                  ) : bookmarkedProperties && bookmarkedProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bookmarkedProperties.map(property => (
                        <PropertyCard key={property.id} property={property} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-medium mb-2">No saved properties yet</h3>
                      <p className="text-gray-500 mb-4">Start browsing and save properties you're interested in</p>
                      <Button variant="outline">Browse Properties</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="w-full md:w-2/3">
          <Tabs defaultValue="bookmarks">
            <TabsList>
              <TabsTrigger value="bookmarks">Saved Properties</TabsTrigger>
              <TabsTrigger value="history">Browsing History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bookmarks" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Properties</CardTitle>
                  <CardDescription>Properties you've bookmarked for later</CardDescription>
                </CardHeader>
                <CardContent>
                  {isBookmarksLoading ? (
                    <div className="grid grid-cols-1 gap-4">
                      {[1, 2].map(i => (
                        <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-lg"></div>
                      ))}
                    </div>
                  ) : bookmarkedProperties && bookmarkedProperties.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {bookmarkedProperties.map(property => (
                        <PropertyCard key={property.id} property={property} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-medium mb-2">No saved properties yet</h3>
                      <p className="text-gray-500 mb-4">Start browsing and save properties you're interested in</p>
                      <Button variant="outline">Browse Properties</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Browsing History</CardTitle>
                  <CardDescription>Properties you've recently viewed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium mb-2">No browsing history</h3>
                    <p className="text-gray-500 mb-4">Properties you view will appear here</p>
                    <Button variant="outline">Browse Properties</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
