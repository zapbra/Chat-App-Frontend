export interface DirectMessage {
    id: number;
    message: string;
    threadId: number;
    senderId: number;
    receiverId: number;
    createdAt: string;
    senderUsername: string;
    receiverUsername: string;
    isRead: boolean | null;
}

export interface DbDirectMessage {
    id: number;
    message: string;
    thread_id: number;
    sender_id: number;
    receiver_id: number;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}

export interface UserDmRead {
    id: number;
    last_read_message_id: number | null;
    thread_id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}
