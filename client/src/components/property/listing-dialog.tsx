import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import PropertyDetails from './property-details';

interface ListingDialogProps {
  propertyId: number | null;
  open: boolean;
  onClose: () => void;
}

export default function ListingDialog({ propertyId, open, onClose }: ListingDialogProps) {
  return (
    <Dialog open={open && !!propertyId} onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden bg-background">
        <VisuallyHidden>
          <DialogTitle>Property Details</DialogTitle>
        </VisuallyHidden>
        {propertyId ? (
          <PropertyDetails propertyId={propertyId} onClose={onClose} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}