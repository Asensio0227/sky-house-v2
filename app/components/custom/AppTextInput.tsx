import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';

const AppTextInput: React.FC<{
  value: string | any;
  icon?: string;
  label?: string;
  placeholder?: string;
  mode?: 'flat' | 'outlined';
  style?: any;
  [key: string]: any;
}> = ({
  value,
  icon,
  label,
  placeholder,
  mode = 'outlined',
  style,
  ...otherProps
}) => {
  const theme = useTheme();

  return (
    <TextInput
      value={value}
      mode={mode}
      label={label}
      placeholder={placeholder}
      right={icon ? <TextInput.Icon icon={icon} /> : undefined}
      style={[styles.input, style]}
      theme={{
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.surface,
          surface: theme.colors.surface,
        },
      }}
      {...otherProps}
    />
  );
};

export default AppTextInput;

const styles = StyleSheet.create({
  input: {
    marginVertical: 8,
  },
});
