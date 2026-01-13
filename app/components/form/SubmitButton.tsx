import * as Haptics from 'expo-haptics';
import { useFormikContext } from 'formik';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { designTokens } from '../../utils/designTokens';

const SubmitButton: React.FC<{
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  icon?: string;
  title?: string;
  style?: any;
  disabled?: boolean;
}> = ({
  mode = 'contained',
  icon,
  title = 'Submit',
  style,
  disabled = false,
}) => {
  const { handleSubmit, isSubmitting } = useFormikContext();
  const theme = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleSubmit();
  };

  return (
    <Button
      icon={icon}
      mode={mode}
      onPress={handlePress}
      loading={isSubmitting}
      disabled={disabled || isSubmitting}
      style={[styles.button, style]}
      contentStyle={styles.buttonContent}
      labelStyle={styles.buttonLabel}
    >
      {title}
    </Button>
  );
};

export default SubmitButton;

const styles = StyleSheet.create({
  button: {
    borderRadius: designTokens.borderRadius.xl,
    elevation: 4,
  },
  buttonContent: {
    paddingVertical: designTokens.spacing.sm,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
