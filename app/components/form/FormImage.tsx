import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Field, FieldProps } from 'formik';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { designTokens } from '../../utils/designTokens';
import ImageInput from '../custom/ImageInput';
import ImageList from '../custom/ImageList';

interface FormImageFieldProps {
  name: string;
  singleImage?: boolean;
  photoUrl?: boolean;
  maxImages?: number;
}

const FormImageField: React.FC<FormImageFieldProps> = ({
  name,
  singleImage = false,
  photoUrl = false,
  maxImages = 6,
}) => {
  const theme = useTheme();

  return (
    <Field name={name}>
      {({ field, form, meta }: FieldProps) => {
        console.log('🎯 Field Component Render:', {
          name,
          value: field.value,
          valueType: typeof field.value,
          hasValue: !!field.value,
        });

        const fieldValue = field.value || (singleImage ? '' : []);

        const imageUris = singleImage
          ? fieldValue && typeof fieldValue === 'string'
            ? [fieldValue]
            : []
          : Array.isArray(fieldValue)
          ? fieldValue.filter((uri) => uri && typeof uri === 'string')
          : [];

        const handleAddImage = async (uri: string) => {
          console.log('==================================================');
          console.log('📸 Field handleAddImage');
          console.log('URI:', uri);
          console.log('Current value:', field.value);
          console.log('==================================================');

          if (singleImage) {
            await form.setFieldValue(name, uri, false);
          } else {
            const current = Array.isArray(field.value) ? field.value : [];
            if (current.length >= maxImages) {
              console.warn('Max images reached');
              return;
            }
            await form.setFieldValue(name, [...current, uri], false);
          }

          form.setFieldTouched(name, true);

          console.log('✅ Value after set:', form.values[name]);
          console.log('==================================================');
        };

        const handleRemoveImage = async (uri: string) => {
          if (singleImage) {
            await form.setFieldValue(name, '', false);
          } else {
            const current = Array.isArray(field.value) ? field.value : [];
            await form.setFieldValue(
              name,
              current.filter((img) => img !== uri),
              false
            );
          }
          form.setFieldTouched(name, true);
        };

        const showError = meta.touched && meta.error;

        if (singleImage) {
          const currentImageUri = imageUris[0] || '';

          return (
            <View style={styles.singleImageContainer}>
              <View style={styles.avatarContainer}>
                <Surface
                  style={[
                    styles.avatarSurface,
                    { backgroundColor: theme.colors.surfaceVariant },
                  ]}
                  elevation={2}
                >
                  <ImageInput
                    imageUri={currentImageUri}
                    onChangeImage={handleAddImage}
                    style={styles.avatarImage}
                  />
                </Surface>
              </View>

              <View style={styles.textContainer}>
                <Text
                  variant='titleMedium'
                  style={[styles.title, { color: theme.colors.onSurface }]}
                >
                  Profile Photo
                </Text>
                <Text
                  variant='bodySmall'
                  style={[
                    styles.subtitle,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {currentImageUri ? 'Tap to change' : 'Tap to upload'} your
                  profile picture
                </Text>
              </View>

              {showError && (
                <View style={styles.errorContainer}>
                  <MaterialCommunityIcons
                    name='alert-circle'
                    size={16}
                    color={theme.colors.error}
                  />
                  <Text
                    variant='bodySmall'
                    style={[styles.errorText, { color: theme.colors.error }]}
                  >
                    {meta.error as string}
                  </Text>
                </View>
              )}
            </View>
          );
        }

        // Multiple images mode
        return (
          <View style={styles.container}>
            <View style={styles.headerRow}>
              <Text
                variant='titleMedium'
                style={[styles.headerTitle, { color: theme.colors.onSurface }]}
              >
                Photos
              </Text>
              <Text
                variant='bodySmall'
                style={[
                  styles.imageCount,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {imageUris.length} / {maxImages}
              </Text>
            </View>

            <Surface
              style={[
                styles.imageListContainer,
                { backgroundColor: theme.colors.surface },
              ]}
              elevation={1}
            >
              <ImageList
                imageUris={imageUris as []}
                onAddImage={handleAddImage}
                onRemoveImage={handleRemoveImage}
              />
            </Surface>

            {imageUris.length === 0 && (
              <View
                style={[
                  styles.emptyState,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <MaterialCommunityIcons
                  name='image-plus'
                  size={48}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  variant='bodyMedium'
                  style={[
                    styles.emptyStateText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  No photos added yet
                </Text>
              </View>
            )}

            {showError && (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons
                  name='alert-circle'
                  size={16}
                  color={theme.colors.error}
                />
                <Text
                  variant='bodySmall'
                  style={[styles.errorText, { color: theme.colors.error }]}
                >
                  {meta.error as string}
                </Text>
              </View>
            )}
          </View>
        );
      }}
    </Field>
  );
};

export default FormImageField;

const styles = StyleSheet.create({
  singleImageContainer: {
    marginBottom: designTokens.spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: designTokens.spacing.md,
  },
  avatarSurface: {
    borderRadius: 60,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  textContainer: {
    alignItems: 'center',
    gap: designTokens.spacing.xs,
  },
  title: {
    fontWeight: '600',
  },
  subtitle: {
    textAlign: 'center',
  },
  container: {
    marginBottom: designTokens.spacing.lg,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designTokens.spacing.sm,
    paddingHorizontal: designTokens.spacing.xs,
  },
  headerTitle: {
    fontWeight: '600',
  },
  imageCount: {
    fontWeight: '500',
  },
  imageListContainer: {
    borderRadius: designTokens.borderRadius.lg,
    padding: designTokens.spacing.sm,
    marginBottom: designTokens.spacing.sm,
  },
  emptyState: {
    padding: designTokens.spacing.xl,
    borderRadius: designTokens.borderRadius.lg,
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },
  emptyStateText: {
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: designTokens.spacing.sm,
    paddingHorizontal: designTokens.spacing.sm,
  },
  errorText: {
    marginLeft: designTokens.spacing.xs,
  },
});
