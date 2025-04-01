import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Property } from '@shared/schema';
import {
  Clock,
  Car,
  Bus,
  Bike,
  MoveHorizontal,
  MapPin,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { travelTimeService, TravelTimeResult, TRANSPORT_MODES } from '@/lib/travel-time-service';

interface TravelTimeInfoProps {
  property: Property;
}

// Format the travel method data for display
const formatTravelMethod = (
  result?: TravelTimeResult,
  loading: boolean = false
) => {
  const transportMode = TRANSPORT_MODES.find(m => m.id === result?.mode.id) || TRANSPORT_MODES[0];
  
  // Get the icon component
  const getIcon = () => {
    switch(transportMode.icon) {
      case 'MoveHorizontal': return <MoveHorizontal className="h-4 w-4" />;
      case 'Bike': return <Bike className="h-4 w-4" />;
      case 'Car': return <Car className="h-4 w-4" />;
      case 'Bus': return <Bus className="h-4 w-4" />;
      default: return <MoveHorizontal className="h-4 w-4" />;
    }
  };
  
  return {
    id: transportMode.id,
    method: transportMode.name,
    icon: getIcon(),
    color: transportMode.color,
    time: result?.timeFormatted || 'Calculating...',
    distance: result?.distanceFormatted || 'Calculating...',
    loading
  };
};

export default function TravelTimeInfo({ property }: TravelTimeInfoProps) {
  const [travelTimes, setTravelTimes] = useState<TravelTimeResult[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTravelTimes = async () => {
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
        setTravelTimes(results);
      } catch (error) {
        console.error('Error fetching travel times:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTravelTimes();
  }, [property.latitude, property.longitude]);
  
  // Instead of processing TRANSPORT_MODES, use the actual travelTimes results
  // This prevents duplicate entries and ensures we only show what we actually have
  const travelMethods = loading 
    ? TRANSPORT_MODES.map(mode => formatTravelMethod(undefined, true)) 
    : travelTimes.map(result => formatTravelMethod(result, false));
  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Clock className="h-5 w-5 mr-2 text-primary" />
        Travel Time to McMaster University
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center mb-2">
          <MapPin className="h-4 w-4 mr-2 text-primary" />
          <p className="text-sm text-muted-foreground">
            From: {property.address || property.location}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {travelMethods.map((method, index) => (
            <motion.div 
              key={`${method.id}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 as number }}
            >
              <Card className="overflow-hidden border">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Badge variant="outline" className={`mr-3 ${method.color}`}>
                        {method.icon}
                      </Badge>
                      <div>
                        <p className="font-medium">{method.method}</p>
                        <p className="text-sm text-muted-foreground">{method.distance}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {method.loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <p className="font-bold text-primary">{method.time}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          Note: Travel times are calculated using the TravelTime API and may vary based on traffic, weather conditions, and exact route taken.
        </p>
      </div>
    </div>
  );
}