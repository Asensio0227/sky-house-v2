import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
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
      style={styles.inputContainer}
      onSubmit={onPress}
    >
      <AppText
        style={[styles.subtitle, { color: theme.colors.onSurface }]}
        title={subTitle}
      />
      <FormInput name='email' icon='email' label='Email' placeholder='Email' />
      <SubmitButton title={title} />
    </AppForm>
  );
};

export default ResetInput;

const styles = StyleSheet.create({
  inputContainer: {
    fontSize: 24,
    width: '90%',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textDecorationLine: 'underline',
    marginBottom: 16,
  },
});
