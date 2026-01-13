import { AntDesign } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Rating } from 'react-native-stock-star-rating';

const AppRating: React.FC<{ rating: number }> = ({ rating }) => {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text
        style={{
          marginRight: 6,
          fontWeight: 'bold',
          fontSize: 14,
          color: theme.colors.onSurface,
        }}
      >
        {rating?.toFixed(1)}
      </Text>
      <Rating
        colorFilled='gold'
        colorUnfilled='#ccc'
        stars={rating}
        maxStars={5}
        size={25}
      />
    </View>
  );
};

export default AppRating;
