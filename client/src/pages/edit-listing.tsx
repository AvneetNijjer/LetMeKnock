import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient, getQueryFn } from '@/lib/queryClient';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ArrowLeft, CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Property } from '@shared/schema';

// Define the form schema (same as create-listing)
const listingFormSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  price: z.coerce.number().min(1, {
    message: "Price must be at least $1.",
  }),
  propertyType: z.enum(["apartment", "house", "room", "studio", "other"], {
    required_error: "Please select a property type.",
  }),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0),
  campus: z.string().min(1, {
    message: "Please enter a campus location.",
  }),
  address: z.string().min(5, {
    message: "Please enter a valid address.",
  }),
  availableFrom: z.date({
    required_error: "Please select a date.",
  }),
  furnished: z.boolean().default(false),
  petsAllowed: z.boolean().default(false),
  utilities: z.boolean().default(false),
  parking: z.boolean().default(false),
  wifi: z.boolean().default(false),
  laundry: z.boolean().default(false),
  airConditioning: z.boolean().default(false),
  imageUrls: z.string().optional(),
  contactEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  contactPhone: z.string().optional(),
  status: z.enum(["available", "pending", "rented", "unavailable"]).default("available"),
});

// Edit listing component
export default function EditListing() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [listingId, setListingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Extract listing ID from URL
  useEffect(() => {
    const id = location.split('/').pop();
    if (id && !isNaN(parseInt(id))) {
      setListingId(parseInt(id));
    } else {
      // Invalid ID, redirect to my listings
      toast({
        title: "Error",
        description: "Invalid listing ID. Redirecting to your listings.",
        variant: "destructive",
      });
      setLocation('/my-listings');
    }
  }, [location, setLocation, toast]);

  // Define form hook
  const form = useForm<z.infer<typeof listingFormSchema>>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      propertyType: "apartment",
      bedrooms: 1,
      bathrooms: 1,
      campus: "McMaster University",
      address: "",
      furnished: false,
      petsAllowed: false,
      utilities: false,
      parking: false,
      wifi: false,
      laundry: false,
      airConditioning: false,
      imageUrls: "",
      contactEmail: user?.email || "",
      contactPhone: "",
      status: "available",
    },
  });

  // Fetch property data
  const { data: property, error } = useQuery<Property>({
    queryKey: ['/api/properties', listingId],
    queryFn: getQueryFn({ on401: 'throw' }),
    enabled: !!listingId,
  });

  // Set form values when property data is loaded
  useEffect(() => {
    if (property) {
      // Make sure the user owns this property
      if (property.ownerId !== user?.id) {
        toast({
          title: "Unauthorized",
          description: "You don't have permission to edit this listing.",
          variant: "destructive",
        });
        setLocation('/my-listings');
        return;
      }

      form.reset({
        title: property.title,
        description: property.description,
        price: property.price,
        propertyType: property.propertyType as any,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        campus: property.campus,
        address: property.address,
        availableFrom: property.availableFrom ? new Date(property.availableFrom) : new Date(),
        furnished: property.furnished || false,
        petsAllowed: property.petsAllowed || false,
        utilities: property.utilities || false,
        parking: property.parking || false,
        wifi: property.wifi || false,
        laundry: property.laundry || false,
        airConditioning: property.airConditioning || false,
        imageUrls: property.images?.join(', ') || "",
        contactEmail: property.contactEmail || user?.email || "",
        contactPhone: property.contactPhone || "",
        status: (property.status as any) || "available",
      });
      setIsLoading(false);
    }
  }, [property, form, user, setLocation, toast]);

  // Define mutation
  const updateListingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof listingFormSchema>) => {
      if (!listingId) {
        throw new Error("Listing ID is missing");
      }
      
      const images = data.imageUrls
        ? data.imageUrls.split(',').map(url => url.trim())
        : [];

      const amenities = [
        ...(data.wifi ? ['WiFi'] : []),
        ...(data.laundry ? ['Laundry'] : []),
        ...(data.airConditioning ? ['Air Conditioning'] : []),
        ...(data.utilities ? ['Utilities Included'] : []),
        ...(data.parking ? ['Parking'] : []),
      ];
      
      const res = await apiRequest('PUT', `/api/properties/${listingId}`, {
        ...data,
        images,
        amenities,
        updatedAt: new Date(),
      });
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your property listing has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      queryClient.invalidateQueries({ queryKey: ['/api/properties/owner', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/properties', listingId] });
      setLocation('/my-listings');
    },
    onError: (error) => {
      console.error("Error updating listing:", error);
      toast({
        title: "Error",
        description: "Failed to update your listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  function onSubmit(data: z.infer<typeof listingFormSchema>) {
    updateListingMutation.mutate(data);
  }

  // Error state
  if (error) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load listing data. The listing may not exist or you may not have permission to edit it.
          </AlertDescription>
        </Alert>
        <Button onClick={() => setLocation('/my-listings')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Listings
        </Button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setLocation('/my-listings')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Edit Listing</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Update information for your property listing
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Basic Information</h2>
              <Separator />
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Spacious 2-bedroom apartment near McMaster" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Create a catchy title for your listing
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your property in detail..."
                        className="resize-y min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include amenities, neighborhood info, and other details
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($/month)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="room">Room</SelectItem>
                          <SelectItem value="studio">Studio</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="rented">Rented</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Current status of this property
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Location Information</h2>
              <Separator />
              
              <FormField
                control={form.control}
                name="campus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nearest Campus</FormLabel>
                    <FormControl>
                      <Input placeholder="McMaster University" {...field} />
                    </FormControl>
                    <FormDescription>
                      What campus is this property closest to?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="1280 Main St W, Hamilton, ON" {...field} />
                    </FormControl>
                    <FormDescription>
                      This will be used to show the property on the map
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availableFrom"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Available From</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When will this property be available for move-in?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Amenities & Features</h2>
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="furnished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Furnished</FormLabel>
                        <FormDescription>
                          Does the property come furnished?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="petsAllowed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Pets Allowed</FormLabel>
                        <FormDescription>
                          Are pets allowed in the property?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="utilities"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Utilities Included</FormLabel>
                        <FormDescription>
                          Are utilities included in the rent?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parking"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Parking Available</FormLabel>
                        <FormDescription>
                          Is parking available at the property?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="wifi"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>WiFi Included</FormLabel>
                        <FormDescription>
                          Is WiFi included with the property?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="laundry"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Laundry</FormLabel>
                        <FormDescription>
                          Is laundry available in the property?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="airConditioning"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Air Conditioning</FormLabel>
                        <FormDescription>
                          Does the property have air conditioning?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Images & Contact</h2>
              <Separator />
              
              <FormField
                control={form.control}
                name="imageUrls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URLs</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter URLs separated by commas"
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter image URLs for your property, separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Email for inquiries about this property
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional phone number for inquiries
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation('/my-listings')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateListingMutation.isPending}
              >
                {updateListingMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Listing"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}