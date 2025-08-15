// socket.ts
import { io, Socket } from "socket.io-client";

const apiUrl = import.meta.env.VITE_SOCKET_URL;

let socket: Socket | null = null;

export const initSocket = (
    username: string,
    userId: string,
    token: string
): Socket => {
    if (!socket) {
        socket = io(apiUrl, {
            auth: { username, userId, token },
            autoConnect: true,
            transports: ["websocket"],
        });

        socket.on("connect", () => {});

        socket.on("connect_error", (err) => {
            console.log(err.message);
        });
    }

    return socket;
};

export const getSocket = (): Socket | null => socket;
