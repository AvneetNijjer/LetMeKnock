import { Directions } from 'openrouteservice-js';

// McMaster University coordinates
export const MCMASTER_COORDINATES: [number, number] = [-79.91979, 43.26144];

// Different transportation methods
export type TransportMethod = 'foot-walking' | 'cycling-regular' | 'driving-car' | 'wheelchair';

interface TravelTimeResult {
  time: number; // in seconds
  distance: number; // in meters
}

class RouteService {
  private directionsClient: Directions;
  
  constructor() {
    this.directionsClient = new Directions({
      api_key: import.meta.env.OPENROUTE_API_KEY || ''
    });
  }

  async getTravelTime(
    startCoords: [number, number], 
    endCoords: [number, number] = MCMASTER_COORDINATES,
    profile: TransportMethod = 'foot-walking'
  ): Promise<TravelTimeResult> {
    try {
      const response = await this.directionsClient.calculate({
        coordinates: [startCoords, endCoords],
        profile,
        format: 'json'
      });

      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        return {
          time: route.summary.duration, // seconds
          distance: route.summary.distance // meters
        };
      }
      
      throw new Error('No route found');
    } catch (error) {
      console.error('Error calculating travel time:', error);
      // Fallback to a simple estimation as last resort
      return this.estimateTravelTime(startCoords, endCoords, profile);
    }
  }

  // Fallback estimation method if API fails
  private estimateTravelTime(
    startCoords: [number, number], 
    endCoords: [number, number] = MCMASTER_COORDINATES,
    profile: TransportMethod = 'foot-walking'
  ): TravelTimeResult {
    // Calculate distance using Haversine formula
    const R = 6371e3; // Earth's radius in meters
    const lat1 = startCoords[1] * Math.PI / 180;
    const lat2 = endCoords[1] * Math.PI / 180;
    const deltaLat = (endCoords[1] - startCoords[1]) * Math.PI / 180;
    const deltaLon = (endCoords[0] - startCoords[0]) * Math.PI / 180;

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // in meters

    // Estimate time based on transportation mode
    let speed: number; // in m/s
    switch (profile) {
      case 'foot-walking':
        speed = 1.4; // ~5 km/h
        break;
      case 'cycling-regular':
        speed = 4.2; // ~15 km/h
        break;
      case 'driving-car':
        speed = 11.1; // ~40 km/h in urban areas
        break;
      case 'wheelchair':
        speed = 0.8; // ~3 km/h
        break;
      default:
        speed = 1.4;
    }

    const time = distance / speed; // seconds

    return { time, distance };
  }

  // Helper to format time in minutes
  formatTravelTime(seconds: number): string {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}min`;
    }
  }
}

export const routeService = new RouteService();