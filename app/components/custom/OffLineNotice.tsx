import { useNetInfo } from '@react-native-community/netinfo';
import Constants from 'expo-constants';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import Text from './AppText';

const OffLineNotice = () => {
  const netInfo = useNetInfo();
  const theme = useTheme();

  if (netInfo.type !== 'unknown' && netInfo.isInternetReachable === false)
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.errorContainer },
        ]}
      >
        <Text
          style={[styles.text, { color: theme.colors.onErrorContainer }]}
          title='No Internet Connection...'
          variant='bodyMedium'
        />
      </View>
    );

  return null;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
    position: 'absolute',
    top: Constants.statusBarHeight,
    width: '100%',
    zIndex: 1,
    elevation: 4,
  },
  text: {
    fontWeight: '600',
  },
});

export default OffLineNotice;
