import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  useWindowDimensions,
  View,
} from 'react-native';
import { Slider } from 'react-native-elements';
import {
  ActivityIndicator,
  Button,
  Chip,
  FAB,
  Searchbar,
  useTheme,
} from 'react-native-paper';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Carousel, {
  ICarouselInstance,
  Pagination,
} from 'react-native-reanimated-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootEstateState } from '../../../store';
import { ListSkeleton } from '../../components/custom/SkeletonLoader';
import {
  EmptyState,
  ErrorState,
} from '../../components/custom/StateComponents';
import Estate from '../../components/Estate';
import EstateContainer from '../../components/EstateContainer';
import {
  clearError,
  resetAds,
  retrieveNearbyEstates,
  setCurrentLocation,
  setDistance,
  setListingType,
} from '../../features/estate/estateSlice';
import { designTokens } from '../../utils/designTokens';

const Home = React.memo(() => {
  const theme = useTheme();
  const {
    isLoading,
    houses,
    hasMore,
    page,
    featuredAds,
    error,
    currentLocation,
    listingType,
    fetchMode,
    nearbyExhausted,
    distance,
  } = useSelector((store: RootEstateState) => store.ESTATE);
  const dispatch = useDispatch<AppDispatch>();

  const carouselRef = useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const fabScale = useSharedValue(1);

  const navigation: any = useNavigation();
  const { width } = useWindowDimensions();

  // Entrance animation
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  useEffect(() => {
    fadeAnim.value = withTiming(1, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    });
    slideAnim.value = withTiming(0, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    });
  }, []);

  // Request location
  const requestLocationPermission = useCallback(async () => {
    setIsRequestingLocation(true);
    setLocationError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLocationError('Location access is needed to show nearby properties');
        setIsRequestingLocation(false);
        return false;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (location && location.coords) {
        dispatch(
          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          })
        );
        setLocationError(null);
        return true;
      }
    } catch (error: any) {
      console.error('Error getting location:', error);
      setLocationError('Unable to get your location. Please try again.');
    } finally {
      setIsRequestingLocation(false);
    }
    return false;
  }, [dispatch]);

  useEffect(() => {
    if (!currentLocation) {
      requestLocationPermission();
    }
  }, []);

  const onPressPagination = useCallback(
    (index: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      carouselRef.current?.scrollTo({
        count: index - progress.value,
        animated: true,
      });
    },
    [progress]
  );

  const handleScrollEndReached = useCallback(() => {
    if (!isLoading && hasMore && houses.length > 0) {
      if (nearbyExhausted && fetchMode === 'all' && page === 1) {
        ToastAndroid.show(
          '🌍 Loading properties from all areas...',
          ToastAndroid.LONG
        );
      }
      dispatch(retrieveNearbyEstates());
    }
  }, [
    isLoading,
    hasMore,
    houses.length,
    nearbyExhausted,
    fetchMode,
    page,
    dispatch,
  ]);

  const onRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRefreshing(true);
    dispatch(clearError());
    dispatch(resetAds());

    try {
      if (!currentLocation) {
        await requestLocationPermission();
      }
      await dispatch(retrieveNearbyEstates()).unwrap();
    } catch (error) {
      if (__DEV__) console.warn(`Error fetching nearby estates: ${error}`);
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch, currentLocation, requestLocationPermission]);

  const handleRetry = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(clearError());

    if (!currentLocation) {
      const hasLocation = await requestLocationPermission();
      if (!hasLocation) return;
    }

    dispatch(resetAds());
    dispatch(retrieveNearbyEstates());
  }, [dispatch, currentLocation, requestLocationPermission]);

  const handleSearchPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('search');
  }, [navigation]);

  const handleEnableLocation = useCallback(async () => {
    const hasLocation = await requestLocationPermission();
    if (hasLocation) {
      dispatch(resetAds());
      dispatch(retrieveNearbyEstates());
    }
  }, [requestLocationPermission, dispatch]);

  const handleListingTypeChange = useCallback(
    (type: 'rent' | 'sale' | 'all') => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      dispatch(setListingType(type));
      dispatch(resetAds());
      dispatch(retrieveNearbyEstates());
    },
    [dispatch]
  );

  const toggleFilters = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFilters((prev) => !prev);
  }, []);

  // Get mode indicator text
  const getModeIndicator = () => {
    if (isLoading && page === 1) {
      return '⏳ Loading...';
    }

    if (fetchMode === 'nearby' && !nearbyExhausted) {
      return '📍 Nearby Properties';
    } else if (fetchMode === 'all' || nearbyExhausted) {
      return '🌍 All Properties';
    }

    return currentLocation ? '📍 Nearby Properties' : '🌍 All Properties';
  };

  // Load data when screen is focused
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        try {
          await dispatch(retrieveNearbyEstates()).unwrap();
        } catch (error: any) {
          if (__DEV__) console.warn(`Error fetching nearby estates: ${error}`);
        } finally {
          if (isActive) setIsInitialLoad(false);
        }
      };

      if (houses.length === 0 && !error) {
        loadData();
      } else {
        setIsInitialLoad(false);
      }

      return () => {
        isActive = false;
      };
    }, [houses.length, error, dispatch])
  );

  const styles = createStyles(theme);

  // Location permission request screen
  if (locationError && !currentLocation && !isInitialLoad) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <Animated.View style={[styles.content, animatedStyle]}>
          <View style={styles.modernHeader}>
            <Text style={styles.logoText}>EstateHub</Text>
          </View>

          <View style={styles.centerContent}>
            <EmptyState
              icon='📍'
              title='Location Required'
              description={locationError}
              action={{
                label: isRequestingLocation
                  ? 'Requesting...'
                  : 'Enable Location',
                onPress: handleEnableLocation,
                disabled: isRequestingLocation,
              }}
              style={styles.emptyState}
            />
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (!isLoading && !isInitialLoad && houses.length === 0 && !error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <Animated.View style={[styles.content, animatedStyle]}>
          <View style={styles.modernHeader}>
            <Text style={styles.logoText}>EstateHub</Text>
          </View>

          <EmptyState
            icon='🏠'
            title='No Properties Found'
            description="We couldn't find any properties in your area right now. Try adjusting your search criteria or check back later."
            action={{
              label: 'Search Properties',
              onPress: handleSearchPress,
            }}
            style={styles.emptyState}
          />
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !isLoading && houses.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <Animated.View style={[styles.content, animatedStyle]}>
          <View style={styles.modernHeader}>
            <Text style={styles.logoText}>EstateHub</Text>
          </View>

          <ErrorState
            error={
              typeof error === 'string' ? error : 'Unable to load properties'
            }
            onRetry={handleRetry}
            style={styles.errorState}
          />
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <Animated.View style={[styles.content, animatedStyle]}>
        <FlashList
          data={houses}
          ListHeaderComponent={() => (
            <>
              {/* Modern Header */}
              <View style={styles.modernHeader}>
                <View style={styles.headerTop}>
                  <View style={styles.headerLeft}>
                    <Text style={styles.logoText}>EstateHub</Text>
                    <Text style={styles.locationText}>
                      {getModeIndicator()}
                    </Text>
                  </View>
                </View>

                {fetchMode === 'all' && nearbyExhausted && (
                  <View style={styles.modeIndicator}>
                    <Chip
                      icon='earth'
                      style={styles.modeChip}
                      textStyle={styles.modeChipText}
                    >
                      Showing all properties
                    </Chip>
                  </View>
                )}

                {/* Search Bar */}
                <Searchbar
                  placeholder='Search by location, type...'
                  onChangeText={setSearchQuery}
                  value={searchQuery}
                  onIconPress={handleSearchPress}
                  onSubmitEditing={handleSearchPress}
                  style={styles.searchBar}
                  inputStyle={styles.searchInput}
                  iconColor={theme.colors.primary}
                />

                {/* Distance Slider */}
                <View style={styles.distanceSlider}>
                  <Text style={styles.filterLabel}>
                    Search Radius: {distance}km
                  </Text>
                  <Slider
                    value={distance}
                    onValueChange={(value) => {
                      dispatch(setDistance(value));
                      dispatch(resetAds());
                    }}
                    onSlidingComplete={() => {
                      dispatch(retrieveNearbyEstates());
                    }}
                    minimumValue={5}
                    maximumValue={100}
                    step={5}
                    thumbTintColor={theme.colors.primary}
                    minimumTrackTintColor={theme.colors.primary}
                    maximumTrackTintColor={theme.colors.surfaceVariant}
                  />
                </View>

                {/* Filter Chips */}
                <View style={styles.filterChipsContainer}>
                  <Chip
                    selected={!listingType || listingType === 'all'}
                    onPress={() => handleListingTypeChange('all')}
                    style={[
                      styles.filterChip,
                      (!listingType || listingType === 'all') &&
                        styles.filterChipActive,
                    ]}
                    textStyle={
                      !listingType || listingType === 'all'
                        ? styles.filterChipTextActive
                        : styles.filterChipText
                    }
                    mode={
                      !listingType || listingType === 'all'
                        ? 'flat'
                        : 'outlined'
                    }
                  >
                    All
                  </Chip>
                  <Chip
                    selected={listingType === 'sale'}
                    onPress={() => handleListingTypeChange('sale')}
                    style={[
                      styles.filterChip,
                      listingType === 'sale' && styles.filterChipActive,
                    ]}
                    textStyle={
                      listingType === 'sale'
                        ? styles.filterChipTextActive
                        : styles.filterChipText
                    }
                    mode={listingType === 'sale' ? 'flat' : 'outlined'}
                  >
                    For Sale
                  </Chip>
                  <Chip
                    selected={listingType === 'rent'}
                    onPress={() => handleListingTypeChange('rent')}
                    style={[
                      styles.filterChip,
                      listingType === 'rent' && styles.filterChipActive,
                    ]}
                    textStyle={
                      listingType === 'rent'
                        ? styles.filterChipTextActive
                        : styles.filterChipText
                    }
                    mode={listingType === 'rent' ? 'flat' : 'outlined'}
                  >
                    For Rent
                  </Chip>
                  <Chip
                    icon='tune'
                    onPress={toggleFilters}
                    style={styles.filterChip}
                    textStyle={styles.filterChipText}
                    mode='outlined'
                  >
                    Filters
                  </Chip>
                </View>
              </View>

              {/* Featured Section */}
              {isInitialLoad ? (
                <ListSkeleton count={3} showHeader={false} />
              ) : (
                Array.isArray(featuredAds) &&
                featuredAds.length > 0 && (
                  <View style={styles.featuredSection}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>
                        ✨ Featured Properties
                      </Text>
                    </View>
                    <Carousel
                      ref={carouselRef}
                      autoPlay
                      autoPlayInterval={4000}
                      width={width - designTokens.spacing.md * 2}
                      height={(width - designTokens.spacing.md * 2) * 0.6}
                      data={featuredAds}
                      scrollAnimationDuration={5000}
                      style={styles.carousel}
                      onProgressChange={progress}
                      renderItem={({ item, index }) => (
                        <Estate
                          items={item}
                          style={styles.carouselItem}
                          index={index}
                        />
                      )}
                    />
                    <Pagination.Basic
                      progress={progress}
                      data={featuredAds}
                      dotStyle={styles.paginationDot}
                      activeDotStyle={styles.paginationDotActive}
                      containerStyle={styles.paginationContainer}
                      onPress={onPressPagination}
                    />

                    {/* All Properties Header */}
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>All Properties</Text>
                      <Text style={styles.propertyCount}>
                        {houses.length} listings
                      </Text>
                    </View>
                  </View>
                )
              )}
            </>
          )}
          keyExtractor={(item) => String(item.id ?? item._id)}
          renderItem={({ item, index }) => (
            <EstateContainer items={item} style={styles.listItem} />
          )}
          estimatedItemSize={200}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
              title='Pull to refresh'
              titleColor={theme.colors.onSurfaceVariant}
            />
          }
          contentContainerStyle={styles.scrollableContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleScrollEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => {
            if (!hasMore) {
              return (
                <View style={styles.endMessage}>
                  <Text style={styles.endText}>
                    🎉 You've seen all properties!
                  </Text>
                </View>
              );
            }

            if (isLoading && houses.length > 0) {
              const loadingMessage =
                fetchMode === 'all' && nearbyExhausted
                  ? 'Loading properties from all areas...'
                  : fetchMode === 'nearby'
                  ? 'Loading nearby properties...'
                  : 'Loading more properties...';

              return (
                <View style={styles.footerLoader}>
                  <ActivityIndicator
                    size='small'
                    color={theme.colors.primary}
                  />
                  <Text style={styles.loadingText}>{loadingMessage}</Text>
                </View>
              );
            }

            return null;
          }}
        />

        {/* Floating Action Button */}
        <Animated.View style={[styles.fabContainer, fabStyle]}>
          <FAB
            icon='magnify'
            style={styles.fab}
            color={theme.colors.onPrimaryContainer}
            onPress={handleSearchPress}
            label='Search'
            visible={!isLoading}
          />
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
});

