// AuthDebugger.tsx - Updated to show both AUTH and USER state

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export default function AuthDebugger() {
  const {
    isAuthenticated,
    isInitialized,
    sessionRestoreAttempted,
    isLoading,
    error,
  } = useSelector((store: RootState) => store.AUTH);

  const { currentUser } = useSelector((store: RootState) => store.USER);

  useEffect(() => {
    console.log('=== AUTH STATE DEBUG ===');
    console.log('Is Authenticated:', isAuthenticated);
    console.log('Is Initialized:', isInitialized);
    console.log('Session Restore Attempted:', sessionRestoreAttempted);
    console.log('Is Loading:', isLoading);
    console.log('Error:', error);
    console.log('=== USER STATE DEBUG ===');
    console.log(
      'Current User:',
      currentUser
        ? `${currentUser.username} (${currentUser.userId || currentUser._id})`
        : 'null'
    );
    console.log('=======================');
  }, [
    isAuthenticated,
    isInitialized,
    sessionRestoreAttempted,
    isLoading,
    error,
    currentUser,
  ]);

  // Only show in development
  if (__DEV__) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🔍 Debug</Text>
        <Text style={styles.text}>Auth: {String(isAuthenticated)}</Text>
        <Text style={styles.text}>User: {currentUser?.username || 'null'}</Text>
        <Text style={styles.text}>
          ID: {currentUser?.userId || currentUser?._id || 'null'}
        </Text>
        <Text style={styles.text}>Init: {String(isInitialized)}</Text>
        <Text style={styles.text}>
          Restore: {String(sessionRestoreAttempted)}
        </Text>
        <Text style={styles.text}>Loading: {String(isLoading)}</Text>
        {error && <Text style={styles.error}>Error: {String(error)}</Text>}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 8,
    zIndex: 9999,
    minWidth: 200,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 14,
  },
  text: {
    color: '#fff',
    fontSize: 11,
    marginBottom: 4,
  },
  error: {
    color: '#ff6b6b',
    fontSize: 11,
    marginTop: 4,
  },
});
