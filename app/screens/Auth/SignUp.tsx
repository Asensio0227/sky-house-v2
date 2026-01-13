import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ProgressBar,
  Surface,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { AppDispatch, RootState } from '../../../store';
import AppText from '../../components/custom/AppText';
import Loading from '../../components/custom/Loading';
import { createUserAccount } from '../../features/auth/authSlice';
import useLocation from '../../hooks/useLocation';
import useNotifications from '../../hooks/useNotifications';

const validationSchema = Yup.object().shape({
  avatar: Yup.string()
    .test('is-valid-uri', 'Invalid image format', (value) => {
      if (!value) return false;
      return /^(file:\/\/|https:\/\/|http:\/\/|data:)/.test(value);
    })
    .required('Profile photo is required'),
  first_name: Yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  last_name: Yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain lowercase letter')
    .matches(/[A-Z]/, 'Password must contain uppercase letter')
    .matches(/[0-9]/, 'Password must contain number')
    .required('Password is required'),
  phone_number: Yup.string()
    .matches(
      /(?:(?<internationCode>\+[1-9]{1,4})[ -])?\(?(?<areacode>\d{2,3})\)?[ -]?(\d{3})[ -]?(\d{4})/,
      'Invalid phone number format'
    )
    .required('Phone number is required'),
  date_of_birth: Yup.string().required('Date of birth is required'),
  gender: Yup.string().required('Gender is required'),
  street: Yup.string().required('Street address is required'),
  city: Yup.string().required('City is required'),
  province: Yup.string().required('Province is required'),
  postal_code: Yup.string().required('Postal code is required'),
  country: Yup.string().required('Country is required'),
  ideaNumber: Yup.string().required('ID number is required'),
});

type Step = 'profile' | 'personal' | 'address' | 'security';

