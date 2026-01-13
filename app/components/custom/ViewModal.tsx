import * as React from 'react';
import {
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Modal, useTheme } from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';

import { RootState } from '../../../store';
import {
  changePassword,
  hideModal,
  removeUser,
  signOutUser,
} from '../../features/auth/authSlice';
import Form from '../form/AppForm';
import Input from '../form/FormInput';
import SubmitButton from '../form/SubmitButton';
import Loading from './Loading';

const validateSchema = Yup.object().shape({
  oldPassword: Yup.string().required('Old password is required'),
  newPassword: Yup.string().required('New password is required'),
});

const ViewModal = () => {
  const { visible, isLoading } = useSelector((store: RootState) => store.AUTH);
  const dispatch: any = useDispatch();
  const theme = useTheme();

  const containerStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    padding: 20,
    margin: 20,
    borderRadius: 12,
    elevation: 4,
  };

  async function logoutUser() {
    await dispatch(signOutUser());
    removeUser();
    ToastAndroid.showWithGravity('Success! logging out....', 15000, 0);
  }

  const onSubmit = async (data: any) => {
    try {
      await dispatch(changePassword(data));
    } catch (error: any) {
      console.log(`Error changing password: ${error}`);
    } finally {
      dispatch(hideModal());
      logoutUser();
    }
  };

  if (isLoading) return <Loading />;

  return (
    <Modal
      visible={visible}
      onDismiss={() => dispatch(hideModal())}
      contentContainerStyle={containerStyle}
      style={styles.container}
    >
      <TouchableOpacity
        style={styles.btn}
        onPress={() => dispatch(hideModal())}
      >
        <AntDesign name='close' size={30} color={theme.colors.onSurface} />
      </TouchableOpacity>
      <Form
        initialValues={{
          oldPassword: '',
          newPassword: '',
        }}
        validationSchema={validateSchema}
        onSubmit={onSubmit}
      >
        <Input
          name='oldPassword'
          label='old Password'
          placeholder='Enter your old password'
          icon='lock'
          secureTextEntry
        />
        <Input
          name='newPassword'
          label='New Password'
          placeholder='Enter your new password'
          icon='lock'
          secureTextEntry
        />
        <SubmitButton title='update password' />
      </Form>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
  },
  btn: {
    position: 'absolute',
    top: 6,
    right: 3,
  },
});

export default ViewModal;
