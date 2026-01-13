import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { RootReviewsState } from '../../../store';
import Loading from '../../components/custom/Loading';
import AppForm from '../../components/form/AppForm';
import FormInput from '../../components/form/FormInput';
import Rating from '../../components/form/RateInput';
import SubmitButton from '../../components/form/SubmitButton';
import { setPage } from '../../features/estate/estateSlice';
import { leaveReview } from '../../features/reviews/reviewsSlice';

const validateSchema = Yup.object().shape({
  rating: Yup.string().required('Please rate us.'),
  comment: Yup.string().required('Please rate us.').min(1).max(500),
});

function CommentsScreen() {
  const navigation: any = useNavigation();
  const router: any = useRoute();
  const item = router.params;
  const estate = item?._id;
  const dispatch: any = useDispatch();
  const { isLoading } = useSelector(
    (store: RootReviewsState | any) => store.Reviews
  );

  const onSubmit = async (data: any) => {
    try {
      const value: any = { ...data, estate };
      await dispatch(leaveReview(value));
      dispatch(setPage(1));
      navigation.goBack();
    } catch (error: any) {
      console.log(`Error submitting`, error);
    }
  };

  if (isLoading) return <Loading />;

  return (
    // <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <AppForm
      initialValues={{ comment: '', rating: 0 }}
      validationSchema={validateSchema}
      onSubmit={onSubmit}
    >
      <Rating name='rating' />
      <FormInput
        name='comment'
        label='Comment'
        placeholder='Enter comment'
        icon='format-title'
      />
      <SubmitButton title='submit' />
    </AppForm>
    // </View>
  );
}

export default CommentsScreen;
