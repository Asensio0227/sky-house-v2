import { MD3DarkTheme, MD3LightTheme, MD3Theme } from 'react-native-paper';
import { darkTheme, lightTheme } from '../constants/colors';
import { designTokens } from './designTokens';

// Enhanced theme configuration with better contrast and modern styling
// REMOVED useMaterial3Theme hook - it was causing the error
export const createAppTheme = (isDark: boolean): MD3Theme => {
  const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;

  // Use custom color palette from guidelines
  const customColors = isDark ? darkTheme.colors : lightTheme.colors;

  // Enhanced color palette with better contrast
  const enhancedColors = {
    ...baseTheme.colors,
    ...customColors,
    // Improve contrast for better accessibility
    onSurface: isDark ? '#FFFFFF' : '#212121',
    onSurfaceVariant: isDark ? '#BDBDBD' : '#757575',
    surfaceVariant: isDark ? '#2D2D2D' : '#F5F5F5',
    outline: isDark ? '#757575' : '#BDBDBD',
    outlineVariant: isDark ? '#424242' : '#E0E0E0',

    // Custom colors for real estate app
    primaryContainer: isDark ? '#0D47A1' : '#E3F2FD',
    secondaryContainer: isDark ? '#FF8F00' : '#FFF8E1',
    tertiaryContainer: isDark ? '#E65100' : '#FFF3E0',

    // Status colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',

    // Surface variations for cards and elevation
    surface1: isDark ? '#1E1E1E' : '#FFFFFF',
    surface2: isDark ? '#2A2A2A' : '#F8F9FA',
    surface3: isDark ? '#333333' : '#F1F3F4',
  };

  return {
    ...baseTheme,
    colors: enhancedColors,
    // Enhanced typography with better hierarchy
    fonts: {
      ...baseTheme.fonts,
      displayLarge: {
        ...baseTheme.fonts.displayLarge,
        fontSize: designTokens.typography.fontSize.xxxl,
        lineHeight: designTokens.typography.lineHeight.xxxl,
        fontWeight: designTokens.typography.fontWeight.bold,
      },
      displayMedium: {
        ...baseTheme.fonts.displayMedium,
        fontSize: designTokens.typography.fontSize.xxl,
        lineHeight: designTokens.typography.lineHeight.xxl,
        fontWeight: designTokens.typography.fontWeight.semibold,
      },
      headlineLarge: {
        ...baseTheme.fonts.headlineLarge,
        fontSize: designTokens.typography.fontSize.xl,
        lineHeight: designTokens.typography.lineHeight.xl,
        fontWeight: designTokens.typography.fontWeight.semibold,
      },
      bodyLarge: {
        ...baseTheme.fonts.bodyLarge,
        fontSize: designTokens.typography.fontSize.md,
        lineHeight: designTokens.typography.lineHeight.md,
        fontWeight: designTokens.typography.fontWeight.regular,
      },
      bodyMedium: {
        ...baseTheme.fonts.bodyMedium,
        fontSize: designTokens.typography.fontSize.sm,
        lineHeight: designTokens.typography.lineHeight.sm,
        fontWeight: designTokens.typography.fontWeight.regular,
      },
    },
    // Custom properties for enhanced theming
    custom: {
      spacing: designTokens.spacing,
      borderRadius: designTokens.borderRadius,
      elevation: designTokens.elevation,
      animation: designTokens.animation,
    },
  } as any; // Type assertion needed for custom property
};

// Utility functions for consistent styling
export const createStyles = (theme: MD3Theme) => ({
  // Layout utilities
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },

  // Card styles
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.md,
    marginVertical: designTokens.spacing.sm,
    elevation: designTokens.elevation.sm,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },

  // Form styles
  formContainer: {
    padding: designTokens.spacing.lg,
    gap: designTokens.spacing.md,
  },
  input: {
    marginVertical: designTokens.spacing.xs,
  },

  // Button styles
  button: {
    borderRadius: designTokens.borderRadius.md,
    marginVertical: designTokens.spacing.xs,
  },

  // Status styles
  success: {
    backgroundColor: (theme.colors as any).success,
  },
  error: {
    backgroundColor: theme.colors.error,
  },
  warning: {
    backgroundColor: (theme.colors as any).warning,
  },
  info: {
    backgroundColor: (theme.colors as any).info,
  },
});

export type AppTheme = MD3Theme & {
  custom: {
    spacing: typeof designTokens.spacing;
    borderRadius: typeof designTokens.borderRadius;
    elevation: typeof designTokens.elevation;
    animation: typeof designTokens.animation;
  };
};
