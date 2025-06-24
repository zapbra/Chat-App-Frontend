import { fetchWithAuth, login, refreshToken, signUp } from "../services/auth";
import { describe, expect, test } from "vitest";
import { getUserMessages } from "../services/messages";

test("refreshToken() returns a valid access token when successful", async () => {
    const loginResponse = await login("test@gmail.com", "Testpassword10!");

    if (!loginResponse.success) {
        throw new Error(`Failed to login: ${loginResponse.error}`);
    }

    const response = await refreshToken();

    if (!response.success) {
        throw new Error(`refreshToken failed: ${response.error}`);
    }

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(typeof response.data.accessToken).toBe("string");
    expect(response.data.accessToken.length).toBeGreaterThan(10);
});

test("fetchWithAuth() returns data as intended", async () => {
    const loginResponse = await login("test@gmail.com", "Testpassword10!");

    if (!loginResponse.success) {
        throw new Error(`Failed to login: ${loginResponse.error}`);
    }

    const response = await fetchWithAuth<{ email: string }>(
        "test-auth/",
        "GET"
    );

    if (!response.success) {
        throw new Error(`Failed to fetch with auth: ${response.error}`);
    }
    expect(response.success).toBe(true);
    expect(response.data.email).toBe("test@gmail.com");
});

test("likeMessage() properly likes and unlikes messages and returns the proper state", async () => {
    const loginResponse = await login("test@gmail.com", "Testpassword10!");

    if (!loginResponse.success) {
        throw new Error(`Failed to login: ${loginResponse.error}`);
    }

    const response = await getUserMessages(loginResponse.data.user.id);
});
