import { useContext, useState } from "react";
import { getSocket } from "../socket.ts";
import { SendHorizonal } from "lucide-react";
import { UserContext } from "../context/UserContext.ts";
import { Socket } from "socket.io-client";

export default function SendMessage({ roomId }: { roomId: string }) {
    const { user } = useContext(UserContext);
    const [message, setMessage] = useState("");
    const socket = getSocket();
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!socket) {
            console.error("Socket not initialized.");
            return;
        }
        socket.emit("chat message", {
            roomId,
            senderId: user.userId,
            username: user.username,
            message,
        });
        setMessage("");
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="div bg-white flex w-full rounded-lg">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="bg-white  px-2 py-1 w-full rounded-lg py-2"
                />
                <button type="submit" className="px-2 cursor-pointer">
                    <SendHorizonal className="text-slate-500 hover:text-slate-900 transition" />
                </button>
            </div>
        </form>
    );
}
