import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ToastAndroid } from 'react-native';
import customFetch, { checkForUnauthorizedResponse } from '../../utils/axios';
import { customD, getErrorMessage } from '../../utils/globals';
import { leaveReview } from '../reviews/reviewsSlice';
import { categoryOption, Houses, sortOptions, UIEstateDocument } from './types';

const initialState: Houses = {
  hasMore: true,
  isLoading: false,
  houses: [],
  filteredHouses: [],
  singleHouse: null,
  singleHouseWithComments: null,
  featuredAds: [],
  userAds: [],
  userAdsTotal: 0,
  userAdsPage: 1,
  numOfUserAdsPages: 0,
  page: 1,
  userPage: 1,
  search: '',
  isRefreshing: false,
  sort: sortOptions.Newest,
  sortOption: Object.values(sortOptions),
  category: categoryOption.All,
  categoryOptions: Object.values(categoryOption),
  totalAds: 0,
  numOfPages: 0,
  error: null,
  currentLocation: null,
  manualLocation: null,
  listingType: 'sale',
  distance: 10,
};

// ============================================================================
// HELPER FUNCTIONS FOR DUPLICATE PREVENTION
// ============================================================================

// Get unique ID from estate document
const getEstateId = (estate: UIEstateDocument): string => {
  if (estate._id) return String(estate._id);
  if (estate.id) return String(estate.id);
  return '';
};

// Merge arrays without duplicates
const mergeUniqueEstates = (
  existing: UIEstateDocument[],
  incoming: UIEstateDocument[]
): UIEstateDocument[] => {
  const map = new Map<string, UIEstateDocument>();

  // Add existing items
  existing.forEach((item) => {
    const id = getEstateId(item);
    if (id) map.set(id, item);
  });

  // Add incoming items (will overwrite if duplicate)
  incoming.forEach((item) => {
    const id = getEstateId(item);
    if (id) map.set(id, item);
  });

  return Array.from(map.values());
};

// Validate coordinates
const isValidCoordinates = (location: any): boolean => {
  if (!location) return false;
  const { latitude, longitude } = location;
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

export const createAd = createAsyncThunk(
  'estate/create',
  async (
    { data, onUploadProgress }: { data: any; onUploadProgress?: any },
    thunkApi
  ) => {
    try {
      console.log(`====data=====`);
      console.log(data);
      console.log(`====data=====`);
      const listing = customD(data);
      console.log(`====listing===`);
      console.log(listing);
      console.log(`====listing===`);
      const response: any = await customFetch.post('estate', listing, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progress: any) =>
          onUploadProgress(progress.loaded / progress.total),
      });
      if (!response.ok) {
        return checkForUnauthorizedResponse(response, thunkApi);
      }

      return response.data;
    } catch (error: any) {
      console.log('❌ Caught error in thunk:', error);
      const errorMessage = getErrorMessage(error);
      console.log('📢 Returning error message:', errorMessage);
      return thunkApi.rejectWithValue(errorMessage);
    }
  }
);

export const retrieveNearbyEstates = createAsyncThunk(
  'estate/nearby',
  async (_, thunkApi: any) => {
    const {
      currentLocation,
      distance,
      listingType,
      page,
      minPrice,
      maxPrice,
      furnished,
      bedrooms,
      bathrooms,
    } = thunkApi.getState().ESTATE;

    const params: any = {
      page: String(page),
      distance: String(distance),
    };

    if (isValidCoordinates(currentLocation)) {
      params.latitude = String(currentLocation.latitude);
      params.longitude = String(currentLocation.longitude);
    }

    if (listingType) params.type = listingType;
    if (minPrice) params.minPrice = String(minPrice);
    if (maxPrice) params.maxPrice = String(maxPrice);
    if (furnished !== undefined) params.furnished = String(furnished);
    if (bedrooms) params.bedrooms = String(bedrooms);
    if (bathrooms) params.bathrooms = String(bathrooms);

    const urlParams = new URLSearchParams(params);
    const url = `estate/nearby?${urlParams.toString()}`;

    try {
      const response = await customFetch.get(url);
      return response.data;
    } catch (error: any) {
      console.log('❌ Caught error in thunk:', error);
      const errorMessage = getErrorMessage(error);
      console.log('📢 Returning error message:', errorMessage);
      return thunkApi.rejectWithValue(errorMessage);
    }
  }
);

