import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Chip, Text, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootEstateState } from '../../store';
import {
  clearAllFilters,
  setBathrooms,
  setBedrooms,
  setDistance,
  setFurnished,
  setListingType,
  setPriceRange,
} from '../features/estate/estateSlice';
import { designTokens } from '../utils/designTokens';

const ListingFilters: React.FC = React.memo(() => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const {
    listingType,
    distance,
    minPrice,
    maxPrice,
    furnished,
    bedrooms,
    bathrooms,
  } = useSelector((store: RootEstateState) => store.ESTATE);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClearFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Add scale animation for button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    dispatch(clearAllFilters());
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          backgroundColor: theme.colors.surface,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 6,
        },
      ]}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.onSurface,
              fontSize: designTokens.typography.fontSize.xl,
              fontWeight: designTokens.typography.fontWeight.bold,
            },
          ]}
        >
          Filters
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleClearFilters}
          style={styles.clearButton}
          accessibilityRole='button'
          accessibilityLabel='Clear all filters'
          accessibilityHint='Reset all filter selections'
        >
          <Text
            style={[
              styles.clearText,
              {
                color: theme.colors.primary,
                fontSize: designTokens.typography.fontSize.sm,
                fontWeight: designTokens.typography.fontWeight.medium,
              },
            ]}
          >
            Clear All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Listing Type */}
      <View style={styles.filterSection}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.colors.onSurface,
              fontSize: designTokens.typography.fontSize.md,
              fontWeight: designTokens.typography.fontWeight.semibold,
            },
          ]}
        >
          Property Type
        </Text>
        <View style={styles.buttonRow}>
          <Chip
            selected={listingType === 'rent'}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              dispatch(setListingType('rent'));
            }}
            style={[
              styles.chip,
              listingType === 'rent' && {
                backgroundColor: theme.colors.primaryContainer,
              },
            ]}
            textStyle={{
              color:
                listingType === 'rent'
                  ? theme.colors.onPrimaryContainer
                  : theme.colors.onSurfaceVariant,
            }}
            accessibilityRole='button'
            accessibilityState={{ selected: listingType === 'rent' }}
          >
            For Rent
          </Chip>
          <Chip
            selected={listingType === 'sale'}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              dispatch(setListingType('sale'));
            }}
            style={[
              styles.chip,
              listingType === 'sale' && {
                backgroundColor: theme.colors.primaryContainer,
              },
            ]}
            textStyle={{
              color:
                listingType === 'sale'
                  ? theme.colors.onPrimaryContainer
                  : theme.colors.onSurfaceVariant,
            }}
            accessibilityRole='button'
            accessibilityState={{ selected: listingType === 'sale' }}
          >
            For Sale
          </Chip>
        </View>
      </View>

      {/* Distance */}
      <View style={styles.filterRow}>
        <Text style={styles.label}>Distance:</Text>
        {[5, 10, 20].map((dist) => (
          <Button
            key={dist}
            mode={distance === dist ? 'contained' : 'outlined'}
            onPress={() => dispatch(setDistance(dist))}
            style={styles.button}
          >
            {dist}km
          </Button>
        ))}
      </View>

      {/* Price Range - simplified for demo */}
      <View style={styles.filterRow}>
        <Text style={styles.label}>Price:</Text>
        <Button
          mode={minPrice === 0 && maxPrice === 1000 ? 'contained' : 'outlined'}
          onPress={() =>
            dispatch(setPriceRange({ minPrice: 0, maxPrice: 1000 }))
          }
          style={styles.button}
        >
          Under $1000
        </Button>
        <Button
          mode={
            minPrice === 1000 && maxPrice === 2000 ? 'contained' : 'outlined'
          }
          onPress={() =>
            dispatch(setPriceRange({ minPrice: 1000, maxPrice: 2000 }))
          }
          style={styles.button}
        >
          $1000-$2000
        </Button>
      </View>

      {/* Bedrooms */}
      <View style={styles.filterRow}>
        <Text style={styles.label}>Bedrooms:</Text>
        {[1, 2, 3, 4].map((num) => (
          <Button
            key={num}
            mode={bedrooms === num ? 'contained' : 'outlined'}
            onPress={() => dispatch(setBedrooms(num))}
            style={styles.button}
          >
            {num}+
          </Button>
        ))}
      </View>

      {/* Furnished */}
      <View style={styles.filterRow}>
        <Text style={styles.label}>Furnished:</Text>
        <Button
          mode={furnished === true ? 'contained' : 'outlined'}
          onPress={() => dispatch(setFurnished(true))}
          style={styles.button}
        >
          Yes
        </Button>
        <Button
          mode={furnished === false ? 'contained' : 'outlined'}
          onPress={() => dispatch(setFurnished(false))}
          style={styles.button}
        >
          No
        </Button>
      </View>

      <Button
        mode='outlined'
        onPress={() => dispatch(clearAllFilters())}
        style={styles.clearButton}
      >
        Clear All Filters
      </Button>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: designTokens.spacing.lg,
    margin: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.lg,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designTokens.spacing.lg,
    paddingBottom: designTokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: designTokens.typography.fontSize.xl,
    fontWeight: designTokens.typography.fontWeight.bold,
    color: '#212121',
  },
  clearButton: {
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
    borderRadius: designTokens.borderRadius.md,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  clearText: {
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.medium,
    color: '#2196F3',
  },
  filterSection: {
    marginBottom: designTokens.spacing.xl,
  },
  sectionTitle: {
    fontSize: designTokens.typography.fontSize.md,
    fontWeight: designTokens.typography.fontWeight.semibold,
    color: '#212121',
    marginBottom: designTokens.spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
  },
  label: {
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.medium,
    color: '#757575',
    marginRight: designTokens.spacing.md,
    minWidth: 80,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: designTokens.spacing.sm,
    marginBottom: designTokens.spacing.md,
  },
  button: {
    flex: 1,
    borderRadius: designTokens.borderRadius.md,
    paddingVertical: designTokens.spacing.sm,
    minHeight: 44,
  },
  chip: {
    borderRadius: designTokens.borderRadius.xl,
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    gap: designTokens.spacing.sm,
    alignItems: 'center',
    marginBottom: designTokens.spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: designTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
    fontSize: designTokens.typography.fontSize.sm,
    color: '#212121',
  },
  sliderContainer: {
    marginVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.sm,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: designTokens.spacing.xs,
  },
  sliderLabel: {
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.medium,
    color: '#757575',
  },
  numberRow: {
    flexDirection: 'row',
    gap: designTokens.spacing.sm,
    marginTop: designTokens.spacing.sm,
  },
});

export default ListingFilters;
