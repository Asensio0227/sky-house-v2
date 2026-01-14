import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ToastAndroid } from 'react-native';
import { UserDocument } from '../../components/form/FormInput';
import customFetch, { clearAuthToken } from '../../utils/axios';
import { customData } from '../../utils/globals';
import { clearCurrentUser } from '../user/userSlice';

interface authState {
  isAuthenticated: boolean;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null | any;
  visible: boolean;
  sessionRestoreAttempted: boolean;
  isInitialized: boolean;
}

const initialState = {
  isAuthenticated: false,
  accessToken: null,
  isLoading: false,
  error: '',
  visible: false,
  sessionRestoreAttempted: false,
  isInitialized: false,
} satisfies authState as authState;

// Create account
export const createUserAccount = createAsyncThunk(
  'auth/sign-up',
  async (userData: UserDocument | any, thunkAPi) => {
    try {
      const data = customData(userData);
      const response: any = await customFetch.post(`auth/register`, data, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });
      if (!response.ok) {
        throw new Error(response.data.msg);
      }
      return response.data;
    } catch (error: any) {
      return thunkAPi.rejectWithValue(`Could not register user: ${error}`);
    }
  }
);

// Resend code
export const resendAccountCode = createAsyncThunk(
  'auth/resend-code',
  async (email: string, thunkApi) => {
    try {
      const response: any = await customFetch.post(`auth/resend-code`, email);
      if (!response.ok) {
        throw new Error(response.data.msg);
      }
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(`Error resending code: ${error}`);
    }
  }
);

// Verify email
export const verifyEmail = createAsyncThunk(
  'auth/verify-email',
  async (data: any, thunkApi) => {
    try {
      const { email, token } = data;
      const response: any = await customFetch.post('auth/verify-email', {
        email,
        verificationToken: Number(token),
      });
      if (!response.ok) {
        throw new Error(response.data.msg);
      }
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(`Error verifying email: ${error}`);
    }
  }
);

// Sign in
export const signInUser = createAsyncThunk(
  'auth/sign-in',
  async (userData: UserDocument, thunkApi) => {
    try {
      const response: any = await customFetch.post('auth/login', userData);
      if (!response.ok) {
        throw new Error(response.data.msg);
      }
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(`Error sign-in: ${error}`);
    }
  }
);

