import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { designTokens } from '../../utils/designTokens';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Processing...',
}) => {
  const theme = useTheme();

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType='fade'
      visible={visible}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View
          style={[styles.container, { backgroundColor: theme.colors.surface }]}
        >
          <ActivityIndicator size='large' color={theme.colors.primary} />
          <Text
            variant='bodyLarge'
            style={[styles.message, { color: theme.colors.onSurface }]}
          >
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default LoadingOverlay;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    borderRadius: designTokens.borderRadius.xl,
    padding: designTokens.spacing.xl,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  message: {
    marginTop: designTokens.spacing.md,
    fontWeight: '600',
  },
});
