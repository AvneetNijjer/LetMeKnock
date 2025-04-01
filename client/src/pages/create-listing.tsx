import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
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
import { 
  CalendarIcon, 
  Loader2,
  Building,
  Bed,
  Bath,
  MapPin,
  MapPinned,
  DollarSign,
  Image,
  Mail,
  Phone,
  Info,
  CheckSquare,
  GraduationCap,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";

// Define the form schema
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
});

// Create listing component
export default function CreateListing() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [_location, setLocation] = useLocation();
  const [submitting, setSubmitting] = useState(false);

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
    },
  });

  // Define mutation
  const createListingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof listingFormSchema>) => {
      const res = await apiRequest('POST', '/api/properties', {
        ...data,
        ownerId: user?.id,
        ownerName: user?.firstName && user?.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user?.email,
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your property listing has been created.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      setLocation('/my-listings');
    },
    onError: (error) => {
      console.error("Error creating listing:", error);
      toast({
        title: "Error",
        description: "Failed to create your listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  function onSubmit(data: z.infer<typeof listingFormSchema>) {
    setSubmitting(true);
    createListingMutation.mutate(data);
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-10 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container max-w-4xl mx-auto px-4"
      >
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
            <h1 className="text-3xl font-bold flex items-center">
              <Building className="mr-3 h-8 w-8" />
              Create a New Listing
            </h1>
            <p className="mt-2 opacity-90 max-w-xl">
              Fill out the form below to create your property listing. Provide detailed information to help students find their perfect housing solution.
            </p>
          </div>
          
          <div className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-5">
              <h2 className="text-xl font-semibold flex items-center gap-2 pb-2 border-b text-blue-700">
                <Info className="h-5 w-5" />
                Basic Information
              </h2>
              
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($/month)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input 
                            type="number" 
                            min="0" 
                            className="pl-8" 
                            {...field} 
                          />
                        </div>
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
                        defaultValue={field.value}
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Bed className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input 
                            type="number" 
                            min="0" 
                            className="pl-8" 
                            {...field} 
                          />
                        </div>
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
                        <div className="relative">
                          <Bath className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.5" 
                            className="pl-8" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-5">
              <h2 className="text-xl font-semibold flex items-center gap-2 pb-2 border-b text-blue-700">
                <MapPin className="h-5 w-5" />
                Location Information
              </h2>
              
              <FormField
                control={form.control}
                name="campus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nearest Campus</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <GraduationCap className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input 
                          placeholder="McMaster University" 
                          className="pl-8" 
                          {...field} 
                        />
                      </div>
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
                      <div className="relative">
                        <MapPinned className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input 
                          placeholder="1280 Main St W, Hamilton, ON" 
                          className="pl-8"
                          {...field} 
                        />
                      </div>
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
                          disabled={(date) =>
                            date < new Date()
                          }
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

            <div className="space-y-5">
              <h2 className="text-xl font-semibold flex items-center gap-2 pb-2 border-b text-blue-700">
                <Home className="h-5 w-5" />
                Amenities & Features
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
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
                          Is parking available on the property?
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
                          Is WiFi included in the rent?
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
                        <FormLabel>Laundry Facilities</FormLabel>
                        <FormDescription>
                          Does the property have laundry facilities?
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

            <div className="space-y-5">
              <h2 className="text-xl font-semibold flex items-center gap-2 pb-2 border-b text-blue-700">
                <Phone className="h-5 w-5" />
                Images & Contact Information
              </h2>
              
              <FormField
                control={form.control}
                name="imageUrls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URLs</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Image className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input 
                          placeholder="https://example.com/image.jpg" 
                          className="pl-8" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter URL for property images (you can add more after creation)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input 
                            type="email" 
                            placeholder="your@email.com" 
                            className="pl-8" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input 
                            placeholder="(123) 456-7890" 
                            className="pl-8"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-5 border-t mt-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <Button 
                  type="submit" 
                  disabled={submitting || createListingMutation.isPending} 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  size="lg"
                >
                  {(submitting || createListingMutation.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Your Listing...
                    </>
                  ) : (
                    <>
                      <CheckSquare className="mr-2 h-5 w-5" />
                      Publish Listing
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
              </form>
            </Form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}