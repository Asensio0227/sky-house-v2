import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, TextInput, View } from 'react-native';
import {
  ActivityIndicator,
  Button as AppButton,
  useTheme,
} from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { createMsg } from '../../features/chats/chatsSlice';
import { UserDocument } from '../form/FormInput';

type MediaPreviewModalProps = {
  visible: boolean;
  onClose: () => void;
  media: {
    uri: string;
    type: 'image' | 'video' | 'audio';
  } | null;
  senderUser: UserDocument | null | any;
  roomId: string;
  pendingText: string;
  setPendingText: React.Dispatch<React.SetStateAction<string>>;
};

const MediaPreviewModal = ({
  visible,
  onClose,
  media,
  senderUser,
  roomId,
  pendingText,
  setPendingText,
}: MediaPreviewModalProps) => {
  const theme = useTheme();
  if (!media) return null;
  const dispatch: any = useDispatch();
  const [loading, setLoading] = useState(true);

  const onSend = async () => {
    setLoading(true);
    try {
      const fileType = media.type?.split('/')[0];
      const mediaKey =
        fileType === 'image'
          ? 'photo'
          : fileType === 'audio'
          ? 'audio'
          : fileType === 'video'
          ? 'video'
          : null;

      if (!mediaKey) {
        console.warn('Unsupported media type');
        return;
      }

      const messagePayload = {
        roomId,
        sender: senderUser?._id,
        text: pendingText,
        [mediaKey]: [media],
      };

      await dispatch(createMsg(messagePayload));
      onClose();
    } catch (error) {
      console.error('Media send error:', error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <Modal visible={visible} transparent animationType='slide'>
      <View style={styles.overlay}>
        {loading ? (
          <ActivityIndicator size={'large'} />
        ) : (
          <View
            style={[
              styles.container,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            {typeof media?.uri === 'string' && media.uri.trim() !== '' && (
              <Image
                source={{ uri: media.uri }}
                style={styles.media}
                placeholder={{
                  blurhash: media.blurhash || 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
                }}
                contentFit='cover'
                transition={200}
                cachePolicy='memory-disk'
                priority='high'
              />
            )}
            <TextInput
              value={pendingText}
              onChangeText={setPendingText}
              placeholder='Add a message...'
              placeholderTextColor={theme.colors.onSurfaceVariant}
              style={[
                styles.input,
                {
                  borderColor: theme.colors.outline,
                  color: theme.colors.onSurface,
                  backgroundColor: theme.colors.surfaceVariant,
                },
              ]}
            />
            <View style={styles.buttonRow}>
              <AppButton
                style={{ marginRight: 3 }}
                mode='contained'
                onPress={onClose}
              >
                Cancel
              </AppButton>
              <AppButton mode='contained' onPress={onSend}>
                Send
              </AppButton>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default MediaPreviewModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  container: {
    width: '90%',
    height: '70%',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: '100%',
    height: '70%',
    borderRadius: 12,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    width: '90%',
    marginVertical: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  audioContainer: {
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioText: {
    fontSize: 16,
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 24,
  },
  iconButton: {
    padding: 8,
  },
});
