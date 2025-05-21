export interface ChatRoom {
    id: number;
    name: string;
    description: string;
    messageCount: number;
    lastMessageAt: string;
    activeUserCount: number;
    created_at: string;
    deleted_at: string;
    updated_at: string;
}

export interface Message {
    id: string;
    message: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
    sender_id: string;
    username: string;
}

export interface DbMessage {
    id: number;
    senderId: number;
    roomId: number;
    message: string;
    updated_at: string;
    created_at: string;
    deleted_at: string | null;
}

export interface MessageResponse {
    message: string;
    liked: boolean;
    likeId: number;
}
