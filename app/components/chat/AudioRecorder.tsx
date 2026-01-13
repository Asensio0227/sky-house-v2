import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, IconButton, useTheme } from 'react-native-paper';
import { format, formatDuration } from '../../utils/globals';
import { UserDocument } from '../form/FormInput';

type AudioRecorderProps = {
  senderUser: UserDocument | any;
  roomId: string;
  stopRecording: () => void;
  cancelRecording: () => void;
  recording: boolean;
  sendRecording: () => void;
  duration: number;
  loading: boolean;
  recordingUri: any;
};

const AudioRecorder = ({
  duration,
  stopRecording,
  cancelRecording,
  recording,
  sendRecording,
  loading,
  recordingUri,
}: AudioRecorderProps) => {
  const theme = useTheme();
  const player = useAudioPlayer(recordingUri || '');
  const status = useAudioPlayerStatus(player);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  const startPlayback = async () => {
    if (!recordingUri) return;
    try {
      await player.play();
      setIsPlaying(true);
      setPlaybackDuration(0);
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  const stopPlayback = async () => {
    await player.pause();
    await player.seekTo(0);
    setIsPlaying(false);
    setPlaybackDuration(0);
  };

  useEffect(() => {
    if (status?.playing !== isPlaying) {
      setIsPlaying(status?.playing ?? false);
    }
    if (status?.currentTime) {
      setPlaybackDuration(Math.floor(status.currentTime));
    }
    if (status?.playing === false && playbackDuration > 0) {
      // Playback finished
      setIsPlaying(false);
      setPlaybackDuration(0);
    }
  }, [status, isPlaying, playbackDuration]);

  return (
    <>
      {loading ? (
        <ActivityIndicator size={'small'} />
      ) : (
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.outline,
            },
          ]}
        >
          <Text
            style={[styles.text, { flex: 1, color: theme.colors.onSurface }]}
          >
            {recording
              ? `Recording... ${formatDuration(duration)}`
              : isPlaying
              ? `Playing... ${format(playbackDuration)}`
              : `Recorded: ${formatDuration(duration)}`}
          </Text>

          {recording ? (
            <IconButton icon='stop' onPress={stopRecording} />
          ) : isPlaying ? (
            <IconButton icon='pause' onPress={stopPlayback} />
          ) : (
            <>
              <IconButton icon='play' onPress={startPlayback} />
              <IconButton icon='send' onPress={sendRecording} />
              <IconButton icon='cancel' onPress={cancelRecording} />
            </>
          )}
        </View>
      )}
    </>
  );
};

export default AudioRecorder;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
  },
  text: {
    fontSize: 16,
  },
  recordingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timer: {
    fontSize: 18,
    color: '#333',
  },
  button: {
    padding: 10,
  },
});
