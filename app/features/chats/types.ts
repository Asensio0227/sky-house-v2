export interface Room {
  _id: string;
  participantsArray: string[];
  participants: Participants[];
  userId: string;
  lastMessage: null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Messages {
  _id: string;
  text?: string;
  photo?: [] | any;
  audio?: [] | any;
  video?: [] | any;
  user: string;
  roomId: string;
  sent: boolean;
  pending: boolean;
  received: boolean;
  isRead: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type Participants = {
  status: string;
  email: string;
  avatar: string;
  username: string;
  _id: string;
};
