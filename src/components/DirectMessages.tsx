import { useContext, useState } from "react";
import { UserContext } from "../../components/context/UserContext";
import recentMessages from "../../data/recent_messages.json";
import DirectMessageDisplay from "../../components/profile/DirectMessageDisplay";
import DisplayMessage from "../../components/chatroom/DisplayMessage";
import TestMessages from "../../data/messages.json";
import SendMessage from "../../components/chatroom/SendMessage";

export default function DirectMessages() {
    const { user } = useContext(UserContext);
    const [messages, setMessages] = useState([
        ...recentMessages,
        ...recentMessages,
        ...recentMessages,
        ...recentMessages,
    ]);

    const [currentChatMessages, setCurrentChatMessages] =
        useState(TestMessages);

    console.log("current chat msgs");
    console.log(currentChatMessages);
    return (
        <div className=" max-w-[1440px] mx-auto px-6 ">
            <div className="flex w-full  bg-sky-800 h-[75vh]">
                {/** Left Sidebar Messages */}
                <div className="max-w-[400px] overflow-y-scroll">
                    {messages.map((message) => {
                        return (
                            <DirectMessageDisplay
                                username={message.username}
                                message={message.message}
                                isRead={message.isRead}
                                sentAt={message.sent_at}
                            />
                        );
                    })}
                </div>
                {/** End of Left Sidebar Messages  */}

                {/** Current Chat Message */}
                <div className="px-10 w-full flex flex-col justify-end mb-4">
                    <div>
                        {currentChatMessages.map((message) => {
                            return (
                                <DisplayMessage
                                    message={message}
                                    isUserMessage={false}
                                    liked={false}
                                />
                            );
                        })}
                    </div>
                    <div className="">
                        <SendMessage />
                    </div>
                </div>

                {/** End of Current Chat Messages */}
            </div>
        </div>
    );
}
