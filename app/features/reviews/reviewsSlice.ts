import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ToastAndroid } from 'react-native';
import customFetch from '../../utils/axios';
import { getErrorMessage } from '../../utils/globals';
import { UIReviewDocument } from './types';

interface Reviews {
  isLoading: boolean;
  reviews: UIReviewDocument[];
  page: number;
  totalReviews: number;
  numOfPages: number;
  hasMore: boolean;
}

const initialState: Reviews = {
  isLoading: false,
  reviews: [],
  page: 1,
  totalReviews: 0,
  numOfPages: 0,
  hasMore: true,
} satisfies Reviews as Reviews;

// ============================================================================
// HELPER FUNCTIONS FOR DUPLICATE PREVENTION
// ============================================================================

// Get unique ID from review document
const getReviewId = (review: UIReviewDocument): string => {
  if (review._id) return String(review._id);
  if (review.id) return String(review.id);
  return '';
};

// Merge arrays without duplicates
const mergeUniqueReviews = (
  existing: UIReviewDocument[],
  incoming: UIReviewDocument[]
): UIReviewDocument[] => {
  const map = new Map<string, UIReviewDocument>();

  // Add existing items
  existing.forEach((item) => {
    const id = getReviewId(item);
    if (id) map.set(id, item);
  });

  // Add incoming items (will overwrite if duplicate)
  incoming.forEach((item) => {
    const id = getReviewId(item);
    if (id) map.set(id, item);
  });

  return Array.from(map.values());
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Create review
export const leaveReview = createAsyncThunk(
  'review/create',
  async (data: any, thunkApi: any) => {
    try {
      const response = await customFetch.post('review', data);
      const newReview: any = response.data;
      return { review: newReview.review, houseId: data.estate };
    } catch (error: any) {
      console.log('❌ Caught error in thunk:', error);
      const errorMessage = getErrorMessage(error);
      console.log('📢 Returning error message:', errorMessage);
      return thunkApi.rejectWithValue(errorMessage);
    }
  }
);

// Retrieve all reviews
export const retrieveAllReviews = createAsyncThunk(
  'review/retrieveAllReviews',
  async (_, thunkApi: any) => {
    try {
      const { page } = thunkApi.getState().Reviews;
      const params = new URLSearchParams({
        page: String(page),
      });
      let url = `review?${params.toString()}`;
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

// ============================================================================
// SLICE
// ============================================================================

const reviewsSlice = createSlice({
  name: 'Reviews',
  initialState,
  reducers: {
    resetReviews: (state) => {
      state.reviews = [];
      state.page = 1;
      state.hasMore = true;
      state.totalReviews = 0;
      state.numOfPages = 0;
    },
    setReviewPage: (state, action) => {
      state.page = action.payload;
    },
    removeReview: (state, action) => {
      const idToRemove = action.payload;
      state.reviews = state.reviews.filter(
        (review) => getReviewId(review) !== idToRemove
      );
      state.totalReviews = Math.max(0, state.totalReviews - 1);
    },
  },
  extraReducers: (builder) => {
    // LEAVE REVIEW
    builder
      .addCase(leaveReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(leaveReview.fulfilled, (state, action: any) => {
        state.isLoading = false;
        const newReview = action.payload.review;

        // Check if review already exists
        const reviewId = getReviewId(newReview);
        const exists = state.reviews.some(
          (review) => getReviewId(review) === reviewId
        );

        if (!exists && reviewId) {
          state.reviews.unshift(newReview);
          state.totalReviews++;
        }

        ToastAndroid.showWithGravity(
          'Review posted successfully',
          3000,
          ToastAndroid.BOTTOM
        );
      })
      .addCase(leaveReview.rejected, (state, action: any) => {
        state.isLoading = false;
        ToastAndroid.showWithGravity(
          `Error creating review: ${action.payload || action.error.message}`,
          3000,
          ToastAndroid.BOTTOM
        );
      });

    // RETRIEVE ALL REVIEWS
    builder
      .addCase(retrieveAllReviews.pending, (state) => {
        if (state.page === 1) {
          state.isLoading = true;
        }
      })
      .addCase(retrieveAllReviews.fulfilled, (state, action: any) => {
        state.isLoading = false;
        const { totalReviews, numOfPages, review = [] } = action.payload;

        if (review.length === 0) {
          state.hasMore = false;
        } else {
          // Use helper function to merge without duplicates
          state.reviews = mergeUniqueReviews(state.reviews, review);
          state.totalReviews = totalReviews;
          state.numOfPages = numOfPages;
          state.page += 1;

          // Update hasMore based on current page
          state.hasMore = state.page <= numOfPages;
        }
      })
      .addCase(retrieveAllReviews.rejected, (state, action: any) => {
        state.isLoading = false;
        state.hasMore = false;
        ToastAndroid.showWithGravity(
          `Error fetching reviews: ${action.payload || action.error.message}`,
          3000,
          ToastAndroid.BOTTOM
        );
      });
  },
});

export const { resetReviews, setReviewPage, removeReview } =
  reviewsSlice.actions;
export default reviewsSlice.reducer;
