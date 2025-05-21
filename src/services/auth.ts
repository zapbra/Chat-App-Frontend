import { LoginResponse, User } from "../types";

const URL = import.meta.env.VITE_API_BASE_URL;

export async function login(
    email: string,
    password: string
): Promise<
    | { success: true; data: LoginResponse }
    | { success: false; error: string; status?: number }
> {
    try {
        // Send login POST request
        const response = await fetch(`${URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        // successfully logged in
        if (response.ok) {
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            return { success: true, data };
        } else {
            return {
                success: false,
                error: data.message,
                status: response.status,
            };
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.message || "Network error",
        };
    }
}

export async function refreshToken(): Promise<
    | { success: true; data: { accessToken: string } }
    | { success: false; error: string; status?: number; redirect?: string }
> {
    try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            return {
                success: false,
                error: "Failed to get refreshToken from local storage",
                redirect: "/sign-in",
            };
        }
        const response = await fetch(`${URL}/refresh`, {
            method: "GET",
            headers: { Authorization: `Bearer ${refreshToken}` },
        });

        if (!response.ok) {
            throw new Error("Unauthorized");
        }

        const { accessToken } = await response.json();
        localStorage.setItem("accessToken", accessToken);

        return { success: true, data: { accessToken } };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || "Network error",
            redirect: "/sign-in",
        };
    }
}

export type FetchMethod = "GET" | "POST" | "PUT" | "DELETE";

export async function fetchWithAuth<T = unknown>(
    url: string,
    method: FetchMethod,
    body?: Record<string, any>,
    headers?: HeadersInit
): Promise<
    | { success: true; data: T}
    | { success: false; error: string; status?: number; redirect?: string }
> {
    try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            return {
                success: false,
                error: "Failed to get accessToken from local storage",
                redirect: "/sign-in",
            };
        }

        const response = await fetch(`${URL}/${url}`, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        // Request didn't work, assuming the issue is due to expired auth token
        if (!response.ok) {
            const refreshTokenResponse = await refreshToken();
            // Succesfully refreshed token,
            if (refreshTokenResponse.success) {
                const response = await fetch(`${URL}/${url}`, {
                    method: method,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${refreshTokenResponse.data.accessToken}`,
                        ...headers,
                    },
                    body: body ? JSON.stringify(body) : undefined,
                });
                // Request failed again
                if (!response.ok) {
                    throw new Error("Unauthorized");
                }
                // Successfully requested data after refreshing token
                return response.json();
            } else {
                return refreshTokenResponse;
            }
        }

        return {
            success: true,
            data: await response.json(),
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || "Network error",
        };
    }
}

export async function signUp(
    user: User
): Promise<
    | { success: true; data: LoginResponse }
    | { success: false; error: string; status?: number }
> {
    try {
        const response = await fetch(`${URL}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            return { success: true, data };
        } else {
            return {
                success: false,
                error: data.message,
                status: response.status,
            };
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.message || "Network error",
        };
    }
}
