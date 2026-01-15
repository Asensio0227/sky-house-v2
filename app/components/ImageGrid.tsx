import { Image } from 'expo-image';
import React, { useState } from 'react';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { IPhoto } from '../features/estate/types';

const ImageGrid: React.FC<{ data: IPhoto[] | any }> = ({ data }) => {
  const [mainImg, setMainImg] = useState(data?.[0] || null);
  const theme = useTheme();

  if (!data || data.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='small' />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.outline }]}>
      {/* Main Image with blurhash placeholder */}
      <Image
        style={styles.mainImg}
        source={{ uri: mainImg.url }}
        placeholder={{
          blurhash: mainImg.blurhash || 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
        }}
        contentFit='cover'
        transition={200}
        cachePolicy='memory-disk'
        priority='high'
      />

      {/* Thumbnail Gallery */}
      <View style={styles.gallery}>
        {data.map((item: IPhoto, index: number) => {
          const isActive = mainImg.id === item.id;

          return (
            <TouchableWithoutFeedback
              key={item.id}
              onPress={() => setMainImg(item)}
            >
              <View
                style={[
                  styles.thumbnailWrapper,
                  isActive && [
                    styles.activeThumbnail,
                    { borderColor: theme.colors.primary },
                  ],
                ]}
              >
                <Image
                  style={styles.thumbnail}
                  source={{
                    uri: item.thumbnailUrl || item.url, // Use thumbnail URL if available
                  }}
                  placeholder={{
                    blurhash: item.blurhash || 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
                  }}
                  contentFit='cover'
                  transition={100}
                  cachePolicy='memory-disk'
                  priority={index < 4 ? 'high' : 'normal'} // Prioritize first 4
                />
              </View>
            </TouchableWithoutFeedback>
          );
        })}
      </View>
    </View>
  );
};

export default ImageGrid;

const styles = StyleSheet.create({
  container: {
    marginBottom: -15,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImg: {
    width: '100%',
    aspectRatio: 1,
  },
  gallery: {
    marginTop: 2,
    marginHorizontal: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  thumbnailWrapper: {
    height: 60,
    width: '18%',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  activeThumbnail: {
    borderWidth: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