export const retrieveRentalEstates = createAsyncThunk(
  'estate/rent',
  async (_, thunkApi: any) => {
    const {
      search,
      page,
      sort,
      distance,
      minPrice,
      maxPrice,
      furnished,
      bedrooms,
      bathrooms,
      currentLocation,
    } = thunkApi.getState().ESTATE;

    const params: any = {
      sort,
      page: String(page),
      distance: String(distance),
    };

    if (search) params.search = search;
    if (isValidCoordinates(currentLocation)) {
      params.latitude = String(currentLocation.latitude);
      params.longitude = String(currentLocation.longitude);
    }
    if (minPrice) params.minPrice = String(minPrice);
    if (maxPrice) params.maxPrice = String(maxPrice);
    if (furnished !== undefined) params.furnished = String(furnished);
    if (bedrooms) params.bedrooms = String(bedrooms);
    if (bathrooms) params.bathrooms = String(bathrooms);

    const urlParams = new URLSearchParams(params);
    const url = `estate/rent?${urlParams.toString()}`;

    try {
      const response = await customFetch.get(url);
      return response.data;
    } catch (error: any) {
      console.log('❌ Caught error in thunk:', error);
      const errorMessage = getErrorMessage(error);
      console.log('📢 Returning error message:', errorMessage);
      return thunkApi.rejectWithValue(errorMessage);
    }
  }
);

export const searchEstates = createAsyncThunk(
  'estate/search',
  async (_, thunkApi: any) => {
    const {
      search,
      page,
      sort,
      listingType,
      distance,
      minPrice,
      maxPrice,
      furnished,
      bedrooms,
      bathrooms,
      currentLocation,
      manualLocation,
    } = thunkApi.getState().ESTATE;

    const location = manualLocation || currentLocation;

    if (!isValidCoordinates(location)) {
      return thunkApi.rejectWithValue(
        'Please enable location services or set a location manually'
      );
    }

    const params: any = {
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      sort,
      page: String(page),
      distance: String(distance),
    };

    if (search) params.search = search;
    if (listingType) params.type = listingType;
    if (minPrice) params.minPrice = String(minPrice);
    if (maxPrice) params.maxPrice = String(maxPrice);
    if (furnished !== undefined) params.furnished = String(furnished);
    if (bedrooms) params.bedrooms = String(bedrooms);
    if (bathrooms) params.bathrooms = String(bathrooms);

    const urlParams = new URLSearchParams(params);
    const url = `estate/search?${urlParams.toString()}`;

    try {
      const response = await customFetch.get(url);
      return response.data;
    } catch (error: any) {
      console.log('❌ Caught error in thunk:', error);
      const errorMessage = getErrorMessage(error);
      console.log('📢 Returning error message:', errorMessage);
      return thunkApi.rejectWithValue(errorMessage);
    }
  }
);

export const retrieveAllAds = createAsyncThunk<
  any,
  string,
  { rejectValue: any }
>('estate/retrieve-all', async (_, thunkApi: any) => {
  const { search, page, sort, category } = thunkApi.getState().ESTATE;
  const params = new URLSearchParams({
    sort,
    category,
    page: String(page),
    ...(search && { search }),
  });
  const url = `estate?${params.toString()}`;
  try {
    const response = await customFetch.get(url);
    return response.data;
  } catch (error: any) {
    console.log('❌ Caught error in thunk:', error);
    const errorMessage = getErrorMessage(error);
    console.log('📢 Returning error message:', errorMessage);
    return thunkApi.rejectWithValue(errorMessage);
  }
});

export const retrieveFilterAds = createAsyncThunk<
  any,
  string,
  { rejectValue: any }
>('estate/filter-all', async (_, thunkApi: any) => {
  const { search, page, sort, category } = thunkApi.getState().ESTATE;
  const params = new URLSearchParams({
    sort,
    category,
    page: String(page),
    ...(search && { search }),
  });
  const url = `estate?${params.toString()}`;
  try {
    const response = await customFetch.get(url);
    return response.data;
  } catch (error: any) {
    console.log('❌ Caught error in thunk:', error);
    const errorMessage = getErrorMessage(error);
    console.log('📢 Returning error message:', errorMessage);
    return thunkApi.rejectWithValue(errorMessage);
  }
});

