import { fetchWithAuth } from "./auth";

export const toggleFollowUser = async (userIdToFollow: number) => {
    const response = await fetchWithAuth<{ following: boolean }>(
        `followers/follow`,
        "POST",
        { userId: userIdToFollow }
    );
    return response;
};
