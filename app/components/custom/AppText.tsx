import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

const AppText: React.FC<{
  title: string | Number | any;
  style?: any;
  variant?:
    | 'displayLarge'
    | 'displayMedium'
    | 'displaySmall'
    | 'headlineLarge'
    | 'headlineMedium'
    | 'headlineSmall'
    | 'titleLarge'
    | 'titleMedium'
    | 'titleSmall'
    | 'bodyLarge'
    | 'bodyMedium'
    | 'bodySmall'
    | 'labelLarge'
    | 'labelMedium'
    | 'labelSmall';
  color?: any;
  [key: string]: any;
}> = ({ title, style, variant = 'bodyMedium', color, ...otherProps }) => {
  const theme = useTheme();

  return (
    <Text
      variant={variant}
      style={[
        styles.text,
        Platform.OS === 'android' && styles.androidFix,
        style,
        { color: color || theme.colors.onSurface },
      ]}
      {...otherProps}
    >
      {title}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'System',
    // Universal fix for proper text rendering
    paddingVertical: 2,
  },
  androidFix: {
    // Android-specific fixes for text clipping
    includeFontPadding: false, // Remove extra padding that clips descenders
    textAlignVertical: 'center', // Center text properly
    // Add slight extra padding to prevent clipping on some Android devices
    paddingTop: 3,
    paddingBottom: 3,
  },
});

export default AppText;
