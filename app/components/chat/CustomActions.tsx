import React from 'react';
import { View } from 'react-native';
import { Actions } from 'react-native-gifted-chat';
import { IconButton, useTheme } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CustomActions = ({
  recording,
  onMediaPick,
  onStartRecording,
  onStopRecording,
  ...props
}: any) => {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Actions
        {...props}
        options={{ ['Send Media']: onMediaPick }}
        icon={() => (
          <Ionicons
            name='attach'
            size={24}
            color={theme.colors.onSurfaceVariant}
          />
        )}
      />
      <IconButton
        icon={recording ? 'stop' : 'microphone'}
        onPress={recording ? onStopRecording : onStartRecording}
        size={24}
        iconColor={theme.colors.onSurfaceVariant}
      />
    </View>
  );
};

export default CustomActions;
