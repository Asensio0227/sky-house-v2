import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { formatDuration } from '../utils/globals';

type Props = {
  uri: string;
};

const AudioPlayer = ({ uri }: Props) => {
  const theme = useTheme();
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  const [isSeeking, setIsSeeking] = useState(false);
  const [timerPosition, setTimerPosition] = useState(0);

  const isPlaying = status?.playing ?? false;
  const duration = status?.duration ?? 0;
  const position = status?.currentTime ?? 0;
  const isLoading = !status?.isLoaded;

  const playPause = async () => {
    if (isPlaying) {
      await player.pause();
    } else {
      await player.play();
    }
  };

  const stopPlayback = async () => {
    await player.pause();
    await player.seekTo(0);
  };

  const seek = async (val: number) => {
    try {
      await player.seekTo(val / 1000);
    } catch (error) {
      console.error('Error seeking:', error);
    } finally {
      setIsSeeking(false);
    }
  };

  const skip = async (ms: number) => {
    const newPos = Math.min(Math.max(position + ms / 1000, 0), duration);
    try {
      await player.seekTo(newPos);
    } catch (error) {
      console.error('Error skipping:', error);
    }
  };

  const handleSliderTouchStart = async () => {
    setIsSeeking(true);
    if (isPlaying) {
      await player.pause();
    }
  };

  const handleSliderTouchEnd = async (newPosition: number) => {
    setIsSeeking(false);
    try {
      await player.seekTo(newPosition / 1000);
      if (isPlaying) {
        await player.play();
      }
    } catch (error) {
      console.error('Error setting position after slider:', error);
    }
  };

  useEffect(() => {
    setTimerPosition(position * 1000);
  }, [position]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.primaryContainer,
        },
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : (
        <>
          <View style={styles.controlsRow}>
            <TouchableOpacity onPress={() => skip(-10000)}>
              <Ionicons
                name='play-back'
                size={24}
                color={theme.colors.onPrimaryContainer}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={playPause} style={styles.playButton}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={32}
                color={theme.colors.onPrimaryContainer}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => skip(10000)}>
              <Ionicons
                name='play-forward'
                size={24}
                color={theme.colors.onPrimaryContainer}
              />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.progressBarContainer,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <View
              style={[
                styles.progressBar,
                {
                  width:
                    duration > 0 ? `${(position / duration) * 100}%` : '0%',
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>

          <Text
            style={[
              styles.timeText,
              { color: theme.colors.onPrimaryContainer },
            ]}
          >
            {formatDuration(timerPosition)} / {formatDuration(duration * 1000)}
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    marginHorizontal: 12,
  },
  progressBarContainer: {
    width: '100%',
    height: 3,
    borderRadius: 1.5,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
  },
  timeText: {
    alignSelf: 'center',
    marginTop: 4,
  },
});

export default AudioPlayer;
