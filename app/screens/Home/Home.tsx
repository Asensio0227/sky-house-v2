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
  useWindowDimensions,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Appbar,
  Chip,
  FAB,
  Searchbar,
  useTheme,
} from 'react-native-paper';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Carousel, {
  ICarouselInstance,
  Pagination,
} from 'react-native-reanimated-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootEstateState } from '../../../store';
import Screen from '../../components/custom/Screen';
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
  const headerOpacity = useSharedValue(1);
  const fabScale = useSharedValue(1);

  const navigation: any = useNavigation();
  const { width } = useWindowDimensions();

  // Entrance animation
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
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
      dispatch(retrieveNearbyEstates());
    }
  }, [isLoading, hasMore, houses.length, dispatch]);

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
    (type: 'rent' | 'sale') => {
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

  // Location permission request screen
  if (locationError && !currentLocation && !isInitialLoad) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <StatusBar
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <Animated.View style={[styles.content, animatedStyle]}>
          <View style={styles.modernHeader}>
            <Text style={[styles.logoText, { color: theme.colors.primary }]}>
              EstateHub
            </Text>
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
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <StatusBar
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <Animated.View style={[styles.content, animatedStyle]}>
          <View style={styles.modernHeader}>
            <Text style={[styles.logoText, { color: theme.colors.primary }]}>
              EstateHub
            </Text>
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
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <StatusBar
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <Animated.View style={[styles.content, animatedStyle]}>
          <View style={styles.modernHeader}>
            <Text style={[styles.logoText, { color: theme.colors.primary }]}>
              EstateHub
            </Text>
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      <Animated.View style={[styles.content, animatedStyle]}>
        <FlashList
          data={houses}
          ListHeaderComponent={() => (
            <>
              {/* Modern Header - Now inside scrollable area */}
              <View
                style={[
                  styles.modernHeader,
                  { backgroundColor: theme.colors.background },
                ]}
              >
                <View style={styles.headerTop}>
                  <View style={styles.headerLeft}>
                    <Text
                      style={[styles.logoText, { color: theme.colors.primary }]}
                    >
                      EstateHub
                    </Text>
                    <Text
                      style={[
                        styles.locationText,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      📍{' '}
                      {currentLocation ? 'Nearby Properties' : 'All Properties'}
                    </Text>
                  </View>
                </View>

                {/* Search Bar */}
                <Searchbar
                  placeholder='Search by location, type...'
                  onChangeText={setSearchQuery}
                  value={searchQuery}
                  onIconPress={handleSearchPress}
                  onSubmitEditing={handleSearchPress}
                  style={[
                    styles.searchBar,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      elevation: 0,
                    },
                  ]}
                  inputStyle={styles.searchInput}
                  iconColor={theme.colors.primary}
                />

                {/* Filter Chips */}
                <View style={styles.filterChipsContainer}>
                  <Chip
                    selected={listingType === 'sale'}
                    onPress={() => handleListingTypeChange('sale')}
                    style={[
                      styles.filterChip,
                      listingType === 'sale' && {
                        backgroundColor: theme.colors.primaryContainer,
                      },
                    ]}
                    textStyle={{
                      color:
                        listingType === 'sale'
                          ? theme.colors.onPrimaryContainer
                          : theme.colors.onSurfaceVariant,
                      fontWeight: listingType === 'sale' ? '600' : '400',
                    }}
                    mode={listingType === 'sale' ? 'flat' : 'outlined'}
                  >
                    For Sale
                  </Chip>
                  <Chip
                    selected={listingType === 'rent'}
                    onPress={() => handleListingTypeChange('rent')}
                    style={[
                      styles.filterChip,
                      listingType === 'rent' && {
                        backgroundColor: theme.colors.primaryContainer,
                      },
                    ]}
                    textStyle={{
                      color:
                        listingType === 'rent'
                          ? theme.colors.onPrimaryContainer
                          : theme.colors.onSurfaceVariant,
                      fontWeight: listingType === 'rent' ? '600' : '400',
                    }}
                    mode={listingType === 'rent' ? 'flat' : 'outlined'}
                  >
                    For Rent
                  </Chip>
                  <Chip
                    icon='tune'
                    onPress={toggleFilters}
                    style={styles.filterChip}
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
                      <Text
                        style={[
                          styles.sectionTitle,
                          { color: theme.colors.onSurface },
                        ]}
                      >
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
                      dotStyle={[
                        styles.paginationDot,
                        { backgroundColor: theme.colors.primary },
                      ]}
                      activeDotStyle={[
                        styles.paginationDotActive,
                        { backgroundColor: theme.colors.primary },
                      ]}
                      containerStyle={styles.paginationContainer}
                      onPress={onPressPagination}
                    />

                    {/* All Properties Header */}
                    <View style={styles.sectionHeader}>
                      <Text
                        style={[
                          styles.sectionTitle,
                          { color: theme.colors.onSurface },
                        ]}
                      >
                        All Properties
                      </Text>
                      <Text
                        style={[
                          styles.propertyCount,
                          { color: theme.colors.onSurfaceVariant },
                        ]}
                      >
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
          ListFooterComponent={() =>
            !hasMore ? (
              <View style={styles.endMessage}>
                <Text
                  style={[
                    styles.endText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  You've seen all properties! 🎉
                </Text>
              </View>
            ) : (
              isLoading &&
              houses.length > 0 && (
                <View style={styles.footerLoader}>
                  <ActivityIndicator
                    size='small'
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.loadingText,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Loading more properties...
                  </Text>
                </View>
              )
            )
          }
        />

        {/* Floating Action Button */}
        <Animated.View style={[styles.fabContainer, fabStyle]}>
          <FAB
            icon='magnify'
            style={[
              styles.fab,
              { backgroundColor: theme.colors.primaryContainer },
            ]}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  modernHeader: {
    paddingHorizontal: designTokens.spacing.md,
    paddingTop: designTokens.spacing.md,
    paddingBottom: designTokens.spacing.sm,
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
  },
  locationText: {
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: '500',
  },
  searchBar: {
    marginBottom: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.xl,
    elevation: 0,
  },
  searchInput: {
    fontSize: designTokens.typography.fontSize.md,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    gap: designTokens.spacing.sm,
    marginBottom: designTokens.spacing.sm,
  },
  filterChip: {
    borderRadius: designTokens.borderRadius.xl,
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
  },
  propertyCount: {
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.medium,
  },
  carousel: {
    borderRadius: designTokens.borderRadius.lg,
  },
  carouselItem: {
    borderRadius: designTokens.borderRadius.xl,
    elevation: 6,
    shadowColor: '#000',
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
    opacity: 0.3,
  },
  paginationDotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
    opacity: 1,
  },
  scrollableContent: {
    paddingBottom: designTokens.spacing.xl * 3, // Extra padding for FAB
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
  },
  footerLoader: {
    alignItems: 'center',
    paddingVertical: designTokens.spacing.lg,
    paddingHorizontal: designTokens.spacing.md,
    gap: designTokens.spacing.sm,
  },
  loadingText: {
    fontSize: designTokens.typography.fontSize.sm,
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
    borderRadius: designTokens.borderRadius.xl,
    elevation: 6,
  },
});
