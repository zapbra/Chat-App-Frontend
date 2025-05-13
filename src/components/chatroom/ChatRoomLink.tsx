import { ChatRoom } from "../../types";
import { Link } from "react-router";
import { stringToReadableDate } from "../../utils/utils";

export default function ChatRoomLink({ chatRoom }: { chatRoom: ChatRoom }) {
    return (
        <Link to={`/chatroom/${chatRoom.id}`}>
            <div className="rounded-3xl bg-white shadow-2xl px-6 py-3 cursor-pointer  hover:bg-sky-100 transition duration-300 max-w-[400px]">
                <h3 className="text-2xl font-bold mb-6 text-sky-900">
                    {chatRoom.name}
                </h3>

                <div className="grid grid-cols-2 gap-y-2 mb-4">
                    <span>Current Chatters</span>
                    <span className="text-right font-bold">
                        {chatRoom.activeUserCount}
                    </span>

                    <span>Messages</span>
                    <span className="text-right font-bold">
                        {chatRoom.messageCount}
                    </span>

                    <span>Last Message</span>
                    <span className="text-right font-bold">
                        {stringToReadableDate(chatRoom.lastMessageAt)}
                    </span>
                </div>
                <p className="text-base">{chatRoom.description}</p>
            </div>
        </Link>
    );
}