// Forgot password
export const requestResetPassword = createAsyncThunk(
  'auth/forgot-password',
  async (data: { email: string }, { rejectWithValue }) => {
    try {
      const response: any = await customFetch.post(
        'auth/forgot-password',
        data
      );
      if (!response.ok) {
        throw new Error(response.data.msg);
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(`Error forgot password: ${error}`);
    }
  }
);

// Reset password
export const ResetUserPassword = createAsyncThunk(
  'auth/reset-password',
  async (data: any, thunkApi) => {
    try {
      const { email, token, password } = data;
      const response: any = await customFetch.post(`auth/reset-password`, {
        email,
        token: Number(token),
        password,
      });
      if (!response.ok) {
        throw new Error(response.data.msg);
      }
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(`Error resetting password: ${error}`);
    }
  }
);

// Sign out
export const signOutUser = createAsyncThunk(
  'auth/logout',
  async (_, thunkApi) => {
    try {
      await clearAuthToken();
      const response: any = await customFetch.delete('auth/logout');
      if (!response.ok) {
        throw new Error(response.data.msg);
      }
      thunkApi.dispatch(clearCurrentUser());
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(`Error logging out: ${error}`);
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  'auth/change-password',
  async (data: { oldPassword: string; newPassword: string }, thunkApi) => {
    try {
      const response: any = await customFetch.patch('user', data);
      if (!response.ok) {
        throw new Error(response.data.msg);
      }
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(`Error changing password: ${error}`);
    }
  }
);

// Expo token
export const expoPushNotification = createAsyncThunk(
  'user/expoToken',
  async (expoPushToken: any, thunkApi) => {
    try {
      const response = await customFetch.post('user/expo-token', {
        expoToken: expoPushToken,
      });
      if (!response.ok) {
        throw new Error(
          `Error posting expo token: ${response.problem || 'Unknown issue'}`
        );
      }
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(`Error posting expo token: ${error}`);
    }
  }
);

// guest login
export const guestSignIn = createAsyncThunk(
  'auth/guest-login',
  async (data: { expoToken?: string; userAds_address?: any }, thunkApi) => {
    try {
      const response: any = await customFetch.post('auth/guest-login', data);
      if (!response.ok) {
        throw new Error(response.data.msg);
      }
      return response.data;
    } catch (error: any) {
      return thunkApi.rejectWithValue(`Error guest sign-in: ${error}`);
    }
  }
);

const authSlice = createSlice({
  name: 'AUTH',
  initialState,
  reducers: {
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.error = null;
    },
    showModal: (state) => {
      state.visible = true;
    },
    hideModal: (state) => {
      state.visible = false;
    },
    markSessionRestoreAttempted: (state) => {
      state.sessionRestoreAttempted = true;
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    // Sign-up
    builder
      .addCase(createUserAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUserAccount.fulfilled, (state, action: any) => {
        state.isLoading = false;
        ToastAndroid.showWithGravity(action.payload.msg, 2000, 0);
      })
      .addCase(createUserAccount.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
        ToastAndroid.showWithGravity(action.payload, 2000, 0);
      });

    // Resend code
    builder
      .addCase(resendAccountCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendAccountCode.fulfilled, (state, action: any) => {
        state.isLoading = false;
        ToastAndroid.showWithGravity(action.payload.msg, 2000, 0);
      })
      .addCase(resendAccountCode.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
        ToastAndroid.showWithGravity(action.payload, 2000, 0);
      });

    // Verify email
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action: any) => {
        state.isLoading = false;
        ToastAndroid.showWithGravity(action.payload.msg, 2000, 0);
      })
      .addCase(verifyEmail.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
        ToastAndroid.showWithGravity(action.payload, 2000, 0);
      });

    // Sign in
    builder
      .addCase(signInUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInUser.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken || null;
        console.log('✅ User signed in successfully');
      })
      .addCase(signInUser.rejected, (state, action: any) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
        ToastAndroid.showWithGravity(action.payload, 2000, 0);
      });

    // Forgot password
    builder
      .addCase(requestResetPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(requestResetPassword.fulfilled, (state, action: any) => {
        state.isLoading = false;
        ToastAndroid.showWithGravity(action.payload.msg, 2000, 0);
      })
      .addCase(requestResetPassword.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
        ToastAndroid.showWithGravity(action.payload, 2000, 0);
      });

    // Reset password
    builder
      .addCase(ResetUserPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(ResetUserPassword.fulfilled, (state, action: any) => {
        state.isLoading = false;
        ToastAndroid.showWithGravity(action.payload.msg, 2000, 0);
      })
      .addCase(ResetUserPassword.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
        ToastAndroid.showWithGravity(action.payload, 2000, 0);
      });

    // Sign out
    builder
      .addCase(signOutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signOutUser.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.accessToken = null;
        console.log('✅ User signed out');
      })
      .addCase(signOutUser.rejected, (state, action: any) => {
        state.isLoading = false;
      });

    // Change password
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(changePassword.fulfilled, (state, action: any) => {
        state.isLoading = false;
        ToastAndroid.showWithGravity('Password changed successfully', 2000, 0);
      })
      .addCase(changePassword.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
        ToastAndroid.showWithGravity(action.payload, 2000, 0);
      });

    // Expo token
    builder
      .addCase(expoPushNotification.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(expoPushNotification.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(expoPushNotification.rejected, (state, action: any) => {
        state.isLoading = false;
        console.log('Expo token error:', action.payload);
      });
    // guest login
    builder
      .addCase(guestSignIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(guestSignIn.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken || null;
        console.log('✅ Guest signed in successfully');
        ToastAndroid.showWithGravity('Welcome, Guest!', 2000, 0);
      })
      .addCase(guestSignIn.rejected, (state, action: any) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
        ToastAndroid.showWithGravity(action.payload, 2000, 0);
      });
  },
});

export const {
  setAuthenticated,
  setAccessToken,
  clearAuth,
  showModal,
  hideModal,
  markSessionRestoreAttempted,
} = authSlice.actions;

export default authSlice.reducer;
