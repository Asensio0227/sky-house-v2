import { useFormikContext } from 'formik';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { designTokens } from '../../utils/designTokens';
import ErrorMessage from './ErrorMessage';

const FormInput: React.FC<{
  name: string;
  icon?: string;
  label?: string;
  placeholder?: string;
  mode?: 'flat' | 'outlined';
  style?: any;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  onIconPress?: () => void;
  [key: string]: any;
}> = ({
  name,
  icon,
  label,
  placeholder,
  mode = 'outlined',
  style,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  onIconPress,
  ...otherProps
}) => {
  const theme = useTheme();
  const { setFieldTouched, setFieldValue, touched, errors, values } =
    useFormikContext<any>();

  return (
    <View style={styles.inputContainer}>
      <TextInput
        value={values[name] || ''}
        mode={mode}
        label={label}
        placeholder={placeholder}
        right={
          icon ? (
            <TextInput.Icon icon={icon} onPress={onIconPress} />
          ) : undefined
        }
        onBlur={() => setFieldTouched(name)}
        onChangeText={(text: any) => setFieldValue(name, text)}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        error={touched[name] && !!errors[name]}
        style={[styles.input, multiline && styles.multilineInput, style]}
        outlineStyle={{
          borderRadius: designTokens.borderRadius.lg,
          borderWidth: 1.5,
        }}
        theme={{
          colors: {
            primary: theme.colors.primary,
            error: theme.colors.error,
          },
          roundness: designTokens.borderRadius.lg,
        }}
        {...otherProps}
      />
      <ErrorMessage visible={touched[name]} error={errors[name]} />
    </View>
  );
};

export default FormInput;

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: designTokens.spacing.sm,
  },
  input: {
    backgroundColor: 'transparent',
  },
  multilineInput: {
    minHeight: 100,
  },
});
