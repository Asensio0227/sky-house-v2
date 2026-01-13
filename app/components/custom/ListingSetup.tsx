import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import AppForm from '../form/AppForm';
import FormImage from '../form/FormImage';
import FormInput from '../form/FormInput';
import FormSelector from '../form/FormSelector';
import SubmitButton from '../form/SubmitButton';

const ListingSetup: React.FC<{
  initialValues: any;
  onSubmit: any;
  validationSchema: any;
  edit?: boolean | any;
  title?: string;
}> = ({ initialValues, onSubmit, validationSchema, edit }) => {
  const arr = ['Apartments', 'Houses', 'Condos', 'Villas', 'Land'];
  const listingTypes = ['sale', 'rent'];
  const rentFrequencies = ['monthly', 'weekly', 'daily'];

  return (
    <ScrollView
      contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}
      style={styles.container}
    >
      <AppForm
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        <FormImage name='photo' />
        <FormInput
          name='title'
          label='Title'
          placeholder='Enter title'
          icon='format-title'
        />
        <FormInput
          name='address'
          label='Address'
          placeholder='Enter address'
          icon='google-maps'
        />
        <FormInput
          name='description'
          label='Description'
          placeholder='Enter description'
          icon='card-text-outline'
          multiline={true}
        />

        {/* Listing Type Selector */}
        <FormSelector name='listingType' options={listingTypes} />

        {/* Conditional Price Fields */}
        <FormInput
          name='price'
          label='Sale Price'
          placeholder='Enter sale price'
          icon='numeric'
          multiline={true}
        />

        {/* Rental Fields - shown when listingType is 'rent' */}
        <FormInput
          name='rentPrice'
          label='Rent Price'
          placeholder='Enter rent price'
          icon='numeric'
          multiline={true}
        />
        <FormSelector name='rentFrequency' options={rentFrequencies} />
        <FormInput
          name='deposit'
          label='Deposit'
          placeholder='Enter deposit amount'
          icon='numeric'
        />
        <FormSelector name='furnished' options={['true', 'false']} />
        <FormInput
          name='bedrooms'
          label='Bedrooms'
          placeholder='Number of bedrooms'
          icon='numeric'
        />
        <FormInput
          name='bathrooms'
          label='Bathrooms'
          placeholder='Number of bathrooms'
          icon='numeric'
        />

        <FormSelector name='category' options={arr} />
        <SubmitButton title={edit ? 'update' : 'create'} />
      </AppForm>
    </ScrollView>
  );
};

export default ListingSetup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    marginBottom: 28,
  },
});
