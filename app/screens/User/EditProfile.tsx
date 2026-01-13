import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { RootState } from '../../../store';
import Loading from '../../components/custom/Loading';
import Setup from '../../components/custom/Setup';
import { UserDocument } from '../../components/form/FormInput';
import { updateCurrentUser } from '../../features/user/userSlice'; // ✅ Changed import

const validateSchema = Yup.object().shape({
  avatar: Yup.string().required('UserProfile is required'),
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  username: Yup.string().required('Username is required'),
  email: Yup.string().email().required('Email is required'),
  phone_number: Yup.string()
    .matches(
      /(?:(?<internationCode>\+[1-9]{1,4})[ -])?\(?(?<areacode>\d{2,3})\)?[ -]?(\d{3})[ -]?(\d{4})/,
      'Invalid phone number'
    )
    .required('Phone number is required!'),
  date_of_birth: Yup.date().required('Date of birth is required').nullable(),
  gender: Yup.string().required('Gender is required'),
  street: Yup.string().required('Street is required'),
  city: Yup.string().required('City is required'),
  province: Yup.string().required('Province is required'),
  postal_code: Yup.string().required('Postal code is required'),
  country: Yup.string().required('Country is required'),
  ideaNumber: Yup.string().required('Idea number is required'),
});

const EditProfile = () => {
  const router = useRoute();
  const user: UserDocument | any = router.params;
  const navigation: any = useNavigation();
  const dispatch: any = useDispatch();

  // ✅ Get loading state from USER slice
  const { isLoading } = useSelector((store: RootState) => store.USER);

  const onSubmit = async (item: UserDocument) => {
    try {
      // ✅ Use updateCurrentUser instead of updateUser
      await dispatch(updateCurrentUser(item)).unwrap();
      navigation.goBack();
    } catch (error: any) {
      console.log(`Error while updating user: ${error.message || error}`);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <Setup
      initialValues={{
        avatar: user.avatar || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        gender: user.gender || '',
        date_of_birth: user.date_of_birth || '',
        phone_number: user.contact_details?.phone_number || '',
        street: user.physical_address?.street || '',
        city: user.physical_address?.city || '',
        province: user.physical_address?.province || '',
        postal_code: user.physical_address?.postal_code || '',
        country: user.physical_address?.country || '',
        ideaNumber: user.ideaNumber || '',
      }}
      validationSchema={validateSchema}
      onSubmit={onSubmit}
      title='Update Account'
      edit={true}
    />
  );
};

export default EditProfile;
