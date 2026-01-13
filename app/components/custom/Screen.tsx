import Constants from 'expo-constants';
import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const Screen: React.FC<{
  children: React.ReactNode;
  style?: any;
  onLayout?: () => any;
}> = ({ children, style, onLayout }) => {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[
        styles.screen,
        { backgroundColor: theme.colors.background },
        style,
      ]}
    >
      <View style={[styles.view, style]} onLayout={onLayout}>
        {children}
        {Platform.OS === 'android' && (
          <KeyboardAvoidingView
            behavior={Platform.OS !== 'android' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS !== 'android' ? -64 : 0}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Screen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    // paddingTop: Constants.statusBarHeight,
  },
  view: {
    flex: 1,
  },
});
