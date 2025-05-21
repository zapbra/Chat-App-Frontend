import { io, Socket } from "socket.io-client";
import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "./context/UserContext";

export const useSocket = (): Socket | null => {
    const { user } = useContext(UserContext);
    const apiUrl = import.meta.env.VITE_SOCKET_URL;
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (user?.userId) {
            // Only connect when user exists
            const username = user.username || `guest-${crypto.randomUUID()}`;

            socketRef.current = io(apiUrl, {
                auth: { username, userId: user.userId },
                autoConnect: true,
            });

            return () => {
                socketRef.current?.disconnect();
            };
        }
    }, [user?.userId]); // Reconnect only if userId changes

    return socketRef.current;
};