const SignUp = () => {
  const theme = useTheme();
  const { isLoading } = useSelector((store: RootState) => store.AUTH);
  const dispatch = useDispatch<AppDispatch>();
  const { location, isLoadingLocation } = useLocation();
  const { expoPushToken } = useNotifications();
  const navigation: any = useNavigation();

  const [currentStep, setCurrentStep] = useState<Step>('profile');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    avatar: '',
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    gender: '',
    date_of_birth: '',
    phone_number: '',
    street: '',
    city: '',
    province: '',
    postal_code: '',
    country: '',
    ideaNumber: '',
  });

  const steps: Step[] = ['profile', 'personal', 'address', 'security'];
  const stepIndex = steps.indexOf(currentStep);
  const progress = (stepIndex + 1) / steps.length;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 40,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      paddingBottom: 20,
      backgroundColor: theme.colors.primaryContainer,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.onPrimaryContainer,
    },
    stepCounter: {
      fontSize: 14,
      fontWeight: '600',
    },
    progressBar: {
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.surfaceVariant,
    },
    stepInfo: {
      paddingHorizontal: 24,
      paddingVertical: 24,
      backgroundColor: theme.colors.background,
    },
    stepTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 8,
      color: theme.colors.onBackground,
    },
    stepDescription: {
      fontSize: 16,
    },
    formContainer: {
      paddingHorizontal: 24,
    },
    stepContent: {
      marginBottom: 24,
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    avatarSurface: {
      borderRadius: 60,
      overflow: 'hidden',
      marginBottom: 16,
    },
    avatarTouchable: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    avatarImage: {
      width: 120,
      height: 120,
    },
    avatarText: {
      marginTop: 8,
      textAlign: 'center',
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
      marginBottom: 8,
    },
    input: {
      marginBottom: 8,
      backgroundColor: 'transparent',
    },
    photoHint: {
      marginTop: 16,
      padding: 12,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
    },
    locationHint: {
      marginTop: 12,
      padding: 12,
      backgroundColor: theme.colors.primaryContainer,
      borderRadius: 8,
    },
    hintText: {
      fontSize: 14,
      textAlign: 'center',
    },
    passwordHints: {
      marginTop: 12,
      padding: 16,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    passwordHintTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
    },
    passwordHint: {
      fontSize: 13,
      marginBottom: 4,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
    },
    backButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.outline,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    nextButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nextButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    signInContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 32,
    },
    signInText: {
      fontSize: 14,
    },
    signInLink: {
      fontSize: 14,
      fontWeight: '600',
      textDecorationLine: 'underline',
    },
  });

  const validateField = async (fieldName: string, value: any) => {
    try {
      await validationSchema.validateAt(fieldName, { [fieldName]: value });
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return true;
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, [fieldName]: error.message }));
      return false;
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field as keyof typeof formData]);
  };

  const requestImagePermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to upload images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleImageSelect = async () => {
    const hasPermission = await requestImagePermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const uri = result.assets[0].uri;
        setFormData((prev) => ({ ...prev, avatar: uri }));
        setTouched((prev) => ({ ...prev, avatar: true }));
        validateField('avatar', uri);
      }
    } catch (error) {
      console.error('❌ Error selecting image:', error);
    }
  };

  const validateAllFields = async () => {
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      return true;
    } catch (error: any) {
      const validationErrors: Record<string, string> = {};
      error.inner.forEach((err: any) => {
        if (err.path) {
          validationErrors[err.path] = err.message;
        }
      });
      setErrors(validationErrors);

      // Mark all fields as touched
      const allTouched: Record<string, boolean> = {};
      Object.keys(formData).forEach((key) => {
        allTouched[key] = true;
      });
      setTouched(allTouched);

      return false;
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateAllFields();

    if (!isValid) {
      Alert.alert(
        'Validation Error',
        'Please fill in all required fields correctly.'
      );
      return;
    }

    try {
      console.log('======FINAL DATA=======');
      console.log(formData);
      console.log('======FINAL DATA=======');

      let userAds_address: any = { type: 'Point', coordinates: [0, 0] };

      if (location?.coords) {
        const { longitude, latitude } = location.coords;
        if (longitude !== undefined && latitude !== undefined) {
          userAds_address.coordinates = [longitude, latitude];
        }
      }

      const userData = {
        ...formData,
        userAds_address,
        expoToken: expoPushToken || '',
      };

      await dispatch(createUserAccount(userData)).unwrap();
      navigation.navigate('verify');
    } catch (error: any) {
      console.error('Error submitting:', error);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'profile':
        return 'Profile Photo';
      case 'personal':
        return 'Personal Info';
      case 'address':
        return 'Address Details';
      case 'security':
        return 'Security';
      default:
        return 'Sign Up';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'profile':
        return 'Upload your profile photo';
      case 'personal':
        return 'Tell us about yourself';
      case 'address':
        return 'Where are you located?';
      case 'security':
        return 'Set up your account security';
      default:
        return '';
    }
  };

  if (isLoading) return <Loading />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <AppText title='Create Account' style={styles.headerTitle} />
            <AppText
              title={`Step ${stepIndex + 1} of ${steps.length}`}
              style={styles.stepCounter}
              color={theme.colors.onPrimaryContainer}
            />
          </View>
          <ProgressBar
            progress={progress}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
        </View>

        <View style={styles.stepInfo}>
          <AppText title={getStepTitle()} style={styles.stepTitle} />
          <AppText
            title={getStepDescription()}
            style={styles.stepDescription}
            color={theme.colors.onSurfaceVariant}
          />
        </View>

        <View style={styles.formContainer}>
          {/* PROFILE STEP */}
          {currentStep === 'profile' && (
            <View style={styles.stepContent}>
              <View style={styles.avatarContainer}>
                <Surface style={styles.avatarSurface} elevation={2}>
                  <TouchableOpacity
                    style={styles.avatarTouchable}
                    onPress={handleImageSelect}
                    activeOpacity={0.8}
                  >
                    {formData.avatar ? (
                      <Image
                        source={{ uri: formData.avatar }}
                        style={styles.avatarImage}
                        resizeMode='cover'
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name='camera'
                        size={40}
                        color={theme.colors.onSurfaceVariant}
                      />
                    )}
                  </TouchableOpacity>
                </Surface>

                <Text
                  variant='titleMedium'
                  style={{ color: theme.colors.onSurface }}
                >
                  Profile Photo
                </Text>
                <Text
                  variant='bodySmall'
                  style={[
                    styles.avatarText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {formData.avatar ? 'Tap to change' : 'Tap to upload'} your
                  profile picture
                </Text>

                {touched.avatar && errors.avatar && (
                  <Text style={styles.errorText}>{errors.avatar}</Text>
                )}
              </View>

              <View style={styles.photoHint}>
                <AppText
                  title='📸 Choose a clear photo of yourself'
                  style={styles.hintText}
                  color={theme.colors.onSurfaceVariant}
                />
              </View>
            </View>
          )}

          {/* PERSONAL INFO STEP */}
          {currentStep === 'personal' && (
            <View style={styles.stepContent}>
              <TextInput
                mode='outlined'
                label='First Name'
                placeholder='John'
                value={formData.first_name}
                onChangeText={(text) => handleFieldChange('first_name', text)}
                onBlur={() => handleFieldBlur('first_name')}
                error={touched.first_name && !!errors.first_name}
                right={<TextInput.Icon icon='account' />}
                style={styles.input}
              />
              {touched.first_name && errors.first_name && (
                <Text style={styles.errorText}>{errors.first_name}</Text>
              )}

              <TextInput
                mode='outlined'
                label='Last Name'
                placeholder='Doe'
                value={formData.last_name}
                onChangeText={(text) => handleFieldChange('last_name', text)}
                onBlur={() => handleFieldBlur('last_name')}
                error={touched.last_name && !!errors.last_name}
                right={<TextInput.Icon icon='account' />}
                style={styles.input}
              />
              {touched.last_name && errors.last_name && (
                <Text style={styles.errorText}>{errors.last_name}</Text>
              )}

              <TextInput
                mode='outlined'
                label='Username'
                placeholder='johndoe'
                value={formData.username}
                onChangeText={(text) => handleFieldChange('username', text)}
                onBlur={() => handleFieldBlur('username')}
                error={touched.username && !!errors.username}
                autoCapitalize='none'
                right={<TextInput.Icon icon='at' />}
                style={styles.input}
              />
              {touched.username && errors.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}

              <TextInput
                mode='outlined'
                label='Email'
                placeholder='john@example.com'
                value={formData.email}
                onChangeText={(text) => handleFieldChange('email', text)}
                onBlur={() => handleFieldBlur('email')}
                error={touched.email && !!errors.email}
                keyboardType='email-address'
                autoCapitalize='none'
                right={<TextInput.Icon icon='email' />}
                style={styles.input}
              />
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              <TextInput
                mode='outlined'
                label='ID Number'
                placeholder='Enter your ID number'
                value={formData.ideaNumber}
                onChangeText={(text) => handleFieldChange('ideaNumber', text)}
                onBlur={() => handleFieldBlur('ideaNumber')}
                error={touched.ideaNumber && !!errors.ideaNumber}
                right={<TextInput.Icon icon='card-account-details' />}
                style={styles.input}
              />
              {touched.ideaNumber && errors.ideaNumber && (
                <Text style={styles.errorText}>{errors.ideaNumber}</Text>
              )}

              <TextInput
                mode='outlined'
                label='Phone Number'
                placeholder='+263 123 456 7890'
                value={formData.phone_number}
                onChangeText={(text) => handleFieldChange('phone_number', text)}
                onBlur={() => handleFieldBlur('phone_number')}
                error={touched.phone_number && !!errors.phone_number}
                keyboardType='phone-pad'
                right={<TextInput.Icon icon='phone' />}
                style={styles.input}
              />
              {touched.phone_number && errors.phone_number && (
                <Text style={styles.errorText}>{errors.phone_number}</Text>
              )}

              <TextInput
                mode='outlined'
                label='Date of Birth'
                placeholder='YYYY-MM-DD'
                value={formData.date_of_birth}
                onChangeText={(text) =>
                  handleFieldChange('date_of_birth', text)
                }
                onBlur={() => handleFieldBlur('date_of_birth')}
                error={touched.date_of_birth && !!errors.date_of_birth}
                right={<TextInput.Icon icon='calendar' />}
                style={styles.input}
              />
              {touched.date_of_birth && errors.date_of_birth && (
                <Text style={styles.errorText}>{errors.date_of_birth}</Text>
              )}

              <TextInput
                mode='outlined'
                label='Gender'
                placeholder='Male / Female / Other'
                value={formData.gender}
                onChangeText={(text) => handleFieldChange('gender', text)}
                onBlur={() => handleFieldBlur('gender')}
                error={touched.gender && !!errors.gender}
                right={<TextInput.Icon icon='gender-male-female' />}
                style={styles.input}
              />
              {touched.gender && errors.gender && (
                <Text style={styles.errorText}>{errors.gender}</Text>
              )}
            </View>
          )}

          {/* ADDRESS STEP */}
          {currentStep === 'address' && (
            <View style={styles.stepContent}>
              <TextInput
                mode='outlined'
                label='Street Address'
                placeholder='123 Main Street'
                value={formData.street}
                onChangeText={(text) => handleFieldChange('street', text)}
                onBlur={() => handleFieldBlur('street')}
                error={touched.street && !!errors.street}
                right={<TextInput.Icon icon='map-marker' />}
                style={styles.input}
              />
              {touched.street && errors.street && (
                <Text style={styles.errorText}>{errors.street}</Text>
              )}

              <TextInput
                mode='outlined'
                label='City'
                placeholder='Harare'
                value={formData.city}
                onChangeText={(text) => handleFieldChange('city', text)}
                onBlur={() => handleFieldBlur('city')}
                error={touched.city && !!errors.city}
                right={<TextInput.Icon icon='city' />}
                style={styles.input}
              />
              {touched.city && errors.city && (
                <Text style={styles.errorText}>{errors.city}</Text>
              )}

              <TextInput
                mode='outlined'
                label='Province'
                placeholder='Harare Province'
                value={formData.province}
                onChangeText={(text) => handleFieldChange('province', text)}
                onBlur={() => handleFieldBlur('province')}
                error={touched.province && !!errors.province}
                right={<TextInput.Icon icon='map' />}
                style={styles.input}
              />
              {touched.province && errors.province && (
                <Text style={styles.errorText}>{errors.province}</Text>
              )}

              <TextInput
                mode='outlined'
                label='Postal Code'
                placeholder='00263'
                value={formData.postal_code}
                onChangeText={(text) => handleFieldChange('postal_code', text)}
                onBlur={() => handleFieldBlur('postal_code')}
                error={touched.postal_code && !!errors.postal_code}
                right={<TextInput.Icon icon='mailbox' />}
                style={styles.input}
              />
              {touched.postal_code && errors.postal_code && (
                <Text style={styles.errorText}>{errors.postal_code}</Text>
              )}

              <TextInput
                mode='outlined'
                label='Country'
                placeholder='Zimbabwe'
                value={formData.country}
                onChangeText={(text) => handleFieldChange('country', text)}
                onBlur={() => handleFieldBlur('country')}
                error={touched.country && !!errors.country}
                right={<TextInput.Icon icon='flag' />}
                style={styles.input}
              />
              {touched.country && errors.country && (
                <Text style={styles.errorText}>{errors.country}</Text>
              )}

              {isLoadingLocation && (
                <View style={styles.locationHint}>
                  <AppText
                    title='📍 Detecting your location...'
                    style={styles.hintText}
                    color={theme.colors.primary}
                  />
                </View>
              )}
            </View>
          )}

          {/* SECURITY STEP */}
          {currentStep === 'security' && (
            <View style={styles.stepContent}>
              <TextInput
                mode='outlined'
                label='Password'
                placeholder='Create a strong password'
                value={formData.password}
                onChangeText={(text) => handleFieldChange('password', text)}
                onBlur={() => handleFieldBlur('password')}
                error={touched.password && !!errors.password}
                secureTextEntry
                right={<TextInput.Icon icon='lock' />}
                style={styles.input}
              />
              {touched.password && errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              <View style={styles.passwordHints}>
                <AppText
                  title='Password must contain:'
                  style={styles.passwordHintTitle}
                  color={theme.colors.onSurface}
                />
                <AppText
                  title='• At least 8 characters'
                  style={styles.passwordHint}
                  color={theme.colors.onSurfaceVariant}
                />
                <AppText
                  title='• Uppercase and lowercase letters'
                  style={styles.passwordHint}
                  color={theme.colors.onSurfaceVariant}
                />
                <AppText
                  title='• At least one number'
                  style={styles.passwordHint}
                  color={theme.colors.onSurfaceVariant}
                />
              </View>
            </View>
          )}

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {stepIndex > 0 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setCurrentStep(steps[stepIndex - 1])}
              >
                <AppText
                  title='← Back'
                  color={theme.colors.onSurface}
                  style={styles.backButtonText}
                />
              </TouchableOpacity>
            )}

            {stepIndex < steps.length - 1 ? (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => setCurrentStep(steps[stepIndex + 1])}
              >
                <AppText
                  title='Next →'
                  color={theme.colors.onPrimary}
                  style={styles.nextButtonText}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleSubmit}
              >
                <AppText
                  title='Create Account'
                  color={theme.colors.onPrimary}
                  style={styles.nextButtonText}
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.signInContainer}>
            <AppText
              title='Already have an account? '
              color={theme.colors.onSurfaceVariant}
              style={styles.signInText}
            />
            <TouchableOpacity onPress={() => navigation.navigate('sign-in')}>
              <AppText
                title='Sign In'
                color={theme.colors.primary}
                style={styles.signInLink}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;
