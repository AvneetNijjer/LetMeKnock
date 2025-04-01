import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Property } from '@shared/schema';
import PropertyCard from '@/components/property-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Sparkles,
  Home,
  Building,
  Search,
  Filter,
  Heart,
  ArrowRight,
  Loader2,
  Bell
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';

type PreferenceCategory = {
  id: string;
  name: string;
  description: string;
  fields: PreferenceField[];
};

type PreferenceField = {
  id: string;
  name: string;
  type: 'select' | 'range' | 'checkbox' | 'input' | 'switch';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
};

// Mock preference categories
const preferenceCategories: PreferenceCategory[] = [
  {
    id: 'location',
    name: 'Location',
    description: 'Where would you like to live?',
    fields: [
      {
        id: 'area',
        name: 'Area',
        type: 'select',
        options: ['Westdale', 'Ainslie Wood', 'Downtown', 'West Hamilton', 'East Hamilton', 'Dundas']
      },
      {
        id: 'maxDistance',
        name: 'Max distance to McMaster',
        type: 'range',
        min: 1,
        max: 10,
        step: 0.5,
        defaultValue: 5
      },
      {
        id: 'transitAccess',
        name: 'Public transit access',
        type: 'switch',
        defaultValue: true
      },
      {
        id: 'nearRestaurants',
        name: 'Near restaurants/cafes',
        type: 'switch',
        defaultValue: false
      }
    ]
  },
  {
    id: 'housing',
    name: 'Housing',
    description: 'What type of housing are you looking for?',
    fields: [
      {
        id: 'propertyType',
        name: 'Property Type',
        type: 'select',
        options: ['House', 'Apartment', 'Basement', 'Studio', 'Townhouse', 'Any']
      },
      {
        id: 'bedrooms',
        name: 'Bedrooms',
        type: 'select',
        options: ['Studio', '1', '2', '3', '4+', 'Any']
      },
      {
        id: 'bathrooms',
        name: 'Bathrooms',
        type: 'select',
        options: ['1', '1.5', '2', '2+', 'Any']
      },
      {
        id: 'furnished',
        name: 'Furnished',
        type: 'switch',
        defaultValue: false
      },
      {
        id: 'petFriendly',
        name: 'Pet friendly',
        type: 'switch',
        defaultValue: false
      }
    ]
  },
  {
    id: 'budget',
    name: 'Budget',
    description: 'How much are you willing to spend?',
    fields: [
      {
        id: 'maxRent',
        name: 'Maximum monthly rent',
        type: 'range',
        min: 500,
        max: 3000,
        step: 50,
        defaultValue: 1200
      },
      {
        id: 'includeUtilities',
        name: 'Utilities included',
        type: 'switch',
        defaultValue: true
      },
      {
        id: 'includeWifi',
        name: 'Wi-Fi included',
        type: 'switch',
        defaultValue: true
      }
    ]
  },
  {
    id: 'amenities',
    name: 'Amenities',
    description: 'What amenities are important to you?',
    fields: [
      {
        id: 'laundry',
        name: 'In-unit laundry',
        type: 'checkbox',
        defaultValue: false
      },
      {
        id: 'airConditioning',
        name: 'Air conditioning',
        type: 'checkbox',
        defaultValue: false
      },
      {
        id: 'dishwasher',
        name: 'Dishwasher',
        type: 'checkbox',
        defaultValue: false
      },
      {
        id: 'parking',
        name: 'Parking included',
        type: 'checkbox',
        defaultValue: false
      },
      {
        id: 'gym',
        name: 'Gym access',
        type: 'checkbox',
        defaultValue: false
      },
      {
        id: 'balcony',
        name: 'Balcony/patio',
        type: 'checkbox',
        defaultValue: false
      }
    ]
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    description: 'What lifestyle factors matter to you?',
    fields: [
      {
        id: 'studyEnvironment',
        name: 'Quiet study environment',
        type: 'range',
        min: 1,
        max: 5,
        step: 1,
        defaultValue: 3
      },
      {
        id: 'socialEnvironment',
        name: 'Social environment',
        type: 'range',
        min: 1,
        max: 5,
        step: 1,
        defaultValue: 3
      },
      {
        id: 'sharedSpace',
        name: 'Prefer shared accommodation',
        type: 'switch',
        defaultValue: false
      }
    ]
  }
];

