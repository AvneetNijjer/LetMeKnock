// TravelTime API Service
// Documentation: https://docs.traveltime.com/api/reference/time-filter

// McMaster University coordinates
export const MCMASTER_COORDINATES = {
  lat: 43.26144,
  lng: -79.91979
};

// Transport types supported by TravelTime API
export type TransportType = 
  | 'public_transport' 
  | 'driving' 
  | 'walking' 
  | 'cycling';

// Transport mode configuration
export const TRANSPORT_MODES = [
  { 
    id: 'walking', 
    name: 'Walking',
    apiType: 'walking',
    icon: 'MoveHorizontal', 
    color: 'bg-orange-100 text-orange-800 border-orange-300' 
  },
  { 
    id: 'cycling', 
    name: 'Biking',
    apiType: 'cycling',
    icon: 'Bike', 
    color: 'bg-green-100 text-green-800 border-green-300' 
  },
  { 
    id: 'driving', 
    name: 'Driving',
    apiType: 'driving',
    icon: 'Car', 
    color: 'bg-blue-100 text-blue-800 border-blue-300' 
  },
  { 
    id: 'public_transport', 
    name: 'Bus',
    apiType: 'public_transport',
    icon: 'Bus', 
    color: 'bg-purple-100 text-purple-800 border-purple-300' 
  }
];

// Result from TravelTime API with processing
export interface TravelTimeResult {
  mode: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  time: number; // in seconds
  distance: number; // in meters
  timeFormatted: string;
  distanceFormatted: string;
}

class TravelTimeService {
  private apiKey = import.meta.env.TRAVELTIME_API_KEY;
  private appId = import.meta.env.TRAVELTIME_APP_ID;
  private baseUrl = 'https://api.traveltimeapp.com/v4';

  // Calculate travel times for all transport modes
  async calculateTravelTimes(
    lat: number, 
    lng: number
  ): Promise<TravelTimeResult[]> {
    // If coordinates are invalid, return empty array
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      console.error('Invalid coordinates for travel time calculation');
      return [];
    }
    
    const results: TravelTimeResult[] = [];
    
    // Calculate travel time for each transport mode
    for (const mode of TRANSPORT_MODES) {
      try {
        const result = await this.calculateTravelTime(lat, lng, mode.apiType as TransportType);
        results.push({
          mode: {
            id: mode.id,
            name: mode.name,
            icon: mode.icon,
            color: mode.color
          },
          time: result.time,
          distance: result.distance,
          timeFormatted: this.formatTime(result.time),
          distanceFormatted: this.formatDistance(result.distance)
        });
      } catch (error) {
        console.error(`Error calculating travel time for ${mode.name}:`, error);
        // Add fallback calculation
        const fallback = this.fallbackCalculation(lat, lng, mode.id as TransportType);
        results.push({
          mode: {
            id: mode.id,
            name: mode.name,
            icon: mode.icon,
            color: mode.color
          },
          time: fallback.time,
          distance: fallback.distance,
          timeFormatted: this.formatTime(fallback.time),
          distanceFormatted: this.formatDistance(fallback.distance)
        });
      }
    }
    
    return results;
  }
  
  // Calculate travel time for one transport mode
  private async calculateTravelTime(
    lat: number, 
    lng: number,
    transportType: TransportType
  ): Promise<{ time: number; distance: number }> {
    try {
      const url = `${this.baseUrl}/time-filter`;
      
      const departureTime = new Date();
      // Set to next hour to ensure valid results
      departureTime.setHours(departureTime.getHours() + 1);
      departureTime.setMinutes(0);
      departureTime.setSeconds(0);
      
      const requestData = {
        locations: [
          {
            id: "property",
            coords: {
              lat,
              lng
            }
          },
          {
            id: "mcmaster",
            coords: {
              lat: MCMASTER_COORDINATES.lat,
              lng: MCMASTER_COORDINATES.lng
            }
          }
        ],
        departure_searches: [
          {
            id: "property-to-mcmaster",
            departure_location_id: "property",
            arrival_location_ids: ["mcmaster"],
            transportation: {
              type: transportType
            },
            departure_time: departureTime.toISOString(),
            travel_time: 7200, // 2 hours max travel time
            properties: ["travel_time", "distance"]
          }
        ]
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Application-Id': this.appId,
          'X-Api-Key': this.apiKey
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error(`TravelTime API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract time and distance from response
      if (data?.results?.length > 0 && 
          data.results[0]?.locations?.length > 0) {
        const result = data.results[0].locations[0];
        return {
          time: result.properties.travel_time,
          distance: result.properties.distance
        };
      }
      
      throw new Error('Could not parse TravelTime API response');
    } catch (error) {
      console.error('TravelTime API Error:', error);
      throw error;
    }
  }
  
  // Fallback calculation using simple distance formula
  private fallbackCalculation(
    lat: number, 
    lng: number,
    transportType: TransportType
  ): { time: number; distance: number } {
    // Calculate distance using Haversine formula
    const R = 6371e3; // Earth's radius in meters
    const lat1 = lat * Math.PI / 180;
    const lat2 = MCMASTER_COORDINATES.lat * Math.PI / 180;
    const deltaLat = (MCMASTER_COORDINATES.lat - lat) * Math.PI / 180;
    const deltaLng = (MCMASTER_COORDINATES.lng - lng) * Math.PI / 180;

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // in meters

    // Estimate time based on transportation mode
    let speed = 1.4; // default: walking at ~5 km/h (1.4 m/s)
    
    switch (transportType) {
      case 'walking':
        speed = 1.4; // ~5 km/h
        break;
      case 'cycling':
        speed = 4.2; // ~15 km/h
        break;
      case 'driving':
        speed = 11.1; // ~40 km/h in urban areas
        break;
      case 'public_transport':
        speed = 6.9; // ~25 km/h including stops
        break;
    }

    const time = distance / speed; // seconds

    return { time, distance };
  }
  
  // Format time in minutes or hours + minutes
  formatTime(seconds: number): string {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}min`;
    }
  }
  
  // Format distance in km or m
  formatDistance(meters: number): string {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    } else {
      return `${Math.round(meters)} m`;
    }
  }
}

export const travelTimeService = new TravelTimeService();