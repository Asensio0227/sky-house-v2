// @refresh reset

import 'react-native-get-random-values';

import { useFocusEffect } from '@react-navigation/native';
import { AudioRecorder as ExpoAudioRecorder } from 'expo-audio';
import { VideoView } from 'expo-video';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { GiftedChat, Message } from 'react-native-gifted-chat';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import AudioPlayer from '../../components/AudioPlayer';
import AudioRecorder from '../../components/chat/AudioRecorder';
import CustomActions from '../../components/chat/CustomActions';
import MediaPreviewModal from '../../components/chat/MediaPreviewModal';
import {
  createRenderBubble,
  createRenderSend,
  renderInputToolbar,
} from '../../components/GiftedChat';
import {
  createMsg,
  deleteMsg,
  retrieveMsg,
  setLastMessage,
  updateConversation,
  updateMsg,
} from '../../features/chats/chatsSlice';
import { IPhoto } from '../../features/estate/types';
import { sendNotifications } from '../../features/notify/notifySlice';
import { AudioManager } from '../../utils/AudioManager';
import { formatTimestamp, pickMedia } from '../../utils/globals';

const ChatScreen = ({ route }: { route: any }) => {
  const theme = useTheme();
  const { room, user: userB } = route.params;
  const roomId = room && room._id;
  const dispatch: any = useDispatch();
  const [messages, setMessages] = useState<any[]>([]);
  const [localPage, setLocalPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
  const { currentUser: user } = useSelector((store: RootState) => store.USER);
  const senderUser = user && {
    name: user?.username || user?.fName,
    _id: user?.userId || user?._id,
    avatar: user?.avatar,
  };
  const [previewVisible, setPreviewVisible] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<any>(null);
  const [pendingText, setPendingText] = useState('');
  const [recording, setRecording] = useState<ExpoAudioRecorder | null>(null);
  const recordingRef = useRef<ExpoAudioRecorder | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const flatListRef = useRef<any>(null);
  const contentHeightRef = useRef(0);
  const listHeightRef = useRef(0);
  const scrollOffsetRef = useRef<number | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const [sendingMedia, setSendingMedia] = useState(false);
  const [audioPreviewVisible, setAudioPreviewVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [audioLoader, setAudioLoader] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    rightMessage: {
      alignSelf: 'flex-end',
      backgroundColor: theme.colors.primaryContainer,
      padding: 8,
      borderRadius: 10,
      margin: 4,
      maxWidth: '80%',
      color: theme.colors.onPrimaryContainer,
    },
    leftMessage: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.secondaryContainer,
      padding: 8,
      borderRadius: 10,
      margin: 4,
      maxWidth: '80%',
      color: theme.colors.onSecondaryContainer,
    },
    image: {
      width: 200,
      height: 200,
      borderRadius: 10,
    },
    caption: {
      marginTop: 4,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    textTimestamp: {
      fontSize: 12,
      marginTop: 4,
      alignSelf: 'flex-end',
      color: theme.colors.onSurfaceVariant,
    },
    loadingContainer: {
      padding: 10,
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 12,
      marginTop: 4,
      color: theme.colors.onSurfaceVariant,
    },
  });

  const scrollToBottom = () => {
    if (
      flatListRef.current &&
      contentHeightRef.current &&
      listHeightRef.current
    ) {
      flatListRef.current.scrollToOffset({
        offset: contentHeightRef.current - listHeightRef.current,
        animated: true,
      });
    }
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;

    const distanceFromBottom = contentHeight - layoutHeight - offsetY;

    setShowScrollToBottom(distanceFromBottom > 100);

    scrollOffsetRef.current = offsetY;
  };

  const fetchData = async () => {
    setLocalPage(1);
    try {
      const resp = await dispatch(
        retrieveMsg({ roomId, page: localPage })
      ).unwrap();
      const newMessages = resp?.messages || [];

      setMessages((prevMessages) => {
        const existingIds = new Set(prevMessages.map((msg) => msg._id));
        const uniqueNewMessages = newMessages.filter(
          (msg: any) => !existingIds.has(msg._id)
        );
        return [...uniqueNewMessages, ...prevMessages];
      });
      const newLastMessage = Array.isArray(newMessages)
        ? newMessages.slice(0)[0]
        : null;
      if (newLastMessage && newLastMessage._id !== lastMessageIdRef.current) {
        lastMessageIdRef.current = newLastMessage._id;

        const data = { id: roomId, lastMessage: newLastMessage };
        dispatch(updateConversation(data));
        const updateResp = await dispatch(updateMsg(roomId)).unwrap();
        const updatedMessages = updateResp?.messages || [];
        setMessages((prevMessages) => {
          const prevIds = new Set(prevMessages.map((msg) => msg._id));
          const uniqueUpdates = updatedMessages.filter(
            (msg: any) => !prevIds.has(msg._id)
          );
          return [...uniqueUpdates, ...prevMessages];
        });
        dispatch(setLastMessage(newLastMessage));
      }
      setLocalPage(resp.page);
    } catch (error: any) {
      console.log(`Error fetching msg : ${error}`);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
      const intervalId = setInterval(fetchData, 5000);
      return () => {
        clearInterval(intervalId);
      };
    }, [roomId, active])
  );

  useFocusEffect(
    useCallback(() => {
      setActive(true);
      return () => setActive(false);
    }, [])
  );

  const onSend = useCallback(
    async (newMessages: any = []) => {
      const writes = newMessages.map((msg: any) => {
        const messageData = { ...msg, roomId };
        dispatch(createMsg(messageData));
        const arr: any = {
          userId: userB._id,
          message: msg,
        };
        dispatch(sendNotifications(arr));
      });
      const lastMessage =
        newMessages.length > 0 ? newMessages[newMessages.length - 1] : null;
      if (lastMessage) {
        const data: any = { id: roomId, lastMessage };
        writes.push(dispatch(updateConversation(data)));
      }
      writes.push(dispatch(retrieveMsg({ roomId, page: 1 })));
      await Promise.all(writes);
    },
    [roomId, dispatch]
  );

  const formattedMessages = messages
    .filter((m) => m && typeof m === 'object')
    .slice()
    .map((msg) => {
      const { photo, audio, video, _id, text, createdAt, user } = msg;

      const media = {
        ...(photo?.[0] && { image: photo[0] }),
        ...(audio?.[0] && { audio: audio[0] }),
        ...(video?.[0] && { video: video[0] }),
      };

      return {
        _id,
        text: text || '',
        createdAt: new Date(createdAt),
        user: user,
        ...media,
      };
    });

  const renderMessage = (props: any) => {
    const { currentMessage } = props;
    const isSender = currentMessage.user._id === senderUser._id;
    const alignStyle = isSender ? styles.rightMessage : styles.leftMessage;

    const renderText = () => {
      if (currentMessage.text) {
        return <Text style={alignStyle}>{currentMessage.text}</Text>;
      }
      return (
        <Text style={[alignStyle, styles.textTimestamp]}>
          {formatTimestamp(currentMessage.createdAt)}
        </Text>
      );
    };

    if (currentMessage.audio) {
      return (
        <View style={[alignStyle, { padding: 10, maxWidth: 250 }]}>
          <AudioPlayer uri={currentMessage?.audio?.url} />
          {renderText()}
        </View>
      );
    }

    if (Array.isArray(currentMessage.video)) {
      const videoArray = Array.isArray(currentMessage.video)
        ? currentMessage.video
        : currentMessage.video
        ? [currentMessage.video]
        : [];
      return (
        <View style={[alignStyle, { padding: 10, maxWidth: 300 }]}>
          {videoArray.map((uri: IPhoto | any, index: any) => (
            <VideoView
              key={uri._id || index}
              source={{ uri: uri.url }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              useNativeControls
              style={{ width: 250, height: 150, borderRadius: 10 }}
            />
          ))}
          {renderText()}
        </View>
      );
    }

    if (currentMessage.image || currentMessage.photo) {
      const photoList = Array.isArray(
        currentMessage.image || currentMessage.photo
      )
        ? currentMessage.image || currentMessage.photo
        : [currentMessage.image || currentMessage.photo];

      return (
        <View style={[alignStyle, { padding: 10 }]}>
          {photoList.map((img: any, idx: any) => (
            <Image
              key={img._id || idx}
              source={{ uri: img.url || img.uri }}
              style={{
                width: 200,
                height: 200,
                borderRadius: 12,
                marginBottom: 8,
              }}
              resizeMode='cover'
            />
          ))}
          {renderText()}
        </View>
      );
    }

    const { key, ...rest } = props;
    return <Message key={key} {...rest} />;
  };

  const renderBubble = useCallback(createRenderBubble(theme), [theme]);

  const renderSend = useCallback(createRenderSend(theme), [theme]);

  const handleLongPress = (context: any, message: any) => {
    if (Platform.OS !== 'ios') return;
    const options = ['Edit', 'Delete', 'Forward', 'Cancel'];
    const cancelButtonIndex = 4;

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex: 2,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            Alert.prompt(
              'Edit Message',
              'Update your message:',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Save',
                  onPress: (text) => {
                    if (text && text !== message.text) {
                      dispatch(updateMsg({ ...message, text }));
                    }
                  },
                },
              ],
              'plain-text',
              message.text
            );
            break;

          case 1:
            dispatch(deleteMsg(message._id));
            break;

          case 2:
            Alert.alert('Forward', 'Coming soon!');
            break;

          default:
            break;
        }
      }
    );
  };

  const handleMediaPick = async () => {
    const file = await pickMedia();
    if (file) {
      setPendingMedia(file);
      setPendingText('');
      setPreviewVisible(true);
    }
  };

  const startRecording = async () => {
    try {
      Vibration.vibrate(50);

      if (recordingRef.current) {
        await recordingRef.current.stop();
        recordingRef.current = null;
      }

      const recording = new ExpoAudioRecorder({});
      recordingRef.current = recording;

      await recording.prepareToRecordAsync({
        isMeteringEnabled: true,
      });

      recording.record();
      setRecording(recording);
      setRecordingUri(null);
      setRecordingDuration(0);

      recordingIntervalRef.current = setInterval(async () => {
        const status = recording.getStatus();
        if (status.isRecording) {
          setRecordingDuration(recording.currentTime * 1000);
        }
      }, 500);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return;
      Vibration.vibrate(100);
      clearInterval(recordingIntervalRef.current!);
      await recordingRef.current.stop();
      const uri = recordingRef.current.uri;

      setRecording(null);
      setAudioPreviewVisible(true);
      setRecordingUri(uri || null);
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  };

  const sendRecording = async () => {
    setAudioLoader(true);
    try {
      if (!recordingUri) return;

      const audioFile = {
        uri: recordingUri,
        name: `audio-${Date.now()}.m4a`,
        type: 'audio/m4a',
      };

      const messagePayload = {
        roomId,
        sender: senderUser._id,
        text: '',
        audio: [audioFile],
      };

      await dispatch(createMsg(messagePayload));

      setRecordingUri(null);
      setRecordingDuration(0);
    } catch (error: any) {
      console.log(`Error sending audio : ${error}`);
    } finally {
      setAudioLoader(false);
    }
  };

  const cancelRecording = () => {
    setRecording(null);
    setRecordingUri(null);
    setRecordingDuration(0);
    clearInterval(recordingIntervalRef.current!);
  };

  const renderFooter = () => {
    if (!sendingMedia) return null;

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='small' color={theme.colors.primary} />
        <Text style={styles.loadingText}>Sending media...</Text>
      </View>
    );
  };

  const renderCustomActions = (props: any) => (
    <CustomActions
      {...props}
      recording={recording}
      onMediaPick={handleMediaPick}
      onStartRecording={startRecording}
      onStopRecording={stopRecording}
    />
  );

  const loadEarlierMessages = async () => {
    if (!hasMore) return;

    setIsLoadingEarlier(true);

    try {
      const resp = await dispatch(
        retrieveMsg({ roomId, page: localPage + 1 })
      ).unwrap();

      const fetchedMessages = resp?.messages || [];
      const newPage = resp?.page || localPage + 1;
      const noMoreMessages = fetchedMessages.length === 0;

      setMessages((prevMessages) => {
        const existingIds = new Set(prevMessages.map((msg) => msg._id));
        const uniqueNewMessages = fetchedMessages.filter(
          (msg: any) => !existingIds.has(msg._id)
        );
        return [...uniqueNewMessages, ...prevMessages];
      });

      setLocalPage(newPage);
      setHasMore(!noMoreMessages);
    } catch (err) {
      console.log('Failed to load earlier messages:', err);
    }

    setIsLoadingEarlier(false);

    setTimeout(() => {
      if (flatListRef.current?.current?._messageContainerRef?.scrollToEnd) {
        flatListRef.current?.current._messageContainerRef.scrollToEnd({
          animated: true,
        });
      }
    }, 300);
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const hideMediaPreview = () => setPreviewVisible(false);

  useEffect(() => {
    setMessages([]);
    setLocalPage(1);
  }, [roomId]);

  useEffect(() => {
    return () => {
      AudioManager.stopCurrent();
    };
  }, []);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={['bottom']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 90}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 }}>
          <GiftedChat
            renderLoading={() => (
              <ActivityIndicator size='large' color={theme.colors.primary} />
            )}
            messages={formattedMessages}
            textInputProps={{ multiline: true }}
            onSend={(msgs) => onSend(msgs)}
            user={senderUser}
            loadEarlier={hasMore}
            alwaysShowSend
            renderBubble={renderBubble}
            renderInputToolbar={(props) =>
              recording ? null : renderInputToolbar(props)
            }
            onLoadEarlier={loadEarlierMessages}
            listViewProps={{
              ref: flatListRef,
              onContentSizeChange: (w: any, h: any) => {
                if (scrollOffsetRef.current !== null && flatListRef.current) {
                  flatListRef.current.scrollToOffset({
                    offset: h - scrollOffsetRef.current,
                    animated: false,
                  });
                }
              },
              onLayout: (event: any) => {
                listHeightRef.current = event.nativeEvent.layout.height;
              },
              onScroll: handleScroll,
              scrollEventThrottle: 16,
              keyboardShouldPersistTaps: 'handled',
            }}
            isLoadingEarlier={isLoadingEarlier}
            renderActions={renderCustomActions}
            renderMessage={renderMessage}
            onLongPress={(context, message) =>
              handleLongPress(context, message)
            }
            renderAvatar={null}
            disableComposer={!!recording}
            renderSend={renderSend}
            renderFooter={renderFooter}
          />
        </View>
      </KeyboardAvoidingView>
      {(recording || recordingUri) && (
        <AudioRecorder
          duration={recordingDuration}
          stopRecording={stopRecording}
          cancelRecording={cancelRecording}
          sendRecording={sendRecording}
          recording={!!recording}
          loading={audioLoader}
          senderUser={senderUser}
          roomId={roomId}
          recordingUri={recordingUri}
        />
      )}
      <MediaPreviewModal
        pendingText={pendingText}
        setPendingText={setPendingText}
        visible={previewVisible}
        media={pendingMedia}
        onClose={hideMediaPreview}
        roomId={roomId}
        senderUser={senderUser}
      />
    </SafeAreaView>
  );
};

export default ChatScreen;
