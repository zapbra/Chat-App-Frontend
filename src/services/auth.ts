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
    | { success: false; error: string; status?: number }
> {
    try {
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
