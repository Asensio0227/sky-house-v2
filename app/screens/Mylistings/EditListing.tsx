import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useFormikContext } from 'formik';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  Card,
  IconButton,
  ProgressBar,
  Text,
  useTheme,
} from 'react-native-paper';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import AppForm from '../../components/form/AppForm';
import DatePicker from '../../components/form/DatePicker';
import FormImageField from '../../components/form/FormImage';
import FormInput from '../../components/form/FormInput';
import FormSelector from '../../components/form/FormSelector';
import SubmitButton from '../../components/form/SubmitButton';
import { updateAd } from '../../features/estate/estateSlice';
import { UIEstateDocument } from '../../features/estate/types';
import { designTokens } from '../../utils/designTokens';

// FormikConsumer component for conditional rendering
const FormikConsumer = ({ children }: any) => {
  const formikProps = useFormikContext();
  return children(formikProps);
};

// Same validation schema as CreateListing
const editListingSchema = Yup.object().shape({
  photo: Yup.array()
    .min(1, 'Please upload at least 1 image')
    .max(6, 'Maximum 6 images allowed')
    .required('Property images are required'),

  title: Yup.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must not exceed 100 characters')
    .required('Title is required'),

  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters')
    .required('Description is required'),

  category: Yup.string()
    .oneOf(['Apartments', 'Houses', 'Condos', 'Villas', 'Land'])
    .required('Category is required'),

  listingType: Yup.string()
    .oneOf(['sale', 'rent'])
    .required('Listing type is required'),

  price: Yup.number().when('listingType', {
    is: 'sale',
    then: (schema) =>
      schema
        .min(1, 'Price must be greater than 0')
        .required('Sale price is required'),
    otherwise: (schema) => schema.notRequired(),
  }),

  rentPrice: Yup.number().when('listingType', {
    is: 'rent',
    then: (schema) =>
      schema
        .min(1, 'Rent price must be greater than 0')
        .required('Rent price is required'),
    otherwise: (schema) => schema.notRequired(),
  }),

  rentFrequency: Yup.string().when('listingType', {
    is: 'rent',
    then: (schema) =>
      schema
        .oneOf(['daily', 'weekly', 'monthly', 'yearly'])
        .required('Rent frequency is required'),
    otherwise: (schema) => schema.notRequired(),
  }),

  bedrooms: Yup.number()
    .min(0, 'Bedrooms cannot be negative')
    .required('Number of bedrooms is required'),

  bathrooms: Yup.number()
    .min(0, 'Bathrooms cannot be negative')
    .required('Number of bathrooms is required'),

  // Contact Details (ALL required by backend)
  contact_phone: Yup.string()
    .matches(/^[\d\s+()-]+$/, 'Please enter a valid phone number')
    .required('Phone number is required'),

  contact_email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),

  contact_address: Yup.string()
    .min(5, 'Address must be at least 5 characters')
    .required('Address is required'),

  // Listing Source
  listingSource: Yup.string()
    .oneOf(['municipality', 'agent', 'owner'])
    .required('Listing source is required'),
});

