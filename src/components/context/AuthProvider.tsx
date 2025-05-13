import React, { useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { UserAuth } from "../../types";

const URL = import.meta.env.VITE_API_BASE_URL;
const initialContext: UserAuth = {
    loggedIn: false,
    username: "",
    userId: "",
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserAuth>(initialContext);

    const resetUserContext = () => setUser(initialContext);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("accessToken");
            if (token) {
                const res = await fetch(`${URL}/user`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    throw new Error("Invalid or expired token");
                }

                const data = await res.json();
                setUser({
                    loggedIn: true,
                    username: data.username,
                    userId: data.id,
                });
            }
        };
        checkAuth();
    }, []);

    const contextValue = { user, setUser, resetUserContext };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};
