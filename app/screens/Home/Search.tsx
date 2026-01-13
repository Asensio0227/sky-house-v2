import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import debounce from 'lodash.debounce';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Chip,
  IconButton,
  Searchbar,
  Text,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { RootEstateState } from '../../../store';
import AppPicker from '../../components/custom/AppPicker';
import EstateContainer from '../../components/EstateContainer';
import ListingFilters from '../../components/ListingFilters';
import {
  clearAllFilters,
  handleChange,
  resetAds,
  searchEstates,
  setListingType,
} from '../../features/estate/estateSlice';
import { designTokens } from '../../utils/designTokens';
import { formatArray } from '../../utils/globals';

const Search = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const {
    search,
    isLoading,
    filteredHouses,
    sort,
    category,
    categoryOptions,
    listingType,
    distance,
    minPrice,
    maxPrice,
    furnished,
    bedrooms,
    bathrooms,
    hasMore,
    error,
  } = useSelector((store: RootEstateState) => store.ESTATE);

  const [cateType, setCateType] = useState(category);
  const [searchTerm, setSearchTerm] = useState(search);
  const [showFilters, setShowFilters] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const cateOptions = formatArray(categoryOptions);
  const dispatch: any = useDispatch();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  const handleSearch = debounce(() => {
    dispatch(handleChange({ name: 'search', value: searchTerm }));
    dispatch(resetAds());
  }, 500);

  useEffect(() => {
    if (isLoading) return;
    dispatch(handleChange({ name: 'category', value: cateType }));
    dispatch(setListingType(listingType));
    dispatch(resetAds());
  }, [cateType, listingType, isLoading, dispatch]);

  useEffect(() => {
    if (isLoading) return;
    handleSearch();
  }, [searchTerm, isLoading, dispatch]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          await dispatch(searchEstates());
        } catch (error: any) {
          console.log(`Error searching estates: ${error}`);
        } finally {
          setIsInitialLoad(false);
        }
      })();
    }, [
      sort,
      category,
      search,
      listingType,
      distance,
      minPrice,
      maxPrice,
      furnished,
      bedrooms,
      bathrooms,
      dispatch,
    ])
  );

  const toggleFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFilters((prev) => !prev);
  };

  const handleClearAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSearchTerm('');
    setCateType('all');
    dispatch(clearAllFilters());
    dispatch(resetAds());
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (cateType !== 'all') count++;
    if (listingType) count++;
    if (minPrice || maxPrice) count++;
    if (furnished !== undefined) count++;
    if (bedrooms) count++;
    if (bathrooms) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <Appbar.Header elevated style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
        />
        <Appbar.Content
          title='Search Properties'
          titleStyle={styles.headerTitle}
        />
        {activeFiltersCount > 0 && (
          <Appbar.Action icon='filter-off' onPress={handleClearAll} />
        )}
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder='Search by location, title...'
              onChangeText={(text) => setSearchTerm(text)}
              value={searchTerm}
              style={[
                styles.searchBar,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
              inputStyle={styles.searchInput}
              iconColor={theme.colors.primary}
            />
          </View>

          {/* Quick Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickFilters}
            contentContainerStyle={styles.quickFiltersContent}
          >
            <Chip
              icon='tune'
              selected={showFilters}
              onPress={toggleFilters}
              style={[
                styles.filterChip,
                showFilters && {
                  backgroundColor: theme.colors.primaryContainer,
                },
              ]}
              textStyle={{
                color: showFilters
                  ? theme.colors.onPrimaryContainer
                  : theme.colors.onSurfaceVariant,
                fontWeight: showFilters ? '700' : '500',
              }}
            >
              All Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Chip>

            <Chip
              selected={listingType === 'sale'}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                dispatch(setListingType('sale'));
              }}
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
                fontWeight: listingType === 'sale' ? '700' : '500',
              }}
            >
              For Sale
            </Chip>

            <Chip
              selected={listingType === 'rent'}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                dispatch(setListingType('rent'));
              }}
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
                fontWeight: listingType === 'rent' ? '700' : '500',
              }}
            >
              For Rent
            </Chip>

            {bedrooms && (
              <Chip
                icon='bed'
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.filterChip,
                  { backgroundColor: theme.colors.secondaryContainer },
                ]}
                textStyle={{
                  color: theme.colors.onSecondaryContainer,
                  fontWeight: '600',
                }}
              >
                {bedrooms}+ Beds
              </Chip>
            )}

            {bathrooms && (
              <Chip
                icon='shower'
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.filterChip,
                  { backgroundColor: theme.colors.secondaryContainer },
                ]}
                textStyle={{
                  color: theme.colors.onSecondaryContainer,
                  fontWeight: '600',
                }}
              >
                {bathrooms}+ Baths
              </Chip>
            )}
          </ScrollView>

          {/* Category Picker */}
          <View style={styles.categoryContainer}>
            <AppPicker
              label=''
              items={cateOptions}
              selectedValue={cateType}
              onValueChange={(value) => setCateType(value)}
              style={[
                styles.categoryPicker,
                { backgroundColor: theme.colors.surface },
              ]}
            />
          </View>

          {/* Results Section */}
          <View style={styles.resultsContainer}>
            {/* Results Header */}
            <View style={styles.resultsHeader}>
              <Text
                style={[styles.resultsTitle, { color: theme.colors.onSurface }]}
              >
                {isLoading && isInitialLoad
                  ? 'Searching...'
                  : `${filteredHouses?.length || 0} Properties Found`}
              </Text>
              {!isLoading && filteredHouses?.length > 0 && (
                <IconButton
                  icon='sort'
                  size={20}
                  iconColor={theme.colors.onSurfaceVariant}
                  onPress={() => {}}
                  style={styles.sortButton}
                />
              )}
            </View>

            {/* Results List */}
            <View style={styles.listWrapper}>
              {isLoading && isInitialLoad ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size='large'
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.loadingText,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Searching properties...
                  </Text>
                </View>
              ) : filteredHouses?.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name='search-outline'
                    size={64}
                    color={theme.colors.onSurfaceVariant}
                    style={styles.emptyIcon}
                  />
                  <Text
                    style={[
                      styles.emptyTitle,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    No Properties Found
                  </Text>
                  <Text
                    style={[
                      styles.emptyDescription,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Try adjusting your filters or search criteria
                  </Text>
                  <Button
                    mode='contained'
                    onPress={handleClearAll}
                    style={styles.clearButton}
                  >
                    Clear All Filters
                  </Button>
                </View>
              ) : (
                <FlashList
                  data={filteredHouses}
                  keyExtractor={(item) => item.id || item._id}
                  renderItem={({ item }) => (
                    <EstateContainer items={item} style={styles.listItem} />
                  )}
                  estimatedItemSize={200}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContent}
                  ListFooterComponent={() =>
                    isLoading && filteredHouses.length > 0 ? (
                      <View style={styles.footerLoader}>
                        <ActivityIndicator
                          size='small'
                          color={theme.colors.primary}
                        />
                      </View>
                    ) : null
                  }
                />
              )}
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Filters Modal */}
      <Modal
        isVisible={showFilters}
        onBackdropPress={toggleFilters}
        onBackButtonPress={toggleFilters}
        style={styles.modal}
        animationIn='slideInUp'
        animationOut='slideOutDown'
        backdropOpacity={0.5}
        useNativeDriver
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text
              style={[styles.modalTitle, { color: theme.colors.onSurface }]}
            >
              Filters
            </Text>
            <IconButton
              icon='close'
              size={24}
              onPress={toggleFilters}
              iconColor={theme.colors.onSurface}
            />
          </View>

          <ScrollView
            style={styles.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            <ListingFilters />
          </ScrollView>

          <View
            style={[
              styles.modalFooter,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Button
              mode='outlined'
              onPress={() => {
                dispatch(clearAllFilters());
                toggleFilters();
              }}
              style={styles.modalButton}
            >
              Clear All
            </Button>
            <Button
              mode='contained'
              onPress={toggleFilters}
              style={styles.modalButton}
            >
              Apply Filters
            </Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: designTokens.spacing.md,
    paddingTop: designTokens.spacing.sm,
    paddingBottom: designTokens.spacing.xs,
  },
  searchBar: {
    borderRadius: designTokens.borderRadius.xl,
    elevation: 0,
  },
  searchInput: {
    fontSize: designTokens.typography.fontSize.md,
  },
  quickFilters: {
    maxHeight: 50,
  },
  quickFiltersContent: {
    paddingHorizontal: designTokens.spacing.md,
    gap: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
  },
  filterChip: {
    borderRadius: designTokens.borderRadius.xl,
    height: 40,
  },
  categoryContainer: {
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.xs,
  },
  categoryPicker: {
    borderRadius: designTokens.borderRadius.lg,
    elevation: 1,
  },
  resultsContainer: {
    flex: 1,
    paddingTop: designTokens.spacing.sm,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sortButton: {
    margin: 0,
  },
  listWrapper: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: designTokens.spacing.md,
    paddingBottom: designTokens.spacing.xl,
  },
  listItem: {
    marginVertical: designTokens.spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: designTokens.spacing.xl * 2,
  },
  loadingText: {
    marginTop: designTokens.spacing.md,
    fontSize: designTokens.typography.fontSize.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: designTokens.spacing.xl,
    paddingVertical: designTokens.spacing.xl * 2,
  },
  emptyIcon: {
    marginBottom: designTokens.spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: designTokens.spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: designTokens.spacing.lg,
    lineHeight: 22,
  },
  clearButton: {
    borderRadius: designTokens.borderRadius.xl,
    minWidth: 160,
  },
  footerLoader: {
    paddingVertical: designTokens.spacing.lg,
    alignItems: 'center',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: designTokens.borderRadius.xl,
    borderTopRightRadius: designTokens.borderRadius.xl,
    maxHeight: '85%',
    paddingBottom: designTokens.spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: designTokens.spacing.md,
    paddingTop: designTokens.spacing.md,
    paddingBottom: designTokens.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalScroll: {
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: designTokens.spacing.sm,
    paddingHorizontal: designTokens.spacing.md,
    paddingTop: designTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalButton: {
    flex: 1,
    borderRadius: designTokens.borderRadius.xl,
  },
});
