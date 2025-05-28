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

export interface ReactionInfo {
    count: number;
    userReacted: boolean;
    users: string[];
}

export interface ReactionMap {
    [emoji: string]: ReactionInfo;
}

export interface Message {
    id: string;
    message: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
    sender_id: string;
    username: string;
    likes_count: string;
    likes: Like[] | null;
    reactions: ReactionMap | null;
}

export interface Like {
    id: number;
    username: string;
}

export interface ReactionList {
    emoji: string;
    usernames: string[];
}

export interface DbReaction {
    emoji: string;
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

export interface ReactionResponse {
    message: string;
    reactedTo: boolean;
    reactId: number;
}
