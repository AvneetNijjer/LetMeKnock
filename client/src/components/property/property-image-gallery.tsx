import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ExpandIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PropertyImageGalleryProps {
  images: string[];
  title: string;
}

export default function PropertyImageGallery({ images, title }: PropertyImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // If no images are provided, use a placeholder
  const hasImages = images && images.length > 0;
  const placeholderImage = "https://images.unsplash.com/photo-1560184897-ae75f418493e?q=80&w=2070&auto=format&fit=crop";
  
  // Show real images if available, otherwise use placeholders
  const displayImages = hasImages ? images : [placeholderImage];
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };
  
  return (
    <>
      <div className="relative">
        {/* Main Image */}
        <div className="relative h-64 md:h-96 w-full overflow-hidden bg-muted">
          <img
            src={displayImages[currentImageIndex]}
            alt={`${title} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
          />
          
          {/* Navigation Controls */}
          {displayImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background rounded-full"
                onClick={prevImage}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background rounded-full"
                onClick={nextImage}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
          
          {/* Image Counter */}
          <div className="absolute bottom-2 right-2 bg-background/80 text-foreground px-2 py-1 text-xs rounded-md">
            {currentImageIndex + 1} / {displayImages.length}
          </div>
          
          {/* Fullscreen Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 hover:bg-background rounded-full"
            onClick={() => setIsFullscreen(true)}
          >
            <ExpandIcon className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Thumbnail Strip */}
        {displayImages.length > 1 && (
          <div className="flex overflow-x-auto mt-2 space-x-2 px-2">
            {displayImages.map((image, index) => (
              <div
                key={index}
                className={`relative flex-shrink-0 h-16 w-16 md:h-20 md:w-20 cursor-pointer 
                  ${currentImageIndex === index ? 'ring-2 ring-primary' : 'opacity-70'}`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <img
                  src={image}
                  alt={`${title} thumbnail ${index + 1}`}
                  className="h-full w-full object-cover rounded-md"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-5xl w-full h-[90vh] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="relative h-full w-full flex items-center justify-center">
            <img
              src={displayImages[currentImageIndex]}
              alt={`${title} - Image ${currentImageIndex + 1} (fullscreen)`}
              className="max-h-full max-w-full object-contain"
            />
            
            {/* Fullscreen Navigation Controls */}
            {displayImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background rounded-full"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background rounded-full"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
            
            {/* Fullscreen Image Counter */}
            <div className="absolute bottom-2 right-2 bg-background/80 text-foreground px-3 py-1 rounded-md">
              {currentImageIndex + 1} / {displayImages.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}