import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, MapPin, BedDouble, Bath, Check, Star, ArrowLeft } from 'lucide-react';
import { Property } from '@shared/schema';
import { useAuth } from '@/context/auth-context';
import ContactForm from '@/components/property/contact-form';
import PropertyMap from '@/components/map/property-map';
import PropertyImageGallery from '@/components/property/property-image-gallery';
import TravelTimeInfo from '@/components/property/travel-time-info';

// Extended property type for the UI display
interface ExtendedProperty extends Property {
  nearbyAmenities?: string[];
  leaseLength?: string;
  parking?: boolean;
  squareFeet?: number;
  utilities?: string[];
}

// Utility function to cast property to include extended props with derived values
function castToExtended(property: Property): ExtendedProperty {
  const extendedProperty: ExtendedProperty = { 
    ...property,
    // Map leaseTerms to leaseLength for UI display
    leaseLength: property.leaseTerms === null ? undefined : property.leaseTerms,
    // Check amenities for parking and set parking flag
    parking: Array.isArray(property.amenities) ? 
      property.amenities.some(amenity => 
        typeof amenity === 'string' && amenity.toLowerCase().includes('parking')) : false,
    // Set nearby amenities based on location
    nearbyAmenities: getNearbyAmenitiesForLocation(property.location),
    // Derive utilities from amenities
    utilities: Array.isArray(property.amenities) ? 
      (property.amenities.some(amenity => 
        typeof amenity === 'string' && amenity.toLowerCase().includes('utilities included')) ? 
        ['included'] : []) : []
  };
  
  return extendedProperty;
}

// Helper function to get nearby amenities based on location
function getNearbyAmenitiesForLocation(location?: string): string[] {
  if (!location) return [];
  
  // Common nearby amenities based on neighborhoods
  const commonNearbyAmenities: Record<string, string[]> = {
    'Westdale': [
      'Coffee shops and cafes',
      'Grocery stores',
      'Public transit stops',
      'Restaurants and food options',
      'Parks and green spaces'
    ],
    'Ainslie Wood': [
      'Grocery stores',
      'Convenience stores',
      'Public transit stops',
      'Student-friendly restaurants'
    ],
    'Downtown Hamilton': [
      'Shopping centers',
      'Restaurants and bars',
      'Public transit hub',
      'Entertainment venues',
      'Fitness centers'
    ],
    'Kirkendall': [
      'Trendy cafes',
      'Specialty shops',
      'Parks and trails',
      'Restaurants and bars'
    ]
  };
  
  // Return appropriate nearby amenities or default list
  return commonNearbyAmenities[location] || [
    'Grocery stores',
    'Public transit stops',
    'Convenience stores'
  ];
}

interface PropertyDetailsProps {
  propertyId: number;
  onClose?: () => void;
}

