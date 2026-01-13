import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect } from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';

const ImageInput: React.FC<{
  imageUri?: string;
  onChangeImage?: any;
  style?: any;
  [key: string]: any;
}> = ({ imageUri, onChangeImage, style, ...otherProps }) => {
  const theme = useTheme();

  const requestPermission = async () => {
    try {
      const { granted } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted)
        Alert.alert(
          'You need to enable permission to access the image library '
        );
    } catch (error: any) {
      console.log(error);
    }
  };

  useEffect(() => {
    requestPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePress = async () => {
    if (!imageUri) selectImage();
    else {
      Alert.alert('Delete', 'Are you sure you want to delete this image', [
        { text: 'Yes', onPress: () => onChangeImage(null) },
        { text: 'No' },
      ]);
    }
  };

  const selectImage = async () => {
    try {
      const result: any = await ImagePicker.launchImageLibraryAsync({
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.cancelled) {
        onChangeImage(result.assets[0].uri);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.container,
        { backgroundColor: theme.colors.surfaceVariant },
      ]}
    >
      {!imageUri ? (
        <MaterialCommunityIcons
          name='camera'
          size={40}
          color={theme.colors.onSurface}
        />
      ) : (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          {...otherProps}
        />
      )}
    </TouchableOpacity>
  );
};

export default ImageInput;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 15,
    height: 100,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 100,
  },
  image: {
    height: '100%',
    width: '100%',
  },
});
