import React from 'react';
import { GestureResponderEvent, StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import AppText from './AppText';

const AppButton: React.FC<{
  title: string;
  style?: any;
  onPress: (e?: GestureResponderEvent) => void | any;
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  icon?: any;
  [key: string]: any;
  color?: any;
}> = ({
  title,
  mode = 'contained',
  icon,
  onPress,
  style,
  color,
  ...otherProps
}) => {
  const theme = useTheme();

  return (
    <Button
      icon={icon}
      mode={mode}
      onPress={onPress}
      style={[styles.button, style]}
      buttonColor={color || theme.colors.primary}
      textColor={theme.colors.onPrimary}
      {...otherProps}
    >
      {title}
    </Button>
  );
};

export default AppButton;

const styles = StyleSheet.create({
  button: {
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
  },
});
