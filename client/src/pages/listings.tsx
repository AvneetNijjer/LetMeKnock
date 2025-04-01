import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PropertyCard from "@/components/property-card";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Property } from "@shared/schema";

export default function Listings() {
  const [filters, setFilters] = useState({
    campus: "all",
    propertyType: "all",
    priceRange: [500, 2000],
    amenities: [] as string[],
    searchText: "",
  });

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  const handleAmenityToggle = (amenity: string) => {
    setFilters(prev => {
      const amenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities };
    });
  };

  const filteredProperties = properties?.filter(property => {
    // Apply filters
    if (filters.campus !== "all" && property.campus !== filters.campus) return false;
    if (filters.propertyType !== "all" && property.propertyType !== filters.propertyType) return false;
    if (property.price < filters.priceRange[0] || property.price > filters.priceRange[1]) return false;
    
    // Check if property has all selected amenities
    if (filters.amenities.length > 0) {
      if (!property.amenities) return false;
      if (!filters.amenities.every(amenity => property.amenities?.includes(amenity))) return false;
    }
    
    // Text search
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      return (
        property.title.toLowerCase().includes(searchLower) ||
        property.description.toLowerCase().includes(searchLower) ||
        property.location.toLowerCase().includes(searchLower) ||
        property.address?.toLowerCase().includes(searchLower) ||
        property.campus.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Student Housing Listings</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          <Card className="sticky top-24">
            <CardContent className="p-4">
              <h2 className="text-xl font-bold mb-4">Filters</h2>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search properties..."
                    value={filters.searchText}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="campus">Campus</Label>
                  <Select
                    value={filters.campus}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, campus: value }))}
                  >
                    <SelectTrigger id="campus" className="mt-1">
                      <SelectValue placeholder="Select Campus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Campuses</SelectItem>
                      <SelectItem value="McMaster">McMaster</SelectItem>
                      <SelectItem value="York">York</SelectItem>
                      <SelectItem value="UofT">University of Toronto</SelectItem>
                      <SelectItem value="Western">Western University</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select
                    value={filters.propertyType}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, propertyType: value }))}
                  >
                    <SelectTrigger id="propertyType" className="mt-1">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Room">Room</SelectItem>
                      <SelectItem value="Suite">Suite</SelectItem>
                      <SelectItem value="Studio">Studio</SelectItem>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Condo">Condo</SelectItem>
                      <SelectItem value="Basement">Basement</SelectItem>
                      <SelectItem value="Loft">Loft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}</Label>
                  <Slider
                    min={500}
                    max={2000}
                    step={50}
                    value={filters.priceRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label className="mb-2 block">Amenities</Label>
                  <div className="space-y-2">
                    {["Wi-Fi", "Laundry", "Parking", "Utilities Included", "Gym", "Air Conditioning", "Heating", "High-Speed Internet"].map(amenity => (
                      <div key={amenity} className="flex items-center">
                        <Checkbox
                          id={`amenity-${amenity}`}
                          checked={filters.amenities.includes(amenity)}
                          onCheckedChange={() => handleAmenityToggle(amenity)}
                        />
                        <label htmlFor={`amenity-${amenity}`} className="ml-2 text-sm">{amenity}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setFilters({
                    campus: "all",
                    propertyType: "all",
                    priceRange: [500, 2000],
                    amenities: [],
                    searchText: "",
                  })}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full md:w-3/4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-96"></div>
              ))}
            </div>
          ) : filteredProperties && filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-xl text-center">
              <h3 className="text-xl font-medium mb-2">No properties found</h3>
              <p className="text-gray-500">Try adjusting your filters to see more results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
