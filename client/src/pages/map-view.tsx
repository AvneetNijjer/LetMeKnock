import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PropertyMap from '@/components/map/property-map';
import { Property } from '@shared/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, BedDouble, Bath, DollarSign, Home, Clock, Navigation, School } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import TravelTimeInfo from '@/components/property/travel-time-info';

export default function MapView() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [bedroomFilter, setBedroomFilter] = useState<string>('any');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('any');

  const { data: properties = [], isLoading, error } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  const filteredProperties = properties.filter(property => {
    // Filter by search term
    const matchesSearch = searchQuery === '' || 
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.campus.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by price range
    let matchesPrice = true;
    if (priceRange && priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(p => parseInt(p));
      matchesPrice = property.price >= min && (max ? property.price <= max : true);
    }
    
    // Filter by bedrooms
    let matchesBedrooms = true;
    if (bedroomFilter && bedroomFilter !== 'any') {
      if (bedroomFilter === '4+') {
        matchesBedrooms = property.bedrooms >= 4;
      } else {
        matchesBedrooms = property.bedrooms === parseInt(bedroomFilter);
      }
    }
    
    // Filter by property type
    let matchesPropertyType = true;
    if (propertyTypeFilter && propertyTypeFilter !== 'any') {
      matchesPropertyType = property.propertyType.toLowerCase() === propertyTypeFilter.toLowerCase();
    }
    
    return matchesSearch && matchesPrice && matchesBedrooms && matchesPropertyType;
  });

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    // Scroll to property details
    document.getElementById('property-details')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Property Map View</h1>
            <p className="text-gray-600">
              Explore properties visually and find their distance to McMaster University
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 bg-blue-50">
              <span className="font-medium text-blue-600 flex items-center gap-1">
                <School className="h-3.5 w-3.5" />
                McMaster University
              </span>
            </Badge>
            <Badge variant="outline" className="px-3 py-1 bg-blue-50">
              <span className="text-blue-600 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                1km radius
              </span>
            </Badge>
            <Badge variant="outline" className="px-3 py-1 bg-blue-50">
              <span className="text-blue-600 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-300"></span>
                2km radius
              </span>
            </Badge>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Filter Properties</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input 
                placeholder="Search by location or description" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-500">Less than $500</SelectItem>
                  <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                  <SelectItem value="1000-1500">$1,000 - $1,500</SelectItem>
                  <SelectItem value="1500-2000">$1,500 - $2,000</SelectItem>
                  <SelectItem value="2000-3000">$2,000 - $3,000</SelectItem>
                  <SelectItem value="3000-10000">$3,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={bedroomFilter} onValueChange={setBedroomFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1 Bedroom</SelectItem>
                  <SelectItem value="2">2 Bedrooms</SelectItem>
                  <SelectItem value="3">3 Bedrooms</SelectItem>
                  <SelectItem value="4+">4+ Bedrooms</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Type</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="room">Room</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[calc(100vh-200px)] bg-gray-100 rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="h-full w-full" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-red-500">Error loading map data</p>
              </div>
            ) : (
              <PropertyMap 
                properties={filteredProperties} 
                selectedProperty={selectedProperty}
                onPropertySelect={handlePropertySelect}
                showDirections={true}
              />
            )}
          </div>
          
          <div className="h-[calc(100vh-200px)] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {filteredProperties.length} Properties Found
              </h2>
            </div>
            
            <div className="space-y-4">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="cursor-pointer">
                    <CardHeader className="p-4">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full mt-2" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                filteredProperties.map(property => (
                  <Card 
                    key={property.id} 
                    className={`cursor-pointer transition-shadow hover:shadow-md ${
                      selectedProperty?.id === property.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handlePropertySelect(property)}
                  >
                    <CardContent className="p-0">
                      {property.images && property.images[0] && (
                        <div className="h-32 relative">
                          <img 
                            src={property.images[0]} 
                            alt={property.title} 
                            className="h-full w-full object-cover rounded-t-lg"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold">{property.title}</h3>
                          <span className="text-blue-600 font-bold">${property.price}/mo</span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm mt-1">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          {property.address}
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-2">
                          <span className="flex items-center">
                            <BedDouble className="h-4 w-4 mr-1" />
                            {property.bedrooms}
                          </span>
                          <span className="flex items-center">
                            <Bath className="h-4 w-4 mr-1" />
                            {property.bathrooms}
                          </span>
                          <span className="flex items-center">
                            <Home className="h-4 w-4 mr-1" />
                            {property.propertyType}
                          </span>
                        </div>
                        
                        {property.travelTime && (
                          <div className="mt-2 flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{property.travelTime} min to McMaster</span>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {property.amenities?.slice(0, 3).map((amenity, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                        
                        {property.latitude && property.longitude && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(
                                `https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}&origin=43.2609,-79.9192`,
                                '_blank'
                              );
                            }}
                            className="mt-2 w-full justify-start text-xs text-blue-600"
                          >
                            <Navigation className="h-3 w-3 mr-1" />
                            <span>Directions to McMaster</span>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              
              {!isLoading && filteredProperties.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500">No properties match your search criteria.</p>
                  <Button 
                    variant="link" 
                    onClick={() => {
                      setSearchQuery('');
                      setPriceRange('all');
                      setBedroomFilter('any');
                      setPropertyTypeFilter('any');
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Selected Property Details */}
        {selectedProperty && (
          <div id="property-details" className="mt-10 pt-4 border-t">
            <h2 className="text-2xl font-bold mb-4">{selectedProperty.title}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{selectedProperty.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {selectedProperty.address}
                        </CardDescription>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        ${selectedProperty.price}/mo
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex flex-wrap gap-6 mb-6">
                      <div className="flex items-center">
                        <BedDouble className="h-5 w-5 mr-2 text-blue-500" />
                        <div>
                          <div className="font-semibold">{selectedProperty.bedrooms}</div>
                          <div className="text-xs text-gray-500">Bedrooms</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Bath className="h-5 w-5 mr-2 text-blue-500" />
                        <div>
                          <div className="font-semibold">{selectedProperty.bathrooms}</div>
                          <div className="text-xs text-gray-500">Bathrooms</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Home className="h-5 w-5 mr-2 text-blue-500" />
                        <div>
                          <div className="font-semibold">{selectedProperty.propertyType}</div>
                          <div className="text-xs text-gray-500">Property Type</div>
                        </div>
                      </div>
                      
                      {selectedProperty.travelTime && (
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 mr-2 text-blue-500" />
                          <div>
                            <div className="font-semibold">{selectedProperty.travelTime} min</div>
                            <div className="text-xs text-gray-500">To McMaster</div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-gray-700">{selectedProperty.description}</p>
                    </div>
                    
                    {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-semibold mb-2">Amenities</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedProperty.amenities.map((amenity, i) => (
                            <Badge key={i} variant="secondary">{amenity}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-4">
                      {selectedProperty.furnished && (
                        <Badge className="py-1 px-3">Furnished</Badge>
                      )}
                      {selectedProperty.petsAllowed && (
                        <Badge className="py-1 px-3">Pets Allowed</Badge>
                      )}
                      {selectedProperty.availableFrom && (
                        <Badge className="py-1 px-3">
                          Available: {new Date(selectedProperty.availableFrom).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between border-t p-4">
                    <Button 
                      onClick={() => {
                        // Link to property details page when available
                        // window.location.href = `/listings/${selectedProperty.id}`;
                      }}
                    >
                      View Full Details
                    </Button>
                    
                    {selectedProperty.latitude && selectedProperty.longitude && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${selectedProperty.latitude},${selectedProperty.longitude}&origin=43.2609,-79.9192`,
                            '_blank'
                          );
                        }}
                        className="flex items-center gap-1"
                      >
                        <Navigation className="h-4 w-4" />
                        <span>Get Directions</span>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full mb-3">Contact Owner</Button>
                    <Button variant="outline" className="w-full">Schedule Viewing</Button>
                  </CardContent>
                </Card>
                
                {/* Travel Time Information */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Travel Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TravelTimeInfo property={selectedProperty} />
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Location Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-semibold block">Campus:</span>
                        {selectedProperty.campus}
                      </div>
                      {selectedProperty.distanceToCampus && (
                        <div>
                          <span className="font-semibold block">Distance to McMaster:</span>
                          {selectedProperty.distanceToCampus} km
                        </div>
                      )}
                      {selectedProperty.travelTime && (
                        <div>
                          <span className="font-semibold block">Travel Time:</span>
                          {selectedProperty.travelTime} minutes
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
