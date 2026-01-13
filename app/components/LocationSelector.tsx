import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootEstateState } from '../../store';
import {
  setManualLocation,
  updateUserManualLocation,
} from '../features/estate/estateSlice';
import { LocationService } from '../utils/LocationService';

const LocationSelector: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { manualLocation } = useSelector(
    (store: RootEstateState) => store.ESTATE
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a location to search');
      return;
    }

    setIsSearching(true);
    try {
      const location = await LocationService.searchLocationByName(searchQuery);
      if (location) {
        dispatch(setManualLocation(location));
        dispatch(updateUserManualLocation(location));
        Alert.alert('Success', 'Location updated successfully');
      } else {
        Alert.alert('Not Found', 'Could not find the specified location');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search location');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsSearching(true);
    try {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        dispatch(setManualLocation(location));
        dispatch(updateUserManualLocation(location));
        Alert.alert('Success', 'Current location set');
      } else {
        Alert.alert('Error', 'Could not get current location');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surfaceVariant },
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        Set Location
      </Text>

      <TextInput
        label='Search for a city or address'
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.input}
        onSubmitEditing={handleSearchLocation}
      />

      <View style={styles.buttonRow}>
        <Button
          mode='contained'
          onPress={handleSearchLocation}
          loading={isSearching}
          disabled={isSearching}
          style={styles.button}
        >
          Search
        </Button>

        <Button
          mode='outlined'
          onPress={handleUseCurrentLocation}
          loading={isSearching}
          disabled={isSearching}
          style={styles.button}
        >
          Use Current
        </Button>
      </View>

      {manualLocation && (
        <View
          style={[
            styles.locationDisplay,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text
            style={[styles.locationText, { color: theme.colors.onSurface }]}
          >
            Current: {manualLocation.city || 'Unknown City'},{' '}
            {manualLocation.country || 'Unknown Country'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  locationDisplay: {
    marginTop: 12,
    padding: 8,
    borderRadius: 4,
  },
  locationText: {
    fontSize: 14,
  },
});

export default LocationSelector;
