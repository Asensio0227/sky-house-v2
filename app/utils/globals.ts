// import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Option } from '../components/custom/AppPicker';
import { UserDocument } from '../components/form/FormInput';
import { Room } from '../features/chats/types';
import { IPhoto, UIEstateDocument } from '../features/estate/types';

export function formatDate(rawDate: Date) {
  const date = new Date(rawDate);
  let year = date.getFullYear();
  let month: number | string = date.getMonth() + 1;
  let day: number | string = date.getDate();

  month = month < 10 ? `0${month}` : month;
  day = day < 10 ? `0${day}` : day;

  return `${year}-${month}-${day}`;
}

export const formatTimestamp = (dateString: string | Date) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const format = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
};

export const customData = (userData: UserDocument | any, profile?: boolean) => {
  const {
    city,
    postal_code,
    street,
    country,
    province,
    phone_number,
    email,
    userAds_address,
  } = userData;
  const physical_address: any = {
    city,
    postal_code,
    street,
    country,
    province,
  };
  const contact_details: any = { phone_number, email };
  const formData = new FormData();
  Object.entries(contact_details).forEach(([key, value]) => {
    formData.append(`contact_details[${key}]`, value as any);
  });
  Object.entries(physical_address).forEach(([key, value]) => {
    formData.append(`physical_address[${key}]`, value as any);
  });

  const stringifyLocation = JSON.stringify(userAds_address);
  {
    !profile && formData.append(`userAds_address`, stringifyLocation);
  }
  {
    !profile && formData.append('password', userData.password);
  }
  formData.append('first_name', userData.first_name);
  formData.append('last_name', userData.last_name);
  formData.append('username', userData.username);
  formData.append('email', userData.email);
  formData.append('gender', userData.gender);
  formData.append('ideaNumber', userData.ideaNumber);
  formData.append('date_of_birth', userData.date_of_birth);
  {
    !profile && formData.append('expoToken', userData.expoToken);
  }
  formData.append('avatar', {
    uri: userData.avatar,
    name: 'uploaded_image.jpg',
    type: 'image/jpeg',
  } as any);

  return formData;
};

// Updated customD function - Replace in your globals.ts
// This matches your estateModel.ts exactly

export const customD = (ads: UIEstateDocument | any) => {
  const formData = new FormData();

  // Location (GeoJSON format) - REQUIRED
  if (ads.location) {
    const stringifiedLocation = JSON.stringify(ads.location);
    formData.append('location', stringifiedLocation);
  }

  // Contact details - ALL THREE FIELDS REQUIRED by backend
  if (ads.contact_details) {
    const { phone_number, email, address } = ads.contact_details;

    if (phone_number) {
      formData.append('contact_details[phone_number]', phone_number);
    }
    if (email) {
      formData.append('contact_details[email]', email);
    }
    if (address) {
      formData.append('contact_details[address]', address);
    }
  }

  // Basic fields
  if (ads.title) formData.append('title', ads.title);
  if (ads.description) formData.append('description', ads.description);
  if (ads.category) formData.append('category', ads.category);

  // Listing type - REQUIRED
  if (ads.listingType) formData.append('listingType', ads.listingType);

  // Sale-specific fields
  if (ads.price !== undefined && ads.price !== null) {
    formData.append('price', ads.price.toString());
  }

  // Rental-specific fields
  if (ads.rentPrice !== undefined && ads.rentPrice !== null) {
    formData.append('rentPrice', ads.rentPrice.toString());
  }
  if (ads.rentFrequency) {
    formData.append('rentFrequency', ads.rentFrequency);
  }
  if (ads.depositAmount !== undefined && ads.depositAmount !== null) {
    formData.append('depositAmount', ads.depositAmount.toString());
  }
  if (ads.availableFrom) {
    formData.append('availableFrom', ads.availableFrom);
  }
  if (ads.isFurnished !== undefined) {
    formData.append('isFurnished', String(ads.isFurnished));
  }
  if (ads.minimumStay !== undefined && ads.minimumStay !== null) {
    formData.append('minimumStay', ads.minimumStay.toString());
  }

  // Property details
  if (ads.bedrooms !== undefined && ads.bedrooms !== null) {
    formData.append('bedrooms', ads.bedrooms.toString());
  }
  if (ads.bathrooms !== undefined && ads.bathrooms !== null) {
    formData.append('bathrooms', ads.bathrooms.toString());
  }

  // Other fields
  if (ads.taken !== undefined) {
    formData.append('taken', String(ads.taken));
  }

  // Photos - handle both array of URIs and array of objects
  // Backend expects 'media' field name based on your existing code
  if (ads.photo && Array.isArray(ads.photo) && ads.photo.length > 0) {
    ads.photo.forEach((img: IPhoto | string | any, index: number) => {
      // If img is a string URI
      if (typeof img === 'string') {
        formData.append('media', {
          uri: img,
          name: `uploaded_image_${index}.jpg`,
          type: 'image/jpeg',
        } as any);
      }
      // If img is an object with url property (existing photo from edit)
      else if (img.url) {
        // For existing photos, you might want to send just the URL
        // or skip them if they're already on the server
        // This depends on your backend implementation
        formData.append('media', {
          uri: img.url,
          name: `uploaded_image_${index}.jpg`,
          type: 'image/jpeg',
        } as any);
      }
      // If img is an object with uri property (newly selected photo)
      else if (img.uri) {
        formData.append('media', {
          uri: img.uri,
          name: `uploaded_image_${index}.jpg`,
          type: 'image/jpeg',
        } as any);
      }
    });
  }

  return formData;
};
export const customMsg = (data: any) => {
  const formData: any = new FormData();

  if (data.photo?.length) {
    data.photo.forEach((file: any) => {
      formData.append('media', {
        uri: file.uri,
        name: file.fileName || 'photo.jpg',
        type: file.type || 'image/jpeg',
      });
    });
  }

  if (data.audio?.length) {
    data.audio.forEach((file: any) => {
      formData.append('media', {
        uri: file.uri,
        name: file.fileName || 'audio.m4a',
        type: file.type || 'audio/m4a',
      });
    });
  }

  if (data.video?.length) {
    data.video.forEach((file: any) => {
      formData.append('media', {
        uri: file.uri,
        name: file.fileName || 'video.mp4',
        type: file.type || 'video/mp4',
      });
    });
  }

  if (data.text) {
    formData.append('text', data.text);
  }

  if (data.roomId) {
    formData.append('roomId', data.roomId);
  }

  if (Array.isArray(data.files)) {
    data.files.forEach((file: any) => {
      formData.append('files', {
        uri: file.uri,
        name: file.fileName || file.name || 'file',
        type: file.type || 'application/octet-stream',
      });
    });
  }

  return formData;
};

