import { useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Text, useTheme } from 'react-native-paper';

dayjs.extend(relativeTime);

const ChatHeader = () => {
  const theme = useTheme();
  const route: any = useRoute();
  const { user: userB, room } = route.params;
  const { avatar, username, status, lastSeen } = userB;

  const renderStatus = () => {
    if (status === 'online') return 'Online';
    if (lastSeen) return `Last seen ${dayjs(lastSeen).fromNow()}`;
    return 'Offline';
  };

  return (
    <View style={styles.container}>
      <View>
        <Avatar.Image size={30} source={{ uri: avatar }} />
      </View>
      <View style={styles.section}>
        <Text style={[styles.text, { color: theme.colors.onSurface }]}>
          {username}
        </Text>
        <Text style={[styles.status, { color: theme.colors.onSurfaceVariant }]}>
          {renderStatus()}
        </Text>
      </View>
    </View>
  );
};

export default ChatHeader;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    right: 35,
    marginLeft: 8,
  },
  section: {
    alignItems: 'center',
    marginRight: 25,
    justifyContent: 'center',
    paddingLeft: 15,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 9,
  },
});
