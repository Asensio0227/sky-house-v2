import { ApiResponse, create } from 'apisauce';
import * as SecureStore from 'expo-secure-store';

const getBaseURL = () => {
  const scheme = 'http';
  const host = '192.168.0.7';
  const port = '5000';
  return `${scheme}://${host}:${port}/api/v1/`;
};

const customFetch = create({
  baseURL: getBaseURL(),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 30000, // ✅ Increase timeout for file uploads
});

let authToken: string | null = null;

export const setAuthToken = async (token: string) => {
  authToken = token;
  await SecureStore.setItemAsync('jwt_token', token);
  console.log('✅ Auth token saved');
};

export const loadAuthToken = async () => {
  authToken = await SecureStore.getItemAsync('jwt_token');
  if (authToken) {
    console.log('✅ Auth token loaded');
  }
  return authToken;
};

export const clearAuthToken = async () => {
  console.log('🔴 Clearing auth token');
  authToken = null;
  await SecureStore.deleteItemAsync('jwt_token');
};

// Attach Authorization header when token is present
customFetch.addRequestTransform((request) => {
  // 🚨 apisauce may set headers to null
  // if (!request.headers) {
  //   request.headers = {};
  // }
  // if (authToken) {
  //   request.headers.Authorization = `Bearer ${authToken}`;
  //   console.log('✅ Token attached:', request.url);
  // } else {
  //   console.log('⚠️ No token available for request:', request.url);
  // }
});

// ✅ FIXED: Handle responses WITHOUT auto-clearing token
customFetch.addResponseTransform((response: ApiResponse<any>) => {
  // Only log in development
  if (__DEV__) {
    console.log('🔍 API Response:', {
      url: response.config?.url,
      ok: response.ok,
      status: response.status,
      problem: response.problem,
    });
  }

  // If response is not ok, log but DON'T clear token here
  if (!response.ok) {
    const status = response.status ?? 0;
    const data: any = response.data || {};

    console.log('⚠️ API Error:', {
      status,
      url: response.config?.url,
      msg: data.msg || data.message,
      problem: response.problem,
    });

    // ✅ CRITICAL: Don't clear token automatically!
    // Let each thunk decide how to handle errors

    const errorMessage =
      data.msg || data.message || response.problem || 'Request failed';

    // @ts-ignore - Add custom error property
    response.errorMessage = errorMessage;
  }
});

// ✅ NEW: Only clear token on explicit 401 for protected routes
// In axios.ts
export const checkForUnauthorizedResponse = (error: any, thunkAPI: any) => {
  const status = error?.response?.status || error?.status;

  if (status === 401) {
    console.log('🔴 401 Unauthorized - clearing auth state');

    // Clear token
    clearAuthToken();

    // Return rejection that triggers logout in your auth middleware
    return thunkAPI.rejectWithValue({
      message: 'Unauthorized! Logging Out...',
      shouldLogout: true,
    });
  }

  return thunkAPI.rejectWithValue(
    error?.response?.data?.msg ||
      error?.response?.data?.message ||
      error?.message ||
      'Request failed'
  );
};

export default customFetch;
