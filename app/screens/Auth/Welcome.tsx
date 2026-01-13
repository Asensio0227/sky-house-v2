import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import AppButton from '../../components/custom/AppButton';
import AppText from '../../components/custom/AppText';

const { width, height } = Dimensions.get('window');

const Welcome = () => {
  const theme = useTheme();
  const navigation: any = useNavigation();

  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonSlideAnim = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const styles = StyleSheet.create({
    wclBackground: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    logoSection: {
      alignItems: 'center',
      marginTop: height * 0.12,
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    logoIcon: {
      fontSize: 40,
    },
    brandName: {
      fontSize: 36,
      fontWeight: 'bold',
      letterSpacing: 1.2,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 8,
    },
    taglineSection: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 30,
    },
    mainTagline: {
      fontSize: 32,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 8,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 8,
    },
    subTagline: {
      fontSize: 18,
      fontWeight: '500',
      textAlign: 'center',
      marginBottom: 24,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
      color: theme.colors.secondary,
    },
    featuresContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 10,
      marginTop: 20,
    },
    featurePill: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    featureText: {
      fontSize: 12,
      fontWeight: '600',
    },
    sectionCenter: {
      padding: 24,
      width: '100%',
      paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    },
    signInButton: {
      marginBottom: 12,
      borderColor: '#FFFFFF',
      borderWidth: 2,
    },
    signUpButton: {
      marginBottom: 16,
      backgroundColor: theme.colors.primary,
      elevation: 8,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    guestButton: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    guestText: {
      fontSize: 14,
      fontWeight: '500',
      textDecorationLine: 'underline',
      opacity: 0.9,
    },
  });

  useEffect(() => {
    // Staggered entrance animations
    Animated.sequence([
      // Logo and brand fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Tagline slide up
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      // Buttons slide up
      Animated.timing(buttonSlideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ImageBackground
      source={require('../../assets/small-wooden-houses-with-heart-big-one-symbolizing-family-love-security-home.jpg')}
      blurRadius={5}
      resizeMode='cover'
      style={styles.wclBackground}
    >
      {/* Dark overlay for better text contrast */}
      <View style={styles.overlay} />

      {/* Logo/Brand Section */}
      <Animated.View
        style={[
          styles.logoSection,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <AppText title='🏠' style={styles.logoIcon} />
        </View>
        <AppText title='Sky Housing' color='#FFFFFF' style={styles.brandName} />
      </Animated.View>

      {/* Main Tagline Section */}
      <Animated.View
        style={[
          styles.taglineSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <AppText
          title='Your Next Home Awaits'
          color='#FFFFFF'
          style={styles.mainTagline}
        />
        <AppText title='Start Searching Today!' style={styles.subTagline} />

        {/* Feature Pills */}
        <View style={styles.featuresContainer}>
          <View style={styles.featurePill}>
            <AppText
              title='📍 Find Locations'
              color='#FFFFFF'
              style={styles.featureText}
            />
          </View>
          <View style={styles.featurePill}>
            <AppText
              title='💬 Chat Agents'
              color='#FFFFFF'
              style={styles.featureText}
            />
          </View>
          <View style={styles.featurePill}>
            <AppText
              title='⭐ Rate Homes'
              color='#FFFFFF'
              style={styles.featureText}
            />
          </View>
        </View>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View
        style={[
          styles.sectionCenter,
          {
            transform: [{ translateY: buttonSlideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <AppButton
          style={styles.signInButton}
          title='Sign In'
          mode='outlined'
          onPress={() => navigation.navigate('sign-in')}
        />
        <AppButton
          style={styles.signUpButton}
          title='Create Account'
          mode='contained'
          onPress={() => navigation.navigate('sign-up')}
        />

        {/* Guest Browse Option */}
        <TouchableOpacity
          style={styles.guestButton}
          onPress={() => {
            // Navigate to main app without authentication
            console.log('Browse as guest');
          }}
        >
          <AppText
            title='Browse as Guest →'
            color='#FFFFFF'
            style={styles.guestText}
          />
        </TouchableOpacity>
      </Animated.View>
    </ImageBackground>
  );
};

export default Welcome;
