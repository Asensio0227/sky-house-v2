// theme.d.ts
import 'react-native-paper';

declare module 'react-native-paper' {
  interface MD3Theme {
    custom: {
      spacing: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
      };
      borderRadius: {
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
      };
      elevation: {
        none: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
      };
      animation: {
        duration: {
          fast: number;
          normal: number;
          slow: number;
        };
      };
    };
  }
}
