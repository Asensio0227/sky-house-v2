import { useNavigation, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useState } from 'react';
import { Alert, StyleSheet, ToastAndroid, View } from 'react-native';
import {
  Appbar,
  Avatar,
  Button,
  Divider,
  Menu,
  Text,
  useTheme,
} from 'react-native-paper';
import { useDispatch } from 'react-redux';

import {
  deleteAd,
  markAdAsTaken,
  removeAd,
} from '../../features/estate/estateSlice';
import { UserDocument } from '../form/FormInput';
import Rating from '../reviews/Rating';

dayjs.extend(calendar);
dayjs.extend(relativeTime);

const UserProfile: React.FC<{
  user: UserDocument | any;
  style?: any;
  rating?: number | any;
  items?: any;
}> = ({ user, style, rating, items }) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const router: any = useRoute();
  const navigation: any = useNavigation();
  const dispatch: any = useDispatch();
  const id = router.params?._id;

  // Safe null checks
  const userName = user?.username || 'Unknown User';
  const userAvatar = user?.avatar;
  const userStatus = user?.status;
  const lastSeen = user?.lastSeen;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPriceDisplay = () => {
    if (!items) return '';

    if (items.listingType === 'rent' && items.rentPrice) {
      const frequency = items.rentFrequency || 'monthly';
      const frequencyMap: any = {
        daily: '/day',
        weekly: '/wk',
        monthly: '/mo',
        yearly: '/yr',
      };
      return `${formatPrice(items.rentPrice)}${
        frequencyMap[frequency] || '/mo'
      }`;
    }

    return items.price ? formatPrice(items.price) : '';
  };

  const getListingTypeBadge = () => {
    if (!items?.listingType) return null;
    return items.listingType === 'rent' ? 'For Rent' : 'For Sale';
  };

  const getStatusDisplay = () => {
    if (userStatus === 'online') return 'Online';
    if (lastSeen) return `Last seen ${dayjs(lastSeen).fromNow()}`;
    return 'Offline';
  };

  const openMenu = () => setVisible(!visible);

  const markAsTaken = async () => {
    try {
      const adId = items._id;
      await dispatch(markAdAsTaken(adId));
      ToastAndroid.showWithGravity(
        'Ad marked as taken successfully',
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM
      );
      navigation.goBack();
    } catch (error) {
      console.log(`Error changing ad status: ${error}`);
      ToastAndroid.showWithGravity(
        'Failed to update ad status',
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM
      );
    }
  };

  const removeFromAdList = async () => {
    try {
      await dispatch(deleteAd(id));
      dispatch(removeAd(id));
      openMenu();
      ToastAndroid.showWithGravity(
        'Ad deleted successfully',
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM
      );
      navigation.goBack();
    } catch (error) {
      console.log(`Error deleting ad: ${error}`);
      ToastAndroid.showWithGravity(
        'Failed to delete ad',
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM
      );
    }
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
    },
    avatarContainer: {
      marginRight: 12,
    },
    infoContainer: {
      flex: 1,
    },
    userSection: {
      marginBottom: 4,
    },
    userName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 2,
    },
    userStatus: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    onlineIndicator: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
      marginBottom: 4,
    },
    price: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginRight: 8,
    },
    listingTypeBadge: {
      fontSize: 11,
      fontWeight: '600',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      overflow: 'hidden',
      backgroundColor: theme.colors.secondaryContainer,
      color: theme.colors.onSecondaryContainer,
    },
    menuButton: {
      marginLeft: 'auto',
    },
    menuContainer: {
      position: 'absolute',
      top: 50,
      right: 16,
      zIndex: 1000,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      minWidth: 160,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    menuButton: {
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    menuButtonText: {
      fontSize: 14,
    },
    deleteButton: {
      color: theme.colors.error,
    },
  });

  return (
    <View style={[styles.container, style]}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {userAvatar ? (
          <Avatar.Image size={48} source={{ uri: userAvatar }} />
        ) : (
          <Avatar.Text
            size={48}
            label={userName.charAt(0).toUpperCase()}
            style={{ backgroundColor: theme.colors.primaryContainer }}
            color={theme.colors.onPrimaryContainer}
          />
        )}
      </View>

      {/* User Info */}
      <View style={styles.infoContainer}>
        <View style={styles.userSection}>
          <Text style={styles.userName}>
            {items?.title ? `${userName} • ${items.title}` : userName}
          </Text>
          <Text
            style={
              userStatus === 'online'
                ? styles.onlineIndicator
                : styles.userStatus
            }
          >
            {getStatusDisplay()}
          </Text>
        </View>

        {/* Price and Badge */}
        {items && getPriceDisplay() && (
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{getPriceDisplay()}</Text>
            {getListingTypeBadge() && (
              <Text style={styles.listingTypeBadge}>
                {getListingTypeBadge()}
              </Text>
            )}
          </View>
        )}

        {/* Rating */}
        {rating !== undefined && rating !== null && <Rating rating={rating} />}
      </View>

      {/* Menu for listing actions */}
      {router.name === 'info' && (
        <View>
          <Appbar.Action
            icon='dots-vertical'
            onPress={openMenu}
            iconColor={theme.colors.onSurface}
          />
          {visible && (
            <View style={styles.menuContainer}>
              <Button
                mode='text'
                textColor={theme.colors.primary}
                onPress={() => {
                  setVisible(false);
                  navigation.navigate('edit-Listing', items);
                }}
                style={styles.menuButton}
                labelStyle={styles.menuButtonText}
              >
                Edit Listing
              </Button>
              <Divider />
              <Button
                mode='text'
                textColor={theme.colors.primary}
                disabled={items?.taken}
                onPress={() => {
                  setVisible(false);
                  Alert.alert(
                    'Mark as Taken',
                    'Are you sure you want to mark this listing as taken?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Mark as Taken',
                        onPress: markAsTaken,
                        style: 'default',
                      },
                    ]
                  );
                }}
                style={styles.menuButton}
                labelStyle={styles.menuButtonText}
              >
                {items?.taken ? 'Already Taken' : 'Mark as Taken'}
              </Button>
              <Divider />
              <Button
                mode='text'
                textColor={theme.colors.error}
                onPress={() => {
                  setVisible(false);
                  Alert.alert(
                    'Delete Listing',
                    'Are you sure you want to delete this listing? This action cannot be undone.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        onPress: removeFromAdList,
                        style: 'destructive',
                      },
                    ]
                  );
                }}
                style={styles.menuButton}
                labelStyle={[styles.menuButtonText, styles.deleteButton]}
              >
                Delete Listing
              </Button>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default UserProfile;
