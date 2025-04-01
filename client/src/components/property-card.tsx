import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Property } from "@shared/schema";
import { Star, BookmarkPlus, Eye } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import ListingDialog from "./property/listing-dialog";
import TravelTimeCardInfo from "./property/travel-time-card-info";
import { motion } from "framer-motion";
import { AnimatedSection, fadeIn } from "@/components/ui/animated-section";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);

  const handleBookmark = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required", 
        description: "Please sign in to bookmark properties",
        variant: "destructive"
      });
      return;
    }

    try {
      await apiRequest(
        'POST',
        '/api/bookmarks',
        {
          userId: user.id,
          propertyId: property.id
        }
      );
      
      toast({ title: "Property added to bookmarks" });
      
      // Invalidate bookmarks cache to refresh the data
      queryClient.invalidateQueries({
        queryKey: ['/api/users', user.id, 'bookmarks']
      });
    } catch (error) {
      console.error("Error bookmarking property:", error);
      toast({ 
        title: "Error", 
        description: "Failed to bookmark property",
        variant: "destructive"
      });
    }
  };

  // Calculate the rating display
  const displayRating = property.rating ? (property.rating / 5).toFixed(1) : null;

  return (
    <AnimatedSection>
      <motion.div 
        whileHover={{ 
          y: -5,
          transition: { duration: 0.2 }
        }}
      >
        <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 property-card h-full flex flex-col">
          <motion.div 
            className="relative h-56 cursor-pointer overflow-hidden" 
            onClick={() => setShowDetails(true)}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            {property.images && property.images[0] ? (
              <img 
                src={property.images[0]} 
                alt={property.title} 
                className="w-full h-full object-cover transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
            {property.featured && (
              <motion.div 
                initial={{ x: -100 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="absolute top-4 left-4 bg-primary text-primary-foreground px-2 py-1 rounded text-sm font-bold"
              >
                Featured
              </motion.div>
            )}
          </motion.div>
          
          <CardContent className="p-5 flex flex-col flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold">{property.title}</h3>
              <motion.p 
                className="text-primary font-bold"
                whileHover={{ scale: 1.1 }}
              >
                ${property.price}/mo
              </motion.p>
            </div>
            
            <p className="text-muted-foreground mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin inline-block mr-2 text-primary">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {property.address ? property.address : property.location}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">
                {property.propertyType}
              </Badge>
              
              <Badge variant="secondary">
                {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
              </Badge>
              
              <Badge variant="secondary">
                {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
              </Badge>
              
              {property.furnished && (
                <Badge variant="outline" className="border-primary text-primary">
                  Furnished
                </Badge>
              )}
            </div>
            
            <div className="mt-auto space-y-3">
              {/* Show travel time information if available */}
              {(property.latitude && property.longitude) && (
                <div className="flex flex-wrap gap-2 items-center">
                  <TravelTimeCardInfo property={property} transportType="walking" />
                  <motion.a 
                    href={`/map-view?property=${property.id}`}
                    className="text-xs inline-flex items-center text-primary font-medium hover:underline"
                    whileHover={{ scale: 1.03 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map mr-1">
                      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
                      <line x1="9" x2="9" y1="3" y2="18"></line>
                      <line x1="15" x2="15" y1="6" y2="21"></line>
                    </svg>
                    See on map
                  </motion.a>
                </div>
              )}
              
              {/* Amenities */}
              <div className="flex flex-wrap gap-2">
                {property.amenities && property.amenities.slice(0, 2).map((amenity, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
                
                {/* Show more if there are more amenities */}
                {property.amenities && property.amenities.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{property.amenities.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {property.rating ? (
                  <>
                    <Star className="text-yellow-400 fill-yellow-400 mr-1 h-4 w-4" />
                    <span className="font-medium">{property.rating}</span>
                    <span className="text-muted-foreground ml-1 text-sm">
                      ({property.reviewCount || 0})
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground text-sm">No ratings</span>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs px-2"
                  onClick={handleBookmark}
                >
                  <BookmarkPlus className="h-3.5 w-3.5 mr-1" />
                  Save
                </Button>
                
                <Button 
                  variant="default" 
                  size="sm" 
                  className="text-xs px-2"
                  onClick={() => setShowDetails(true)}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Property Details Dialog */}
      <ListingDialog 
        propertyId={showDetails ? property.id : null}
        open={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </AnimatedSection>
  );
}
