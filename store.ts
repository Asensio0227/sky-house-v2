// store.ts - Updated with separated auth and user persistence

import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import authSlice from './app/features/auth/authSlice';
import chatsSlice from './app/features/chats/chatsSlice';
import estateSlice from './app/features/estate/estateSlice';
import notifySlice from './app/features/notify/notifySlice';
import reviewsSlice from './app/features/reviews/reviewsSlice';
import themeReducer from './app/features/theme/themeSlice';
import userSlice from './app/features/user/userSlice';
import errorSlice from './app/utils/errorHandler';

// ✅ Auth persistence - Only persist authentication status
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['isAuthenticated', 'accessToken'],
  blacklist: ['isLoading', 'error', 'isInitialized', 'sessionRestoreAttempted'],
  debug: __DEV__,
};

// ✅ User persistence - Persist current user profile
const userPersistConfig = {
  key: 'user',
  storage: AsyncStorage,
  whitelist: ['currentUser'], // Only persist the current user
  blacklist: [
    'isLoading',
    'error',
    'users',
    'singleUser',
    'page',
    'search',
    'sort',
    'sortOption',
    'totalUsers',
    'numOfPages',
    'hasMore',
  ],
  debug: __DEV__,
};

// ✅ Theme persistence
const themePersistConfig = {
  key: 'theme',
  storage: AsyncStorage,
  debug: __DEV__,
};

// ✅ Create persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authSlice);
const persistedUserReducer = persistReducer(userPersistConfig, userSlice);
const persistedThemeReducer = persistReducer(themePersistConfig, themeReducer);

export const store = configureStore({
  reducer: {
    AUTH: persistedAuthReducer,
    USER: persistedUserReducer,
    ESTATE: estateSlice,
    Reviews: reviewsSlice,
    Chats: chatsSlice,
    NOTIFY: notifySlice,
    ERROR: errorSlice,
    THEME: persistedThemeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      immutableCheck: {
        warnAfter: 128,
      },
    }),
});

// ✅ Create persistor
export const persistor = persistStore(store);

// ✅ Enable purge in development for testing
if (__DEV__) {
  // Add helper to clear persisted state in console
  (global as any).clearPersistedState = async () => {
    console.log('🧹 Clearing persisted state...');
    await persistor.purge();
    await AsyncStorage.clear();
    console.log('✅ Persisted state cleared');
  };
}

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
