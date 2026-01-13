import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getCurrentUser } from '../features/user/userSlice';
import { useAppDispatch } from './useAppDispatch';

const useAppStateListener = () => {
  const dispatch = useAppDispatch();
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const lastRefreshTime = useRef<number>(0);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // Log app state changes for debugging
      if (appState.current !== nextAppState) {
        console.log(
          '📱 App state changed:',
          appState.current,
          '→',
          nextAppState
        );
      }

      if (nextAppState === 'active') {
        console.log('✅ App is now active');

        // Refresh user data when app comes to foreground
        // Only if it's been more than 5 seconds since last refresh (to avoid spam)
        const now = Date.now();
        const timeSinceLastRefresh = now - lastRefreshTime.current;
        const REFRESH_COOLDOWN = 5000; // 5 seconds

        if (timeSinceLastRefresh > REFRESH_COOLDOWN) {
          console.log('🔄 Refreshing user data...');
          lastRefreshTime.current = now;
          dispatch(getCurrentUser());
        } else {
          console.log('⏭️ Skipping refresh (too soon since last refresh)');
        }
      } else if (nextAppState === 'background') {
        console.log('⏸️ App moved to background');
        // App has moved to background
        // You could pause ongoing operations here
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, [dispatch]);
};

export default useAppStateListener;
