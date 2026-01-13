import React, { useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ImageInput from './ImageInput';

const ImageList: React.FC<{
  imageUris: [];
  onAddImage: (uri: string) => void;
  onRemoveImage: (uri: string) => void;
}> = ({ imageUris = [], onAddImage, onRemoveImage }) => {
  const scrollRef: any = useRef(null);

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        onContentSizeChange={() => scrollRef?.current?.scrollToEnd()}
      >
        <View style={styles.container}>
          {imageUris.map((uri: string) => (
            <View key={uri} style={styles.image}>
              <ImageInput
                key={uri}
                imageUri={uri}
                onChangeImage={() => onRemoveImage(uri)}
              />
            </View>
          ))}
          <ImageInput onChangeImage={(uri: string) => onAddImage(uri)} />
        </View>
      </ScrollView>
    </View>
  );
};

export default ImageList;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  image: {
    marginRight: 10,
  },
});