export const formatArray = (data: any) => {
  const op: Option[] = data.map((item: string) => {
    return { label: item.charAt(0).toUpperCase() + item.slice(1), value: item };
  });

  return op;
};

export const pickMedia = async () => {
  const permissionResult =
    await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissionResult.granted) {
    alert('Permission to access media is required!');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: false,
    quality: 1,
  });

  if (!result.canceled && result.assets?.length > 0) {
    const asset = result.assets[0];

    if (!asset.uri) {
      console.error('No valid URI found for the selected asset.');
      return null;
    }

    return {
      uri: asset.uri,
      name: asset.fileName || 'file.jpg',
      type: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
    };
  }

  return null;
};

export const formatDuration = (millis: number) => {
  // const totalSeconds = Math.floor(millis / 1000);
  // const minutes = Math.floor(totalSeconds / 60);
  // const seconds = totalSeconds % 60;
  // return `${minutes.toString().padStart(2, '0')}:${seconds
  //   .toString()
  //   .padStart(2, '0')}`;
  const minutes = Math.floor(millis / 60000);
  const seconds = Math.floor((millis % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export const getUserId = (data: any) => {
  if (!data) return null;

  if (typeof data === 'string') return data;
  if (typeof data === 'object' && data.user) {
    return typeof data.user === 'string' ? data.user : data.user._id;
  }

  return null;
};

// export const resizeImage = async (uriArr: IPhoto[], width: number) => {
//   return Promise.all(
//     uriArr.map(async (img: IPhoto | any) => {
//       const { id, url } = img;
//       const { uri } = await ImageManipulator.manipulateAsync(
//         url,
//         [{ resize: { width, height: width / 2 } }],
//         { compress: 1, format: ImageManipulator.SaveFormat.PNG }
//       );
//       const uris = { uri, id };
//       return uris; // Returns the URI of the resized image
//     })
//   );
// };

// app/utils/conversationHelpers.ts

/**
 * Remove duplicate conversations from an array
 * Uses _id as the unique identifier
 */
export const removeDuplicateConversations = (conversations: Room[]): Room[] => {
  const seen = new Set<string>();
  return conversations.filter((conv) => {
    if (!conv || !conv._id) return false;
    if (seen.has(conv._id)) return false;
    seen.add(conv._id);
    return true;
  });
};

/**
 * Merge new conversations with existing ones
 * Prevents duplicates and updates existing conversations
 */
export const mergeConversations = (
  existing: Room[],
  newConversations: Room[]
): Room[] => {
  // Create a Map for O(1) lookup
  const conversationsMap = new Map<string, Room>();

  // Add existing conversations to map
  existing.forEach((conv) => {
    if (conv && conv._id) {
      conversationsMap.set(conv._id, conv);
    }
  });

  // Add or update with new conversations
  newConversations.forEach((conv) => {
    if (conv && conv._id) {
      const existingConv = conversationsMap.get(conv._id);
      if (existingConv) {
        // Merge, preferring newer data
        conversationsMap.set(conv._id, {
          ...existingConv,
          ...conv,
        });
      } else {
        conversationsMap.set(conv._id, conv);
      }
    }
  });

  return Array.from(conversationsMap.values());
};

/**
 * Sort conversations by lastMessage timestamp (most recent first)
 */
export const sortConversationsByLastMessage = (
  conversations: Room[]
): Room[] => {
  return [...conversations].sort((a, b) => {
    const aTime = a.lastMessage?.createdAt
      ? new Date(a.lastMessage.createdAt).getTime()
      : 0;
    const bTime = b.lastMessage?.createdAt
      ? new Date(b.lastMessage.createdAt).getTime()
      : 0;
    return bTime - aTime;
  });
};

/**
 * Filter conversations that have lastMessage
 */
export const filterConversationsWithMessages = (
  conversations: Room[]
): Room[] => {
  return conversations.filter(
    (conv) =>
      conv && conv.lastMessage && Object.keys(conv.lastMessage).length > 0
  );
};

/**
 * Update a specific conversation in an array
 * Returns a new array with the updated conversation
 */
export const updateConversationInArray = (
  conversations: Room[],
  updatedConversation: Room
): Room[] => {
  if (!updatedConversation || !updatedConversation._id) {
    return conversations;
  }

  const index = conversations.findIndex(
    (conv) => conv._id === updatedConversation._id
  );

  if (index === -1) {
    // Conversation doesn't exist, add it
    return [updatedConversation, ...conversations];
  }

  // Update existing conversation
  const newConversations = [...conversations];
  newConversations[index] = {
    ...newConversations[index],
    ...updatedConversation,
  };

  return newConversations;
};

/**
 * Remove a conversation from an array
 */
export const removeConversationFromArray = (
  conversations: Room[],
  conversationId: string
): Room[] => {
  return conversations.filter((conv) => conv._id !== conversationId);
};

/**
 * Parse rooms with userB (the other participant)
 */
export const parseRoomsWithUserB = (
  rooms: Room[],
  currentUserEmail: string
): Room[] => {
  return rooms
    .map((doc: any) => {
      if (!doc || !doc._id) return null;

      const userB = doc.participants?.find(
        (p: any) => p?.email && p.email !== currentUserEmail
      );

      return {
        ...doc,
        userB: userB || null,
      };
    })
    .filter(Boolean) as Room[];
};

/**
 * Get unique conversations count
 */
export const getUniqueConversationsCount = (conversations: Room[]): number => {
  const uniqueIds = new Set(
    conversations.map((conv) => conv._id).filter(Boolean)
  );
  return uniqueIds.size;
};

/**
 * Validate conversation object
 */
export const isValidConversation = (
  conversation: any
): conversation is Room => {
  return (
    conversation &&
    typeof conversation === 'object' &&
    '_id' in conversation &&
    typeof conversation._id === 'string' &&
    conversation._id.length > 0
  );
};

export const getErrorMessage = (error: any): string => {
  console.log('🔍 Extracting error from:', JSON.stringify(error, null, 2));

  // If it's already a string, return it
  if (typeof error === 'string') {
    console.log('✅ Error is string:', error);
    return error;
  }

  // APISAUCE: Check for data.msg (this is where MongoDB errors come through)
  if (error?.data?.msg) {
    console.log('✅ Found error.data.msg:', error.data.msg);
    return error.data.msg;
  }

  // APISAUCE: Check for data.message
  if (error?.data?.message) {
    console.log('✅ Found error.data.message:', error.data.message);
    return error.data.message;
  }

  // APISAUCE: Check for errorMessage (added by our transform)
  if (error?.errorMessage) {
    console.log('✅ Found error.errorMessage:', error.errorMessage);
    return error.errorMessage;
  }

  // APISAUCE: Check for problem (network issues)
  if (error?.problem) {
    console.log('✅ Found error.problem:', error.problem);
    return error.problem;
  }

  // Standard error.message
  if (error?.message) {
    console.log('✅ Found error.message:', error.message);
    return error.message;
  }

  // Default fallback
  console.log('⚠️ No error message found, using default');
  return 'An error occurred';
};
