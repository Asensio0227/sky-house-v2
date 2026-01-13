import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ToastAndroid } from 'react-native';
import { UserDocument } from '../../components/form/FormInput';
import customFetch from '../../utils/axios';

interface userState {
  isLoading: boolean;
  users: UserDocument[];
  singleUser: UserDocument | null | any;
  currentUser: UserDocument | null | any; // ✅ Current logged-in user
  page: number;
  search: string;
  sort: string;
  sortOption: sortOptions[];
  totalUsers: number;
  numOfPages: number;
  hasMore: boolean;
}

enum sortOptions {
  Az = 'a-z',
  Za = 'z-a',
  Newest = 'newest',
  Oldest = 'oldest',
}

const initialState = {
  isLoading: false,
  users: [],
  singleUser: null,
  currentUser: null, // ✅ Initialize current user
  page: 1,
  sort: sortOptions.Newest,
  search: '',
  sortOption: Object.values(sortOptions),
  totalUsers: 0,
  numOfPages: 0,
  hasMore: false,
} satisfies userState as userState;

// ✅ NEW: Get current logged-in user (moved from authSlice)
export const getCurrentUser = createAsyncThunk(
  'user/getCurrentUser',
  async (_, thunkApi) => {
    try {
      const response: any = await customFetch.get('user/showMe');
      if (!response.ok) {
        throw new Error(response.data.msg || 'Failed to fetch current user');
      }
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(
        `Error retrieving current user: ${error.message || error}`
      );
    }
  }
);

// ✅ NEW: Update current user (moved from authSlice)
export const updateCurrentUser = createAsyncThunk(
  'user/updateCurrentUser',
  async (data: UserDocument, thunkApi) => {
    try {
      const { customData } = await import('../../utils/globals');
      const profile = true;
      const userData = customData(data, profile);

      const response: any = await customFetch.put(
        'user/update-user',
        userData,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.ok) {
        throw new Error(response.data.msg || 'Failed to update user');
      }
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(
        `Error updating user: ${error.message || error}`
      );
    }
  }
);

export const retrieveAllUsers = createAsyncThunk(
  'users/all',
  async ({ page }: any, thunkApi: any) => {
    const { search, sort } = thunkApi.getState().USER;
    const params = new URLSearchParams({
      page: String(page),
      sort,
      ...(search && { search }),
    });
    const url = `user?${params.toString()}`;
    try {
      const response: any = await customFetch.get(url);
      if (!response.ok) {
        throw new Error(response.data.msg);
      }
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(`Error fetching users: ${error}`);
    }
  }
);

export const retrieveUser = createAsyncThunk(
  'users/id',
  async (id: string, thunkApi) => {
    try {
      const response: any = await customFetch.get(`user/${id}`);
      if (!response.ok) {
        throw new Error(response.data.msg);
      }
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(`Error retrieving user: ${error}`);
    }
  }
);

const userSlice = createSlice({
  name: 'USER',
  initialState,
  reducers: {
    handleChange: (state: any, { payload: { name, value } }) => {
      state.page = 1;
      state[name] = value;
    },
    handlePage: (state, { payload }) => {
      state.page = payload;
    },
    // ✅ NEW: Clear current user on logout
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    // ✅ NEW: Set current user directly (for optimistic updates)
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ✅ Get current user cases
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.currentUser = action.payload.user;
        console.log('✅ Current user loaded:', action.payload.user?.username);
      })
      .addCase(getCurrentUser.rejected, (state, action: any) => {
        state.isLoading = false;
        // ✅ CRITICAL: Don't clear user on error to prevent navigation remount
        // state.currentUser = null; // REMOVED
        console.log('❌ Failed to load current user:', action.payload);
        console.log('⚠️ Keeping existing user to prevent logout');
      });

    // ✅ Update current user cases
    builder
      .addCase(updateCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCurrentUser.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.currentUser = action.payload.user;
        ToastAndroid.showWithGravity('Profile updated successfully!', 2000, 0);
        console.log('✅ User profile updated');
      })
      .addCase(updateCurrentUser.rejected, (state, action: any) => {
        state.isLoading = false;
        ToastAndroid.showWithGravity(
          action.payload || 'Failed to update profile',
          2000,
          0
        );
        console.log('❌ Failed to update user:', action.payload);
      });

    // Retrieve all users
    builder
      .addCase(retrieveAllUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(retrieveAllUsers.fulfilled, (state, action: any) => {
        state.isLoading = false;
        const { users, numOfPages, totalUsers } = action.payload;
        state.users = users;
        state.numOfPages = numOfPages;
        state.totalUsers = totalUsers;
      })
      .addCase(retrieveAllUsers.rejected, (state, action: any) => {
        state.isLoading = false;
        ToastAndroid.showWithGravity(action.payload, 2000, 0);
      });

    // Retrieve single user
    builder
      .addCase(retrieveUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(retrieveUser.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.singleUser = action.payload.user;
      })
      .addCase(retrieveUser.rejected, (state, action: any) => {
        state.isLoading = false;
        ToastAndroid.showWithGravity(action.payload, 2000, 0);
      });
  },
});

export const { handleChange, handlePage, clearCurrentUser, setCurrentUser } =
  userSlice.actions;
export default userSlice.reducer;