Home.displayName = 'Home';

export default Home;

// Dynamic styles that use theme - using designTokens directly
const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
    },
    modernHeader: {
      paddingHorizontal: designTokens.spacing.md,
      paddingTop: designTokens.spacing.md,
      paddingBottom: designTokens.spacing.sm,
      backgroundColor: theme.colors.background,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: designTokens.spacing.md,
    },
    headerLeft: {
      flex: 1,
    },
    logoText: {
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: -0.5,
      marginBottom: 4,
      color: theme.colors.primary,
    },
    modeIndicator: {
      paddingVertical: designTokens.spacing.xs,
      marginBottom: designTokens.spacing.sm,
    },
    modeChip: {
      backgroundColor: theme.colors.secondaryContainer,
    },
    modeChipText: {
      fontSize: 12,
      color: theme.colors.onSecondaryContainer,
    },
    locationText: {
      fontSize: designTokens.typography.fontSize.sm,
      fontWeight: '500',
      color: theme.colors.onSurfaceVariant,
    },
    searchBar: {
      marginBottom: designTokens.spacing.md,
      borderRadius: designTokens.borderRadius.xl,
      backgroundColor: theme.colors.surfaceVariant,
      elevation: 0,
    },
    searchInput: {
      fontSize: designTokens.typography.fontSize.md,
      color: theme.colors.onSurface,
    },
    distanceSlider: {
      marginBottom: designTokens.spacing.md,
    },
    filterLabel: {
      fontSize: designTokens.typography.fontSize.sm,
      fontWeight: designTokens.typography.fontWeight.medium,
      color: theme.colors.onSurfaceVariant,
      marginBottom: designTokens.spacing.xs,
    },
    filterChipsContainer: {
      flexDirection: 'row',
      gap: designTokens.spacing.sm,
      marginBottom: designTokens.spacing.sm,
    },
    filterChip: {
      borderRadius: designTokens.borderRadius.xl,
      borderColor: theme.colors.outline,
    },
    filterChipActive: {
      backgroundColor: theme.colors.primaryContainer,
    },
    filterChipText: {
      color: theme.colors.onSurfaceVariant,
      fontWeight: designTokens.typography.fontWeight.regular,
    },
    filterChipTextActive: {
      color: theme.colors.onPrimaryContainer,
      fontWeight: designTokens.typography.fontWeight.semibold,
    },
    featuredSection: {
      marginBottom: designTokens.spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: designTokens.spacing.md,
      marginBottom: designTokens.spacing.md,
      marginTop: designTokens.spacing.sm,
    },
    sectionTitle: {
      fontSize: designTokens.typography.fontSize.xl,
      fontWeight: designTokens.typography.fontWeight.bold,
      color: theme.colors.onSurface,
    },
    propertyCount: {
      fontSize: designTokens.typography.fontSize.sm,
      fontWeight: designTokens.typography.fontWeight.medium,
      color: theme.colors.onSurfaceVariant,
    },
    carousel: {
      borderRadius: designTokens.borderRadius.lg,
    },
    carouselItem: {
      borderRadius: designTokens.borderRadius.xl,
      elevation: designTokens.elevation.lg,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    paginationContainer: {
      gap: designTokens.spacing.xs,
      marginTop: designTokens.spacing.md,
    },
    paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
      opacity: 0.3,
    },
    paginationDotActive: {
      width: 24,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
      opacity: 1,
    },
    scrollableContent: {
      paddingBottom: designTokens.spacing.xl * 3,
    },
    listItem: {
      marginVertical: designTokens.spacing.xs,
      marginHorizontal: designTokens.spacing.md,
      borderRadius: designTokens.borderRadius.xl,
    },
    endMessage: {
      alignItems: 'center',
      paddingVertical: designTokens.spacing.xl,
      paddingHorizontal: designTokens.spacing.md,
    },
    endText: {
      fontSize: designTokens.typography.fontSize.md,
      fontWeight: designTokens.typography.fontWeight.medium,
      color: theme.colors.onSurfaceVariant,
    },
    footerLoader: {
      alignItems: 'center',
      paddingVertical: designTokens.spacing.lg,
      paddingHorizontal: designTokens.spacing.md,
      gap: designTokens.spacing.sm,
    },
    loadingText: {
      fontSize: designTokens.typography.fontSize.sm,
      color: theme.colors.onSurfaceVariant,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
    },
    errorState: {
      flex: 1,
      justifyContent: 'center',
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fabContainer: {
      position: 'absolute',
      bottom: designTokens.spacing.xl,
      right: designTokens.spacing.md,
    },
    fab: {
      backgroundColor: theme.colors.primaryContainer,
      borderRadius: designTokens.borderRadius.xl,
      elevation: designTokens.elevation.lg,
    },
  });
