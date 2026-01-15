import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { designTokens } from '../../utils/designTokens';
import AppText from '../custom/AppText';
import AppForm from './AppForm';
import FormInput from './FormInput';
import SubmitButton from './SubmitButton';

const ResetInput: React.FC<{
  onPress: any;
  validateSchema: any;
  title: string;
  initialValues: any;
  subTitle: string;
}> = ({ onPress, validateSchema, initialValues, title, subTitle }) => {
  const theme = useTheme();

  return (
    <AppForm
      initialValues={initialValues}
      validationSchema={validateSchema}
      onSubmit={onPress}
    >
      <AppText
        style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        title={subTitle}
      />
      <FormInput
        name='email'
        icon='email'
        label='Email Address'
        placeholder='your@email.com'
        keyboardType='email-address'
        autoCapitalize='none'
      />
      <SubmitButton title={title} style={styles.submitButton} />
    </AppForm>
  );
};

export default ResetInput;

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: designTokens.spacing.lg,
    lineHeight: 20,
  },
  submitButton: {
    marginTop: designTokens.spacing.md,
  },
});
