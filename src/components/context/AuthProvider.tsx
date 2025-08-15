import React, { useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { UserAuth } from "../../types";
import { refreshToken } from "../../services/auth";
import { connectSocket, disconnectSocket } from "../socket";

const URL = import.meta.env.VITE_API_BASE_URL;

const initialContext: UserAuth = {
    loggedIn: false,
    username: "",
    userId: "",
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserAuth>(initialContext);

    const resetUserContext = () => {
        setUser(initialContext);
        disconnectSocket();
        localStorage.removeItem("accessToken");
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const stored = localStorage.getItem("accessToken");
                if (!stored) return;

                // try with stored token
                let accessToken = stored;
                let res = await fetch(`${URL}/user`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                // if it fails, try refresh -> retry /user
                if (!res.ok) {
                    const refreshRes = await refreshToken();
                    if (!refreshRes.success) {
                        resetUserContext();
                        return;
                    }
                    accessToken = refreshRes.data.accessToken;
                    localStorage.setItem("accessToken", accessToken);

                    res = await fetch(`${URL}/user`, {
                        headers: { Authorization: `Bearer ${accessToken}` }, // <-- fixed stray "}"
                    });
                    if (!res.ok) {
                        resetUserContext();
                        return;
                    }
                }

                const data = await res.json();

                setUser({
                    loggedIn: true,
                    username: data.username,
                    userId: String(data.id),
                });

                // 👉 connect the socket with current auth
                connectSocket({
                    username: data.username,
                    userId: data.id,
                    token: accessToken,
                });
            } catch {
                resetUserContext();
            }
        };

        checkAuth();

        // optional: disconnect on provider unmount
        return () => disconnectSocket();
    }, []);

    const contextValue = { user, setUser, resetUserContext };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};
