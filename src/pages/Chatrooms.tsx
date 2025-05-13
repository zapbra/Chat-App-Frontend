import { useEffect, useState } from "react";
import { ChatRoom } from "../types";
import ChatRoomLink from "../components/chatroom/ChatRoomLink";

const URL = import.meta.env.VITE_API_BASE_URL;

export default function Chatrooms() {
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

    useEffect(() => {
        const fetchChatRooms = async () => {
            try {
                const response = await fetch(`${URL}/rooms`);
                // Data successfully retrieved
                if (response.status == 200) {
                    const data = await response.json();
                    setChatRooms(data);
                }
            } catch (error) {
                console.log("Error fetching chat rooms", error);
            }
        };

        fetchChatRooms();
    }, []);

    return (
        <div className="max-w-[1440px] mx-auto my-4">
            <h1 className="text-6xl font-bold text-sky-900 mb-8">
                Discover New Chatrooms
            </h1>

            <div className="bg-sky-500 px-15 py-10 flex flex-wrap gap-8 rounded-2xl">
                {chatRooms.map((chatRoom) => {
                    return <ChatRoomLink chatRoom={chatRoom} />;
                })}
            </div>
        </div>
    );
}
