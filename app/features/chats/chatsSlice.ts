import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { ToastAndroid } from 'react-native';
import { UserDocument } from '../../components/form/FormInput';
import customFetch from '../../utils/axios';
import {
  customMsg,
  filterConversationsWithMessages,
  getErrorMessage,
  isValidConversation,
  mergeConversations,
  parseRoomsWithUserB,
  removeConversationFromArray,
  sortConversationsByLastMessage,
  updateConversationInArray,
} from '../../utils/globals';
import { Messages, Room } from './types';

interface roomState {
  conversations: Room[];
  filteredConversations: Room[];
  selectedRoom: Room | null;
  conversationsWithNewMessages: Messages[] | Room[] | any;
  contact: UserDocument[];
  isLoading: boolean;
  page: number;
  hasMore: boolean;
  lastMessage: any | null;
}

const initialState: roomState = {
  conversations: [],
  hasMore: true,
  filteredConversations: [],
  conversationsWithNewMessages: [],
  selectedRoom: null,
  contact: [],
  isLoading: false,
  lastMessage: null,
  page: 1,
};

// =========ROOM=======
export const createConversation = createAsyncThunk(
  'room/create',
  async (data: any, thunkApi) => {
    try {
      const response = await customFetch.post('room', data);
      return response.data;
    } catch (error: any) {
      console.log('❌ Caught error in thunk:', error);
      const errorMessage = getErrorMessage(error);
      console.log('📢 Returning error message:', errorMessage);
      return thunkApi.rejectWithValue(errorMessage);
    }
  }
);

export const retrieveUserConversation = createAsyncThunk(
  'room/user',
  async (_, thunkApi: any) => {
    try {
      const { page } = thunkApi.getState().Chats;
      const { user } = thunkApi.getState().AUTH;
      const params = new URLSearchParams({
        page: String(page),
      });
      const url = `room?${params.toString()}`;
      const { data } = await customFetch.get(url);
      return { data, user };
    } catch (error: any) {
      console.log('❌ Caught error in thunk:', error);
      const errorMessage = getErrorMessage(error);
      console.log('📢 Returning error message:', errorMessage);
      return thunkApi.rejectWithValue(errorMessage);
    }
  }
);

export const updateConversation = createAsyncThunk(
  'room/update',
  async (data: any, thunkApi: any) => {
    try {
      const { user } = thunkApi.getState().AUTH;
      const { id, lastMessage } = data;
      const { data: resp } = await customFetch.put(`room/${id}`, {
        lastMessage,
      });
      return { user, resp };
    } catch (error: any) {
      console.log('❌ Caught error in thunk:', error);
      const errorMessage = getErrorMessage(error);
      console.log('📢 Returning error message:', errorMessage);
      return thunkApi.rejectWithValue(errorMessage);
    }
  }
);

export const removeRoom = createAsyncThunk(
  'room/remove',
  async (id: string, thunkApi: any) => {
    try {
      const response = await customFetch.delete(`room/${id}`);
      return { ...response.data, id };
    } catch (error: any) {
      console.log('❌ Caught error in thunk:', error);
      const errorMessage = getErrorMessage(error);
      console.log('📢 Returning error message:', errorMessage);
      return thunkApi.rejectWithValue(errorMessage);
    }
  }
);

export const retrieveRoom = createAsyncThunk(
  'room/retrieve',
  async (id, thunkApi: any) => {
    try {
      const response = await customFetch.get(`room/${id}`);
      return response.data;
    } catch (error: any) {
      console.log('❌ Caught error in thunk:', error);
      const errorMessage = getErrorMessage(error);
      console.log('📢 Returning error message:', errorMessage);
      return thunkApi.rejectWithValue(errorMessage);
    }
  }
);

