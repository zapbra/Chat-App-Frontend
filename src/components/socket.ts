import { io } from "socket.io-client";

const apiUrl = import.meta.env.VITE_SOCKET_URL;

export const socket = io(apiUrl);
