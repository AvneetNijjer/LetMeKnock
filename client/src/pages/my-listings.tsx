import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { apiRequest, queryClient, getQueryFn } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import { Property } from '@shared/schema';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Loader2, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash, 
  Eye, 
  Home, 
  Calendar, 
  DollarSign,
  Building,
  Tag,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function MyListings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deleteListingId, setDeleteListingId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Query to get user's listings
  const { data: myListings, isLoading, error } = useQuery<Property[]>({
    queryKey: ['/api/properties/owner', user?.id],
    queryFn: getQueryFn({ on401: 'throw' }),
    enabled: !!user?.id,
  });

  // Mutation to delete a listing
  const deleteListingMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/properties/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Listing deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/properties/owner', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error deleting listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete listing',
        variant: 'destructive',
      });
    },
  });

  // Handler for delete confirmation
  const handleDeleteListing = () => {
    if (deleteListingId) {
      deleteListingMutation.mutate(deleteListingId);
    }
  };

  // Handler to open delete dialog
  const openDeleteDialog = (id: number) => {
    setDeleteListingId(id);
    setIsDeleteDialogOpen(true);
  };

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="container py-10">
        <div className="p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Listings</h2>
          <p className="text-gray-700">
            There was a problem loading your listings. Please try again later.
          </p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/properties/owner', user?.id] })} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Helper function to determine badge color based on status
  const getBadgeVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case 'available':
        return 'default';
      case 'rented':
        return 'secondary';
      case 'pending':
        // Map 'pending' to 'secondary' since 'warning' is not an available variant
        return 'secondary';
      case 'unavailable':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your property listings
          </p>
        </div>
        <Link href="/create-listing">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Listing
          </Button>
        </Link>
      </div>

      {myListings && myListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myListings.map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="line-clamp-1">{listing.title}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Building className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        {listing.address}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/listings/${listing.id}`}>
                            <div className="w-full flex items-center">
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Listing</span>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/edit-listing/${listing.id}`}>
                            <div className="w-full flex items-center">
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Listing</span>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Calendar className="mr-2 h-4 w-4" />
                              <span>Manage Bookings</span>
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Bookings for {listing.title}</DialogTitle>
                              <DialogDescription>
                                View and manage all booking requests for this property.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <p className="text-center text-muted-foreground">
                                Booking management feature coming soon!
                              </p>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button>Close</Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <DropdownMenuSeparator />
                        <AlertDialog open={isDeleteDialogOpen && deleteListingId === listing.id} onOpenChange={setIsDeleteDialogOpen}>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              onSelect={(e) => {
                                e.preventDefault();
                                openDeleteDialog(listing.id);
                              }}
                              className="text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Delete Listing</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                listing and remove it from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteListing}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {deleteListingMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Delete"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="py-2 flex-grow">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant={getBadgeVariant(listing.status || 'available')}>
                      <Tag className="h-3 w-3 mr-1" />
                      {listing.status 
                        ? listing.status.charAt(0).toUpperCase() + listing.status.slice(1) 
                        : 'Available'}
                    </Badge>
                    <Badge variant="outline">
                      <Home className="h-3 w-3 mr-1" />
                      {listing.propertyType 
                        ? listing.propertyType.charAt(0).toUpperCase() + listing.propertyType.slice(1) 
                        : 'Apartment'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div className="flex items-center text-muted-foreground">
                      <DollarSign className="h-3.5 w-3.5 mr-1" />
                      ${listing.price}/month
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {listing.availableFrom ? format(new Date(listing.availableFrom), 'MMM d, yyyy') : 'Available now'}
                    </div>
                  </div>
                  <p className="text-sm line-clamp-3">{listing.description}</p>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="flex justify-between items-center w-full text-sm">
                    <div>
                      <span className="text-muted-foreground">Created: </span>
                      {listing.createdAt ? format(new Date(listing.createdAt), 'MMM d, yyyy') : 'N/A'}
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{listing.bedrooms}</span>
                      <span className="text-muted-foreground">bed</span>
                      <span className="mx-1">•</span>
                      <span>{listing.bathrooms}</span>
                      <span className="text-muted-foreground">bath</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Listings Yet</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            You haven't created any property listings yet. Get started by creating your first listing!
          </p>
          <Link href="/create-listing">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Listing
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}