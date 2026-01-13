import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Avatar, Bubble, InputToolbar } from 'react-native-gifted-chat';

export const createRenderBubble = (theme: any) => (props: any) =>
  (
    <Bubble
      {...props}
      textStyle={{
        right: { color: theme.colors.onPrimary },
        left: { color: theme.colors.onSurface },
      }}
      wrapperStyle={{
        right: { backgroundColor: theme.colors.primary },
        left: { backgroundColor: theme.colors.surfaceVariant },
      }}
    />
  );

export const renderAvatar = (props: any) => <Avatar {...props} />;

export const renderInputToolbar = (props: any) => (
  <InputToolbar
    {...props}
    containerStyle={{
      marginLeft: 10,
      marginRight: 10,
      marginBottom: 2,
      borderRadius: 20,
      paddingTop: 5,
    }}
  />
);

export const createRenderSend = (theme: any) => (props: any) => {
  const { text, user, onSend } = props;

  return (
    <TouchableOpacity
      style={{
        height: 50,
        width: 50,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onPress={() => {
        if (text && onSend) {
          onSend({ text: text.trim(), user, _id: user._id }, true);
        }
      }}
    >
      <Ionicons
        name='send'
        size={20}
        color={text ? theme.colors.primary : theme.colors.onSurfaceVariant}
      />
    </TouchableOpacity>
  );
};
