import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { designTokens } from '../../utils/designTokens';

interface ModernButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: any;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const ModernButton: React.FC<ModernButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const getButtonStyle = () => {
    const baseStyle = [
      styles.button,
      styles[`${variant}Button`],
      styles[`${size}Button`],
      fullWidth && styles.fullWidth,
      disabled && styles.disabled,
      { transform: [{ scale: scaleAnim }] },
      style,
    ];

    return baseStyle;
  };

  const getTextStyle = () => {
    return [
      styles.buttonText,
      styles[`${variant}Text`],
      styles[`${size}Text`],
      disabled && styles.disabledText,
    ];
  };

  const getButtonColors = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? '#E0E0E0' : theme.colors.primary,
          borderColor: disabled ? '#E0E0E0' : theme.colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? '#F5F5F5' : theme.colors.secondary,
          borderColor: disabled ? '#E0E0E0' : theme.colors.secondary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: disabled ? '#E0E0E0' : theme.colors.primary,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      default:
        return {};
    }
  };

  return (
    <Animated.View style={getButtonColors()}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={getButtonStyle()}
        accessibilityRole='button'
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: disabled || loading }}
      >
        {loading ? (
          <ActivityIndicator
            size='small'
            color={
              variant === 'primary' || variant === 'secondary'
                ? '#FFFFFF'
                : theme.colors.primary
            }
          />
        ) : (
          <Text style={getTextStyle()}>{title}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: designTokens.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Variants
  primaryButton: {
    backgroundColor: '#2196F3',
    borderWidth: 0,
  },
  secondaryButton: {
    backgroundColor: '#FFC107',
    borderWidth: 0,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  textButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },

  // Sizes
  smallButton: {
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
    minHeight: 36,
  },
  mediumButton: {
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.md,
    minHeight: 48,
  },
  largeButton: {
    paddingHorizontal: designTokens.spacing.xl,
    paddingVertical: designTokens.spacing.lg,
    minHeight: 56,
  },

  // States
  disabled: {
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },

  // Text styles
  buttonText: {
    fontWeight: designTokens.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#2196F3',
  },
  textText: {
    color: '#2196F3',
  },
  smallText: {
    fontSize: designTokens.typography.fontSize.sm,
  },
  mediumText: {
    fontSize: designTokens.typography.fontSize.md,
  },
  largeText: {
    fontSize: designTokens.typography.fontSize.lg,
  },
  disabledText: {
    color: '#9E9E9E',
  },
});

export default ModernButton;