export const retrieveAd = createAsyncThunk<any, string, { rejectValue: any }>(
  'estate/retrieve-ad',
  async (productId, thunkApi: any) => {
    try {
      const response = await customFetch.get(`estate/${productId}`);
      return response.data;
    } catch (error: any) {
      console.log('❌ Caught error in thunk:', error);
      const errorMessage = getErrorMessage(error);
      console.log('📢 Returning error message:', errorMessage);
      return thunkApi.rejectWithValue(errorMessage);
    }
  }
);

export const retrieveAdWithComments = createAsyncThunk<
  any,
  string,
  { rejectValue: any }
>('estate/retrieve-ad-with-comments', async (productId, thunkApi) => {
  try {
    const response = await customFetch.get(`estate/${productId}/reviews`);
    return response.data;
  } catch (error: any) {
    console.log('❌ Caught error in thunk:', error);
    const errorMessage = getErrorMessage(error);
    console.log('📢 Returning error message:', errorMessage);
    return thunkApi.rejectWithValue(errorMessage);
  }
});

export const retrieveUserAds = createAsyncThunk(
  'estate/retrieve-user-ads',
  async (_, thunkApi: any) => {
    const { userPage, sort, category } = thunkApi.getState().ESTATE;
    const params = new URLSearchParams({
      sort,
      category,
      page: String(userPage),
    });
    let url = `estate/user-ads?${params.toString()}`;
    try {
      const response = await customFetch.get(url);
      return response.data;
    } catch (error: any) {
      console.log('❌ Caught error in thunk:', error);
      const errorMessage = getErrorMessage(error);
      console.log('📢 Returning error message:', errorMessage);
      return thunkApi.rejectWithValue(errorMessage);
    }
  }
);