export default function AIMatchingPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('location');
  const [preferences, setPreferences] = useState<Record<string, any>>({});
  const [savedFilters, setSavedFilters] = useState<boolean>(false);
  const [isMatching, setIsMatching] = useState(false);
  const [matchedProperties, setMatchedProperties] = useState<Property[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Get all properties
  const { data: properties, isLoading } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      const res = await fetch('/api/properties');
      if (!res.ok) throw new Error('Failed to fetch properties');
      return res.json();
    }
  });

  // Initialize preferences with default values
  useState(() => {
    const defaultPreferences: Record<string, any> = {};
    preferenceCategories.forEach(category => {
      category.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          defaultPreferences[field.id] = field.defaultValue;
        }
      });
    });
    setPreferences(defaultPreferences);
  });

  const handlePreferenceChange = (fieldId: string, value: any) => {
    setPreferences(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleFindMatches = () => {
    setIsMatching(true);
    setIsAnimating(true);
    
    // Simulated AI matching algorithm
    // In a real implementation, this would call an API that uses machine learning
    setTimeout(() => {
      // Filter properties based on preferences
      const filtered = properties.filter((property: Property) => {
        // Apply filters based on collected preferences
        if (preferences.maxRent && property.price > preferences.maxRent) return false;
        
        if (preferences.bedrooms && preferences.bedrooms !== 'Any') {
          if (preferences.bedrooms === '4+') {
            if (property.bedrooms < 4) return false;
          } else if (preferences.bedrooms === 'Studio') {
            if (property.bedrooms !== 0) return false;
          } else if (property.bedrooms !== parseInt(preferences.bedrooms)) return false;
        }
        
        if (preferences.propertyType && preferences.propertyType !== 'Any') {
          if (!property.propertyType?.toLowerCase().includes(preferences.propertyType.toLowerCase())) return false;
        }
        
        return true;
      });
      
      // Sort properties by how well they match preferences
      const scored = filtered.map((property: Property) => {
        let score = 0;
        
        // Location scores
        if (preferences.area && property.city?.includes(preferences.area)) score += 10;
        
        // Amenity scores
        if (preferences.laundry && property.description?.toLowerCase().includes('laundry')) score += 5;
        if (preferences.airConditioning && property.description?.toLowerCase().includes('air condition')) score += 5;
        if (preferences.parking && property.description?.toLowerCase().includes('parking')) score += 5;
        
        // Budget match (closer to max budget = better match)
        if (preferences.maxRent) {
          const budgetDiff = 1 - Math.abs(property.price - preferences.maxRent) / preferences.maxRent;
          score += budgetDiff * 15;
        }
        
        return { property, score };
      }).sort((a: { property: Property; score: number }, b: { property: Property; score: number }) => b.score - a.score);
      
      const matchedResults = scored.slice(0, 6).map((item: { property: Property; score: number }) => item.property);
      
      setMatchedProperties(matchedResults);
      setIsMatching(false);
      
      if (savedFilters) {
        toast({
          title: "Preferences saved",
          description: "We'll notify you when new properties match your criteria.",
        });
      }
    }, 2500);
  };
  
  const handleSaveFilters = () => {
    setSavedFilters(!savedFilters);
    
    if (!savedFilters) {
      toast({
        title: "Preferences will be saved",
        description: "After running the AI matching, you'll receive notifications for new matches.",
      });
    }
  };

  // Animation effect when switching tabs
  const handleCategoryChange = (value: string) => {
    setIsAnimating(true);
    setActiveCategory(value);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const PreferenceFields = ({ fields }: { fields: PreferenceField[] }) => {
    return (
      <div className={`space-y-6 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor={field.id}>{field.name}</Label>
              
              {field.type === 'switch' && (
                <Switch
                  id={field.id}
                  checked={preferences[field.id] || false}
                  onCheckedChange={(checked) => handlePreferenceChange(field.id, checked)}
                />
              )}
            </div>
            
            {field.type === 'select' && (
              <Select
                value={preferences[field.id] || ''}
                onValueChange={(value) => handlePreferenceChange(field.id, value)}
              >
                <SelectTrigger id={field.id}>
                  <SelectValue placeholder={`Select ${field.name.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {field.type === 'range' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{field.min}</span>
                  <span className="font-medium">
                    {field.id === 'maxRent' ? `$${preferences[field.id] || field.defaultValue}` : preferences[field.id] || field.defaultValue}
                  </span>
                  <span>{field.max}</span>
                </div>
                <Slider
                  id={field.id}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  defaultValue={[field.defaultValue || field.min || 0]}
                  value={[preferences[field.id] || field.defaultValue || field.min || 0]}
                  onValueChange={(value) => handlePreferenceChange(field.id, value[0])}
                />
              </div>
            )}
            
            {field.type === 'checkbox' && (
              <div className="flex items-center space-x-2 mt-1">
                <Checkbox
                  id={field.id}
                  checked={preferences[field.id] || false}
                  onCheckedChange={(checked) => handlePreferenceChange(field.id, checked)}
                />
                <label htmlFor={field.id} className="text-sm text-muted-foreground cursor-pointer">
                  {field.name}
                </label>
              </div>
            )}
            
            {field.type === 'input' && (
              <Input
                id={field.id}
                value={preferences[field.id] || ''}
                onChange={(e) => handlePreferenceChange(field.id, e.target.value)}
                placeholder={`Enter ${field.name.toLowerCase()}`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 pt-24">
      <div className="flex items-center mb-6">
        <Sparkles className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-2xl font-bold">AI Property Matching</h1>
      </div>
      
      <p className="text-muted-foreground mb-8">
        Tell us your preferences and our AI will find the perfect student housing for you.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Preferences</CardTitle>
              <CardDescription>
                Set your criteria and we'll find your ideal home
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="location">Location</TabsTrigger>
                  <TabsTrigger value="housing">Housing</TabsTrigger>
                  <TabsTrigger value="budget">Budget</TabsTrigger>
                </TabsList>
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="amenities">Amenities</TabsTrigger>
                  <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
                </TabsList>
                
                {preferenceCategories.map((category) => (
                  <TabsContent key={category.id} value={category.id} className="mt-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-medium">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <PreferenceFields fields={category.fields} />
                  </TabsContent>
                ))}
              </Tabs>
              
              <Separator className="my-6" />
              
              <div className="flex items-center space-x-2 mb-6">
                <Switch 
                  id="saveFilter" 
                  checked={savedFilters}
                  onCheckedChange={handleSaveFilters}
                />
                <div>
                  <Label htmlFor="saveFilter">Save search & get notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    We'll notify you when new properties match your criteria
                  </p>
                </div>
              </div>
              
              <Button 
                className="w-full"
                size="lg"
                onClick={handleFindMatches}
                disabled={isMatching}
              >
                {isMatching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finding matches...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Find AI Matches
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Matched Properties</CardTitle>
              <CardDescription>
                {matchedProperties.length > 0 
                  ? `Based on your preferences, we found ${matchedProperties.length} properties that match your criteria.`
                  : "Set your preferences and click 'Find AI Matches' to see properties tailored to your needs."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isMatching ? (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-8 mb-4">
                    <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">AI is finding your perfect match</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Our algorithm is analyzing properties based on your preferences to find the best matches
                  </p>
                </div>
              ) : matchedProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matchedProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center justify-center rounded-full bg-muted p-8 mb-4">
                    <Search className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No matches yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Set your preferences and click "Find AI Matches" to discover properties that match your needs
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}