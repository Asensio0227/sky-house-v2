import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

const LOCATION_KEY = 'user_location';

export class LocationService {
  static async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  static async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location permissions to find properties near you.',
          [{ text: 'OK' }]
        );
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      // Try to get address from coordinates with timeout
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Geocoding timeout')), 3000);
        });

        const addressPromise = Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        const address = (await Promise.race([
          addressPromise,
          timeoutPromise,
        ])) as any;
        const locationData: LocationData = {
          latitude,
          longitude,
          city: address[0]?.city || undefined,
          country: address[0]?.country || undefined,
        };
        return locationData;
      } catch (addressError) {
        console.warn('Could not reverse geocode location:', addressError);
        return { latitude, longitude };
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  static async saveLocation(location: LocationData): Promise<void> {
    try {
      await SecureStore.setItemAsync(LOCATION_KEY, JSON.stringify(location));
    } catch (error) {
      console.error('Error saving location:', error);
    }
  }

  static async getSavedLocation(): Promise<LocationData | null> {
    try {
      const locationString = await SecureStore.getItemAsync(LOCATION_KEY);
      if (locationString) {
        return JSON.parse(locationString);
      }
      return null;
    } catch (error) {
      console.error('Error getting saved location:', error);
      return null;
    }
  }

  static async clearSavedLocation(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(LOCATION_KEY);
    } catch (error) {
      console.error('Error clearing saved location:', error);
    }
  }

  static async searchLocationByName(
    query: string
  ): Promise<LocationData | null> {
    try {
      const results = await Location.geocodeAsync(query);
      if (results.length > 0) {
        const { latitude, longitude } = results[0];

        // Try to get address details with timeout
        try {
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Geocoding timeout')), 3000);
          });

          const addressPromise = Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });

          const address = (await Promise.race([
            addressPromise,
            timeoutPromise,
          ])) as any;
          return {
            latitude,
            longitude,
            city: address[0]?.city || undefined,
            country: address[0]?.country || undefined,
          };
        } catch {
          return { latitude, longitude };
        }
      }
      return null;
    } catch (error) {
      console.error('Error searching location:', error);
      return null;
    }
  }

  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
