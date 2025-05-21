"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Navigation, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Location {
  latitude: number;
  longitude: number;
  address: string;
  placeId?: string;
  name?: string;
  isCustom?: boolean;
}

interface LocationSelectorProps {
  onLocationSelect: (location: Location, locationString: string, coordinatesString: string) => void;
  initialLocation?: Location;
}

interface SearchResult {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface NearbyResult {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export function LocationSelector({ onLocationSelect, initialLocation }: LocationSelectorProps) {
  const [location, setLocation] = useState<Location | null>(initialLocation || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<SearchResult[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyResult[]>([]);
  const [showNearby, setShowNearby] = useState(false);
  const [open, setOpen] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAddress, setCustomAddress] = useState("");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<HTMLIFrameElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialLocation) {
      onLocationSelect(
        initialLocation, 
        `${initialLocation.latitude} ${initialLocation.longitude}`,
        `${initialLocation.latitude},${initialLocation.longitude}`
      );
    }
  }, [initialLocation, onLocationSelect]);

  const getPlacePredictions = async (input: string) => {
    if (!input.trim()) {
      setPredictions([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/places?input=${encodeURIComponent(input)}&type=autocomplete`
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 403) {
          toast.error("API key is not authorized. Please check your Google Cloud Console settings.");
        } else {
          throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        return;
      }
      
      if (data.status === "OK") {
        const validPredictions = (data.predictions || []).filter(p => p.place_id);
        setPredictions(validPredictions);
        
        if (validPredictions.length === 0) {
          toast.info("No locations found. Try a different search term or use current location.");
        }
      } else if (data.status === "ZERO_RESULTS") {
        setPredictions([]);
        toast.info("No locations found. Try a different search term or use current location.");
      } else {
        console.error("Places API error:", data.status, data.error_message);
        setPredictions([]);
        toast.error(data.error_message || "Failed to load location suggestions");
      }
    } catch (error) {
      console.error("Failed to get place predictions:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load location suggestions");
      setPredictions([]);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setOpen(true);
    setShowCustomInput(false);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Only search if input is at least 2 characters
    if (value.length >= 2) {
      searchTimeout.current = setTimeout(() => {
        getPlacePredictions(value);
      }, 300);
    } else {
      setPredictions([]);
    }
  };

  const getPlaceDetails = async (place: SearchResult) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/places?input=${place.place_id}&type=details`
      );
      
      if (!response.ok) {
        if (response.status === 403) {
          toast.error("API key is not authorized. Please check your Google Cloud Console settings.");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return;
      }
      
      const data = await response.json();
      if (data.status === "OK" && data.result) {
        const newLocation = {
          latitude: data.result.geometry.location.lat,
          longitude: data.result.geometry.location.lng,
          address: data.result.formatted_address,
          placeId: place.place_id,
          name: data.result.name || place.structured_formatting.main_text,
        };
        setLocation(newLocation);
        onLocationSelect(
          newLocation, 
          `${newLocation.latitude} ${newLocation.longitude}`,
          `${newLocation.latitude},${newLocation.longitude}`
        );
        setOpen(false);
        toast.success("Location updated successfully");
      } else {
        throw new Error(data.error || "Failed to get place details");
      }
    } catch (error) {
      console.error("Failed to get place details:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get location details");
    }
    setIsLoading(false);
  };

  const getCurrentLocation = async () => {
    setIsLoading(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    try {
      // First check the permission status
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permissionStatus.state === 'denied') {
        toast.error("Location access denied. Please enable location services in your browser settings.");
        setIsLoading(false);
        return;
      }

      // If permission is prompt or granted, proceed with getting location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { 
            timeout: 10000,
            enableHighAccuracy: true,
            maximumAge: 0
          }
        );
      });

