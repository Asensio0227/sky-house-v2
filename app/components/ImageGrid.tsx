import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { ActivityIndicator, MD3Colors, useTheme } from 'react-native-paper';
import { IPhoto } from '../features/estate/types';

const ImageGrid: React.FC<{ data: IPhoto[] | any }> = ({ data }) => {
  const [mainImg, setMainImg] = useState(data ? data[0] : null);
  const theme = useTheme();
  if (!mainImg) return <ActivityIndicator size={'small'} />;

  return (
    <View style={{ marginBottom: -15, backgroundColor: theme.colors.outline }}>
      <Image style={styles.img} source={{ uri: mainImg.url }} />
      <View style={styles.gallery}>
        {data &&
          data.map((item: IPhoto, index: any) => {
            return (
              <TouchableWithoutFeedback
                key={item.id}
                onPress={() => setMainImg(data[index])}
              >
                <Image
                  style={[styles.mainImage, index % 2 === 0 && styles.active]}
                  source={{ uri: item.url }}
                />
              </TouchableWithoutFeedback>
            );
          })}
      </View>
    </View>
  );
};

export default ImageGrid;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    overflow: 'hidden',
    objectFit: 'cover',
  },
  gallery: {
    marginTop: 2,
    marginHorizontal: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mainImage: {
    height: 60,
    width: '18%',
    marginBottom: 16,
    marginHorizontal: 2,
  },
  img: {
    width: '100%',
    // height: 100,
    aspectRatio: 1,
  },
  active: {
    shadowColor: MD3Colors.primary40,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 2,
  },
});
