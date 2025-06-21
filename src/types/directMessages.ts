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
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
