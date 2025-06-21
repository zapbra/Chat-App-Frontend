import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../components/context/UserContext";
import recentMessages from "../../data/recent_messages.json";
import DirectMessageDisplay from "../../components/profile/DirectMessageDisplay";
import DisplayMessage from "../../components/chatroom/DisplayMessage";
import TestMessages from "../../data/messages.json";
import SendMessage from "../../components/chatroom/SendMessage";
import { DbDirectMessage, DirectMessage } from "../../types/directMessages";
import { fetchWithAuth } from "../../services/auth";
import { Follower, Message } from "../../types";
import NewMessagePopup from "../../components/profile/NewMessagePopup";
import { Socket } from "socket.io-client";
import { initSocket } from "../../components/socket";

const URL = import.meta.env.VITE_API_BASE_URL;

type ActiveChatDetails = {
    receiverId: number;
    receiverUsername: string;
    threadId: number | null;
};

export default function DirectMessages() {
    const { user } = useContext(UserContext);
    const [messages, setMessages] = useState<DirectMessage[]>([]);
    const [newMessagePopupOpen, setNewMessagePopupOpen] = useState(true);
    const [currentChatMessages, setCurrentChatMessages] = useState<
        DbDirectMessage[] | null
    >(null);
    const [activeChatDetails, setActiveChatDetails] =
        useState<ActiveChatDetails | null>(null);
    // Optimize this to only fetch when the send message is clicked
    const [following, setFollowing] = useState<Follower[]>([]);

    const [socket, setSocket] = useState<Socket | null>(null);

    console.log("messages");
    console.log(messages);

    const sendChatMessage = (message: string) => {
        // Might want to handle this errors more gracefully in the future, instead of doing console.error
        if (!socket) {
            console.error("Socket not initialized");
            return;
        }

        // User must be in chat to send a message
        if (!activeChatDetails) {
            console.error("User is not in active chat");
            return;
        }

        socket.emit("dm message", {
            senderId: user.userId,
            receiverId: activeChatDetails.receiverId,
            message,
            threadId: activeChatDetails.threadId,
        });
    };
    // Load the web socket initially if user logged in and it hasn't been loaded yet
    useEffect(() => {
        if (!user?.loggedIn || socket) return;

        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const initializedSocket = initSocket(user.username, user.userId, token);
        setSocket(initializedSocket);
    }, [user, socket]);

    // Socket for handling messages and setting up joining / leaving direct message rooms
    useEffect(() => {
        if (!socket || !user?.loggedIn || activeChatDetails == null) return;

        const handleConnect = () => {
            if (!activeChatDetails || activeChatDetails.threadId == null)
                return;
            console.log("connecting");
            console.log(activeChatDetails);
            socket.emit("join dm", String(activeChatDetails.threadId));
        };

        const handleMessage = ({
            thread_id,
            message,
        }: {
            thread_id: number;
            message: DbDirectMessage;
        }) => {
            console.log("received message: " + message.message);

            setActiveChatDetails((prev) => {
                if (prev == null) return null;
                return {
                    ...prev,
                    threadId: thread_id,
                };
            });

            setCurrentChatMessages((prev) => {
                if (prev == null) return [message];
                return [...prev, message];
            });
        };

        // Join dm only after socket connects
        if (socket.connected && activeChatDetails.threadId != null) {
            console.log("joinging dm...");
            console.log(activeChatDetails.threadId);
            socket.emit("join dm", String(activeChatDetails.threadId));
        } else {
            socket.on("connect", handleConnect);
        }

        socket.on("dm message", handleMessage);
        return () => {
            socket.emit("leave room", String(activeChatDetails.threadId));
            socket.off("dm message", handleMessage);
            socket.off("connect", handleConnect);
        };
    }, [socket, activeChatDetails?.threadId]);

    // Use effect to load initial data
    useEffect(() => {
        if (!user.userId) return;

        const fetchData = async () => {
            const messagesResponse = await fetchWithAuth<{
                messages: DirectMessage[];
            }>(`dms/threads`, "GET");
            if (messagesResponse.success) {
                console.log("response..");
                console.log(messagesResponse);
                setMessages(messagesResponse.data.messages);
            }
            // Optimize this to only fetch when the send message is clicked
            const response = await fetch(
                `${URL}/followers/${user.userId}/following`
            );
            if (response.ok) {
                const data = await response.json();
                setFollowing(data.following);
            }
        };

        fetchData();
    }, [user]);

    // Going to have to update this to open a thread if it already exists soon
    const createNewMessageThread = async (userId: number, username: string) => {
        setNewMessagePopupOpen(false);
        const response = await fetchWithAuth<{
            threadId: number;
            messages: DbDirectMessage[];
        }>(`dms/thread/${userId}`, "GET");
        if (response.success) {
            const { threadId, messages } = response.data;
            setCurrentChatMessages(messages);
            setActiveChatDetails({
                receiverId: userId,
                receiverUsername: username,
                threadId: threadId,
            });
        } else {
            const response = await fetchWithAuth<{ threadId: number }>(
                `dms/thread/${userId}`,
                "POST"
            );

            if (response.success) {
                const { threadId } = response.data;
                setActiveChatDetails({
                    receiverId: userId,
                    receiverUsername: username,
                    threadId: threadId,
                });
                console.log("Successfully created thread");
                console.log(`Thread id: ${threadId}`);
            } else {
                console.log("Failed to create thread");
                console.log(response);
                setActiveChatDetails({
                    receiverId: userId,
                    receiverUsername: username,
                    threadId: null,
                });
            }
            setCurrentChatMessages([]);
        }
    };

    /**
     * Retrieves a list of messages when a direct message is opened and
     * populates the screen with the messages
     */
    const openDirectMessage = async (otherUserId: number) => {
        console.log("opening direct message");
        const response = await fetchWithAuth<{
            messages: DbDirectMessage[];
        }>(`dms/thread/${otherUserId}`, "GET");
        if (response.success) {
            setNewMessagePopupOpen(false);
            setCurrentChatMessages(response.data.messages);
        }
        // Might want to handle case where messages aren't found
        // It should be found though, so unlikely
    };
    return (
        <div className=" max-w-[1440px] mx-auto px-6 ">
            <div className="flex w-full  bg-sky-800 h-[75vh]">
                {/** Left Sidebar Messages */}
                <div className="max-w-[400px] w-full overflow-y-scroll">
                    {/** No messages to display */}
                    {messages.length === 0 && (
                        <div className="px-4 py-2">
                            <p className="text-lg text-white">
                                You have no messages to display
                            </p>
                        </div>
                    )}
                    {/** End of no messages to display */}
                    {messages.map((message) => {
                        return (
                            <DirectMessageDisplay
                                username={
                                    message.senderUsername == user.username
                                        ? message.receiverUsername
                                        : message.senderUsername
                                }
                                message={message.message}
                                isRead={message.isRead}
                                sentAt={message.createdAt}
                                otherUserId={
                                    message.receiverId == Number(user.userId)
                                        ? message.senderId
                                        : message.receiverId
                                }
                                openDirectMessage={openDirectMessage}
                            />
                        );
                    })}
                </div>
                {/** End of Left Sidebar Messages  */}

                {/** Current Chat Message */}
                <div className="px-10 w-full flex flex-col justify-between mb-4 relative">
                    <div className="flex justify-end">
                        {activeChatDetails && (
                            <p className="text-emerald-300 ">
                                Chatting with{" "}
                                <span className="font-bold">
                                    {activeChatDetails.receiverUsername}
                                </span>
                            </p>
                        )}
                    </div>

                    {newMessagePopupOpen && (
                        <NewMessagePopup
                            following={following}
                            createNewMessageThread={createNewMessageThread}
                        />
                    )}
                    {currentChatMessages ? (
                        <>
                            <div>
                                {currentChatMessages.map((message) => {
                                    return (
                                        <DisplayMessage
                                            message={message}
                                            isUserMessage={
                                                message.sender_id ==
                                                Number(user.userId)
                                            }
                                            liked={false}
                                        />
                                    );
                                })}
                            </div>
                            <div className="">
                                <SendMessage
                                    sendChatMessage={sendChatMessage}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            {!newMessagePopupOpen && (
                                <div className="flex justify-center items-center h-full">
                                    <div className="bg-white hover:bg-sky-100 transition rounded-xl px-4 py-2 shadow-lg cursor-pointer">
                                        <p className="text-sky-950 font-bold">
                                            Send a Message
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/** End of Current Chat Messages */}
            </div>
        </div>
    );
}