      const { latitude, longitude } = position.coords;
      const response = await fetch(
        `/api/places?input=${latitude},${longitude}&type=geocode`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.status === "OK" && data.results[0]) {
        const newLocation = {
          latitude,
          longitude,
          address: data.results[0].formatted_address,
          placeId: data.results[0].place_id,
        };
        setLocation(newLocation);
        onLocationSelect(
          newLocation, 
          `${latitude} ${longitude}`,
          `${latitude},${longitude}`
        );
        toast.success("Location updated successfully");
      } else {
        throw new Error(data.error || "Failed to get address");
      }
    } catch (error) {
      console.error("Location error:", error);
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Please allow location access to use this feature");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable. Please try again.");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out. Please try again.");
            break;
          default:
            toast.error("Unable to retrieve your location. Please try again.");
        }
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to get location");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAddress.trim()) {
      toast.error("Please enter a location");
      return;
    }

    const newLocation = {
      latitude: location?.latitude || 0,
      longitude: location?.longitude || 0,
      address: customAddress,
      isCustom: true,
    };
    setLocation(newLocation);
    onLocationSelect(
      newLocation, 
      customAddress,
      `${newLocation.latitude},${newLocation.longitude}`
    );
    setShowCustomInput(false);
    toast.success("Custom location added");
  };

  const handleMapLoad = () => {
    setMapLoading(false);
  };

  const handleMapError = () => {
    setMapLoading(false);
    toast.error("Failed to load map preview. Please check your Google Maps API configuration.");
  };

  const clearLocation = () => {
    setLocation(null);
    setSearchQuery("");
    onLocationSelect({
      latitude: 0,
      longitude: 0,
      address: "",
    }, "0 0", "0,0");
  };

  const getNearbyPlaces = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/places?type=nearby&lat=${lat}&lng=${lng}`
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 403) {
          toast.error("API key is not authorized. Please check your Google Cloud Console settings.");
        } else {
          throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        return;
      }
      
      if (data.status === "OK") {
        setNearbyPlaces(data.results || []);
        setShowNearby(true);
      } else if (data.status === "ZERO_RESULTS") {
        setNearbyPlaces([]);
        toast.info("No nearby places found.");
      } else {
        throw new Error(data.error || "Failed to get nearby places");
      }
    } catch (error) {
      console.error("Failed to get nearby places:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get nearby places");
      setNearbyPlaces([]);
    }
    setIsLoading(false);
  };

  const handleNearbySelect = async (place: NearbyResult) => {
    const newLocation = {
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      address: place.vicinity,
      placeId: place.place_id,
      name: place.name,
    };
    setLocation(newLocation);
    onLocationSelect(
      newLocation, 
      `${place.geometry.location.lat} ${place.geometry.location.lng}`,
      `${place.geometry.location.lat},${place.geometry.location.lng}`
    );
    setShowNearby(false);
    toast.success("Location updated successfully");
  };

  return (
    <Card className="p-0 space-y-1.5 sm:space-y-2 border border-border/40 shadow-none">
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 sm:pl-10 text-base sm:text-lg h-12 sm:h-14"
              disabled={isLoading}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => {
                  setSearchQuery("");
                  setPredictions([]);
                }}
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={getCurrentLocation}
            disabled={isLoading}
            className="whitespace-nowrap h-12 sm:h-14 text-sm sm:text-base px-2 sm:px-2.5 border shadow-none"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-1" />
            ) : (
              <Navigation className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
            )}
            Locate
          </Button>
        </div>

        {open && predictions.length > 0 && (
          <div className="border border-border/40 rounded-md shadow-none">
            <Command>
              <CommandList>
                <CommandGroup heading="Search Results">
                  {predictions.map((prediction) => (
                    <CommandItem
                      key={prediction.place_id}
                      onSelect={() => getPlaceDetails(prediction)}
                      className="flex flex-col items-start py-1 sm:py-1.5"
                    >
                      <div className="font-medium text-sm sm:text-base">{prediction.structured_formatting.main_text}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {prediction.structured_formatting.secondary_text}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}

        {showNearby && nearbyPlaces.length > 0 && (
          <div className="border border-border/40 rounded-md shadow-none">
            <Command>
              <CommandList>
                <CommandGroup heading="Nearby Places">
                  {nearbyPlaces.map((place) => (
                    <CommandItem
                      key={place.place_id}
                      onSelect={() => handleNearbySelect(place)}
                      className="flex flex-col items-start py-1 sm:py-1.5"
                    >
                      <div className="font-medium text-sm sm:text-base">{place.name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {place.vicinity}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}

        {open && predictions.length === 0 && searchQuery.length >= 2 && (
          <div className="border border-border/40 rounded-md p-2 sm:p-3 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1.5">No locations found. Try:</p>
            <div className="flex flex-col gap-1.5">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  setShowCustomInput(true);
                }}
                className="w-full text-sm sm:text-base h-9 sm:h-10 shadow-none"
              >
                Add Custom Location
              </Button>
              <Button
                variant="outline"
                onClick={getCurrentLocation}
                className="w-full text-sm sm:text-base h-9 sm:h-10 shadow-none"
              >
                Use Current Location
              </Button>
            </div>
          </div>
        )}
      </div>

      {showCustomInput && (
        <div className="space-y-1.5">
          <Textarea
            placeholder="Enter your location details..."
            value={customAddress}
            onChange={(e) => setCustomAddress(e.target.value)}
            className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
          />
          <div className="flex gap-1.5">
            <Button 
              type="button" 
              className="flex-1 text-sm sm:text-base h-9 sm:h-10 shadow-none"
              onClick={() => {
                if (customAddress.trim()) {
                  const newLocation = {
                    latitude: location?.latitude || 0,
                    longitude: location?.longitude || 0,
                    address: customAddress,
                    isCustom: true,
                  };
                  setLocation(newLocation);
                  onLocationSelect(
                    newLocation, 
                    customAddress,
                    `${newLocation.latitude},${newLocation.longitude}`
                  );
                  setShowCustomInput(false);
                  toast.success("Custom location added");
                }
              }}
            >
              Save Location
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCustomInput(false)}
              className="flex-1 text-sm sm:text-base h-9 sm:h-10 shadow-none"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {location && (
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                <p className="font-medium text-xs sm:text-sm">Selected Location:</p>
              </div>
              {location.name && (
                <p className="font-medium text-xs sm:text-sm">{location.name}</p>
              )}
              <p className="text-[11px] sm:text-xs break-words">{location.address}</p>
              {!location.isCustom && (
                <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                  Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearLocation}
              className="h-6 w-6 sm:h-7 sm:w-7 p-0"
            >
              <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Button>
          </div>

          {!location.isCustom && (
            <div className="relative h-[120px] sm:h-[140px] w-full rounded-md overflow-hidden border border-border/40">
              {mapLoading && (
                <Skeleton className="absolute inset-0" />
              )}
              <iframe
                ref={mapRef}
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${location.latitude},${location.longitude}&zoom=15`}
                allowFullScreen
                onLoad={handleMapLoad}
                onError={handleMapError}
              />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
