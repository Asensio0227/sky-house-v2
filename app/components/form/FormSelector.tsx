import * as Haptics from 'expo-haptics';
import { useFormikContext } from 'formik';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, Text, useTheme } from 'react-native-paper';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { designTokens } from '../../utils/designTokens';
import ErrorMessage from './ErrorMessage';

interface FormSelectorProps {
  name: string;
  options: string[];
  label?: string;
}

const FormSelector: React.FC<FormSelectorProps> = ({
  options,
  name,
  label,
}) => {
  const theme = useTheme();
  const { values, setFieldValue, errors, touched } = useFormikContext<any>();
  const [isExpanded, setIsExpanded] = useState(false);

  const getDisplayLabel = () => {
    switch (name) {
      case 'category':
        return 'Category';
      case 'listingType':
        return 'Listing Type';
      case 'rentFrequency':
        return 'Payment Frequency';
      case 'isFurnished':
        return 'Furnished Status';
      default:
        return label || name;
    }
  };

  const formatOptionLabel = (option: string) => {
    if (name === 'listingType') {
      return option === 'sale' ? 'For Sale' : 'For Rent';
    }
    if (name === 'isFurnished') {
      return option === 'true' ? '✓ Furnished' : '✗ Not Furnished';
    }
    if (name === 'rentFrequency') {
      return option.charAt(0).toUpperCase() + option.slice(1);
    }
    return option;
  };

  const getIcon = () => {
    switch (name) {
      case 'category':
        return '🏘️';
      case 'listingType':
        return '🏷️';
      case 'rentFrequency':
        return '📅';
      case 'isFurnished':
        return '🛋️';
      default:
        return '📋';
    }
  };

  const handleSelect = (option: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFieldValue(name, option);
    setIsExpanded(false);
  };

  const showError = touched[name] && errors[name];

  return (
    <View style={styles.container}>
      <Text
        variant='labelLarge'
        style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
      >
        {getIcon()} {getDisplayLabel()}
      </Text>

      <View style={styles.chipsContainer}>
        {options.map((option, index) => (
          <Chip
            key={index}
            selected={values[name] === option}
            onPress={() => handleSelect(option)}
            style={[
              styles.chip,
              values[name] === option && {
                backgroundColor: theme.colors.primaryContainer,
              },
            ]}
            textStyle={{
              color:
                values[name] === option
                  ? theme.colors.onPrimaryContainer
                  : theme.colors.onSurfaceVariant,
              fontWeight: values[name] === option ? '600' : '400',
            }}
            mode={values[name] === option ? 'flat' : 'outlined'}
          >
            {formatOptionLabel(option)}
          </Chip>
        ))}
      </View>

      {showError && (
        <ErrorMessage visible={true} error={errors[name] as string} />
      )}
    </View>
  );
};

export default FormSelector;

const styles = StyleSheet.create({
  container: {
    marginBottom: designTokens.spacing.md,
  },
  label: {
    marginBottom: designTokens.spacing.sm,
    fontWeight: '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designTokens.spacing.sm,
  },
  chip: {
    borderRadius: designTokens.borderRadius.xl,
  },
});
