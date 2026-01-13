import { Formik } from 'formik';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const AppForm: React.FC<{
  initialValues: any;
  onSubmit: any;
  validationSchema: any;
  children: React.ReactNode;
  style?: any;
  innerRef?: any;
}> = ({
  children,
  initialValues,
  onSubmit,
  validationSchema,
  style,
  innerRef,
}) => {
  return (
    <Formik
      innerRef={innerRef}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      validateOnMount={false}
      validateOnChange={false}
      validateOnBlur={true}
      enableReinitialize={true} // ✅ CRITICAL: This allows Formik to update when initialValues change
    >
      {() => <View style={[styles.container, style]}>{children}</View>}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

export default AppForm;
