import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MD2Colors, MD3Theme, withTheme } from 'react-native-paper';
import AppText from '../components/custom/AppText';

interface Props {
  children: ReactNode;
  theme: MD3Theme;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class NavigationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error(
      'Navigation Error Boundary caught an error:',
      error,
      errorInfo
    );

    // Filter out the specific immutable object error
    if (
      error.message.includes('attempted to set the key') &&
      error.message.includes('undefined') &&
      error.message.includes('immutable')
    ) {
      console.log(
        'Ignoring immutable object warning - this is a React Navigation internal warning'
      );
      // Reset the error state after a brief delay
      setTimeout(() => {
        this.setState({ hasError: false, error: null });
      }, 100);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { theme } = this.props;

    if (this.state.hasError) {
      // Check if it's the navigation immutable error
      const isNavigationError =
        this.state.error?.message.includes('attempted to set the key') &&
        this.state.error?.message.includes('immutable');

      if (isNavigationError) {
        // Don't show error UI for this specific error, just render children
        return this.props.children;
      }

      // Show error UI for other errors
      return (
        <View
          style={[
            styles.container,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <View
            style={[
              styles.errorCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <AppText title='⚠️' style={styles.errorIcon} />
            <AppText
              title='Something went wrong'
              style={styles.errorTitle}
              color={theme.colors.onSurface}
            />
            <AppText
              title='An unexpected error occurred while navigating'
              style={styles.errorMessage}
              color={theme.colors.onSurfaceVariant}
            />
            {__DEV__ && this.state.error && (
              <View
                style={[
                  styles.errorDetails,
                  { backgroundColor: theme.colors.errorContainer },
                ]}
              >
                <AppText
                  title={this.state.error.message}
                  style={styles.errorText}
                  color={theme.colors.onErrorContainer}
                />
              </View>
            )}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={this.handleReset}
            >
              <AppText
                title='Try Again'
                style={styles.buttonText}
                color={theme.colors.onPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export default withTheme(NavigationErrorBoundary);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorDetails: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
