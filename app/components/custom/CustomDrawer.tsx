import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  Avatar,
  Divider,
  List,
  Switch,
  Text,
  useTheme,
} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { signOutUser } from '../../features/auth/authSlice';
import { toggleTheme } from '../../features/theme/themeSlice';
import { clearCurrentUser } from '../../features/user/userSlice';
import { designTokens } from '../../utils/designTokens';

const CustomDrawer = (props: any) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { currentUser: user } = useSelector((store: RootState) => store.USER);
  const { isDark } = useSelector((state: any) => state.THEME);
  const dispatch: any = useDispatch();

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(signOutUser());
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              dispatch(clearCurrentUser());
            } catch (error) {
              console.error('Logout error:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleThemeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(toggleTheme());
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContent}
      style={{ backgroundColor: theme.colors.background }}
    >
      {/* User Profile Section */}
      <View
        style={[
          styles.profileSection,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <View style={styles.profileHeader}>
          {user?.avatar ? (
            <Avatar.Image size={72} source={{ uri: user.avatar }} />
          ) : (
            <Avatar.Text
              size={72}
              label={user?.username?.charAt(0).toUpperCase() || 'U'}
              style={{ backgroundColor: theme.colors.primaryContainer }}
            />
          )}
          <View style={styles.profileInfo}>
            <Text
              variant='titleLarge'
              style={[styles.username, { color: theme.colors.onSurface }]}
            >
              {user?.username || 'Guest User'}
            </Text>
            <Text
              variant='bodyMedium'
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {user?.email || 'guest@example.com'}
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text
              variant='titleMedium'
              style={[styles.statValue, { color: theme.colors.primary }]}
            >
              12
            </Text>
            <Text
              variant='bodySmall'
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Listings
            </Text>
          </View>
          <Divider style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text
              variant='titleMedium'
              style={[styles.statValue, { color: theme.colors.primary }]}
            >
              4.8
            </Text>
            <Text
              variant='bodySmall'
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Rating
            </Text>
          </View>
          <Divider style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text
              variant='titleMedium'
              style={[styles.statValue, { color: theme.colors.primary }]}
            >
              45
            </Text>
            <Text
              variant='bodySmall'
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Reviews
            </Text>
          </View>
        </View>
      </View>

      <Divider style={styles.divider} />

      {/* Navigation Items */}
      <View style={styles.navigationSection}>
        <Text
          variant='labelLarge'
          style={[
            styles.sectionLabel,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          MAIN MENU
        </Text>
        <DrawerItemList {...props} />
      </View>

      <Divider style={styles.divider} />

      {/* Settings Section */}
      <View style={styles.settingsSection}>
        <Text
          variant='labelLarge'
          style={[
            styles.sectionLabel,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          PREFERENCES
        </Text>

        <List.Item
          title='Dark Mode'
          description={isDark ? 'Enabled' : 'Disabled'}
          titleStyle={{ fontSize: 16, fontWeight: '600' }}
          descriptionStyle={{ fontSize: 12 }}
          left={(props) => (
            <Ionicons
              name={isDark ? 'moon' : 'moon-outline'}
              size={24}
              color={theme.colors.onSurfaceVariant}
              style={{ marginLeft: 12 }}
            />
          )}
          right={(props) => (
            <Switch
              value={isDark}
              onValueChange={handleThemeToggle}
              color={theme.colors.primary}
            />
          )}
          style={styles.listItem}
        />

        <List.Item
          title='Notifications'
          titleStyle={{ fontSize: 16, fontWeight: '600' }}
          left={(props) => (
            <Ionicons
              name='notifications-outline'
              size={24}
              color={theme.colors.onSurfaceVariant}
              style={{ marginLeft: 12 }}
            />
          )}
          right={(props) => (
            <Ionicons
              name='chevron-forward'
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          )}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('notifications' as never);
          }}
          style={styles.listItem}
        />

        <List.Item
          title='Help & Support'
          titleStyle={{ fontSize: 16, fontWeight: '600' }}
          left={(props) => (
            <Ionicons
              name='help-circle-outline'
              size={24}
              color={theme.colors.onSurfaceVariant}
              style={{ marginLeft: 12 }}
            />
          )}
          right={(props) => (
            <Ionicons
              name='chevron-forward'
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          )}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('help' as never);
          }}
          style={styles.listItem}
        />
      </View>

      <Divider style={styles.divider} />

      {/* Logout Button */}
      <TouchableOpacity
        style={[
          styles.logoutButton,
          { backgroundColor: theme.colors.errorContainer },
        ]}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Ionicons name='log-out-outline' size={24} color={theme.colors.error} />
        <Text
          variant='titleMedium'
          style={[styles.logoutText, { color: theme.colors.error }]}
        >
          Logout
        </Text>
      </TouchableOpacity>

      {/* App Version */}
      <View style={styles.footer}>
        <Text
          variant='bodySmall'
          style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}
        >
          EstateHub v1.0.0 • {isDark ? 'Dark' : 'Light'} Mode
        </Text>
      </View>
    </DrawerContentScrollView>
  );
};

export default CustomDrawer;

const styles = StyleSheet.create({
  drawerContent: {
    paddingTop: 0,
  },
  profileSection: {
    padding: designTokens.spacing.lg,
    borderBottomLeftRadius: designTokens.borderRadius.xl,
    borderBottomRightRadius: designTokens.borderRadius.xl,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: designTokens.spacing.md,
  },
  profileInfo: {
    marginLeft: designTokens.spacing.md,
    flex: 1,
  },
  username: {
    fontWeight: '700',
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: designTokens.spacing.md,
    paddingTop: designTokens.spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: '700',
    marginBottom: 4,
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  divider: {
    marginVertical: designTokens.spacing.md,
  },
  navigationSection: {
    paddingHorizontal: designTokens.spacing.xs,
  },
  settingsSection: {
    paddingHorizontal: designTokens.spacing.xs,
  },
  sectionLabel: {
    marginLeft: designTokens.spacing.md,
    marginBottom: designTokens.spacing.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  listItem: {
    borderRadius: designTokens.borderRadius.lg,
    marginHorizontal: designTokens.spacing.sm,
    marginVertical: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: designTokens.spacing.lg,
    marginVertical: designTokens.spacing.md,
    padding: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.xl,
    gap: designTokens.spacing.sm,
  },
  logoutText: {
    fontWeight: '700',
  },
  footer: {
    padding: designTokens.spacing.md,
    marginTop: 'auto',
  },
});
