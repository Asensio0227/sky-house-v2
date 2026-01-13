import { useNavigation, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Share,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import {
  ActivityIndicator,
  Avatar,
  Chip,
  IconButton,
  Text,
  useTheme,
} from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  createConversation,
  createMsg,
  updateConversation,
} from '../features/chats/chatsSlice';
import { IPhoto, UIEstateDocument } from '../features/estate/types';
import { sendNotifications } from '../features/notify/notifySlice';
import { designTokens } from '../utils/designTokens';
import { getUserId } from '../utils/globals';

dayjs.extend(relativeTime);

const { width } = Dimensions.get('screen');

interface EstateContainerProps {
  items: UIEstateDocument;
  style?: any;
  showEditButton?: boolean; // New prop to control button display
}

const EstateContainer: React.FC<EstateContainerProps> = React.memo(
  ({ items, style, showEditButton = false }) => {
    const theme = useTheme();
    const navigation: any = useNavigation();
    const router: any = useRoute();
    const { currentUser } = useSelector((store: RootState) => store.USER);
    const {
      user,
      photo,
      average_rating,
      price,
      rentPrice,
      listingType,
      category,
    } = items;
    const userId = getUserId(items);
    const dispatch: any = useDispatch();
    const [readMore, setReadMore] = useState(false);
    const [visible, setVisible] = useState(false);
    const [sending, setSending] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const pressAnim = useRef(new Animated.Value(1)).current;

    const images: { id: string; uri: string } | any = photo.map(
      (img: IPhoto) => ({
        id: img.id,
        uri: img.url,
      })
    );

    // Check if current user owns this listing
    const isOwnListing = currentUser?.userId === userId;

    // Entrance animation
    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    useEffect(() => {
      if (images.length > 0) {
        setImageUrl(images[0].uri);
      }
    }, []);

    const handlePressIn = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.spring(pressAnim, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(pressAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    const handlePress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.name === 'listings'
        ? navigation.navigate('details', items)
        : navigation.navigate('info', items);
    };

    const shareImage = async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      try {
        if (typeof items.title !== 'string' || typeof imageUrl !== 'string') {
          console.error('Invalid title or imageUrl');
          return;
        }

        const result = await Share.share({
          message: `${items.title}, ${imageUrl}`,
          url: imageUrl,
        });
        if (result.action === Share.sharedAction) {
          ToastAndroid.show('Property shared successfully', 1500);
        }
      } catch (error: any) {
        console.log('Oops!, Failed to share image', error);
      }
    };

    const handleEdit = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      navigation.navigate('edit-listing', items);
    };

    const enquire = async () => {
      setSending(true);

      try {
        if (!user || !currentUser) {
          console.error('User or currentUser is undefined');
          ToastAndroid.show('Failed to send message: Missing user data', 2000);
          return;
        }

        const userB = {
          email: user.email || user.contact_details?.email,
          avatar: user.avatar,
          _id: user._id,
          username: user.username,
          lastSeen: user.lastSeen || `Last seen ${dayjs().fromNow()}`,
        };

        const userA = {
          email: currentUser.email,
          avatar: currentUser.avatar,
          _id: currentUser.userId,
          username: currentUser.username,
          lastSeen: currentUser.lastSeen || `Last seen ${dayjs().fromNow()}`,
        };

        const participantsArray = [userA.email, userB.email];
        const participants = [userA, userB];

        const roomAction = await dispatch(
          createConversation({ participants, participantsArray })
        );

        const room =
          roomAction.payload.newRoom || roomAction.payload.existingRoom;

        if (!room?._id) throw new Error('Room creation failed');

        const roomId = room._id;

        const msg = {
          text: 'hello, is this still available?',
          roomId,
          photo: images,
        };

        const [msgAction] = await Promise.all([
          dispatch(createMsg(msg)),
          dispatch(sendNotifications({ userId, msg })),
        ]);

        const lastMessage = msgAction.payload.newMsg;

        await dispatch(
          updateConversation({
            id: roomId,
            lastMessage,
          })
        );

        ToastAndroid.show('Message sent', 1500);
      } catch (error) {
        console.log(error);
        ToastAndroid.show('Failed to send message', 1500);
      } finally {
        setSending(false);
      }
    };

    const formatPrice = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const displayPrice = listingType === 'rent' ? rentPrice : price;

    return (
      <Animated.View
        style={[
          styles.container,
          style,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              transform: [{ scale: pressAnim }],
            },
          ]}
        >
          <TouchableWithoutFeedback
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            accessibilityRole='button'
            accessibilityLabel={`View details for ${items.title}`}
            accessibilityHint='Navigate to property details'
          >
            <View>
              {/* Image Section with Overlay Info */}
              <View style={styles.imageSection}>
                <Image
                  source={{ uri: photo[0]?.url }}
                  style={styles.mainImage}
                  resizeMode='cover'
                  accessibilityLabel='Property image'
                />

                {/* Gradient Overlay */}
                <View style={styles.imageOverlay} />

                {/* Top Badges */}
                <View style={styles.topBadges}>
                  <Chip
                    mode='flat'
                    style={[
                      styles.listingTypeChip,
                      {
                        backgroundColor:
                          listingType === 'rent'
                            ? 'rgba(255, 152, 0, 0.9)'
                            : 'rgba(76, 175, 80, 0.9)',
                      },
                    ]}
                    textStyle={styles.chipText}
                  >
                    {listingType === 'rent' ? 'For Rent' : 'For Sale'}
                  </Chip>
                  <Chip
                    mode='flat'
                    style={[
                      styles.categoryChip,
                      { backgroundColor: 'rgba(33, 150, 243, 0.9)' },
                    ]}
                    textStyle={styles.chipText}
                  >
                    {category}
                  </Chip>
                </View>

                {/* Price Badge */}
                <View style={styles.priceBadge}>
                  <Text style={styles.priceText}>
                    {formatPrice(displayPrice || 0)}
                    {listingType === 'rent' && (
                      <Text style={styles.priceFrequency}>/mo</Text>
                    )}
                  </Text>
                </View>

                {/* Image Counter */}
                <View style={styles.imageCounter}>
                  <Ionicons name='images' size={14} color='#fff' />
                  <Text style={styles.imageCounterText}>{photo.length}</Text>
                </View>
              </View>

              {/* Content Section */}
              <View style={styles.contentSection}>
                {/* User Profile - Fixed Layout */}
                <View style={styles.userProfileSection}>
                  {user?.avatar ? (
                    <Avatar.Image size={48} source={{ uri: user.avatar }} />
                  ) : (
                    <Avatar.Text
                      size={48}
                      label={user?.username?.charAt(0).toUpperCase() || 'U'}
                    />
                  )}
                  <View style={styles.userInfoContainer}>
                    <Text
                      style={[
                        styles.username,
                        { color: theme.colors.onSurface },
                      ]}
                      numberOfLines={1}
                    >
                      {user?.username || 'Anonymous'}
                    </Text>
                    {average_rating > 0 && (
                      <View style={styles.ratingContainer}>
                        <Ionicons name='star' size={14} color='#FFD700' />
                        <Text
                          style={[
                            styles.ratingText,
                            { color: theme.colors.onSurfaceVariant },
                          ]}
                        >
                          {average_rating.toFixed(1)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Title */}
                <Text
                  style={[styles.title, { color: theme.colors.onSurface }]}
                  numberOfLines={2}
                >
                  {items.title}
                </Text>

                {/* Description */}
                <Text
                  style={[
                    styles.description,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                  numberOfLines={readMore ? undefined : 2}
                >
                  {readMore
                    ? items.description
                    : items.description.length > 100
                    ? `${items.description.substring(0, 100)}...`
                    : items.description}
                </Text>

                {items.description.length > 100 && (
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setReadMore((prev) => !prev);
                    }}
                    style={styles.readMoreButton}
                    accessibilityRole='button'
                    accessibilityLabel={
                      readMore
                        ? 'Show less description'
                        : 'Read more description'
                    }
                  >
                    <Text
                      style={[styles.readMore, { color: theme.colors.primary }]}
                    >
                      {readMore ? 'Show Less' : 'Read More'}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Property Features */}
                <View style={styles.featuresRow}>
                  {items.bedrooms && (
                    <View style={styles.featureItem}>
                      <Ionicons
                        name='bed-outline'
                        size={18}
                        color={theme.colors.primary}
                      />
                      <Text
                        style={[
                          styles.featureText,
                          { color: theme.colors.onSurfaceVariant },
                        ]}
                      >
                        {items.bedrooms} bed
                      </Text>
                    </View>
                  )}
                  {items.bathrooms && (
                    <View style={styles.featureItem}>
                      <Ionicons
                        name='water-outline'
                        size={18}
                        color={theme.colors.primary}
                      />
                      <Text
                        style={[
                          styles.featureText,
                          { color: theme.colors.onSurfaceVariant },
                        ]}
                      >
                        {items.bathrooms} bath
                      </Text>
                    </View>
                  )}
                  {items.furnished !== undefined && (
                    <View style={styles.featureItem}>
                      <Ionicons
                        name='home-outline'
                        size={18}
                        color={theme.colors.primary}
                      />
                      <Text
                        style={[
                          styles.featureText,
                          { color: theme.colors.onSurfaceVariant },
                        ]}
                      >
                        {items.furnished ? 'Furnished' : 'Unfurnished'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Action Footer */}
              <View
                style={[
                  styles.footer,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                {/* Conditionally render Edit or Contact button */}
                {showEditButton || isOwnListing ? (
                  <TouchableOpacity
                    onPress={handleEdit}
                    style={[
                      styles.primaryButton,
                      { backgroundColor: theme.colors.primary },
                    ]}
                    accessibilityRole='button'
                    accessibilityLabel='Edit listing'
                  >
                    <MaterialIcons
                      name='edit'
                      size={20}
                      color={theme.colors.onPrimary}
                    />
                    <Text
                      style={[
                        styles.buttonText,
                        { color: theme.colors.onPrimary },
                      ]}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={enquire}
                    disabled={sending}
                    style={[
                      styles.primaryButton,
                      { backgroundColor: theme.colors.primary },
                    ]}
                    accessibilityRole='button'
                    accessibilityLabel='Send inquiry message'
                    accessibilityState={{ disabled: sending }}
                  >
                    {sending ? (
                      <ActivityIndicator
                        size='small'
                        color={theme.colors.onPrimary}
                      />
                    ) : (
                      <>
                        <MaterialIcons
                          name='message'
                          size={20}
                          color={theme.colors.onPrimary}
                        />
                        <Text
                          style={[
                            styles.buttonText,
                            { color: theme.colors.onPrimary },
                          ]}
                        >
                          Contact
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                <View style={styles.secondaryActions}>
                  <IconButton
                    icon='share-variant'
                    size={24}
                    iconColor={theme.colors.onSurfaceVariant}
                    onPress={shareImage}
                    style={styles.iconButton}
                    accessibilityLabel='Share property'
                  />
                  <IconButton
                    icon='heart-outline'
                    size={24}
                    iconColor={theme.colors.onSurfaceVariant}
                    style={styles.iconButton}
                    accessibilityLabel='Add to favorites'
                  />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>

        {/* Image Modal */}
        <Modal
          isVisible={visible}
          onBackdropPress={() => setVisible(false)}
          onBackButtonPress={() => setVisible(false)}
          style={styles.modal}
          animationIn='zoomIn'
          animationOut='zoomOut'
          backdropOpacity={0.9}
        >
          <View style={styles.modalContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.modalImage}
              resizeMode='contain'
              accessibilityLabel='Full size property image'
            />
            <TouchableOpacity
              onPress={() => setVisible(false)}
              style={[
                styles.closeButton,
                { backgroundColor: theme.colors.primary },
              ]}
              accessibilityRole='button'
              accessibilityLabel='Close image modal'
            >
              <AntDesign
                name='close'
                size={24}
                color={theme.colors.onPrimary}
              />
            </TouchableOpacity>
          </View>
        </Modal>
      </Animated.View>
    );
  }
);

EstateContainer.displayName = 'EstateContainer';

export default EstateContainer;

const styles = StyleSheet.create({
  container: {
    marginVertical: designTokens.spacing.sm,
  },
  card: {
    borderRadius: designTokens.borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  imageSection: {
    position: 'relative',
    width: '100%',
    height: 240,
    backgroundColor: '#f5f5f5',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  topBadges: {
    position: 'absolute',
    top: designTokens.spacing.md,
    left: designTokens.spacing.md,
    flexDirection: 'row',
    gap: designTokens.spacing.xs,
  },
  listingTypeChip: {
    height: 28,
  },
  categoryChip: {
    height: 28,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  priceBadge: {
    position: 'absolute',
    bottom: designTokens.spacing.md,
    left: designTokens.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
    borderRadius: designTokens.borderRadius.lg,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  priceFrequency: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e0e0e0',
  },
  imageCounter: {
    position: 'absolute',
    bottom: designTokens.spacing.md,
    right: designTokens.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: 4,
    borderRadius: designTokens.borderRadius.md,
    gap: 4,
  },
  imageCounterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  contentSection: {
    padding: designTokens.spacing.md,
  },
  userProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designTokens.spacing.md,
  },
  userInfoContainer: {
    flex: 1,
    marginLeft: designTokens.spacing.sm,
    justifyContent: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: designTokens.spacing.xs,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: designTokens.spacing.xs,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    marginBottom: designTokens.spacing.sm,
  },
  readMore: {
    fontSize: 14,
    fontWeight: '600',
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designTokens.spacing.md,
    marginTop: designTokens.spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: designTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.sm + 2,
    borderRadius: designTokens.borderRadius.xl,
    gap: designTokens.spacing.xs,
    flex: 1,
    justifyContent: 'center',
    marginRight: designTokens.spacing.sm,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: designTokens.spacing.xs,
  },
  iconButton: {
    margin: 0,
  },
  modal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.95,
    maxHeight: '85%',
  },
  modalImage: {
    width: '100%',
    height: 400,
    borderRadius: designTokens.borderRadius.xl,
  },
  closeButton: {
    position: 'absolute',
    top: designTokens.spacing.md,
    right: designTokens.spacing.md,
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
