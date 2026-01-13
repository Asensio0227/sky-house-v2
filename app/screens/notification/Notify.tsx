import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { format, formatDistanceToNow } from 'date-fns';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Animated,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Chip,
  Divider,
  FAB,
  IconButton,
  Menu,
  Searchbar,
  Text,
  useTheme,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { retrieveNotification } from '../../features/notify/notifySlice';
import { designTokens } from '../../utils/designTokens';
import { AppTheme } from '../../utils/theme';

type FilterType = 'all' | 'ok' | 'failed' | 'unread';

interface NotificationItemProps {
  notification: any;
  onPress: () => void;
  theme: AppTheme;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  theme,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const getNotificationIcon = () => {
    const messageText = notification.message?.text || '';
    if (messageText.includes('message') || messageText.includes('chat'))
      return 'message-text';
    if (messageText.includes('review') || messageText.includes('rating'))
      return 'star';
    if (messageText.includes('property') || messageText.includes('listing'))
      return 'home';
    if (messageText.includes('offer') || messageText.includes('price'))
      return 'currency-usd';
    return 'bell';
  };

  const getStatusColor = () => {
    switch (notification.status) {
      case 'ok':
        return theme.colors.success;
      case 'failed':
        return theme.colors.error;
      default:
        return theme.colors.info;
    }
  };