export default function PropertyDetails({ propertyId, onClose }: PropertyDetailsProps) {
  const { user, isAuthenticated } = useAuth();
  const [contactMethod, setContactMethod] = useState<'email' | 'message'>('message');
  const [showContactForm, setShowContactForm] = useState(false);
  
  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${propertyId}`],
  });
  
  const { data: bookmarks } = useQuery({
    queryKey: ['/api/users', user?.id, 'bookmarks'],
    enabled: !!user && isAuthenticated,
  });
  
  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-80">
        <p>Loading property details...</p>
      </div>
    );
  }
  
  if (error || !property) {
    return (
      <div className="p-8 flex flex-col items-center">
        <p className="text-red-500">Failed to load property details.</p>
        <Button variant="outline" onClick={onClose} className="mt-4">
          Close
        </Button>
      </div>
    );
  }

  // Cast property to ExtendedProperty to access additional fields
  const extProperty = castToExtended(property);
  
  // Check if this property is bookmarked by the user
  const isBookmarked = bookmarks && Array.isArray(bookmarks) && bookmarks.length > 0 && 
    bookmarks.some((bookmark: any) => bookmark.propertyId === propertyId);
  
  const handleContactClick = () => {
    if (!isAuthenticated) {
      // Show login prompt
      // This would be handled by the AuthContext in a real implementation
      alert('Please log in to contact the landlord');
      return;
    }
    setShowContactForm(true);
  };
  
  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background p-4 border-b flex justify-between items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full"
        >
          {onClose ? <ArrowLeft className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </Button>
        <h2 className="text-xl font-bold truncate">{property.title}</h2>
        <div className="w-8"></div> {/* Spacer for alignment */}
      </div>
      
      {/* Scrollable Content */}
      <div className="overflow-y-auto pb-6">
        {/* Property Images */}
        <PropertyImageGallery 
          images={property.images || []} 
          title={property.title}
        />
        
        {/* Property Quick Info */}
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-4">
            <div>
              <h1 className="text-2xl font-bold">{property.title}</h1>
              <p className="flex items-center text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {property.address || property.location}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-2xl font-bold text-primary">${property.price}/mo</p>
              {extProperty.utilities && (
                <p className="text-sm text-muted-foreground">
                  {extProperty.utilities.includes('included') 
                    ? 'Utilities included' 
                    : 'Utilities not included'}
                </p>
              )}
            </div>
          </div>
          
          {/* Property Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="secondary" className="px-3 py-1">
              <BedDouble className="mr-1 h-4 w-4" />
              {property.bedrooms} Bed{property.bedrooms !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Bath className="mr-1 h-4 w-4" />
              {property.bathrooms} Bath{property.bathrooms !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              {property.propertyType}
            </Badge>
            {property.furnished && (
              <Badge variant="outline" className="px-3 py-1 border-primary text-primary">
                Furnished
              </Badge>
            )}
            {extProperty.parking && (
              <Badge variant="outline" className="px-3 py-1">
                Parking
              </Badge>
            )}
            {extProperty.leaseLength && (
              <Badge variant="outline" className="px-3 py-1">
                {extProperty.leaseLength} lease
              </Badge>
            )}
          </div>
          
          {/* Contact and Bookmark Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            {showContactForm ? (
              <ContactForm 
                propertyId={propertyId}
                ownerId={property.ownerId || 1} // Fallback to 1 if not provided
                propertyTitle={property.title}
                contactMethod={contactMethod}
                onSuccess={() => setShowContactForm(false)}
              />
            ) : (
              <>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={handleContactClick}
                >
                  Contact Landlord
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setContactMethod('email');
                      handleContactClick();
                    }}
                  >
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setContactMethod('message');
                      handleContactClick();
                    }}
                  >
                    Message
                  </Button>
                </div>
              </>
            )}
          </div>
          
          <Separator className="my-6" />
          
          {/* Tabs for Details */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="description">Details</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="travel">Travel Time</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-0">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Property Description</h3>
                <p className="text-muted-foreground">
                  {property.description || "No description provided."}
                </p>
                
                <h3 className="text-lg font-semibold pt-4">Property Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Property Type</p>
                    <p>{property.propertyType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                    <p>{property.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                    <p>{property.bathrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p>{extProperty.squareFeet || 'N/A'} sq ft</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Furnished</p>
                    <p>{property.furnished ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Parking</p>
                    <p>{extProperty.parking ? 'Available' : 'Not available'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available From</p>
                    <p>{property.availableFrom || 'Immediately'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lease Length</p>
                    <p>{extProperty.leaseLength || 'Flexible'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Distance to Campus</p>
                    <p>{property.distance || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="amenities" className="mt-0">
              <h3 className="text-lg font-semibold mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities && property.amenities.length > 0 ? (
                  property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-primary" />
                      <span>{amenity}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-full">No amenities listed</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="location" className="mt-0">
              <h3 className="text-lg font-semibold mb-4">Location</h3>
              <div className="h-72 rounded-md overflow-hidden mb-4">
                {property.latitude && property.longitude ? (
                  <PropertyMap 
                    properties={[property]} 
                    selectedProperty={property}
                    showDirections={true}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">Map location not available</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <h4 className="text-md font-semibold">Nearby Amenities</h4>
                <ul className="mt-2 space-y-2">
                  {extProperty.nearbyAmenities && extProperty.nearbyAmenities.length > 0 ? (
                    extProperty.nearbyAmenities.map((amenity: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-1 text-primary" />
                        <span>{amenity}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-muted-foreground">No nearby amenities information available</li>
                  )}
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="travel" className="mt-0">
              <TravelTimeInfo property={property} />
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-0">
              <h3 className="text-lg font-semibold mb-4">Reviews & Ratings</h3>
              {property.rating ? (
                <div className="flex items-center mb-4">
                  <div className="flex mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-5 w-5 ${star <= property.rating! ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{property.rating}</span>
                  <span className="text-muted-foreground ml-1">
                    ({property.reviewCount || 0} reviews)
                  </span>
                </div>
              ) : (
                <p className="text-muted-foreground mb-4">No ratings yet</p>
              )}
              
              {/* Reviews would be fetched and displayed here */}
              <p className="text-muted-foreground">No reviews available for this property.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}