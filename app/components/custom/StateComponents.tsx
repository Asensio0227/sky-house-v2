import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { designTokens } from '../../utils/designTokens';

// Empty state component for when there's no data
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: any;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  action,
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <Text style={[styles.icon, { color: theme.colors.onSurfaceVariant }]}>
          {icon === 'inbox' ? '📭' : icon === 'search' ? '🔍' : '📄'}
        </Text>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        {description && (
          <Text
            style={[
              styles.description,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {description}
          </Text>
        )}
        {action && (
          <Button
            mode='contained'
            onPress={action.onPress}
            style={styles.actionButton}
          >
            {action.label}
          </Button>
        )}
      </View>
    </View>
  );
};

// Error state component for error handling
interface ErrorStateProps {
  error?: string;
  onRetry?: () => void;
  style?: any;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error = 'Something went wrong',
  onRetry,
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <Text style={[styles.icon, { color: theme.colors.error }]}>⚠️</Text>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Oops!
        </Text>
        <Text
          style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
        >
          {error}
        </Text>
        {onRetry && (
          <Button
            mode='contained'
            onPress={onRetry}
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.error },
            ]}
          >
            Try Again
          </Button>
        )}
      </View>
    </View>
  );
};

// Loading state component
interface LoadingStateProps {
  message?: string;
  style?: any;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <Text style={[styles.icon, { color: theme.colors.primary }]}>⏳</Text>
        <Text
          style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
        >
          {message}
        </Text>
      </View>
    </View>
  );
};

// Success state component
interface SuccessStateProps {
  message: string;
  onContinue?: () => void;
  style?: any;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  message,
  onContinue,
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <Text style={[styles.icon, { color: theme.colors.success }]}>✅</Text>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Success!
        </Text>
        <Text
          style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
        >
          {message}
        </Text>
        {onContinue && (
          <Button
            mode='contained'
            onPress={onContinue}
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.success },
            ]}
          >
            Continue
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: designTokens.spacing.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  icon: {
    fontSize: designTokens.typography.fontSize.xxxl,
    marginBottom: designTokens.spacing.md,
  },
  title: {
    fontSize: designTokens.typography.fontSize.xl,
    fontWeight: designTokens.typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: designTokens.spacing.sm,
  },
  description: {
    fontSize: designTokens.typography.fontSize.md,
    textAlign: 'center',
    marginBottom: designTokens.spacing.lg,
    lineHeight: designTokens.typography.lineHeight.md,
  },
  actionButton: {
    borderRadius: designTokens.borderRadius.md,
    minWidth: 120,
  },
});
