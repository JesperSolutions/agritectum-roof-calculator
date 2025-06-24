import React, { useState, useEffect } from 'react';
import { MapPin, Search, Loader2, Globe, Zap, AlertCircle } from 'lucide-react';
import { LocationData } from '../types/project';
import { getLocationData, searchLocation } from '../utils/locationUtils';
import { getEnhancedLocationData, EnhancedLocationData, PVGISApi } from '../utils/pvgisApi';

interface LocationSelectorProps {
  location: EnhancedLocationData | null;
  onLocationChange: (location: EnhancedLocationData | null) => void;
}

export default function LocationSelector({ location, onLocationChange }: LocationSelectorProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{lat: number, lng: number, display_name: string}>>([]);
  const [showResults, setShowResults] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isLoadingPVGIS, setIsLoadingPVGIS] = useState(false);

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
    setIsLoadingPVGIS(true);
    
    try {
      const enhancedLocationData = await getEnhancedLocationData(lat, lng, true);
      onLocationChange(enhancedLocationData);
    } catch (error) {
      console.error('Error getting enhanced location data:', error);
      // Fallback to basic location data
      try {
        const basicLocationData = await getLocationData(lat, lng);
        const enhancedData: EnhancedLocationData = {
          ...basicLocationData,
          dataSource: 'estimated',
          lastUpdated: new Date()
        };
        onLocationChange(enhancedData);
      } catch (fallbackError) {
        console.error('Error getting basic location data:', fallbackError);
      }
    } finally {
      setIsLoadingPVGIS(false);
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
        setIsLoadingPVGIS(true);
        
        try {
          const enhancedLocationData = await getEnhancedLocationData(latitude, longitude, true);
          onLocationChange(enhancedLocationData);
          setSearchQuery(enhancedLocationData.address);
        } catch (error) {
          console.error('Error getting enhanced location data:', error);
          // Fallback to basic location data
          try {
            const basicLocationData = await getLocationData(latitude, longitude);
            const enhancedData: EnhancedLocationData = {
              ...basicLocationData,
              dataSource: 'estimated',
              lastUpdated: new Date()
            };
            onLocationChange(enhancedData);
            setSearchQuery(enhancedData.address);
          } catch (fallbackError) {
            console.error('Error getting basic location data:', fallbackError);
          }
        } finally {
          setIsGettingLocation(false);
          setIsLoadingPVGIS(false);
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
        <h3 className="text-lg font-semibold text-gray-900">Location-Based Solar Optimization</h3>
        {isLoadingPVGIS && (
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading PVGIS data...</span>
          </div>
        )}
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
            disabled={isGettingLocation || isLoadingPVGIS}
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
                  {PVGISApi.isLocationSupported(result.lat, result.lng) && (
                    <Zap className="w-4 h-4 text-green-500 flex-shrink-0" title="PVGIS data available" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Location Info */}
      {location && (
        <div className={`rounded-lg p-4 space-y-3 ${
          location.dataSource === 'pvgis' ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-start space-x-3">
            <MapPin className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
              location.dataSource === 'pvgis' ? 'text-green-600' : 'text-blue-600'
            }`} />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium text-gray-900">Selected Location</h4>
                {location.dataSource === 'pvgis' ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span>PVGIS Data</span>
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Estimated</span>
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{location.address}</p>
              
              {location.dataSource === 'pvgis' && location.pvgisData && (
                <div className="text-xs text-green-700 mb-3">
                  ✓ High-precision solar data from European Commission PVGIS
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-lg font-semibold ${
                location.dataSource === 'pvgis' ? 'text-green-600' : 'text-blue-600'
              }`}>
                {location.solarIrradiance}
              </div>
              <div className="text-xs text-gray-600">kWh/m²/year</div>
              <div className="text-xs text-gray-500">Solar Irradiance</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-semibold ${
                location.dataSource === 'pvgis' ? 'text-green-600' : 'text-blue-600'
              }`}>
                {location.climateZone}
              </div>
              <div className="text-xs text-gray-500">Climate Zone</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-semibold ${
                location.dataSource === 'pvgis' ? 'text-green-600' : 'text-blue-600'
              }`}>
                {location.temperatureRange.min}° to {location.temperatureRange.max}°C
              </div>
              <div className="text-xs text-gray-500">Temperature Range</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-semibold ${
                location.dataSource === 'pvgis' ? 'text-green-600' : 'text-blue-600'
              }`}>
                {location.country}
              </div>
              <div className="text-xs text-gray-500">Country</div>
            </div>
          </div>

          {/* PVGIS-specific data */}
          {location.dataSource === 'pvgis' && location.pvSystemPotential && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {location.pvSystemPotential.optimalTilt}°
                  </div>
                  <div className="text-xs text-gray-500">Optimal Tilt</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {location.pvSystemPotential.optimalAzimuth}°
                  </div>
                  <div className="text-xs text-gray-500">Optimal Azimuth</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {(location.pvSystemPotential.performanceRatio * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">Performance Ratio</div>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 mt-2">
            Last updated: {location.lastUpdated.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}