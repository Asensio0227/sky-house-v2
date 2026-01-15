export const designTokens = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
  },
  elevation: {
    none: 0,
    sm: 1,
    md: 2,
    lg: 4,
    xl: 8,
  },
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    // ✅ Improved line heights with better ratios (1.4-1.5x font size)
    lineHeight: {
      xs: 18, // 12 * 1.5 = 18
      sm: 20, // 14 * 1.43 ≈ 20
      md: 24, // 16 * 1.5 = 24
      lg: 26, // 18 * 1.44 ≈ 26
      xl: 28, // 20 * 1.4 = 28
      xxl: 34, // 24 * 1.42 ≈ 34
      xxxl: 44, // 32 * 1.38 ≈ 44
    },
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
  },
};
