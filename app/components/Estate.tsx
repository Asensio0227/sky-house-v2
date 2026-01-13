import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Chip, useTheme } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UIEstateDocument } from '../features/estate/types';
import { designTokens } from '../utils/designTokens';

const { width } = Dimensions.get('window');

interface EstateProps {
  items: UIEstateDocument;
  onPress?: () => void;
  index?: number;
  style?: any;
}

const Estate: React.FC<EstateProps> = React.memo(
  ({ items, onPress, index = 0, style }) => {
    const theme = useTheme();
    const {
      photo,
      user: { avatar, username },
      title,
      price,
      rentPrice,
      listingType,
      category,
      bedrooms,
      bathrooms,
      furnished,
    } = items;

    // Animation refs
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    // Entrance animation with stagger
    useEffect(() => {
      const delay = index * 100;
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    }, [index]);

    const handlePressIn = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    const handlePress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress?.();
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
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.touchable}
          accessibilityRole='button'
          accessibilityLabel={`Property by ${username}: ${title}`}
          accessibilityHint='Double tap to view property details'
        >
          <View style={styles.card}>
            {/* Main Image */}
            <Image
              style={styles.image}
              source={{ uri: photo[0]?.url }}
              resizeMode='cover'
              accessibilityLabel='Property image'
            />

            {/* Dark Gradient Overlay */}
            <View style={styles.gradientOverlay} />

            {/* Top Left Badges */}
            <View style={styles.topBadges}>
              <Chip
                mode='flat'
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      listingType === 'rent'
                        ? 'rgba(255, 152, 0, 0.95)'
                        : 'rgba(76, 175, 80, 0.95)',
                  },
                ]}
                textStyle={styles.badgeText}
              >
                {listingType === 'rent' ? 'For Rent' : 'For Sale'}
              </Chip>
              <View style={styles.featuredBadge}>
                <Ionicons name='star' size={12} color='#FFD700' />
                <Text style={styles.featuredText}>Featured</Text>
              </View>
            </View>

            {/* Bottom Content */}
            <View style={styles.bottomContent}>
              {/* User Badge */}
              <View style={styles.userBadge}>
                <Image
                  source={
                    avatar
                      ? { uri: avatar }
                      : require('../assets/user-icon.png')
                  }
                  style={styles.userAvatar}
                  accessibilityLabel={`${username}'s profile picture`}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.username} numberOfLines={1}>
                    {username}
                  </Text>
                  <Text style={styles.categoryText}>{category}</Text>
                </View>
              </View>

              {/* Property Title */}
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>

              {/* Features Row */}
              <View style={styles.featuresRow}>
                {bedrooms && (
                  <View style={styles.feature}>
                    <Ionicons name='bed-outline' size={16} color='#fff' />
                    <Text style={styles.featureText}>{bedrooms}</Text>
                  </View>
                )}
                {bathrooms && (
                  <View style={styles.feature}>
                    <Ionicons name='water-outline' size={16} color='#fff' />
                    <Text style={styles.featureText}>{bathrooms}</Text>
                  </View>
                )}
                {furnished !== undefined && (
                  <View style={styles.feature}>
                    <Ionicons
                      name={furnished ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={furnished ? '#4CAF50' : '#FF5252'}
                    />
                    <Text style={styles.featureText}>
                      {furnished ? 'Furnished' : 'Unfurnished'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Price Badge */}
              <View style={styles.priceContainer}>
                <Text style={styles.price}>
                  {formatPrice(displayPrice || 0)}
                  {listingType === 'rent' && (
                    <Text style={styles.priceFrequency}> /month</Text>
                  )}
                </Text>
                <View style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>View</Text>
                  <Ionicons name='arrow-forward' size={14} color='#fff' />
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

Estate.displayName = 'Estate';

const styles = StyleSheet.create({
  container: {
    marginHorizontal: designTokens.spacing.sm,
  },
  touchable: {
    borderRadius: designTokens.borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  card: {
    position: 'relative',
    width: '100%',
    height: 380,
    borderRadius: designTokens.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  topBadges: {
    position: 'absolute',
    top: designTokens.spacing.lg,
    left: designTokens.spacing.lg,
    flexDirection: 'row',
    gap: designTokens.spacing.xs,
    alignItems: 'center',
  },
  badge: {
    height: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: 6,
    borderRadius: designTokens.borderRadius.lg,
    gap: 4,
  },
  featuredText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 0.5,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: designTokens.spacing.lg,
    paddingTop: designTokens.spacing.xl * 2,
    background:
      'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    borderRadius: designTokens.borderRadius.xl,
    alignSelf: 'flex-start',
    marginBottom: designTokens.spacing.sm,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: designTokens.spacing.xs,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: designTokens.spacing.sm,
    lineHeight: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: designTokens.spacing.md,
    marginBottom: designTokens.spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: 4,
    borderRadius: designTokens.borderRadius.md,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  priceFrequency: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.sm,
    borderRadius: designTokens.borderRadius.xl,
    gap: 4,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});

export default Estate;
