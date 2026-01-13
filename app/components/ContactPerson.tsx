import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import React from 'react';
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Avatar, MD3Colors, Text, useTheme } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { removeRoom, resetConversations } from '../features/chats/chatsSlice';
dayjs.extend(calendar);

type ContactPersonProps = {
  description?: string;
  hasUnread: number | string;
  user?: {
    username?: string;
    fName?: string;
    avatar?: string;
  };
  style?: ViewStyle;
  time?: any | { createdAt?: string };
  room?: { _id: string };
  image?: any;
};

const ContactPerson: React.FC<ContactPersonProps> = ({
  description,
  user,
  style,
  time,
  room,
  image,
  hasUnread,
}) => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();

  const deleteChat = async () => {
    try {
      const id: any = room?._id;
      if (id) {
        await dispatch(removeRoom(id) as any);
        dispatch(resetConversations());
      }
    } catch (error) {
      console.log('Error deleting chat:', error);
    }
  };

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('chat', { user, room, image })}
      onLongPress={() =>
        Alert.alert('Chat', 'Are you sure you want to delete chat?', [
          { text: 'Yes', onPress: deleteChat },
          { text: 'No', style: 'cancel' },
        ])
      }
      style={[
        style,
        styles.container,
        { backgroundColor: theme.colors.surfaceVariant },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Avatar.Image size={65} source={{ uri: user.avatar }} />
          ) : (
            <Avatar.Text
              size={40}
              label={user?.username?.charAt(0).toUpperCase() || '?'}
            />
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.rowBetween}>
            <Text
              style={[styles.text, { color: theme.colors.onSurface }]}
              numberOfLines={1}
            >
              {user?.username || user?.fName || 'Unknown'}
            </Text>
            <View style={styles.timeBadgeWrapper}>
              <Text
                style={[styles.time, { color: theme.colors.onSurfaceVariant }]}
              >
                {dayjs(time?.createdAt).calendar()}
              </Text>
              {Number(hasUnread) > 0 && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: theme.colors.onPrimary },
                    ]}
                  >
                    {hasUnread}
                  </Text>
                </View>
              )}
            </View>
          </View>
          {description && (
            <Text
              style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={1}
            >
              {description}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ContactPerson;

const styles = StyleSheet.create({
  container: {
    height: 80,
    padding: 5,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  desc: {
    fontSize: 15,
    marginTop: 2,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    flexShrink: 1,
    flexGrow: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeBadgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  time: {
    fontSize: 12,
  },
  badge: {
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
