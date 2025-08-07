import React, { useState, useEffect } from 'react';
import { MapPin, Search, Loader2, Globe } from 'lucide-react';
import { LocationData } from '../types/project';
import { getLocationData, searchLocation } from '../utils/locationUtils';
import HelpTooltip from './HelpTooltip';

interface LocationSelectorProps {
  location: LocationData | null;
  onLocationChange: (location: LocationData | null) => void;
}

export default function LocationSelector({ location, onLocationChange }: LocationSelectorProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{lat: number, lng: number, display_name: string}>>([]);
  const [showResults, setShowResults] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleSearch = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchLocation(query);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = async (lat: number, lng: number, address: string) => {
    setShowResults(false);
    setSearchQuery(address);
    
    try {
      const locationData = await getLocationData(lat, lng);
      onLocationChange(locationData);
    } catch (error) {
      console.error('Error getting location data:', error);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const locationData = await getLocationData(latitude, longitude);
          onLocationChange(locationData);
          setSearchQuery(locationData.address);
        } catch (error) {
          console.error('Error getting location data:', error);
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting current location:', error);
        alert('Unable to get your current location. Please search manually.');
        setIsGettingLocation(false);
      }
    );
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    if (location) {
      setSearchQuery(location.address);
    }
  }, [location]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-4">
        <Globe className="w-5 h-5 text-blue-600" />
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">Please enter the address for your roof for good</h3>
          <HelpTooltip content="Your location affects solar irradiance, climate conditions, and energy calculations. We use this data to provide accurate environmental and financial projections for your specific area." />
        </div>
      </div>
      
      <div className="relative">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a location (city, address, country)..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
              </div>
            )}
          </div>
          <button
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isGettingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Use Current</span>
          </button>
        </div>

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleLocationSelect(result.lat, result.lng, result.display_name)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-900 line-clamp-2">{result.display_name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Location Info */}
      {location && (
        <div className="bg-blue-50 rounded-lg p-4 space-y-3">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Selected Location</h4>
              <p className="text-sm text-gray-600 mt-1">{location.address}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">{location.solarIrradiance}</div>
              <div className="text-xs text-gray-600">kWh/m²/year</div>
              <div className="text-xs text-gray-500">Solar Irradiance</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">{location.climateZone}</div>
              <div className="text-xs text-gray-500">Climate Zone</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-orange-600">
                {location.temperatureRange.min}° to {location.temperatureRange.max}°C
              </div>
              <div className="text-xs text-gray-500">Temperature Range</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">{location.country}</div>
              <div className="text-xs text-gray-500">Country</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}