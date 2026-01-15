import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Appbar,
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Text,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { RootEstateState } from '../../../store';
import Loading from '../../components/custom/Loading';
import ImageGrid from '../../components/ImageGrid';
import Comment from '../../components/reviews/Comment';
import {
  incrementAdView,
  retrieveAdWithComments,
  toggleLikeAd,
} from '../../features/estate/estateSlice';
import { UIEstateDocument } from '../../features/estate/types';
import { designTokens } from '../../utils/designTokens';
import { formatNumber } from '../../utils/globals';

const { width } = Dimensions.get('window');

const Details = () => {
  const theme = useTheme();
  const router = useRoute();
  const navigation: any = useNavigation();
  const items: UIEstateDocument | any = router.params;
  const { isLoading, singleHouseWithComments } = useSelector(
    (store: RootEstateState) => store.ESTATE
  );
  const dispatch: any = useDispatch();

  const [readMore, setReadMore] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (singleHouseWithComments?._id || singleHouseWithComments?.id) {
      const adId = singleHouseWithComments._id || singleHouseWithComments.id;
      dispatch(incrementAdView(adId));
    }
  }, [singleHouseWithComments?._id, singleHouseWithComments?.id, dispatch]);

  // ✅ Handle like toggle
  const handleToggleLike = useCallback(() => {
    if (!singleHouseWithComments?._id && !singleHouseWithComments?.id) return;
    const adId = singleHouseWithComments._id || singleHouseWithComments.id;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(toggleLikeAd(adId));
  }, [singleHouseWithComments?._id, singleHouseWithComments?.id, dispatch]);

  const headerAnimatedStyle = {
    opacity: headerOpacity.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
  };

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const productId: any = items._id;
        try {
          await dispatch(retrieveAdWithComments(productId));
        } catch (error: any) {
          console.log(`Error fetching ad with comments: ${error}`);
        }
      })();
    }, [])
  );

  useEffect(() => {
    if (items?.photo?.length > 0) {
      const images = items.photo;
      setImageUrl(images[0].url);
    }
  }, [items]);

  const shareProperty = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await Share.share({
        message: `Check out this property: ${
          ad?.title || 'Property'
        }\n${imageUrl}`,
        url: imageUrl,
      });
    } catch (error: any) {
      console.log('Failed to share:', error);
    }
  };

  const handleCommentPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('comments', items);
  };

  const handleCall = (phoneNumber: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`mailto:${email}`);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) return <Loading />;

  // ✅ Safe data extraction with fallbacks
  const ad = singleHouseWithComments?.ad || items;
  const reviews = singleHouseWithComments?.reviews || [];
  const images = ad?.photo || [];

  // ✅ Extract all fields safely
  const listingType = ad?.listingType || 'sale';
  const price = listingType === 'rent' ? ad?.rentPrice : ad?.price;
  const category = ad?.category;
  const title = ad?.title;
  const description = ad?.description;
  const bedrooms = ad?.bedrooms;
  const bathrooms = ad?.bathrooms;

  // ✅ Rental-specific fields
  const rentFrequency = ad?.rentFrequency;
  const depositAmount = ad?.depositAmount;
  const availableFrom = ad?.availableFrom;
  const isFurnished = ad?.isFurnished;
  const minimumStay = ad?.minimumStay;

  // ✅ Status fields
  const taken = ad?.taken;
  const featured = ad?.featured;
  const isVerified = ad?.isVerified;
  const isClaimable = ad?.isClaimable;
  const viewsCount = ad?.viewsCount;
  const listingSource = ad?.listingSource;
  const createdAt = ad?.createdAt;

  // ✅ Contact details
  const contactDetails = ad?.contact_details;
  const contactPhone = contactDetails?.phone_number;
  const contactEmail = contactDetails?.email;
  const contactAddress = contactDetails?.address;

  // ✅ Rating info
  const averageRating = ad?.average_rating || 0;
  const numOfReviews = ad?.numOfReviews || 0;

  // ✅ User - check if it's populated
  const user = (() => {
    const adUser = ad?.user;
    if (adUser && typeof adUser === 'object' && adUser.username) {
      return adUser;
    }
    // Fallback to items.user
    if (items?.user && typeof items.user === 'object' && items.user.username) {
      return items.user;
    }
    return null;
  })();

  // ✅ Claimed by - check if it's populated
  const claimedBy = (() => {
    const claimed = ad?.claimedBy;
    if (claimed && typeof claimed === 'object' && claimed.username) {
      return claimed;
    }
    return null;
  })();

  const MetadataRow = () => {
    if (!viewsCount && !ad?.likeCount && !createdAt && !listingSource) {
      return null;
    }

    return (
      <View style={styles.metadataRow}>
        {viewsCount !== undefined && viewsCount > 0 && (
          <View style={styles.metadataItem}>
            <Ionicons
              name='eye-outline'
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.metadataText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {formatNumber(viewsCount)} {viewsCount === 1 ? 'view' : 'views'}
            </Text>
          </View>
        )}

        {ad?.likeCount !== undefined && ad.likeCount > 0 && (
          <View style={styles.metadataItem}>
            <Ionicons name='heart' size={16} color='#FF4081' />
            <Text
              style={[
                styles.metadataText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {formatNumber(ad.likeCount)}{' '}
              {ad.likeCount === 1 ? 'like' : 'likes'}
            </Text>
          </View>
        )}

        {createdAt && (
          <View style={styles.metadataItem}>
            <Ionicons
              name='calendar-outline'
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.metadataText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Listed {formatDate(createdAt)}
            </Text>
          </View>
        )}

        {listingSource && (
          <View style={styles.metadataItem}>
            <Ionicons
              name='business-outline'
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.metadataText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {listingSource.charAt(0).toUpperCase() + listingSource.slice(1)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            opacity: headerAnimatedStyle.opacity,
          },
        ]}
      >
        <Appbar.Header elevated style={{ backgroundColor: 'transparent' }}>
          <Appbar.BackAction
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
          />
          <Appbar.Content
            title={title || 'Property'}
            titleStyle={styles.headerTitle}
          />
          <Appbar.Action icon='share-variant' onPress={shareProperty} />
          <Appbar.Action
            icon={ad?.isLiked ? 'heart' : 'heart-outline'}
            color={ad?.isLiked ? '#FF4081' : undefined}
            onPress={handleToggleLike}
          />
        </Appbar.Header>
      </Animated.View>

      {/* Floating Back Button */}
      <View style={styles.floatingBackButton}>
        <IconButton
          icon='arrow-left'
          size={24}
          iconColor='#fff'
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
        />
      </View>

      <View style={styles.floatingLikeButton}>
        <IconButton
          icon={ad?.isLiked ? 'heart' : 'heart-outline'}
          size={24}
          iconColor={ad?.isLiked ? '#FF4081' : '#fff'}
          style={[
            styles.likeButton,
            ad?.isLiked && { backgroundColor: 'rgba(255, 64, 129, 0.2)' },
          ]}
          onPress={handleToggleLike}
        />
      </View>

      {/* Main Content */}
      <Animated.ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
            listener: (event: any) => {
              headerOpacity.setValue(event.nativeEvent.contentOffset.y);
            },
          }
        )}
        scrollEventThrottle={16}
      >
        {/* Images */}
        {images.length > 0 && <ImageGrid data={images} />}

        <Animated.View
          style={[
            styles.contentCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Price & Badges */}
          <View style={styles.topRow}>
            <View style={styles.priceContainer}>
              {price && (
                <Text style={[styles.price, { color: theme.colors.primary }]}>
                  {formatPrice(price)}
                  {listingType === 'rent' && rentFrequency && (
                    <Text style={styles.priceFrequency}>
                      {' '}
                      /{rentFrequency === 'monthly' ? 'mo' : rentFrequency}
                    </Text>
                  )}
                </Text>
              )}
            </View>
            <View style={styles.badges}>
              {/* Listing Type Badge */}
              <Chip
                mode='flat'
                style={[
                  styles.typeChip,
                  {
                    backgroundColor:
                      listingType === 'rent'
                        ? 'rgba(255, 152, 0, 0.15)'
                        : 'rgba(76, 175, 80, 0.15)',
                  },
                ]}
                textStyle={{
                  color: listingType === 'rent' ? '#FF9800' : '#4CAF50',
                  fontWeight: '700',
                }}
              >
                {listingType === 'rent' ? 'For Rent' : 'For Sale'}
              </Chip>

              {/* Category Badge */}
              {category && (
                <Chip
                  mode='flat'
                  style={[
                    styles.categoryChip,
                    { backgroundColor: theme.colors.secondaryContainer },
                  ]}
                  textStyle={{
                    color: theme.colors.onSecondaryContainer,
                    fontWeight: '600',
                  }}
                >
                  {category}
                </Chip>
              )}
            </View>
          </View>

          {/* Status Badges */}
          <View style={styles.statusBadges}>
            {taken && (
              <Chip mode='flat' icon='check-circle' style={styles.statusChip}>
                Taken
              </Chip>
            )}
            {featured && (
              <Chip
                mode='flat'
                icon='star'
                style={[styles.statusChip, { backgroundColor: '#FFD700' }]}
              >
                Featured
              </Chip>
            )}
            {isVerified && (
              <Chip
                mode='flat'
                icon='shield-check'
                style={[styles.statusChip, { backgroundColor: '#4CAF50' }]}
              >
                Verified
              </Chip>
            )}
            {isClaimable && (
              <Chip
                mode='flat'
                icon='hand-pointing-up'
                style={styles.statusChip}
              >
                Claimable
              </Chip>
            )}
          </View>

          {/* Title */}
          {title && (
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
              {title}
            </Text>
          )}

          {/* Address */}
          {contactAddress && (
            <View style={styles.addressRow}>
              <Ionicons
                name='location-outline'
                size={20}
                color={theme.colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.address,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {contactAddress}
              </Text>
            </View>
          )}

          {/* Metadata */}
          <MetadataRow />

          <Divider style={styles.divider} />

          {/* Property Features */}
          <Card
            style={[
              styles.card,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <Card.Content>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              >
                Property Features
              </Text>
              <View style={styles.featuresGrid}>
                {bedrooms !== undefined && bedrooms !== null && (
                  <View style={styles.featureItem}>
                    <View
                      style={[
                        styles.featureIcon,
                        { backgroundColor: theme.colors.primaryContainer },
                      ]}
                    >
                      <Ionicons
                        name='bed-outline'
                        size={24}
                        color={theme.colors.onPrimaryContainer}
                      />
                    </View>
                    <Text
                      style={[
                        styles.featureLabel,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      Bedrooms
                    </Text>
                    <Text
                      style={[
                        styles.featureValue,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      {bedrooms}
                    </Text>
                  </View>
                )}

                {bathrooms !== undefined && bathrooms !== null && (
                  <View style={styles.featureItem}>
                    <View
                      style={[
                        styles.featureIcon,
                        { backgroundColor: theme.colors.primaryContainer },
                      ]}
                    >
                      <Ionicons
                        name='water-outline'
                        size={24}
                        color={theme.colors.onPrimaryContainer}
                      />
                    </View>
                    <Text
                      style={[
                        styles.featureLabel,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      Bathrooms
                    </Text>
                    <Text
                      style={[
                        styles.featureValue,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      {bathrooms}
                    </Text>
                  </View>
                )}

                {isFurnished !== undefined && (
                  <View style={styles.featureItem}>
                    <View
                      style={[
                        styles.featureIcon,
                        { backgroundColor: theme.colors.primaryContainer },
                      ]}
                    >
                      <Ionicons
                        name='home-outline'
                        size={24}
                        color={theme.colors.onPrimaryContainer}
                      />
                    </View>
                    <Text
                      style={[
                        styles.featureLabel,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      Furnished
                    </Text>
                    <Text
                      style={[
                        styles.featureValue,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      {isFurnished ? 'Yes' : 'No'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Rental Details */}
              {listingType === 'rent' &&
                (rentFrequency ||
                  depositAmount ||
                  minimumStay ||
                  availableFrom) && (
                  <>
                    <Divider style={{ marginVertical: 12 }} />
                    <Text
                      style={[
                        styles.subTitle,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      Rental Details
                    </Text>

                    {rentFrequency && (
                      <View style={styles.infoRow}>
                        <Ionicons
                          name='calendar-outline'
                          size={18}
                          color={theme.colors.primary}
                        />
                        <Text
                          style={[
                            styles.infoText,
                            { color: theme.colors.onSurfaceVariant },
                          ]}
                        >
                          Payment:{' '}
                          {rentFrequency.charAt(0).toUpperCase() +
                            rentFrequency.slice(1)}
                        </Text>
                      </View>
                    )}

                    {depositAmount !== undefined && depositAmount !== null && (
                      <View style={styles.infoRow}>
                        <Ionicons
                          name='cash-outline'
                          size={18}
                          color={theme.colors.primary}
                        />
                        <Text
                          style={[
                            styles.infoText,
                            { color: theme.colors.onSurfaceVariant },
                          ]}
                        >
                          Deposit: {formatPrice(depositAmount)}
                        </Text>
                      </View>
                    )}

                    {minimumStay && (
                      <View style={styles.infoRow}>
                        <Ionicons
                          name='time-outline'
                          size={18}
                          color={theme.colors.primary}
                        />
                        <Text
                          style={[
                            styles.infoText,
                            { color: theme.colors.onSurfaceVariant },
                          ]}
                        >
                          Min. Stay: {minimumStay}{' '}
                          {minimumStay === 1 ? 'day' : 'days'}
                        </Text>
                      </View>
                    )}

                    {availableFrom && (
                      <View style={styles.infoRow}>
                        <Ionicons
                          name='calendar-sharp'
                          size={18}
                          color={theme.colors.primary}
                        />
                        <Text
                          style={[
                            styles.infoText,
                            { color: theme.colors.onSurfaceVariant },
                          ]}
                        >
                          Available: {formatDate(availableFrom)}
                        </Text>
                      </View>
                    )}
                  </>
                )}
            </Card.Content>
          </Card>

          {/* Listed By / Claimed By */}
          <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
          >
            <Card.Content>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              >
                {claimedBy ? 'Claimed By' : 'Listed By'}
              </Text>

              {/* Show claimed user or original user */}
              {(claimedBy || user) && (
                <View style={styles.userSection}>
                  {claimedBy?.avatar || user?.avatar ? (
                    <Avatar.Image
                      size={64}
                      source={{ uri: claimedBy?.avatar || user?.avatar }}
                    />
                  ) : (
                    <Avatar.Text
                      size={64}
                      label={
                        (claimedBy?.username || user?.username)
                          ?.charAt(0)
                          .toUpperCase() || 'U'
                      }
                    />
                  )}
                  <View style={styles.userInfo}>
                    <Text
                      style={[
                        styles.userName,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      {claimedBy?.username || user?.username || 'Anonymous'}
                    </Text>

                    {claimedBy && (
                      <Chip
                        mode='flat'
                        icon='hand-holding-heart'
                        style={{ alignSelf: 'flex-start', marginTop: 4 }}
                      >
                        Claimed Owner
                      </Chip>
                    )}

                    {averageRating > 0 && (
                      <View style={styles.rating}>
                        <Ionicons name='star' size={16} color='#FFD700' />
                        <Text
                          style={[
                            styles.ratingText,
                            { color: theme.colors.onSurfaceVariant },
                          ]}
                        >
                          {averageRating.toFixed(1)} ({numOfReviews}{' '}
                          {numOfReviews === 1 ? 'review' : 'reviews'})
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Contact Information */}
              {(contactEmail || contactPhone) && (
                <>
                  <Divider style={{ marginVertical: 12 }} />
                  <Text
                    style={[styles.subTitle, { color: theme.colors.onSurface }]}
                  >
                    Contact Information
                  </Text>

                  {contactEmail && (
                    <TouchableOpacity
                      style={styles.contact}
                      onPress={() => handleEmail(contactEmail)}
                    >
                      <Ionicons
                        name='mail-outline'
                        size={16}
                        color={theme.colors.primary}
                      />
                      <Text
                        style={[
                          styles.contactText,
                          { color: theme.colors.primary },
                        ]}
                      >
                        {contactEmail}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {contactPhone && (
                    <TouchableOpacity
                      style={styles.contact}
                      onPress={() => handleCall(contactPhone)}
                    >
                      <Ionicons
                        name='call-outline'
                        size={16}
                        color={theme.colors.primary}
                      />
                      <Text
                        style={[
                          styles.contactText,
                          { color: theme.colors.primary },
                        ]}
                      >
                        {contactPhone}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </Card.Content>
          </Card>

          {/* About Property */}
          {description && (
            <Card
              style={[styles.card, { backgroundColor: theme.colors.surface }]}
            >
              <Card.Content>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  About This Property
                </Text>
                <Text
                  style={[
                    styles.description,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                  numberOfLines={readMore ? undefined : 5}
                >
                  {description}
                </Text>
                {description.length > 200 && (
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setReadMore((p) => !p);
                    }}
                    style={{ marginTop: 8 }}
                  >
                    <Text
                      style={[styles.readMore, { color: theme.colors.primary }]}
                    >
                      {readMore ? 'Show Less' : 'Read More'}
                    </Text>
                  </TouchableOpacity>
                )}
              </Card.Content>
            </Card>
          )}

          {/* Reviews */}
          <Card
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
          >
            <Card.Content>
              <View style={styles.reviewsHeader}>
                <View>
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    Reviews
                  </Text>
                  <Text
                    style={[
                      styles.reviewCount,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    {reviews.length}{' '}
                    {reviews.length === 1 ? 'review' : 'reviews'}
                  </Text>
                </View>
                <Button
                  mode='contained-tonal'
                  onPress={handleCommentPress}
                  icon='star'
                  style={{ borderRadius: 12 }}
                >
                  Write Review
                </Button>
              </View>

              <Divider style={{ marginVertical: 12 }} />

              {reviews.length > 0 ? (
                <View style={{ marginTop: 12 }}>
                  {reviews.slice(0, 2).map((r: any) => (
                    <Comment key={r._id} item={r} reviews={reviews} />
                  ))}
                </View>
              ) : (
                <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                  <Ionicons
                    name='chatbubbles-outline'
                    size={48}
                    color={theme.colors.onSurfaceVariant}
                    style={{ opacity: 0.5, marginBottom: 12 }}
                  />
                  <Text
                    style={[
                      { fontSize: 15, textAlign: 'center' },
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    No reviews yet. Be the first to review!
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </Animated.View>
      </Animated.ScrollView>

      {/* Bottom Action Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outline,
          },
        ]}
      >
        <View style={styles.bottomActions}>
          <IconButton
            icon='share-variant'
            size={24}
            iconColor={theme.colors.onSurfaceVariant}
            onPress={shareProperty}
            style={{ margin: 0 }}
          />
          <Button
            mode='contained'
            onPress={handleCommentPress}
            icon='message'
            style={{ flex: 1, marginHorizontal: 8, borderRadius: 20 }}
            contentStyle={{ paddingVertical: 8 }}
          >
            Contact Owner
          </Button>
          <IconButton
            icon={ad?.isLiked ? 'heart' : 'heart-outline'}
            size={24}
            iconColor={ad?.isLiked ? '#FF4081' : theme.colors.onSurfaceVariant}
            onPress={handleToggleLike}
            style={{ margin: 0 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Details;

const styles = StyleSheet.create({
  // Container & Layout
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  contentCard: {
    padding: designTokens.spacing.md,
  },

  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  floatingBackButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    zIndex: 20,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    margin: 0,
  },

  // Price & Badges Section
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  priceFrequency: {
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.7,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  typeChip: {
    height: 32,
    borderRadius: 16,
  },
  categoryChip: {
    height: 32,
    borderRadius: 16,
  },

  // Status Badges
  statusBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statusChip: {
    height: 30,
    borderRadius: 15,
  },

  // Title & Address
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  address: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },

  // Metadata
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metadataText: {
    fontSize: 13,
    opacity: 0.7,
  },

  // Divider
  divider: {
    marginVertical: 20,
  },

  // Cards
  card: {
    marginBottom: 16,
    borderRadius: designTokens.borderRadius.xl,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Section Titles
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },

  // Features Grid
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  featureItem: {
    alignItems: 'center',
    minWidth: '30%',
    flex: 1,
    paddingVertical: 12,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureLabel: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureValue: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },

  // Info Rows (Rental Details)
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 15,
    flex: 1,
  },

  // User Section
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Contact Section
  contact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    marginTop: 8,
  },
  contactText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },

  // Description
  description: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.85,
  },
  readMore: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },

  // Reviews Section
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewCount: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  floatingLikeButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 20,
  },
  likeButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    margin: 0,
  },
});
