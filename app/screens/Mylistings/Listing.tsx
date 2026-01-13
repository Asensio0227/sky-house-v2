import { useFocusEffect, useRoute } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MD2Colors, MD3Colors, Text, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootEstateState } from '../../../store';
import Loading from '../../components/custom/Loading';
import Screen from '../../components/custom/Screen';
import UserProfile from '../../components/custom/UserProfile';
import ImageGrid from '../../components/ImageGrid';
import Rating from '../../components/reviews/Rating';
import { retrieveAd } from '../../features/estate/estateSlice';

const Listing = () => {
  const router: any = useRoute();
  const items = router.params;
  const [readMore, setReadMore] = useState(false);
  const dispatch: any = useDispatch();
  const { isLoading, singleHouse } = useSelector(
    (store: RootEstateState) => store.ESTATE
  );
  const theme = useTheme();

  useFocusEffect(
    useCallback(() => {
      // fetch data here
      (async () => {
        const productId: any = items._id;
        try {
          await dispatch(retrieveAd(productId));
        } catch (error: any) {
          console.log(`Error fetching ad : ${error}`);
        }
      })();
    }, [])
  );

  if (isLoading) return <Loading />;

  const styles = StyleSheet.create({
    container: {},
    desc: {
      fontFamily: 'OpenSans_300',
      fontWeight: '600',
      color: MD2Colors.grey800,
      paddingHorizontal: 8,
    },
    header: {
      fontSize: 14,
      color: MD3Colors.primary50,
    },
    info: {
      fontFamily: 'OpenSans_300',
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View>
        <UserProfile
          style={{
            marginLeft: 18,
            paddingHorizontal: 18,
            marginBottom: 3,
            marginTop: 5,
          }}
          user={items?.user || singleHouse?.user}
          rating={items?.average_rating || singleHouse?.average_rating}
          items={items}
        />
      </View>
      <View style={{ marginHorizontal: 5 }}>
        <View>
          <Text style={styles.header}>Description : </Text>
          <Text style={styles.info}>{items?.title || singleHouse?.title}</Text>
        </View>
        <View>
          <Text style={styles.header}>$Price : </Text>
          <Text style={styles.info}>{items?.price || singleHouse?.price}</Text>
        </View>
        <View>
          <Text style={styles.header}>Category : </Text>
          <Text style={styles.info}>
            {items?.category || singleHouse?.category}
          </Text>
        </View>
        <Text style={styles.desc} variant='titleSmall'>
          {readMore
            ? singleHouse && singleHouse.description
            : `${singleHouse && singleHouse.description.substring(0, 200)}...`}
          <Text
            style={{
              color: MD3Colors.secondary20,
              textDecorationLine: 'underline',
              fontSize: 10,
            }}
            onPress={() => setReadMore((prev) => !prev)}
          >
            {readMore ? 'Show Less' : 'Read More'}
          </Text>
        </Text>
      </View>
      <ImageGrid data={items?.photo || singleHouse?.photo} />
    </ScrollView>
  );
};

export default Listing;
