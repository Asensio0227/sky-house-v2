import { ScrollView, StyleSheet, View } from 'react-native';
import { Divider, useTheme } from 'react-native-paper';
import Form from '../form/AppForm';
import DatePicker from '../form/DatePicker';
import FormImage from '../form/FormImage';
import Input from '../form/FormInput';
import Submit from '../form/SubmitButton';
import Text from './AppText';
import TextLink from './TextLink';

const Setup: React.FC<{
  initialValues: any;
  onSubmit: any;
  validationSchema: any;
  edit?: boolean | any;
  title?: string;
}> = ({
  initialValues,
  onSubmit,
  validationSchema,
  edit,
  title = 'Sign Up',
}) => {
  const theme = useTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {!edit && (
          <View style={styles.headerContainer}>
            <Text
              title='Create Account'
              variant='headlineMedium'
              style={[styles.headerTitle, { color: theme.colors.primary }]}
            />
            <Text
              title='Fill in your details to get started'
              style={[
                styles.headerSubtitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            />
          </View>
        )}

        <Form
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {/* Profile Image - Single Image Mode */}
          <FormImage name='avatar' singleImage={true} photoUrl={true} />

          <Divider style={styles.divider} />

          {/* Personal Information Section */}
          <View style={styles.section}>
            <Text
              title='Personal Information'
              variant='titleMedium'
              style={[styles.sectionTitle, { color: theme.colors.primary }]}
            />

            <Input
              name='first_name'
              label='First name'
              placeholder='Enter your first name'
              icon='account'
            />
            <Input
              name='last_name'
              label='Last name'
              placeholder='Enter your last name'
              icon='account'
            />
            <Input
              name='username'
              label='Username'
              placeholder='Choose a username'
              icon='at'
            />
            {!edit && (
              <Input
                name='email'
                label='Email'
                placeholder='Enter your email'
                icon='email'
                keyboardType='email-address'
                autoCapitalize='none'
              />
            )}
            <Input
              name='ideaNumber'
              label='ID Number'
              placeholder='Enter your ID number'
              icon='card-account-details'
            />
            <DatePicker
              name='date_of_birth'
              label='Date of birth'
              placeholder='Select your date of birth'
              icon='calendar'
            />
            <Input
              name='gender'
              label='Gender'
              placeholder='Enter your gender'
              icon='gender-male-female'
            />
          </View>

          <Divider style={styles.divider} />

          {/* Contact Information Section */}
          <View style={styles.section}>
            <Text
              title='Contact Information'
              variant='titleMedium'
              style={[styles.sectionTitle, { color: theme.colors.primary }]}
            />

            <Input
              name='phone_number'
              label='Phone number'
              placeholder='Enter your phone number'
              icon='phone'
              keyboardType='phone-pad'
            />
          </View>

          <Divider style={styles.divider} />

          {/* Address Section */}
          <View style={styles.section}>
            <Text
              title='Physical Address'
              variant='titleMedium'
              style={[styles.sectionTitle, { color: theme.colors.primary }]}
            />

            <Input
              name='street'
              label='Street'
              placeholder='Enter your street address'
              icon='road'
            />
            <Input
              name='city'
              label='City'
              placeholder='Enter your city'
              icon='city'
            />
            <Input
              name='province'
              label='Province'
              placeholder='Enter your province'
              icon='map-marker'
            />
            <Input
              name='postal_code'
              label='Postal code'
              placeholder='Enter your postal code'
              icon='mailbox'
            />
            <Input
              name='country'
              label='Country'
              placeholder='Enter your country'
              icon='earth'
            />
          </View>

          {!edit && (
            <>
              <Divider style={styles.divider} />

              <View style={styles.section}>
                <Text
                  title='Security'
                  variant='titleMedium'
                  style={[styles.sectionTitle, { color: theme.colors.primary }]}
                />

                <Input
                  name='password'
                  label='Password'
                  placeholder='Create a secure password'
                  icon='lock'
                  secureTextEntry
                />
              </View>
            </>
          )}

          <Submit title={title} />
        </Form>

        {!edit && (
          <TextLink
            text='Already have an account? '
            linkText='Sign in'
            link='sign-in'
          />
        )}
      </View>
    </ScrollView>
  );
};

export default Setup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 24,
  },
  content: {
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
});