// ========MESSAGE======
export const createMsg = createAsyncThunk(
  'message/create',
  async (data: any, thunkApi: any) => {
    try {
      const formData = customMsg(data);
      const response = await customFetch.post('message', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.log('❌ Caught error in thunk:', error);
      const errorMessage = getErrorMessage(error);
      console.log('📢 Returning error message:', errorMessage);
      return thunkApi.rejectWithValue(errorMessage);
    }
  }
);

interface RetrieveMsgArgs {
  roomId: string;
  page: number;
}

export const retrieveMsg = createAsyncThunk(
  'message/retrieve',
  async ({ roomId, page }: RetrieveMsgArgs, thunkApi) => {
    try {
      if (__DEV__) {
        console.log(
          `🔁 Retrieving messages for roomId: ${roomId}, page: ${page}`
        );
      }
      const params = new URLSearchParams({ page: String(page) });
      const url = `message/${roomId}?${params.toString()}`;
      const response = await customFetch.get(url);
      return response.data;
    } catch (err: unknown | any) {
      console.log('❌ Caught error in thunk:', error);
      const errorMessage = getErrorMessage(error);
      console.log('📢 Returning error message:', errorMessage);
      return thunkApi.rejectWithValue(errorMessage);
    }
  }
);

export const updateMsg = createAsyncThunk(
  'message/update',
  async (roomId: string, thunkApi: any) => {
    try {
      const response = await customFetch.put(`message/${roomId}`);
      return response.data;
    } catch (error: any) {
      console.log('❌ Caught error in thunk:', error);
      const errorMessage = getErrorMessage(error);
      console.log('📢 Returning error message:', errorMessage);
      return thunkApi.rejectWithValue(errorMessage);
    }
  }
);

export const deleteMsg = createAsyncThunk(
  'message/delete',
  async (id: any, thunkApi: any) => {
    try {
      const response = await customFetch.delete(`message/${id}`);
      return response.data;
    } catch (error: any) {
      console.log('❌ Caught error in thunk:', error);
      const errorMessage = getErrorMessage(error);
      console.log('📢 Returning error message:', errorMessage);
      return thunkApi.rejectWithValue(errorMessage);
    }
  }
);

const chatsSlice = createSlice({
  name: 'Chats',
  initialState,
  reducers: {
    resetConversations: (state) => {
      state.conversations = [];
      state.filteredConversations = [];
      state.page = 1;
      state.hasMore = true;
    },
    setLastMessage(state, action: PayloadAction<any>) {
      state.lastMessage = action.payload;
    },
    handleChangeChat: (
      state,
      action: PayloadAction<{ name: string; value: string }>
    ) => {
      const { name, value } = action.payload;
      (state as any)[name] = value;
    },
  },
  extraReducers(builder) {
    // ========= CREATE CONVERSATION =========
    builder
      .addCase(createConversation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createConversation.fulfilled, (state, action: any) => {
        state.isLoading = false;
        const room = action.payload.newRoom || action.payload.existingRoom;

        if (!isValidConversation(room)) {
          console.warn('createConversation: Invalid room data');
          return;
        }

        // ✅ Use helper to update conversation
        state.conversations = updateConversationInArray(
          state.conversations,
          room
        );
        state.filteredConversations = updateConversationInArray(
          state.filteredConversations,
          room
        );

        // ✅ Sort by most recent
        state.conversations = sortConversationsByLastMessage(
          state.conversations
        );
        state.filteredConversations = sortConversationsByLastMessage(
          state.filteredConversations
        );
      })
      .addCase(createConversation.rejected, (state, action: any) => {
        state.isLoading = false;
        ToastAndroid.showWithGravity(
          `Error while creating conversation: ${action.payload}`,
          1000,
          0
        );
      });

    // ========= RETRIEVE USER CONVERSATIONS =========
    builder
      .addCase(retrieveUserConversation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(retrieveUserConversation.fulfilled, (state, action: any) => {
        state.isLoading = false;

        const {
          user,
          data: { rooms, page },
        } = action.payload;

        if (!user?.email) {
          console.warn('retrieveUserConversation: No user email');
          state.hasMore = false;
          return;
        }

        if (!Array.isArray(rooms) || rooms.length === 0) {
          state.hasMore = false;
          return;
        }

        // ✅ Parse rooms with userB using helper
        const parsedRooms = parseRoomsWithUserB(rooms, user.email);

        // ✅ Filter rooms with lastMessage using helper
        const roomsWithMessages = filterConversationsWithMessages(parsedRooms);

        // ✅ Merge with existing conversations (prevents duplicates)
        state.conversations = mergeConversations(
          state.conversations,
          roomsWithMessages
        );

        state.filteredConversations = mergeConversations(
          state.filteredConversations,
          roomsWithMessages
        );

        // ✅ Sort by most recent
        state.conversations = sortConversationsByLastMessage(
          state.conversations
        );
        state.filteredConversations = sortConversationsByLastMessage(
          state.filteredConversations
        );

        // ✅ Update pagination
        state.page += 1;
        state.hasMore = rooms.length > 0;

        if (__DEV__) {
          console.log(`📨 Total conversations: ${state.conversations.length}`);
        }
      })
      .addCase(retrieveUserConversation.rejected, (state, action: any) => {
        state.isLoading = false;
        state.hasMore = false;
        console.error('retrieveUserConversation error:', action.payload);
      });

    // ========= UPDATE CONVERSATION =========
    builder
      .addCase(updateConversation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateConversation.fulfilled, (state, action: any) => {
        state.isLoading = false;

        const updatedRoom = action.payload?.resp?.rooms;

        if (!isValidConversation(updatedRoom)) {
          console.warn('updateConversation: Invalid updated room');
          return;
        }

        // ✅ Use helper to update conversation
        state.conversations = updateConversationInArray(
          state.conversations,
          updatedRoom
        );
        state.filteredConversations = updateConversationInArray(
          state.filteredConversations,
          updatedRoom
        );

        // ✅ Sort by most recent
        state.conversations = sortConversationsByLastMessage(
          state.conversations
        );
        state.filteredConversations = sortConversationsByLastMessage(
          state.filteredConversations
        );
      })
      .addCase(updateConversation.rejected, (state, action: any) => {
        state.isLoading = false;
        console.error('updateConversation error:', action.payload);
      });

    // ========= REMOVE ROOM =========
    builder
      .addCase(removeRoom.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeRoom.fulfilled, (state, action) => {
        state.isLoading = false;

        const removedId = action.payload?.id || action.meta.arg;

        if (!removedId) {
          console.warn('removeRoom: No room ID');
          return;
        }

        // ✅ Use helper to remove conversation
        state.conversations = removeConversationFromArray(
          state.conversations,
          removedId
        );
        state.filteredConversations = removeConversationFromArray(
          state.filteredConversations,
          removedId
        );
        state.conversationsWithNewMessages = removeConversationFromArray(
          state.conversationsWithNewMessages,
          removedId
        );

        if (__DEV__) {
          console.log(`🗑️ Removed conversation: ${removedId}`);
        }
      })
      .addCase(removeRoom.rejected, (state, action: any) => {
        state.isLoading = false;
        console.error('removeRoom error:', action.payload);
      });

    // ========= RETRIEVE SINGLE ROOM =========
    builder
      .addCase(retrieveRoom.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(retrieveRoom.fulfilled, (state, action: any) => {
        state.isLoading = false;

        const room = action.payload?.room;

        if (!isValidConversation(room)) {
          console.warn('retrieveRoom: Invalid room data');
          return;
        }

        state.selectedRoom = room;

        // ✅ Update in conversations if exists
        state.conversations = updateConversationInArray(
          state.conversations,
          room
        );
        state.filteredConversations = updateConversationInArray(
          state.filteredConversations,
          room
        );
      })
      .addCase(retrieveRoom.rejected, (state, action: any) => {
        state.isLoading = false;
        console.error('retrieveRoom error:', action.payload);
      });
  },
});

export const { resetConversations, setLastMessage, handleChangeChat } =
  chatsSlice.actions;
export default chatsSlice.reducer;
