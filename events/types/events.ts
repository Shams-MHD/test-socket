export interface ServerToClientEvents {
  newMessage: (payload: Message) => void;
}

export class Message {
  id: string;
  message: string;
  authorId: string;
  conversationId: string;
  createdAt: Date;
  updatedAt: Date;
}
