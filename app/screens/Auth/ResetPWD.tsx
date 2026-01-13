import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { AppDispatch, RootState } from '../../../store';
import Loading from '../../components/custom/Loading';
import TextLink from '../../components/custom/TextLink';
import Form from '../../components/form/AppForm';
import FormInput from '../../components/form/FormInput';
import ResetInput from '../../components/form/ResetInput';
import Submit from '../../components/form/SubmitButton';
import {
  requestResetPassword,
  ResetUserPassword,
} from '../../features/auth/authSlice';

const ResetPwd = () => {
  const theme = useTheme();
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const navigation: any = useNavigation();
  const { isLoading } = useSelector((store: RootState) => store.AUTH);
  const dispatch = useDispatch<AppDispatch>();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginVertical: 10,
      backgroundColor: theme.colors.background,
      padding: 20,
    },
    containerCenter: {
      padding: 2,
      marginVertical: 8,
      flexDirection: 'row',
      borderRadius: 15,
      width: '100%',
      borderWidth: 1,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.surface,
    },
    icon: {
      margin: 10,
    },
    input: {
      flexDirection: 'row',
      borderRadius: 10,
      marginBottom: 10,
      height: 50,
      overflow: 'hidden',
      backgroundColor: theme.colors.surface,
    },
    text: {
      fontSize: 24,
      marginBottom: 15,
      fontWeight: 'bold',
      textAlign: 'center',
      textTransform: 'capitalize',
      textDecorationLine: 'underline',
      color: theme.colors.onBackground,
    },
    linkContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
  });

  const toggleBtn = () => setSuccessfulCreation(!successfulCreation);

  const onRequestReset = async (data: any) => {
    try {
      await dispatch(requestResetPassword(data) as any);
      setSuccessfulCreation(true);
    } catch (error: any) {
      console.log(`Error submitting code: ${error.message}`);
    } finally {
      toggleBtn();
    }
  };

  const onReset = async (data: any) => {
    try {
      await dispatch(ResetUserPassword(data) as any);
      navigation.navigate('sign-in');
    } catch (error: any) {
      console.log(`Error submitting code: ${error.message}`);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <View style={styles.container}>
      {!successfulCreation && (
        <ResetInput
          initialValues={{ email: '' }}
          onPress={onRequestReset}
          validateSchema={Yup.object().shape({
            email: Yup.string().email().required('Please enter your email'),
          })}
          subTitle='Enter email to reset password'
          title='submit'
        />
      )}

      {successfulCreation && (
        <Form
          initialValues={{ password: '', token: '', email: '' }}
          validationSchema={Yup.object().shape({
            token: Yup.string()
              .required('Please enter verification code.')
              .length(6, 'Code must be exactly 6 characters long'),
            email: Yup.string().email().required('Please enter your email.'),
            password: Yup.string()
              .required('Password is required')
              .min(8, 'Password is too short - should be 8 chars minimum'),
          })}
          onSubmit={onReset}
        >
          <View>
            <FormInput name='email' icon='email' placeholder='Email' />
            <FormInput
              name='token'
              icon='two-factor-authentication'
              placeholder='Code...'
            />
            <FormInput name='password' icon='lock' placeholder='New password' />
          </View>
          <Submit title='submit' />
        </Form>
      )}
      <View style={styles.linkContainer}>
        <TextLink
          text='I already have a account?'
          linkText='sign-in'
          link='sign-in'
        />
        <TextLink
          text="I don't have a account?"
          linkText='Create Account'
          link='sign-up'
        />
      </View>
    </View>
  );
};

export default ResetPwd;
