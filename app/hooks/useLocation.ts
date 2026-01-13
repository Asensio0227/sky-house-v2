import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  setCurrentLocation,
  updateUserLocation,
} from '../features/estate/estateSlice';
import { LocationData, LocationService } from '../utils/LocationService';

const useLocation = () => {
  const dispatch = useDispatch();
  const { currentLocation } = useSelector((store: RootState) => store.ESTATE);
  const [location, setLocation] = useState<LocationData | null>(
    currentLocation
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAndUpdateLocation = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const currentLoc = await LocationService.getCurrentLocation();
      if (currentLoc) {
        setLocation(currentLoc);
        dispatch(setCurrentLocation(currentLoc));
        await LocationService.saveLocation(currentLoc);

        // Update location on backend
        dispatch(
          updateUserLocation({
            latitude: currentLoc.latitude,
            longitude: currentLoc.longitude,
          })
        );
      } else {
        setErrorMsg('Unable to get location');
      }
    } catch (error: any) {
      console.log('Error fetching location:', error?.message || error);
      setErrorMsg(error?.message || 'Error fetching location');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        // First try to load saved location
        const savedLocation = await LocationService.getSavedLocation();
        if (savedLocation) {
          setLocation(savedLocation);
          dispatch(setCurrentLocation(savedLocation));
        }

        // Then try to get fresh location
        await fetchAndUpdateLocation();
      } catch (error: any) {
        console.log('Error initializing location:', error?.message || error);
        setErrorMsg(error?.message || 'Failed to initialize location');
      }
    };

    initializeLocation();

    // Cleanup function
    return () => {
      // Clean up any subscriptions or listeners if needed
    };
  }, []); // Empty dependency array - only run once on mount

  return {
    location,
    errorMsg,
    isLoading,
    isLoadingLocation: isLoading, // Alias for compatibility
    refetchLocation: fetchAndUpdateLocation,
  };
};

export default useLocation;
