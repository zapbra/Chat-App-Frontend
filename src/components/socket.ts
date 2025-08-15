// socket.ts
import { io, Socket } from "socket.io-client";

const apiUrl = import.meta.env.VITE_SOCKET_URL;

let socket: Socket | null = null;

export const ensureSocket = (): Socket => {
    if (!socket) {
        socket = io(apiUrl, {
            autoConnect: false, // important
            transports: ["websocket"],
        });

        socket.on("connect_error", (err) => {
            console.log("socket connect_error:", err?.message || err);
        });
    }
    return socket;
};

// Call this right after login (or whenever token rotates)
export const connectSocket = (auth?: {
    username: string;
    userId: string | number;
    token: string;
}) => {
    const s = ensureSocket();
    if (auth) {
        s.auth = {
            username: auth.username,
            userId: String(auth.userId),
            token: auth.token,
        };
    }
    if (!s.connected) s.connect();
    return s;
};

// If user logs out
export const disconnectSocket = () => {
    if (socket?.connected) socket.disconnect();
};

export const getSocket = (): Socket | null => ensureSocket();
