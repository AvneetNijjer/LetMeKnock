import React, { useEffect, useState } from 'react';
import { Property } from '@shared/schema';
import { travelTimeService } from '@/lib/travel-time-service';
import { Loader2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface TravelTimeCardInfoProps {
  property: Property;
  transportType?: 'walking' | 'cycling' | 'driving' | 'public_transport';
}

export default function TravelTimeCardInfo({ 
  property, 
  transportType = 'walking' 
}: TravelTimeCardInfoProps) {
  const [travelTime, setTravelTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTravelTime = async () => {
      if (!property.latitude || !property.longitude) {
        setLoading(false);
        return;
      }
      
      try {
        const lat = Number(property.latitude);
        const lng = Number(property.longitude);
        
        if (isNaN(lat) || isNaN(lng)) {
          console.error('Invalid coordinates:', property.latitude, property.longitude);
          setLoading(false);
          return;
        }
        
        const results = await travelTimeService.calculateTravelTimes(lat, lng);
        const result = results.find(r => r.mode.id === transportType);
        
        if (result) {
          setTravelTime(result.timeFormatted);
        }
      } catch (error) {
        console.error('Error fetching travel time:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTravelTime();
  }, [property.latitude, property.longitude, transportType]);

  return (
    <div className="text-xs inline-flex items-center text-muted-foreground">
      {loading ? (
        <>
          <Clock className="mr-1 h-3.5 w-3.5 text-primary" />
          <Loader2 className="h-3 w-3 animate-spin" />
        </>
      ) : (
        <>
          <Clock className="mr-1 h-3.5 w-3.5 text-primary" />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {travelTime || 'N/A'}
          </motion.span>
        </>
      )}
    </div>
  );
}