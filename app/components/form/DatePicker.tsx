import DateTimePicker from '@react-native-community/datetimepicker';
import { useFormikContext } from 'formik';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { formatDate } from '../../utils/globals';
import AppTextInput from '../custom/AppTextInput';

const DatePicker: React.FC<{
  name: string;
  style?: any;
  [key: string]: any;
}> = ({ name, style, ...otherProps }) => {
  const theme = useTheme();
  const { setFieldValue, setFieldTouched, values, errors, touched }: any =
    useFormikContext();
  const [show, setShow] = useState(false);
  const [date, setDate] = useState(new Date());

  const toggleDatePicker = () => {
    setShow(!show);
  };

  const handleChange = ({ type }: { type: any }, selectDate: Date) => {
    if (type === 'set') {
      const currentDate = selectDate;
      setDate(currentDate);
      if (Platform.OS === 'android') {
        toggleDatePicker();
        setFieldValue(name, formatDate(currentDate));
      }
    } else {
      toggleDatePicker();
    }
  };

  return (
    <>
      {show && (
        <DateTimePicker
          mode='date'
          value={date}
          display='spinner'
          onChange={handleChange as any}
          minimumDate={new Date('1936-01-01')}
          {...otherProps}
          style={[
            {
              backgroundColor: theme.colors.surface,
              marginBottom: 15,
            },
            style,
          ]}
        />
      )}
      {!show && (
        <Pressable onPress={toggleDatePicker}>
          <AppTextInput
            onBlur={() => setFieldTouched(name)}
            onChangeText={(text: string) => setFieldValue(name, text)}
            value={values[name]}
            {...otherProps}
            editable={false}
            style={[style, { marginBottom: 15 }]}
          />
        </Pressable>
      )}
    </>
  );
};

export default DatePicker;
