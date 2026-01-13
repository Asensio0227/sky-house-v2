import React from 'react';
import { View } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';

const Loading = () => {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator
        size={'large'}
        animating={true}
        color={theme.colors.primary}
      />
    </View>
  );
};

export default Loading;