export const updateAd = createAsyncThunk(
  'estate/update-ad',
  async (data: any, thunkApi) => {
    try {
      const listing = customD(data);
      const response = await customFetch.put(
        `estate/update-ad/${data.id}`,
        listing,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      if (!response.ok) {
        throw new Error(response.originalError.message);
      }
      return response.data;
    } catch (error: any) {
      console.log('❌ Caught error in thunk:', error);
      const errorMessage = getErrorMessage(error);
      console.log('📢 Returning error message:', errorMessage);
      return thunkApi.rejectWithValue(errorMessage);
    }
  }
);

export const deleteAd = createAsyncThunk(
  'estate/remove-ad',
  async (productId, thunkApi) => {
    try {
      const response = await customFetch.delete(`estate/${productId}`);
      return response.data;
    } catch (error: any) {
      console.log('❌ Caught error in thunk:', error);
      const errorMessage = getErrorMessage(error);
      console.log('📢 Returning error message:', errorMessage);
      return thunkApi.rejectWithValue(errorMessage);
    }
  }
);

export const markAdAsTaken = createAsyncThunk(
  'estate/taken',
  async (productId, thunkApi) => {
    try {
      const response = await customFetch.patch(`estate/${productId}`);
      return response.data;
    } catch (error: any) {
      console.log('❌ Caught error in thunk:', error);
      const errorMessage = getErrorMessage(error);
      console.log('📢 Returning error message:', errorMessage);
      return thunkApi.rejectWithValue(errorMessage);
    }
  }
);

export const updateUserLocation = createAsyncThunk(
  'user/update-location',
  async (locationData: { latitude: number; longitude: number }, thunkApi) => {
    try {
      const response = await customFetch.patch('user/location', locationData);
      return response.data;
    } catch (error: any) {
      console.log('❌ Caught error in thunk:', error);
      const errorMessage = getErrorMessage(error);
      console.log('📢 Returning error message:', errorMessage);
      return thunkApi.rejectWithValue(errorMessage);
    }
  }
);

export const updateUserManualLocation = createAsyncThunk(
  'user/update-manual-location',
  async (
    locationData: {
      latitude: number;
      longitude: number;
      city?: string;
      country?: string;
    },
    thunkApi
  ) => {
    try {
      const response = await customFetch.patch(
        'user/manual-location',
        locationData
      );
      return response.data;
    } catch (error: any) {
      console.log('❌ Caught error in thunk:', error);
      const errorMessage = getErrorMessage(error);
      console.log('📢 Returning error message:', errorMessage);
      return thunkApi.rejectWithValue(errorMessage);
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const estateSlice = createSlice({
  name: 'ESTATE',
  initialState,
  reducers: {
    handleChange: (state: any, { payload: { name, value } }) => {
      state.page = 1;
      state[name] = value;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    clearFilters: (state) => {
      return { ...state };
    },
    resetAds: (state) => {
      state.houses = [];
      state.page = 1;
      state.hasMore = true;
      state.error = null;
    },
    setIsReFreshing: (state, action) => {
      state.isRefreshing = action.payload;
    },
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
      state.page = 1;
      state.houses = [];
    },
    setManualLocation: (state, action) => {
      state.manualLocation = action.payload;
      state.page = 1;
      state.houses = [];
    },
    clearManualLocation: (state) => {
      state.manualLocation = null;
      state.page = 1;
      state.houses = [];
    },
    setListingType: (state, action) => {
      state.listingType = action.payload;
      state.page = 1;
      state.houses = [];
    },
    setDistance: (state, action) => {
      state.distance = action.payload;
      state.page = 1;
      state.houses = [];
    },
    setPriceRange: (state, action) => {
      state.minPrice = action.payload.minPrice;
      state.maxPrice = action.payload.maxPrice;
      state.page = 1;
      state.houses = [];
    },
    setFurnished: (state, action) => {
      state.furnished = action.payload;
      state.page = 1;
      state.houses = [];
    },
    setBedrooms: (state, action) => {
      state.bedrooms = action.payload;
      state.page = 1;
      state.houses = [];
    },
    setBathrooms: (state, action) => {
      state.bathrooms = action.payload;
      state.page = 1;
      state.houses = [];
    },
    clearAllFilters: (state) => {
      state.listingType = 'sale';
      state.distance = 10;
      state.minPrice = undefined;
      state.maxPrice = undefined;
      state.furnished = undefined;
      state.bedrooms = undefined;
      state.bathrooms = undefined;
      state.page = 1;
      state.houses = [];
    },
    removeAd: (state, action) => {
      const idToRemove = action.payload;
      state.userAds = state.userAds.filter(
        (ad: any) => getEstateId(ad) !== idToRemove
      );
      state.houses = state.houses.filter(
        (ad: any) => getEstateId(ad) !== idToRemove
      );
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // CREATE AD
    builder
      .addCase(createAd.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAd.fulfilled, (state, action: any) => {
        state.isLoading = false;
        ToastAndroid.showWithGravity('Ad created successfully', 15000, 0);
      })
      .addCase(createAd.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
        ToastAndroid.showWithGravity(
          `Error creating ad: ${action.payload}`,
          15000,
          0
        );
      });

    // RETRIEVE ALL ADS
    builder
      .addCase(retrieveAllAds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(retrieveAllAds.fulfilled, (state: any, action: any) => {
        const { totalAds, numOfPages, ads = [] } = action.payload;

        if (ads.length === 0) {
          state.hasMore = false;
        } else {
          // Merge without duplicates
          state.houses = mergeUniqueEstates(state.houses, ads);
          state.totalAds = totalAds;
          state.numOfPages = numOfPages;
          state.page += 1;
          state.featuredAds = state.houses.filter(
            (item: UIEstateDocument) => item.featured
          );
        }

        state.isLoading = false;
      })
      .addCase(retrieveAllAds.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
        ToastAndroid.showWithGravity(
          `Error retrieving ads: ${action.payload}`,
          15000,
          0
        );
      });

    // RETRIEVE FILTER ADS
    builder
      .addCase(retrieveFilterAds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(retrieveFilterAds.fulfilled, (state: any, action: any) => {
        const { filteredAds } = action.payload;
        state.isLoading = false;
        state.filteredHouses = filteredAds;
      })
      .addCase(retrieveFilterAds.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
        ToastAndroid.showWithGravity(
          `Error retrieving ads: ${action.payload}`,
          15000,
          0
        );
      });

    // RETRIEVE AD
    builder
      .addCase(retrieveAd.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(retrieveAd.fulfilled, (state, action) => {
        state.isLoading = false;
        const { ad }: any = action.payload;
        state.singleHouse = ad;
      })
      .addCase(retrieveAd.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
        ToastAndroid.showWithGravity(
          `Error retrieving ad: ${action.payload}`,
          15000,
          0
        );
      });

    // RETRIEVE AD WITH COMMENTS
    builder
      .addCase(retrieveAdWithComments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(retrieveAdWithComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.singleHouseWithComments = action.payload;
      })
      .addCase(retrieveAdWithComments.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
        ToastAndroid.showWithGravity(
          `Error retrieving ad: ${action.payload}`,
          15000,
          0
        );
      });

    // RETRIEVE USER ADS
    builder
      .addCase(retrieveUserAds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(retrieveUserAds.fulfilled, (state: any, action) => {
        const { totalAds, numOfPages, ads = [] } = action.payload;

        if (ads.length === 0) {
          state.hasMore = false;
        } else {
          // Merge without duplicates
          state.userAds = mergeUniqueEstates(state.userAds, ads);
          state.numOfUserAdsPages = numOfPages;
          state.userAdsTotal = totalAds;
          state.userPage += 1;
        }

        state.isLoading = false;
      })
      .addCase(retrieveUserAds.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
        ToastAndroid.showWithGravity(
          `Error retrieving ad: ${action.payload.msg || action.payload}`,
          15000,
          0
        );
      });

    // UPDATE AD
    builder
      .addCase(updateAd.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAd.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.houses = action.payload;
      })
      .addCase(updateAd.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
        ToastAndroid.showWithGravity(
          `Error updating ad: ${action.payload}`,
          15000,
          0
        );
      });

    // DELETE AD
    builder
      .addCase(deleteAd.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAd.fulfilled, (state, action: any) => {
        state.isLoading = false;
        ToastAndroid.showWithGravity(
          action.payload.msg || `Success! Ad removed from the list`,
          15000,
          0
        );
      })
      .addCase(deleteAd.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
        ToastAndroid.showWithGravity(
          `Error deleting ad: ${action.payload}`,
          15000,
          0
        );
      });

    // MARK AD AS TAKEN
    builder
      .addCase(markAdAsTaken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAdAsTaken.fulfilled, (state, action: any) => {
        state.isLoading = false;
        ToastAndroid.showWithGravity(
          action.payload.msg || `Success! Ad marked as taken`,
          15000,
          0
        );
      })
      .addCase(markAdAsTaken.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
        ToastAndroid.showWithGravity(
          `Error changing ad status: ${action.payload}`,
          15000,
          0
        );
      });

    // LEAVE REVIEW
    builder
      .addCase(leaveReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(leaveReview.fulfilled, (state, action) => {
        state.isLoading = false;
        const { review, houseId } = action.payload;

        const index = state.houses.findIndex((h) => getEstateId(h) === houseId);

        if (index !== -1) {
          const existingHouse: UIEstateDocument | any = state.houses[index];
          const numOfReviews = (existingHouse.numOfReviews || 0) + 1;
          const rating = review.rating || 0;

          const totalRating =
            (existingHouse.average_rating || 0) * (numOfReviews - 1) + rating;

          const updatedHouse = {
            ...existingHouse,
            numOfReviews,
            average_rating: totalRating / numOfReviews,
            reviews: Array.isArray(existingHouse.reviews)
              ? [...existingHouse.reviews, review]
              : [review],
          };

          state.houses[index] = updatedHouse;
        }

        const updateSingleHouse = (house: any) => {
          if (house && getEstateId(house) === houseId) {
            house.numOfReviews = (house.numOfReviews || 0) + 1;

            if (typeof house.average_rating === 'number' && review.rating) {
              const totalRating =
                house.average_rating * (house.numOfReviews - 1) + review.rating;
              house.average_rating = totalRating / house.numOfReviews;
            }

            if (Array.isArray(house.reviews)) {
              house.reviews.push(review);
            }
          }
        };

        updateSingleHouse(state.singleHouse);
        updateSingleHouse(state.singleHouseWithComments);
      })
      .addCase(leaveReview.rejected, (state, action: any) => {
        state.isLoading = false;
      });

    // UPDATE USER LOCATION
    builder
      .addCase(updateUserLocation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserLocation.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateUserLocation.rejected, (state, action: any) => {
        state.isLoading = false;
        ToastAndroid.showWithGravity(
          `Error updating location: ${action.payload}`,
          15000,
          0
        );
      });

    // UPDATE USER MANUAL LOCATION
    builder
      .addCase(updateUserManualLocation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserManualLocation.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateUserManualLocation.rejected, (state, action: any) => {
        state.isLoading = false;
        ToastAndroid.showWithGravity(
          `Error updating manual location: ${action.payload}`,
          15000,
          0
        );
      });

    // RETRIEVE NEARBY ESTATES
    builder
      .addCase(retrieveNearbyEstates.pending, (state) => {
        if (state.page === 1) {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(retrieveNearbyEstates.fulfilled, (state, action: any) => {
        state.isLoading = false;
        const {
          ads = [],
          numOfPages = 0,
          total = 0,
          page: currentPage = 1,
        } = action.payload || {};

        if (currentPage === 1) {
          // First page - replace all
          state.houses = ads;
        } else {
          // Subsequent pages - merge without duplicates
          state.houses = mergeUniqueEstates(state.houses, ads);
        }

        state.numOfPages = numOfPages;
        state.totalAds = total;
        state.hasMore = currentPage < numOfPages;
        state.page = currentPage + 1;

        state.featuredAds = state.houses.filter(
          (item: UIEstateDocument) => item.featured
        );
      })
      .addCase(retrieveNearbyEstates.rejected, (state, action: any) => {
        state.isLoading = false;
        state.hasMore = false;
        state.error = action.payload;
        ToastAndroid.showWithGravity(`Error: ${action.payload}`, 15000, 0);
      });

    // RETRIEVE RENTAL ESTATES
    builder
      .addCase(retrieveRentalEstates.pending, (state) => {
        if (state.page === 1) {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(retrieveRentalEstates.fulfilled, (state, action: any) => {
        state.isLoading = false;
        const {
          ads = [],
          numOfPages = 0,
          total = 0,
          page: currentPage = 1,
        } = action.payload || {};

        if (currentPage === 1) {
          state.houses = ads;
        } else {
          state.houses = mergeUniqueEstates(state.houses, ads);
        }

        state.numOfPages = numOfPages;
        state.totalAds = total;
        state.hasMore = currentPage < numOfPages;
        state.page = currentPage + 1;
      })
      .addCase(retrieveRentalEstates.rejected, (state, action: any) => {
        state.isLoading = false;
        state.hasMore = false;
        state.error = action.payload;
        ToastAndroid.showWithGravity(`Error: ${action.payload}`, 15000, 0);
      });

    // SEARCH ESTATES
    builder
      .addCase(searchEstates.pending, (state) => {
        if (state.page === 1) {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(searchEstates.fulfilled, (state, action: any) => {
        state.isLoading = false;
        const {
          ads = [],
          numOfPages = 0,
          total = 0,
          page: currentPage = 1,
        } = action.payload || {};

        if (currentPage === 1) {
          state.houses = ads;
        } else {
          state.houses = mergeUniqueEstates(state.houses, ads);
        }

        state.numOfPages = numOfPages;
        state.totalAds = total;
        state.hasMore = currentPage < numOfPages;
        state.page = currentPage + 1;
      })
      .addCase(searchEstates.rejected, (state, action: any) => {
        state.isLoading = false;
        state.hasMore = false;
        state.error = action.payload;
        ToastAndroid.showWithGravity(`Error: ${action.payload}`, 15000, 0);
      });
  },
});

export const {
  handleChange,
  setPage,
  clearFilters,
  resetAds,
  setIsReFreshing,
  removeAd,
  setCurrentLocation,
  setManualLocation,
  clearManualLocation,
  setListingType,
  setDistance,
  setPriceRange,
  setFurnished,
  setBedrooms,
  setBathrooms,
  clearAllFilters,
  clearError,
} = estateSlice.actions;
export default estateSlice.reducer;
