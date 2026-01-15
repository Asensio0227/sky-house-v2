import { Formik } from 'formik';
import React from 'react';

interface AppFormProps {
  initialValues: any;
  validationSchema: any;
  onSubmit: (values: any) => void | Promise<void>;
  children: React.ReactNode;
  style?: any;
}

const AppForm: React.FC<AppFormProps> = ({
  initialValues,
  validationSchema,
  onSubmit,
  children,
  style,
}) => {
  console.log('🔶 AppForm rendered');

  const handleSubmit = async (values: any, actions: any) => {
    console.log('🟡 AppForm handleSubmit called');
    console.log('📤 Values being submitted:', values);

    try {
      await onSubmit(values);
      console.log('✅ onSubmit completed successfully');
    } catch (error) {
      console.log('❌ onSubmit error:', error);
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      validateOnMount={true}
      enableReinitialize={true}
    >
      {({ handleSubmit: formikHandleSubmit }) => {
        console.log('🔸 Formik render function called');
        return <>{children}</>;
      }}
    </Formik>
  );
};

export default AppForm;
