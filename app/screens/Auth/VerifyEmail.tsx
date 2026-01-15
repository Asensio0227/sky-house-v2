import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Surface, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { AppDispatch, RootState } from '../../../store';
import AppButton from '../../components/custom/AppButton';
import AppText from '../../components/custom/AppText';
import Loading from '../../components/custom/Loading';
import AppForm from '../../components/form/AppForm';
import FormInput from '../../components/form/FormInput';
import ResetInput from '../../components/form/ResetInput';
import SubmitButton from '../../components/form/SubmitButton';
import { resendAccountCode, verifyEmail } from '../../features/auth/authSlice';
import { designTokens } from '../../utils/designTokens';

const VerifyEmail = () => {
  const theme = useTheme();
  const [resend, setResend] = useState(false);
  const navigation: any = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((store: RootState) => store.AUTH);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: designTokens.spacing.lg,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: designTokens.borderRadius.xl,
      padding: designTokens.spacing.xl,
      elevation: 4,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    header: {
      alignItems: 'center',
      marginBottom: designTokens.spacing.xl,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.primaryContainer,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: designTokens.spacing.md,
    },
    icon: {
      fontSize: 40,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: designTokens.spacing.xs,
      color: theme.colors.onSurface,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      lineHeight: 20,
    },
    infoBox: {
      backgroundColor: theme.colors.primaryContainer,
      borderRadius: designTokens.borderRadius.md,
      padding: designTokens.spacing.md,
      marginBottom: designTokens.spacing.lg,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    infoText: {
      fontSize: 13,
      color: theme.colors.onPrimaryContainer,
      lineHeight: 18,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.outlineVariant,
      marginVertical: designTokens.spacing.lg,
    },
    resendContainer: {
      alignItems: 'center',
      marginTop: designTokens.spacing.md,
    },
    resendButton: {
      marginTop: designTokens.spacing.sm,
    },
    backButton: {
      marginTop: designTokens.spacing.lg,
    },
  });

  const toggleBtn = () => setResend(!resend);

  const handleChange = async (data: any) => {
    try {
      await dispatch(verifyEmail(data)).unwrap();
      navigation.navigate('welcome');
    } catch (error: any) {
      console.log(`Error submitting code: ${error.message}`);
    }
  };

  const handleResend = async (values: { email: string }) => {
    try {
      await dispatch(resendAccountCode(values)).unwrap();
      setResend(false);
    } catch (error: any) {
      console.log(`Error resending code: ${error.message}`);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
      >
        <Surface style={styles.card}>
          {!resend ? (
            <>
              {/* Header Section */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <AppText title='✉️' style={styles.icon} />
                </View>
                <AppText title='Verify Your Email' style={styles.title} />
                <AppText
                  title='Enter the 6-digit code sent to your email address'
                  style={styles.subtitle}
                />
              </View>

              {/* Info Box */}
              <View style={styles.infoBox}>
                <AppText
                  title="💡 Check your spam folder if you don't see the email"
                  style={styles.infoText}
                />
              </View>

              {/* Form Section */}
              <AppForm
                initialValues={{ email: '', token: '' }}
                validationSchema={Yup.object().shape({
                  token: Yup.string()
                    .required('Please enter verification code.')
                    .length(6, 'Code must be exactly 6 characters long'),
                  email: Yup.string()
                    .email('Please enter a valid email')
                    .required('Please enter your email.'),
                })}
                onSubmit={handleChange}
              >
                <FormInput
                  name='email'
                  icon='email'
                  label='Email Address'
                  placeholder='your@email.com'
                  keyboardType='email-address'
                  autoCapitalize='none'
                />

                <FormInput
                  name='token'
                  icon='shield-key'
                  label='Verification Code'
                  placeholder='Enter 6-digit code'
                  keyboardType='number-pad'
                  maxLength={6}
                />

                <SubmitButton title='Verify Email' />
              </AppForm>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Resend Section */}
              <View style={styles.resendContainer}>
                <AppText
                  title="Didn't receive the code?"
                  style={styles.subtitle}
                />
                <AppButton
                  title='Resend Verification Code'
                  onPress={toggleBtn}
                  mode='text'
                  style={styles.resendButton}
                />
              </View>
            </>
          ) : (
            <>
              {/* Resend Header */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <AppText title='🔄' style={styles.icon} />
                </View>
                <AppText title='Resend Code' style={styles.title} />
                <AppText
                  title='Enter your email to receive a new verification code'
                  style={styles.subtitle}
                />
              </View>

              {/* Resend Form */}
              <ResetInput
                initialValues={{ email: '' }}
                validateSchema={Yup.object().shape({
                  email: Yup.string()
                    .email('Please enter a valid email')
                    .required('Please enter your email.'),
                })}
                onPress={handleResend}
                title='Send New Code'
                subTitle="We'll send a fresh verification code to this email"
              />

              {/* Back Button */}
              <AppButton
                title='← Back to Verification'
                onPress={toggleBtn}
                mode='outlined'
                style={styles.backButton}
              />
            </>
          )}
        </Surface>
      </ScrollView>
    </View>
  );
};

export default VerifyEmail;
