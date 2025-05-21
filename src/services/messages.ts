import { DbMessage, MessageResponse } from "../types";
import { FetchMethod, fetchWithAuth } from "./auth";

const URL = import.meta.env.VITE_API_BASE_URL;

export async function likeMessage(messageId: number) {
    const response = await fetchWithAuth<MessageResponse>(
        `${messageId}/like`,
        "POST"
    );
    return response;
}

export async function getUserMessages(
    userId: number
): Promise<{ messages: DbMessage[] } | { error: string }> {
    const response = await fetch(`${URL}/users/${userId}/messages`);
    return await response.json();
}
