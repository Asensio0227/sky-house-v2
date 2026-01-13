import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityIndicator, Snackbar, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { AppDispatch, RootState } from '../../../store';
import AppText from '../../components/custom/AppText';
import Loading from '../../components/custom/Loading';
import Form from '../../components/form/AppForm';
import Input, { UserDocument } from '../../components/form/FormInput';
import SubmitButton from '../../components/form/SubmitButton';
import { signInUser } from '../../features/auth/authSlice';
import { getCurrentUser } from '../../features/user/userSlice';
import useLocation from '../../hooks/useLocation';
import useNotifications from '../../hooks/useNotifications';

const validateSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

const SignIn = () => {
  const theme = useTheme();
  const navigation: any = useNavigation();
  const { isLoading, error } = useSelector((store: RootState) => store.AUTH);
  const dispatch = useDispatch<AppDispatch>();
  const { expoPushToken } = useNotifications();
  const { location, locationError }: any = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
    },

    // Initializing
    initializingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: 24,
    },
    initCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: 40,
      alignItems: 'center',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    initTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 24,
      textAlign: 'center',
      color: theme.colors.onSurface,
    },
    initSubtext: {
      fontSize: 14,
      marginTop: 8,
      textAlign: 'center',
    },
    skipButton: {
      marginTop: 32,
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    skipButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },

    // Hero Section
    heroSection: {
      paddingHorizontal: 24,
      paddingTop: Platform.OS === 'ios' ? 80 : 60,
      paddingBottom: 40,
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    logoContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.primaryContainer,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    logoEmoji: {
      fontSize: 48,
    },
    heroTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 12,
      textAlign: 'center',
      color: theme.colors.onBackground,
    },
    heroSubtitle: {
      fontSize: 16,
      textAlign: 'center',
    },

    // Alert Banner
    alertBanner: {
      marginHorizontal: 24,
      marginBottom: 24,
      padding: 16,
      backgroundColor: theme.colors.errorContainer,
      borderRadius: 16,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.error,
      flexDirection: 'row',
      alignItems: 'center',
    },
    alertIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    alertEmoji: {
      fontSize: 20,
    },
    alertContent: {
      flex: 1,
    },
    alertTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 2,
      color: theme.colors.onErrorContainer,
    },
    alertText: {
      fontSize: 12,
    },

    // Form Section
    formSection: {
      paddingHorizontal: 24,
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginTop: 8,
      marginBottom: 24,
    },
    forgotPasswordText: {
      fontSize: 14,
      fontWeight: '600',
    },

    // Divider
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 32,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.outline,
    },
    dividerText: {
      marginHorizontal: 16,
      fontSize: 12,
      fontWeight: '600',
    },

    // Guest Card
    guestCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      marginBottom: 24,
    },
    guestIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    guestIcon: {
      fontSize: 24,
    },
    guestContent: {
      flex: 1,
    },
    guestTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
      color: theme.colors.onSurfaceVariant,
    },
    guestSubtitle: {
      fontSize: 13,
    },
    guestArrow: {
      fontSize: 20,
    },

    // Sign Up Section
    signUpSection: {
      alignItems: 'center',
      marginTop: 8,
    },
    signUpPrompt: {
      fontSize: 14,
      marginBottom: 16,
    },
    signUpButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 48,
      borderRadius: 12,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    signUpButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },

    // Footer
    footer: {
      paddingHorizontal: 24,
      paddingVertical: 40,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 12,
    },
    footerLinks: {
      flexDirection: 'row',
      marginTop: 8,
    },
    footerLink: {
      fontSize: 12,
      textDecorationLine: 'underline',
    },

    // Snackbar
    snackbar: {
      backgroundColor: theme.colors.inverseSurface,
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 3000);

    if (expoPushToken !== undefined && location !== undefined) {
      setIsInitializing(false);
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [expoPushToken, location]);

  useEffect(() => {
    if (error) {
      showSnackbar(error);
    }
  }, [error]);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const onSubmit = async (data: UserDocument) => {
    try {
      let userAds_address: any = { type: 'Point', coordinates: [] };
      const coordinates: any =
        location && location.coords ? location.coords : {};
      const { longitude, latitude } = coordinates;
      if (longitude !== undefined && latitude !== undefined) {
        userAds_address.coordinates = [longitude, latitude];
      } else {
        console.log(
          'Coordinates are not available! Please allow app to use your location.'
        );
      }
      data.expoToken = expoPushToken;
      const userData = { ...data, userAds_address };
      await dispatch(signInUser(userData)).unwrap();
      await dispatch(getCurrentUser()).unwrap();
    } catch (error: any) {
      console.error('Sign in error:', error);
      const errorMessage =
        error?.message || 'Failed to sign in. Please try again.';
      showSnackbar(errorMessage);
    }
  };

  const handleSkipLocation = () => {
    Alert.alert(
      'Skip Location Setup',
      'You can sign in without location, but some features may be limited.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => setIsInitializing(false),
          style: 'default',
        },
      ]
    );
  };

  if (isInitializing) {
    return (
      <View style={styles.initializingContainer}>
        <View style={styles.initCard}>
          <ActivityIndicator size='large' color={theme.colors.primary} />
          <AppText title='Setting Up Your Session' style={styles.initTitle} />
          <AppText
            title='Preparing location and notifications...'
            style={styles.initSubtext}
            color={theme.colors.onSurfaceVariant}
          />
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkipLocation}
          >
            <AppText
              title='Skip and Continue →'
              color={theme.colors.primary}
              style={styles.skipButtonText}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <AppText title='🏠' style={styles.logoEmoji} />
          </View>
          <AppText title='Welcome Back!' style={styles.heroTitle} />
          <AppText
            title='Sign in to access your account'
            style={styles.heroSubtitle}
            color={theme.colors.onSurfaceVariant}
          />
        </View>

        {/* Alert Banner */}
        {locationError && (
          <View style={styles.alertBanner}>
            <View style={styles.alertIcon}>
              <AppText title='⚠️' style={styles.alertEmoji} />
            </View>
            <View style={styles.alertContent}>
              <AppText title='Location Limited' style={styles.alertTitle} />
              <AppText
                title='Some features may not be available'
                style={styles.alertText}
                color={theme.colors.onSurfaceVariant}
              />
            </View>
          </View>
        )}

        {/* Form Section */}
        <View style={styles.formSection}>
          <Form
            initialValues={{
              username: '',
              password: '',
            }}
            validationSchema={validateSchema}
            onSubmit={onSubmit}
          >
            <Input
              name='username'
              label='Username'
              placeholder='Enter your username'
              icon='account-circle'
              autoCapitalize='none'
              autoCorrect={false}
              returnKeyType='next'
            />

            <Input
              name='password'
              label='Password'
              placeholder='Enter your password'
              icon={showPassword ? 'eye-off' : 'eye'}
              secureTextEntry={!showPassword}
              onIconPress={() => setShowPassword(!showPassword)}
              returnKeyType='done'
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('reset')}
            >
              <AppText
                title='Forgot your password?'
                color={theme.colors.primary}
                style={styles.forgotPasswordText}
              />
            </TouchableOpacity>

            <SubmitButton title='Sign In' />
          </Form>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <AppText
              title='OR'
              style={styles.dividerText}
              color={theme.colors.onSurfaceVariant}
            />
            <View style={styles.dividerLine} />
          </View>

          {/* Guest Access Card */}
          <TouchableOpacity
            style={styles.guestCard}
            onPress={() => showSnackbar('Guest access coming soon!')}
            activeOpacity={0.7}
          >
            <View style={styles.guestIconContainer}>
              <AppText title='👤' style={styles.guestIcon} />
            </View>
            <View style={styles.guestContent}>
              <AppText title='Continue as Guest' style={styles.guestTitle} />
              <AppText
                title='Browse without an account'
                style={styles.guestSubtitle}
                color={theme.colors.onSurfaceVariant}
              />
            </View>
            <AppText
              title='→'
              style={styles.guestArrow}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>

          {/* Sign Up Section */}
          <View style={styles.signUpSection}>
            <AppText
              title="Don't have an account?"
              color={theme.colors.onSurfaceVariant}
              style={styles.signUpPrompt}
            />
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={() => navigation.navigate('sign-up')}
            >
              <AppText
                title='Create Account'
                color={theme.colors.onPrimary}
                style={styles.signUpButtonText}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <AppText
            title='By signing in, you agree to our'
            style={styles.footerText}
            color={theme.colors.onSurfaceVariant}
          />
          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <AppText
                title='Terms of Service'
                style={styles.footerLink}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
            <AppText
              title=' & '
              style={styles.footerText}
              color={theme.colors.onSurfaceVariant}
            />
            <TouchableOpacity>
              <AppText
                title='Privacy Policy'
                style={styles.footerLink}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

export default SignIn;
