import { useFormikContext } from 'formik';
import React from 'react';
import { StyleSheet } from 'react-native';
import { RatingInput } from 'react-native-stock-star-rating';
import ErrorMessage from './ErrorMessage';

const Rating: React.FC<{
  name: string | any;
  style?: any;
  [key: string]: any;
}> = ({ name, style, ...otherProps }) => {
  const { setFieldTouched, setFieldValue, touched, errors, values }: any =
    useFormikContext();

  const handleRatingChange = (rating: any) => {
    setFieldValue(name, rating);
    setFieldTouched(name);
  };

  return (
    <>
      <RatingInput
        rating={values[name]}
        setRating={handleRatingChange}
        size={50}
        maxStars={5}
        bordered={false}
        {...otherProps}
      />
      <ErrorMessage visible={touched[name]} error={errors[name]} />
    </>
  );
};

export default Rating;

const styles = StyleSheet.create({});
