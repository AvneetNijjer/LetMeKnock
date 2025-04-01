import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Tooltip, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Property } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { ExternalLink, Navigation, Info, Home as HomeIcon, School, DollarSign, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Fix Leaflet icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Create custom icons
const createCustomIcon = (iconUrl: string, size: [number, number] = [25, 41], anchor: [number, number] = [12, 41]) => {
  return L.icon({
    iconUrl,
    iconSize: size,
    iconAnchor: anchor,
    popupAnchor: [0, -41],
  });
};

// Custom icons for different property types
const propertyIcons = {
  apartment: createCustomIcon('https://cdn-icons-png.flaticon.com/512/1295/1295181.png', [32, 32], [16, 32]),
  house: createCustomIcon('https://cdn-icons-png.flaticon.com/512/619/619034.png', [32, 32], [16, 32]),
  room: createCustomIcon('https://cdn-icons-png.flaticon.com/512/489/489458.png', [32, 32], [16, 32]),
  studio: createCustomIcon('https://cdn-icons-png.flaticon.com/512/2056/2056256.png', [32, 32], [16, 32]),
  default: createCustomIcon('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png')
};

// McMaster University coordinates and icon
const MCMASTER_COORDS: [number, number] = [43.2609, -79.9192];
const universityIcon = createCustomIcon('https://cdn-icons-png.flaticon.com/512/167/167707.png', [38, 38], [19, 38]);

interface PropertyMapProps {
  properties: Property[];
  selectedProperty?: Property | null;
  onPropertySelect?: (property: Property) => void;
  showDirections?: boolean;
}

function SetViewOnChange({ coords }: { coords: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords, map]);
  
  return null;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ 
  properties, 
  selectedProperty, 
  onPropertySelect,
  showDirections = false
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(MCMASTER_COORDS);
  const [mapZoom, setMapZoom] = useState(13);
  const [showCampusRadius, setShowCampusRadius] = useState(true);
  const [showRoute, setShowRoute] = useState(false);

  useEffect(() => {
    if (selectedProperty && selectedProperty.latitude && selectedProperty.longitude) {
      setMapCenter([Number(selectedProperty.latitude), Number(selectedProperty.longitude)]);
      setMapZoom(15);
      setShowRoute(true);
    } else {
      setMapCenter(MCMASTER_COORDS);
      setMapZoom(13);
      setShowRoute(false);
    }
  }, [selectedProperty]);

  const openDirections = (lat: number, lng: number) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&origin=${MCMASTER_COORDS[0]},${MCMASTER_COORDS[1]}`,
      '_blank'
    );
  };

  // Calculate approximate walking distances to campus
  const getPropertyIcon = (property: Property) => {
    const type = property.propertyType as keyof typeof propertyIcons;
    return propertyIcons[type] || propertyIcons.default;
  };

  // Approximate line between McMaster and selected property
  const routePosition = useMemo(() => {
    if (!selectedProperty || !selectedProperty.latitude || !selectedProperty.longitude) {
      return null;
    }
    return [
      MCMASTER_COORDS, 
      [Number(selectedProperty.latitude), Number(selectedProperty.longitude)]
    ] as [number, number][];
  }, [selectedProperty]);

  return (
    <MapContainer 
      center={mapCenter} 
      zoom={mapZoom} 
      style={{ height: '100%', width: '100%', minHeight: '500px' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Show distance circles around campus */}
      {showCampusRadius && (
        <>
          <Circle 
            center={MCMASTER_COORDS} 
            radius={1000} 
            pathOptions={{ color: 'rgba(59, 130, 246, 0.3)', fillColor: 'rgba(59, 130, 246, 0.1)' }}
          >
            <Tooltip direction="center" permanent>
              <div className="text-xs font-semibold">1km</div>
            </Tooltip>
          </Circle>
          <Circle 
            center={MCMASTER_COORDS} 
            radius={2000} 
            pathOptions={{ color: 'rgba(59, 130, 246, 0.2)', fillColor: 'rgba(59, 130, 246, 0.05)' }}
          >
            <Tooltip direction="center" permanent>
              <div className="text-xs font-semibold">2km</div>
            </Tooltip>
          </Circle>
        </>
      )}
      
      {/* Show route line from campus to selected property */}
      {showRoute && routePosition && selectedProperty && (
        <Polyline
          positions={routePosition}
          pathOptions={{ color: '#3b82f6', weight: 3, dashArray: '5, 5' }}
        >
          <Tooltip>
            <div className="text-xs">
              <span className="font-semibold">Approximate route to McMaster</span>
              {selectedProperty.travelTime && (
                <div>~{selectedProperty.travelTime} minutes</div>
              )}
            </div>
          </Tooltip>
        </Polyline>
      )}
      
      {/* McMaster University Marker */}
      <Marker position={MCMASTER_COORDS} icon={universityIcon}>
        <Popup>
          <div className="flex items-center gap-2">
            <School className="h-4 w-4 text-blue-600" />
            <div className="font-semibold">McMaster University</div>
          </div>
          <div className="text-sm text-gray-600 ml-6">1280 Main St W, Hamilton, ON</div>
          <div className="mt-2 text-xs text-blue-600 font-medium">Central reference point for all listings</div>
        </Popup>
      </Marker>
      
      {/* Property Markers */}
      {properties.map((property) => {
        if (!property.latitude || !property.longitude) return null;
        
        const isSelected = selectedProperty?.id === property.id;
        
        return (
          <Marker 
            key={property.id} 
            position={[Number(property.latitude), Number(property.longitude)]}
            icon={getPropertyIcon(property)}
            eventHandlers={{
              click: () => {
                if (onPropertySelect) {
                  onPropertySelect(property);
                }
              },
            }}
          >
            <Popup>
              <div className="text-sm mb-2">
                <h3 className="font-semibold text-base">{property.title}</h3>
                <div className="flex items-center mt-1">
                  <DollarSign className="h-3.5 w-3.5 text-green-600 mr-1" />
                  <span className="font-medium">${property.price.toLocaleString()}/month</span>
                </div>
                <div className="flex items-center mt-1">
                  <HomeIcon className="h-3.5 w-3.5 text-gray-600 mr-1" />
                  <span>
                    {property.bedrooms} bed • {property.bathrooms} bath • {property.propertyType}
                  </span>
                </div>
                <div className="flex items-center mt-1">
                  <Info className="h-3.5 w-3.5 text-gray-600 mr-1" />
                  <span className="text-gray-600 truncate">{property.address}</span>
                </div>
                
                {property.travelTime && (
                  <div className="flex items-center mt-1">
                    <Clock className="h-3.5 w-3.5 text-purple-600 mr-1" />
                    <span>{property.travelTime} min to McMaster</span>
                  </div>
                )}
                
                {property.furnished && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">Furnished</Badge>
                  </div>
                )}
              </div>
              
              {showDirections && (
                <div className="flex flex-col gap-2 mt-2">
                  <Button 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      openDirections(Number(property.latitude), Number(property.longitude));
                    }}
                    className="w-full flex items-center justify-center gap-1"
                  >
                    <Navigation className="h-4 w-4" />
                    <span>Get Directions</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onPropertySelect) {
                        onPropertySelect(property);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View Full Details</span>
                  </Button>
                </div>
              )}
            </Popup>
          </Marker>
        );
      })}
      
      <SetViewOnChange coords={mapCenter} />
    </MapContainer>
  );
};

export default PropertyMap;