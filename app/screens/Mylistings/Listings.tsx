import { useFocusEffect } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback } from 'react';
import { Text, View } from 'react-native';
import { ActivityIndicator, MD3Colors } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootEstateState } from '../../../store';
import EstateContainer from '../../components/EstateContainer';
import Screen from '../../components/custom/Screen';
import {
  resetAds,
  retrieveUserAds,
  setIsReFreshing,
} from '../../features/estate/estateSlice';

const Listings = () => {
  const { userAds, isRefreshing, hasMore, isLoading } = useSelector(
    (store: RootEstateState) => store.ESTATE
  );
  const dispatch: any = useDispatch();

  async function fetchMoreAds() {
    try {
      await dispatch(retrieveUserAds());
    } catch {
      (error: any) => console.log('Failed to fetch user ads', error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchMoreAds();
    }, [dispatch])
  );

  const handleScrollEndReached = () => {
    if (!isLoading && hasMore) {
      dispatch(retrieveUserAds());
    }
  };

  const onRefresh = async () => {
    dispatch(setIsReFreshing(true));
    dispatch(resetAds());
    await dispatch(retrieveUserAds());
    dispatch(setIsReFreshing(false));
  };

  if (userAds.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No listings available</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={userAds}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EstateContainer items={item} showEditButton={true} />
        )}
        estimatedItemSize={200}
        scrollEnabled
        pagingEnabled
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        showsVerticalScrollIndicator={true}
        onEndReached={handleScrollEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          !hasMore ? (
            <Text style={{ color: MD3Colors.primary60 }}>No more data....</Text>
          ) : (
            isLoading && (
              <Screen style={{ padding: 30, marginVertical: 58 }}>
                <ActivityIndicator size='small' />
              </Screen>
            )
          )
        }
      />
    </View>
  );
};

export default Listings;