const EditListing = () => {
  const theme = useTheme();
  const navigation: any = useNavigation();
  const route = useRoute();
  const dispatch: any = useDispatch();
  const listing: UIEstateDocument = route.params as any;
  const [uploadProgress, setUploadProgress] = useState(0);

  // Extract image URLs from photo array
  const photoUrls = listing.photo?.map((img) => img.url || img.id) || [];

  // Initial form values from existing listing
  const initialValues = {
    photo: photoUrls,
    title: listing.title || '',
    description: listing.description || '',
    category: listing.category || '',
    listingType: listing.listingType || 'sale',
    price: listing.price ? String(listing.price) : '',
    rentPrice: listing.rentPrice ? String(listing.rentPrice) : '',
    rentFrequency: listing.rentFrequency || 'monthly',
    depositAmount: listing.deposit ? String(listing.deposit) : '',
    availableFrom: listing.availableFrom || '',
    isFurnished:
      listing.furnished !== undefined ? String(listing.furnished) : '',
    minimumStay: listing.minimumStay ? String(listing.minimumStay) : '',
    bedrooms: listing.bedrooms ? String(listing.bedrooms) : '',
    bathrooms: listing.bathrooms ? String(listing.bathrooms) : '',
    contact_phone: listing.contact_details?.phone_number || '',
    contact_email: listing.contact_details?.email || '',
    contact_address: listing.contact_details?.address || '',
    listingSource: listing.listingSource || 'owner',
  };

  const handleSubmit = useCallback(
    async (values: any) => {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Prepare update data (matching your backend model exactly)
        const updateData: any = {
          id: listing._id || listing.id,
          photo: values.photo,
          title: values.title.trim(),
          description: values.description.trim(),
          category: values.category,
          listingType: values.listingType,
          listingSource: values.listingSource,
          bedrooms: Number(values.bedrooms),
          bathrooms: Number(values.bathrooms),
          // Backend expects contact_details object with all three fields
          contact_details: {
            phone_number: values.contact_phone,
            email: values.contact_email,
            address: values.contact_address,
          },
          // Location from original listing (don't update location on edit)
          location: listing.location,
        };

        // Add listing-type specific fields
        if (values.listingType === 'sale') {
          updateData.price = Number(values.price);
        } else {
          updateData.rentPrice = Number(values.rentPrice);
          updateData.rentFrequency = values.rentFrequency;

          if (values.depositAmount) {
            updateData.depositAmount = Number(values.depositAmount);
          }
          if (values.availableFrom) {
            updateData.availableFrom = values.availableFrom;
          }
          if (values.isFurnished !== '') {
            updateData.isFurnished = values.isFurnished === 'true';
          }
          if (values.minimumStay) {
            updateData.minimumStay = Number(values.minimumStay);
          }
        }

        console.log('📤 Updating listing:', updateData);

        // Dispatch update action
        await dispatch(updateAd(updateData)).unwrap();

        console.log('✅ Listing updated');

        // Success feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        Alert.alert('Success!', 'Your listing has been updated successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } catch (error: any) {
        console.error('❌ Error updating listing:', error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        Alert.alert(
          'Error',
          error.message || 'Failed to update listing. Please try again.'
        );
      } finally {
        setUploadProgress(0);
      }
    },
    [listing, dispatch, navigation]
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
        >
          {/* Header */}
          <View style={styles.header}>
            <IconButton
              icon='arrow-left'
              size={24}
              onPress={() => navigation.goBack()}
              iconColor={theme.colors.onSurface}
            />
            <Text
              variant='headlineMedium'
              style={[styles.headerTitle, { color: theme.colors.onSurface }]}
            >
              Edit Listing
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 1 && (
            <Card
              style={[
                styles.progressCard,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <Card.Content>
                <Text variant='labelMedium' style={{ marginBottom: 8 }}>
                  Uploading... {Math.round(uploadProgress * 100)}%
                </Text>
                <ProgressBar
                  progress={uploadProgress}
                  color={theme.colors.primary}
                />
              </Card.Content>
            </Card>
          )}

          {/* Form */}
          <AppForm
            initialValues={initialValues}
            validationSchema={editListingSchema}
            onSubmit={handleSubmit}
          >
            {/* Images Section */}
            <Card
              style={[
                styles.section,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Card.Content>
                <Text
                  variant='titleLarge'
                  style={[styles.sectionTitle, { color: theme.colors.primary }]}
                >
                  📸 Property Images
                </Text>
                <FormImageField name='photo' maxImages={6} photoUrl={true} />
              </Card.Content>
            </Card>

            {/* Basic Information */}
            <Card
              style={[
                styles.section,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Card.Content>
                <Text
                  variant='titleLarge'
                  style={[styles.sectionTitle, { color: theme.colors.primary }]}
                >
                  ℹ️ Basic Information
                </Text>

                <FormInput
                  name='title'
                  label='Property Title'
                  placeholder='e.g., Spacious 3BR Apartment'
                  icon='home'
                />

                <FormInput
                  name='description'
                  label='Description'
                  placeholder='Describe your property...'
                  multiline
                  numberOfLines={4}
                />

                <FormSelector
                  name='category'
                  label='Property Category'
                  options={['Apartments', 'Houses', 'Condos', 'Villas', 'Land']}
                />
              </Card.Content>
            </Card>

            {/* Listing Type & Pricing */}
            <Card
              style={[
                styles.section,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Card.Content>
                <Text
                  variant='titleLarge'
                  style={[styles.sectionTitle, { color: theme.colors.primary }]}
                >
                  💰 Listing Type & Pricing
                </Text>

                <FormSelector
                  name='listingType'
                  label='Listing Type'
                  options={['sale', 'rent']}
                />

                <FormikConsumer>
                  {({ values }: any) => (
                    <>
                      {values.listingType === 'sale' ? (
                        <FormInput
                          name='price'
                          label='Sale Price ($)'
                          placeholder='Enter price'
                          keyboardType='numeric'
                          icon='currency-usd'
                        />
                      ) : (
                        <>
                          <FormInput
                            name='rentPrice'
                            label='Rent Price ($)'
                            placeholder='Enter rent amount'
                            keyboardType='numeric'
                            icon='currency-usd'
                          />

                          <FormSelector
                            name='rentFrequency'
                            label='Payment Frequency'
                            options={['daily', 'weekly', 'monthly', 'yearly']}
                          />

                          <FormInput
                            name='depositAmount'
                            label='Deposit Amount ($) (Optional)'
                            placeholder='Enter deposit'
                            keyboardType='numeric'
                          />

                          <DatePicker
                            name='availableFrom'
                            label='Available From (Optional)'
                            placeholder='Select date'
                          />

                          <FormSelector
                            name='isFurnished'
                            label='Furnished Status'
                            options={['true', 'false']}
                          />

                          <FormInput
                            name='minimumStay'
                            label='Minimum Stay (days) (Optional)'
                            placeholder='e.g., 30'
                            keyboardType='numeric'
                          />
                        </>
                      )}
                    </>
                  )}
                </FormikConsumer>
              </Card.Content>
            </Card>

            {/* Property Details */}
            <Card
              style={[
                styles.section,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Card.Content>
                <Text
                  variant='titleLarge'
                  style={[styles.sectionTitle, { color: theme.colors.primary }]}
                >
                  🏠 Property Details
                </Text>

                <FormInput
                  name='bedrooms'
                  label='Number of Bedrooms'
                  placeholder='e.g., 3'
                  keyboardType='numeric'
                  icon='bed'
                />

                <FormInput
                  name='bathrooms'
                  label='Number of Bathrooms'
                  placeholder='e.g., 2'
                  keyboardType='numeric'
                  icon='shower'
                />
              </Card.Content>
            </Card>

            {/* Contact Information */}
            <Card
              style={[
                styles.section,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Card.Content>
                <Text
                  variant='titleLarge'
                  style={[styles.sectionTitle, { color: theme.colors.primary }]}
                >
                  📞 Contact Information
                </Text>

                <FormInput
                  name='contact_phone'
                  label='Phone Number'
                  placeholder='Enter phone number'
                  keyboardType='phone-pad'
                  icon='phone'
                />

                <FormInput
                  name='contact_email'
                  label='Email Address'
                  placeholder='Enter email'
                  keyboardType='email-address'
                  icon='email'
                />

                <FormInput
                  name='contact_address'
                  label='Property Address'
                  placeholder='Enter full property address'
                  multiline
                  numberOfLines={3}
                  icon='map-marker'
                />

                <FormSelector
                  name='listingSource'
                  label='Listing Source'
                  options={['owner', 'agent', 'municipality']}
                />
              </Card.Content>
            </Card>

            {/* Submit Button */}
            <SubmitButton
              title='Update Listing'
              icon='check-circle'
              style={styles.submitButton}
            />

            {/* Bottom Spacing */}
            <View style={{ height: 40 }} />
          </AppForm>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default EditListing;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: designTokens.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: designTokens.spacing.sm,
    paddingTop: designTokens.spacing.md,
    paddingBottom: designTokens.spacing.sm,
  },
  headerTitle: {
    fontWeight: '700',
  },
  progressCard: {
    marginHorizontal: designTokens.spacing.md,
    marginBottom: designTokens.spacing.md,
  },
  section: {
    marginHorizontal: designTokens.spacing.md,
    marginVertical: designTokens.spacing.sm,
    borderRadius: designTokens.borderRadius.xl,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: designTokens.spacing.md,
  },
  submitButton: {
    marginHorizontal: designTokens.spacing.md,
    marginTop: designTokens.spacing.lg,
  },
});