  const getIconColor = () => {
    const icon = getNotificationIcon();
    switch (icon) {
      case 'message-text':
        return theme.colors.primary;
      case 'star':
        return '#FFC107';
      case 'home':
        return theme.colors.secondary;
      case 'currency-usd':
        return '#4CAF50';
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const formatTime = (date: string) => {
    try {
      const notificationDate = new Date(date);
      const now = new Date();
      const diffInHours =
        (now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return formatDistanceToNow(notificationDate, { addSuffix: true });
      } else {
        return format(notificationDate, 'MMM d, h:mm a');
      }
    } catch {
      return 'Recently';
    }
  };

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.notificationItem,
          { backgroundColor: theme.colors.surface },
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          {/* Avatar/Icon */}
          <View style={styles.iconContainer}>
            {notification.createdBy?.avatar ? (
              <Avatar.Image
                size={48}
                source={{ uri: notification.createdBy.avatar }}
              />
            ) : (
              <View
                style={[
                  styles.iconWrapper,
                  { backgroundColor: `${getIconColor()}15` },
                ]}
              >
                <Avatar.Icon
                  size={48}
                  icon={getNotificationIcon()}
                  style={{ backgroundColor: 'transparent' }}
                  color={getIconColor()}
                />
              </View>
            )}
            {notification.status === 'ok' && (
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor() },
                ]}
              />
            )}
          </View>

          {/* Content */}
          <View style={styles.textContainer}>
            {/* Title/Sender */}
            <Text
              variant='titleMedium'
              style={[styles.senderName, { color: theme.colors.onSurface }]}
              numberOfLines={1}
            >
              {notification.createdBy?.username || 'System Notification'}
            </Text>

            {/* Message */}
            <Text
              variant='bodyMedium'
              style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={2}
            >
              {notification.message?.text || 'You have a new notification'}
            </Text>

            {/* Time and Status */}
            <View style={styles.metaContainer}>
              <Text
                variant='bodySmall'
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {formatTime(notification.createdAt)}
              </Text>
              {notification.status && (
                <Chip
                  mode='flat'
                  compact
                  style={[
                    styles.statusChip,
                    { backgroundColor: `${getStatusColor()}20` },
                  ]}
                  textStyle={{ color: getStatusColor(), fontSize: 11 }}
                >
                  {notification.status}
                </Chip>
              )}
            </View>
          </View>

          {/* Action Icon */}
          <IconButton
            icon='chevron-right'
            size={20}
            iconColor={theme.colors.onSurfaceVariant}
            style={styles.chevron}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const NotificationsScreen: React.FC = () => {
  const theme = useTheme<AppTheme>();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();

  const { isLoading, notify, totalNotify } = useSelector(
    (store: RootState) => store.NOTIFY
  );

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [menuVisible, setMenuVisible] = useState(false);

  // Load notifications on screen focus
  useFocusEffect(
    useCallback(() => {
      dispatch(retrieveNotification());
    }, [dispatch])
  );

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    let filtered = [...notify];

    // Apply filter
    if (filterType !== 'all') {
      filtered = filtered.filter((n) => n.status === filterType);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.message?.text?.toLowerCase().includes(query) ||
          n.createdBy?.username?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [notify, filterType, searchQuery]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(retrieveNotification()).unwrap();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleNotificationPress = useCallback(
    (notification: any) => {
      const messageText = notification.message?.text || '';

      if (messageText.includes('message')) {
        navigation.navigate('conversation' as never);
      } else if (messageText.includes('review')) {
        navigation.navigate('home' as never);
      } else if (messageText.includes('property')) {
        navigation.navigate('home' as never);
      }
    },
    [navigation]
  );

  const getFilterLabel = (filter: FilterType) => {
    switch (filter) {
      case 'all':
        return `All (${notify.length})`;
      case 'ok':
        return `Sent (${notify.filter((n) => n.status === 'ok').length})`;
      case 'failed':
        return `Failed (${notify.filter((n) => n.status === 'failed').length})`;
      default:
        return 'All';
    }
  };

  const renderEmpty = () => (
    <View style={[styles.emptyContainer, styles.centered]}>
      <Avatar.Icon
        size={80}
        icon={searchQuery ? 'magnify-close' : 'bell-off-outline'}
        style={{
          backgroundColor: theme.colors.surfaceVariant,
          marginBottom: designTokens.spacing.lg,
        }}
      />
      <Text
        variant='headlineSmall'
        style={[styles.emptyTitle, { color: theme.colors.onSurface }]}
      >
        {searchQuery ? 'No Results Found' : 'No Notifications Yet'}
      </Text>
      <Text
        variant='bodyMedium'
        style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}
      >
        {searchQuery
          ? 'Try adjusting your search or filter'
          : "When you receive notifications, they'll appear here"}
      </Text>
      {searchQuery && (
        <TouchableOpacity
          onPress={() => setSearchQuery('')}
          style={[
            styles.clearButton,
            { backgroundColor: theme.colors.primaryContainer },
          ]}
        >
          <Text style={{ color: theme.colors.primary }}>Clear Search</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
      {/* Title */}
      <View style={styles.headerContent}>
        <Text
          variant='headlineMedium'
          style={[styles.headerTitle, { color: theme.colors.onSurface }]}
        >
          Notifications
        </Text>
        {totalNotify > 0 && (
          <Chip
            mode='flat'
            style={{
              backgroundColor: theme.colors.primaryContainer,
              height: 28,
            }}
            textStyle={{ fontSize: 12, fontWeight: '600' }}
          >
            {totalNotify}
          </Chip>
        )}
      </View>

      {/* Search Bar */}
      {notify.length > 0 && (
        <Searchbar
          placeholder='Search notifications...'
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
          iconColor={theme.colors.onSurfaceVariant}
          inputStyle={{ fontSize: 14 }}
          elevation={0}
        />
      )}

      {/* Filter Chips */}
      {notify.length > 0 && (
        <View style={styles.filterContainer}>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Chip
                mode={filterType === 'all' ? 'flat' : 'outlined'}
                selected={filterType === 'all'}
                onPress={() => setMenuVisible(true)}
                style={styles.filterChip}
                icon='filter-variant'
              >
                {getFilterLabel(filterType)}
              </Chip>
            }
          >
            <Menu.Item
              onPress={() => {
                setFilterType('all');
                setMenuVisible(false);
              }}
              title={getFilterLabel('all')}
            />
            <Menu.Item
              onPress={() => {
                setFilterType('ok');
                setMenuVisible(false);
              }}
              title={getFilterLabel('ok')}
            />
            <Menu.Item
              onPress={() => {
                setFilterType('failed');
                setMenuVisible(false);
              }}
              title={getFilterLabel('failed')}
            />
          </Menu>
        </View>
      )}
    </View>
  );

  if (isLoading && !refreshing && notify.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size='large' color={theme.colors.primary} />
        <Text
          variant='bodyMedium'
          style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}
        >
          Loading notifications...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => handleNotificationPress(item)}
            theme={theme}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={() => (
          <Divider style={{ marginHorizontal: designTokens.spacing.md }} />
        )}
        contentContainerStyle={
          filteredNotifications.length === 0
            ? styles.emptyList
            : styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      {notify.length > 0 && (
        <FAB
          icon='refresh'
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={handleRefresh}
          label='Refresh'
          color={theme.colors.onPrimary}
        />
      )}
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
  },

  // Header
  header: {
    paddingHorizontal: designTokens.spacing.lg,
    paddingTop:
      Platform.OS === 'ios' ? designTokens.spacing.xl : designTokens.spacing.lg,
    paddingBottom: designTokens.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: designTokens.spacing.md,
  },
  headerTitle: {
    fontWeight: designTokens.typography.fontWeight.bold,
  },
  searchBar: {
    marginBottom: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.lg,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: designTokens.spacing.sm,
    marginBottom: designTokens.spacing.sm,
  },
  filterChip: {
    marginRight: designTokens.spacing.xs,
  },

  // Notification Item
  notificationItem: {
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.md,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    position: 'relative',
    marginRight: designTokens.spacing.md,
  },
  iconWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  statusBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  textContainer: {
    flex: 1,
    marginRight: designTokens.spacing.xs,
  },
  senderName: {
    fontWeight: designTokens.typography.fontWeight.semibold,
    marginBottom: designTokens.spacing.xs,
  },
  message: {
    marginBottom: designTokens.spacing.sm,
    lineHeight: 20,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },
  statusChip: {
    height: 22,
  },
  chevron: {
    margin: 0,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    padding: designTokens.spacing.xl,
  },
  emptyTitle: {
    fontWeight: designTokens.typography.fontWeight.bold,
    marginBottom: designTokens.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: designTokens.spacing.lg,
  },
  clearButton: {
    paddingHorizontal: designTokens.spacing.lg,
    paddingVertical: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.md,
    marginTop: designTokens.spacing.sm,
  },

  // Loading
  loadingText: {
    marginTop: designTokens.spacing.md,
  },

  // FAB
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
