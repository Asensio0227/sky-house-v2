import LottieView from 'lottie-react-native';
import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  ProgressBar,
  Text,
  useTheme,
} from 'react-native-paper';
import { designTokens } from '../../utils/designTokens';

const UploadProgressBar: React.FC<{
  progress: number;
  uploadVisible: boolean;
}> = ({ progress, uploadVisible }) => {
  const theme = useTheme();

  return (
    <Modal visible={uploadVisible} transparent animationType='fade'>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
        <View
          style={[styles.container, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.iconContainer}>
            <ActivityIndicator size='large' color={theme.colors.primary} />
          </View>

          <Text
            variant='titleMedium'
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            Uploading Property
          </Text>

          <Text
            variant='bodyMedium'
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Please wait while we upload your listing...
          </Text>

          <View style={styles.progressContainer}>
            <ProgressBar
              progress={progress}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
            <Text
              variant='bodySmall'
              style={[
                styles.percentage,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {Math.round(progress * 100)}%
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default UploadProgressBar;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 400,
    borderRadius: designTokens.borderRadius.xl,
    padding: designTokens.spacing.xl,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconContainer: {
    marginBottom: designTokens.spacing.lg,
  },
  title: {
    fontWeight: '700',
    marginBottom: designTokens.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: designTokens.spacing.lg,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
  },
  percentage: {
    marginTop: designTokens.spacing.sm,
    fontWeight: '600',
  },
});
