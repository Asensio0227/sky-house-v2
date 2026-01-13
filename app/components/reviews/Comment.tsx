import React from 'react';
import { Text, View } from 'react-native';
import { Avatar, useTheme } from 'react-native-paper';

const Comment: React.FC<{ item: any; reviews: any }> = ({ item, reviews }) => {
  const theme = useTheme();

  if (!item || !item.user) {
    return null; // Don't render if item or user is missing
  }

  return (
    <View
      style={{
        height: 'auto',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 10,
        marginBottom: 10,
        borderRadius: 10,
      }}
    >
      <View>
        {item.user.avatar ? (
          <Avatar.Image size={40} source={{ uri: item.user.avatar }} />
        ) : (
          <Avatar.Text
            size={40}
            label={
              item?.user?.username?.charAt(0).toUpperCase() ||
              item?.user?.first_name?.charAt(0).toUpperCase() ||
              'U'
            }
          />
        )}
      </View>
      <View
        style={{
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: 20,
          padding: 12,
          marginVertical: 5,
          marginLeft: 10,
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <Text
          style={{
            color: theme.colors.onSurface,
            fontSize: 12,
            fontWeight: 'bold',
            marginBottom: 4,
          }}
        >
          {item.user.username || item.user.first_name || 'Anonymous'}
        </Text>
        <Text
          style={{
            color: theme.colors.onSurfaceVariant,
            fontSize: 13,
          }}
        >
          {item.comment}
        </Text>
        {item.rating && (
          <View
            style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}
          >
            <Text
              style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}
            >
              Rating: {item.rating}/5 ⭐
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default Comment;
