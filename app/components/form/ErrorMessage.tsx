import React from 'react';
import { Text, useTheme } from 'react-native-paper';

const ErrorMessage: React.FC<{ visible: boolean; error: string }> = ({
  visible,
  error,
}) => {
  const theme = useTheme();

  if (!visible || !error) return null;

  return (
    <Text variant='labelMedium' style={{ color: theme.colors.error }}>
      {error}
    </Text>
  );
};

export default ErrorMessage;
