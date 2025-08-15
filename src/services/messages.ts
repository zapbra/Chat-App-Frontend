import {
    DbMessage,
    DbReaction,
    MessageResponse,
    ReactionResponse,
} from "../types";
import { fetchWithAuth } from "./auth";

const URL = import.meta.env.VITE_API_BASE_URL;

export async function toggleMessageLike(messageId: number) {
    const response = await fetchWithAuth<MessageResponse>(
        `messages/${messageId}/like`,
        "GET"
    );
    return response;
}

export async function toggleReaction(messageId: number, emoji: string) {
    const response = await fetchWithAuth<ReactionResponse>(
        `messages/${messageId}/react`,
        "POST",
        { emoji: emoji }
    );
    return response;
}

export async function getUserMessages(
    userId: number
): Promise<{ messages: DbMessage[] } | { error: string }> {
    const response = await fetch(`${URL}/users/${userId}/messages`);
    return await response.json();
}

interface ReactionInfo {
    count: number;
    userReacted: boolean;
    users: string[];
}
export function sortReactions(
    reactions: DbReaction[],
    username: string
): Record<string, ReactionInfo> {
    const sortedReactions: Record<string, ReactionInfo> = {};

    for (const reaction of reactions) {
        if (!sortedReactions[reaction.emoji]) {
            sortedReactions[reaction.emoji] = {
                count: 0,
                users: [],
                userReacted: false,
            };
        }
        sortedReactions[reaction.emoji].users.push(reaction.username);
        sortedReactions[reaction.emoji].count++;
        sortedReactions[reaction.emoji].userReacted =
            sortedReactions[reaction.emoji].users.includes(username);
    }

    return sortedReactions;
}
