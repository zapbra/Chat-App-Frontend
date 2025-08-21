// socket.ts
import { io, Socket } from "socket.io-client";

const apiUrl = import.meta.env.VITE_SOCKET_URL;

let socket: Socket | undefined;

export const ensureSocket = (): Socket => {
    if (!socket) {
        socket = io(apiUrl, {
            autoConnect: false,
            transports: ["websocket"],
        });
        socket.on("connect_error", (err) => {
            console.log("socket connect_error:", err?.message || err);
        });
    }
    return socket;
};

export const getSocket = (): Socket => ensureSocket();

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
        if (s.connected) s.disconnect(); // ensure server sees new auth
    }
    s.connect();
    return s;
};

export const disconnectSocket = () => {
    if (socket?.connected) socket.disconnect();
};
