import React from 'react';
import { StyleSheet } from 'react-native';
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
      style={[styles.text, style, { color: color || theme.colors.onSurface }]}
      {...otherProps}
    >
      {title}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'System', // Use system font for better performance
  },
});

export default AppText;
