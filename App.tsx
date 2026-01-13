import Entypo from '@expo/vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Appearance, AppState, LogBox } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import {
  Provider as StoreProvider,
  useDispatch,
  useSelector,
} from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import AuthDebugger from './app/components/custom/AuthDebugger';
import OffLineNotice from './app/components/custom/OffLineNotice';
import Screen from './app/components/custom/Screen';
import { markSessionRestoreAttempted } from './app/features/auth/authSlice';
import { loadTheme } from './app/features/theme/themeSlice';
import { getCurrentUser } from './app/features/user/userSlice';
import useLocation from './app/hooks/useLocation';
import useNotifications from './app/hooks/useNotifications';
import AuthNavigation from './app/navigation/AuthNavigation';
import DrawerNavigation from './app/navigation/DrawerNavigation';
import NavigationErrorBoundary from './app/utils/NavigationErrorBoundary';
import { loadAuthToken } from './app/utils/axios';
import { createAppTheme } from './app/utils/theme';
import { AppDispatch, persistor, RootState, store } from './store';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 1000, fade: true });
LogBox.ignoreAllLogs(true);

function App() {
  const dispatch = useDispatch<AppDispatch>();

  // ✅ Get auth state (authentication only)
  const { isAuthenticated, sessionRestoreAttempted } = useSelector(
    (store: RootState) => store.AUTH
  );

  // ✅ Get user profile data (from USER slice)
  const { currentUser } = useSelector((store: RootState) => store.USER);

  // ✅ Track logout events to prevent refetch immediately after logout
  const [justLoggedOut, setJustLoggedOut] = useState(false);

  // ✅ Track app state to detect when returning from background
  const appState = useRef(AppState.currentState);
  const [isReturningFromBackground, setIsReturningFromBackground] =
    useState(false);

  // ✅ Log user state changes (but only when actually changed)
  const prevUserRef = useRef(currentUser);
  useEffect(() => {
    if (prevUserRef.current !== currentUser) {
      console.log(
        '👤 User state changed:',
        currentUser
          ? `${currentUser.username} (${currentUser.userId || currentUser._id})`
          : 'null'
      );
      console.log('🔐 Is authenticated:', isAuthenticated);
      prevUserRef.current = currentUser;
    }
  }, [currentUser, isAuthenticated]);

  const { isDark, isSystemTheme } = useSelector(
    (store: RootState) => store.THEME
  );

  // Custom hooks
  const { expoPushToken } = useNotifications();

  let locationHook;
  try {
    locationHook = useLocation();
  } catch (error) {
    console.log('Location hook error:', error);
    locationHook = { location: null, errorMsg: null, isLoading: false };
  }

  const [appIsReady, setAppIsReady] = useState(false);
  const navigationRef = useRef(null);
  const hasAttemptedRestore = useRef(false);

  // ✅ Track logout events
  useEffect(() => {
    if (!isAuthenticated && currentUser === null) {
      console.log('🚪 Logout detected - setting flag');
      setJustLoggedOut(true);

      // Clear flag after a delay
      const timer = setTimeout(() => {
        console.log('⏰ Clearing logout flag');
        setJustLoggedOut(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, currentUser]);

  // ✅ Monitor app state changes to detect background/foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('📱 App returned from background');
        setIsReturningFromBackground(true);

        // Reset flag after a short delay
        setTimeout(() => setIsReturningFromBackground(false), 500);
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // ✅ Send expo push token when user logs in
  useEffect(() => {
    if (currentUser && expoPushToken && isAuthenticated) {
      // Only send token if we don't already have it stored
      const sendToken = async () => {
        try {
          const storedToken = await AsyncStorage.getItem('expo_push_token');
          if (storedToken !== expoPushToken) {
            console.log('📤 Sending expo push token to server:', expoPushToken);
            const { expoPushNotification } = await import(
              './app/features/auth/authSlice'
            );
            await dispatch(expoPushNotification(expoPushToken));
            await AsyncStorage.setItem('expo_push_token', expoPushToken);
          }
        } catch (error) {
          console.log('❌ Error sending expo token:', error);
        }
      };

      sendToken();
    }
  }, [currentUser, expoPushToken, isAuthenticated, dispatch]);

  // ✅ Refetch user if they become null while authenticated
  useEffect(() => {
    // Only refetch if:
    // 1. User is null
    // 2. We're authenticated
    // 3. Session restore has been attempted
    // 4. We're not currently returning from background (to avoid double fetch)
    // 5. We haven't just logged out
    if (
      !currentUser &&
      isAuthenticated &&
      sessionRestoreAttempted &&
      !isReturningFromBackground &&
      !justLoggedOut
    ) {
      console.log('⚠️ User is null but authenticated - refetching user');
      dispatch(getCurrentUser());
    }
  }, [
    currentUser,
    isAuthenticated,
    sessionRestoreAttempted,
    isReturningFromBackground,
    justLoggedOut,
    dispatch,
  ]);

  // Load theme from storage
  useEffect(() => {
    const loadStoredTheme = async () => {
      try {
        const storedIsSystemTheme = await AsyncStorage.getItem('isSystemTheme');
        const storedIsDarkTheme = await AsyncStorage.getItem('isDarkTheme');

        if (storedIsSystemTheme === 'true') {
          const colorScheme = Appearance.getColorScheme();
          dispatch(
            loadTheme({ isDark: colorScheme === 'dark', isSystemTheme: true })
          );
        } else if (storedIsDarkTheme !== null) {
          dispatch(
            loadTheme({
              isDark: JSON.parse(storedIsDarkTheme),
              isSystemTheme: false,
            })
          );
        } else {
          const colorScheme = Appearance.getColorScheme();
          dispatch(
            loadTheme({ isDark: colorScheme === 'dark', isSystemTheme: true })
          );
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    loadStoredTheme();
  }, [dispatch]);

  // Listen to system theme changes
  useEffect(() => {
    if (!isSystemTheme) return;

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      dispatch(
        loadTheme({ isDark: colorScheme === 'dark', isSystemTheme: true })
      );
    });

    return () => subscription.remove();
  }, [isSystemTheme, dispatch]);

  // Load fonts
  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync(Entypo.font);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // ✅ Session restoration - Fetch user profile if authenticated
  useEffect(() => {
    const restoreSession = async () => {
      if (!appIsReady) return;
      if (hasAttemptedRestore.current) return;
      if (sessionRestoreAttempted) return;

      hasAttemptedRestore.current = true;
      console.log('🔄 Starting session restoration...');

      try {
        // Load token from storage
        const token = await loadAuthToken();

        if (token) {
          // ✅ Fetch current user profile
          const resultAction = await dispatch(getCurrentUser());

          if (getCurrentUser.fulfilled.match(resultAction)) {
            console.log('✅ Session restored successfully');
          } else if (getCurrentUser.rejected.match(resultAction)) {
            console.log('❌ Session restore rejected');
          }
        } else {
          console.log('ℹ️ No token found, skipping session restore');
        }
      } catch (error: any) {
        console.log('❌ Session restore error:', error.message);
      } finally {
        // Mark restoration attempted regardless of outcome
        dispatch(markSessionRestoreAttempted());
      }
    };

    restoreSession();
  }, [appIsReady, sessionRestoreAttempted, dispatch]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && sessionRestoreAttempted) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, sessionRestoreAttempted]);

  const shouldShowNavigation = appIsReady && sessionRestoreAttempted;

  // ✅ FIXED: Stable navigation key that doesn't change during image picking
  const navigationKey = useMemo(() => {
    if (currentUser) {
      const userId = currentUser._id || currentUser.userId;
      console.log('🔑 Navigation key:', userId);
      return userId;
    }

    // ✅ CRITICAL: Keep stable key if authenticated (even if user is temporarily null)
    if (isAuthenticated) {
      console.log('🔑 Navigation key: authenticated (user loading)');
      return 'authenticated'; // Stable key prevents remount
    }

    console.log('🔑 Navigation key: unauthenticated');
    return 'unauthenticated';
  }, [currentUser, isAuthenticated]);

  // ✅ Use both auth state and user data to determine navigation
  const shouldShowAuthenticatedNav = useMemo(() => {
    // Show authenticated nav if either:
    // 1. We have a user object, OR
    // 2. We're authenticated (even if user is temporarily loading)
    const show = isAuthenticated || !!currentUser;
    console.log(
      '🔄 Navigation rendering, user:',
      show ? 'logged in' : 'logged out'
    );
    return show;
  }, [isAuthenticated, currentUser]);

  // ✅ Memoized navigation component
  const navigationComponent = useMemo(() => {
    return shouldShowAuthenticatedNav ? (
      <DrawerNavigation />
    ) : (
      <AuthNavigation />
    );
  }, [shouldShowAuthenticatedNav]);

  if (!shouldShowNavigation) {
    return null;
  }

  return (
    <Screen onLayout={onLayoutRootView}>
      <OffLineNotice />
      {__DEV__ && <AuthDebugger />}
      <NavigationErrorBoundary>
        <NavigationContainer ref={navigationRef} key={navigationKey}>
          {navigationComponent}
        </NavigationContainer>
      </NavigationErrorBoundary>
    </Screen>
  );
}

function ThemedApp() {
  const { isDark } = useSelector((store: RootState) => store.THEME);

  const paperTheme = useMemo(
    () => Object.freeze(createAppTheme(isDark)),
    [isDark]
  );

  return (
    <PaperProvider theme={paperTheme}>
      <App />
    </PaperProvider>
  );
}

export default function Main() {
  return (
    <StoreProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemedApp />
      </PersistGate>
    </StoreProvider>
  );
}
