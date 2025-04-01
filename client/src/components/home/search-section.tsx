import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  MapPin, 
  BedDouble, 
  Bath, 
  DollarSign, 
  Search,
  Home as HomeIcon,
  Sliders
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export default function SearchSection() {
  // useLocation hook from wouter returns [path, navigate]
  const [, navigate] = useLocation();
  // Form fields
  const [locationInput, setLocationInput] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('any');
  const [minPrice, setMinPrice] = useState<number>(500);
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [bedrooms, setBedrooms] = useState<string>('any');
  const [bathrooms, setBathrooms] = useState<string>('any');
  const [advancedFilters, setAdvancedFilters] = useState({
    furnished: false,
    parking: false,
    petsAllowed: false,
    utilitiesIncluded: false,
  });

  const handleSearch = () => {
    // Construct search query parameters
    const queryParams = new URLSearchParams();
    
    if (locationInput) queryParams.append('location', locationInput);
    if (propertyType !== 'any') queryParams.append('propertyType', propertyType);
    if (bedrooms !== 'any') queryParams.append('bedrooms', bedrooms);
    if (bathrooms !== 'any') queryParams.append('bathrooms', bathrooms);
    
    queryParams.append('minPrice', minPrice.toString());
    queryParams.append('maxPrice', maxPrice.toString());
    
    // Add advanced filters if selected
    Object.entries(advancedFilters).forEach(([key, value]) => {
      if (value) queryParams.append(key, 'true');
    });
    
    // Navigate to listings page with filters
    navigate(`/listings?${queryParams.toString()}`);
  };

  // Toggle advanced filter state
  const toggleFilter = (filter: keyof typeof advancedFilters) => {
    setAdvancedFilters({
      ...advancedFilters,
      [filter]: !advancedFilters[filter]
    });
  };

  // Get count of active advanced filters
  const activeFilterCount = Object.values(advancedFilters).filter(Boolean).length;

  return (
    <section className="py-8 px-4 sm:px-6 md:px-8 -mt-24 relative z-20">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Find Your Ideal Student Housing</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Location */}
          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="location"
                placeholder="Near McMaster University"
                className="pl-10"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
              />
            </div>
          </div>
          
          {/* Property Type */}
          <div className="space-y-2">
            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">
              Property Type
            </label>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger id="propertyType" className="w-full">
                <div className="flex items-center">
                  <HomeIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Any type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="any">Any type</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="basement">Basement</SelectItem>
                  <SelectItem value="room">Room</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          {/* Bedrooms */}
          <div className="space-y-2">
            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
              Bedrooms
            </label>
            <Select value={bedrooms} onValueChange={setBedrooms}>
              <SelectTrigger id="bedrooms" className="w-full">
                <div className="flex items-center">
                  <BedDouble className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Any" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5+">5+</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          {/* Bathrooms */}
          <div className="space-y-2">
            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
              Bathrooms
            </label>
            <Select value={bathrooms} onValueChange={setBathrooms}>
              <SelectTrigger id="bathrooms" className="w-full">
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Any" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="1.5">1.5</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="2.5">2.5</SelectItem>
                  <SelectItem value="3+">3+</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Price Range */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Price Range ($/month)
            </label>
            <span className="text-sm text-gray-500">
              ${minPrice} - ${maxPrice}
            </span>
          </div>
          <div className="px-2">
            <Slider
              defaultValue={[minPrice, maxPrice]}
              max={5000}
              min={0}
              step={50}
              onValueChange={(values) => {
                setMinPrice(values[0]);
                setMaxPrice(values[1]);
              }}
              className="mb-6"
            />
          </div>
        </div>
        
        {/* Advanced Filters & Search Button */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" type="button" className="sm:w-auto flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                <span>More Filters</span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-4">
                <h3 className="font-medium">Advanced Filters</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="furnished"
                      checked={advancedFilters.furnished}
                      onChange={() => toggleFilter('furnished')}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="furnished" className="ml-2 text-sm text-gray-700">Furnished</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="parking"
                      checked={advancedFilters.parking}
                      onChange={() => toggleFilter('parking')}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="parking" className="ml-2 text-sm text-gray-700">Parking Available</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="petsAllowed"
                      checked={advancedFilters.petsAllowed}
                      onChange={() => toggleFilter('petsAllowed')}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="petsAllowed" className="ml-2 text-sm text-gray-700">Pets Allowed</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="utilitiesIncluded"
                      checked={advancedFilters.utilitiesIncluded}
                      onChange={() => toggleFilter('utilitiesIncluded')}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="utilitiesIncluded" className="ml-2 text-sm text-gray-700">Utilities Included</label>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            onClick={handleSearch}
            className="sm:flex-grow md:flex-grow-0 md:w-1/3 flex items-center justify-center gap-2"
          >
            <Search className="h-4 w-4" />
            <span>Search Properties</span>
          </Button>
        </div>
      </div>
    </section>
  );
}