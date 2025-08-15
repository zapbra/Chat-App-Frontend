import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../components/context/UserContext";
import DirectMessageDisplay from "../../components/profile/DirectMessageDisplay";
import DmDisplayMessage from "./DmDisplayMessage";
import SendMessage from "../../components/chatroom/SendMessage";
import {
    DbDirectMessage,
    DirectMessage,
    UserDmRead,
} from "../../types/directMessages";
import { fetchWithAuth } from "../../services/auth";
import { Follower } from "../../types";
import NewMessagePopup from "../../components/profile/NewMessagePopup";
import { Socket } from "socket.io-client";
import { connectSocket, getSocket } from "../../components/socket";
import { useParams } from "react-router";

const URL = import.meta.env.VITE_API_BASE_URL;

type ActiveChatDetails = {
    receiverId: number;
    receiverUsername: string;
    threadId: number | null;
};

export default function DirectMessages() {
    const { user } = useContext(UserContext);
    const { userId } = useParams();
    const [messages, setMessages] = useState<DirectMessage[]>([]);
    const [newMessagePopupOpen, setNewMessagePopupOpen] = useState(true);
    const [currentChatMessages, setCurrentChatMessages] = useState<
        DbDirectMessage[] | null
    >(null);
    const [activeChatDetails, setActiveChatDetails] =
        useState<ActiveChatDetails | null>(null);
    const [following, setFollowing] = useState<Follower[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [userDmRead, setUserDmRead] = useState<UserDmRead | null>(null);
    const [otherUserDmRead, setOtherUserDmRead] = useState<UserDmRead | null>(
        null
    );
    const [dmJoined, setDmJoined] = useState(false);
    const [lastReadMessageId, setLastReadMessageId] = useState(0);

    function updateDmRead(
        user_id: number,
        userDmReadArg: UserDmRead
    ): DbDirectMessage | null {
        if (currentChatMessages === null || !socket || !activeChatDetails)
            return null;

        let mostRecentReceivedMessage: DbDirectMessage | null = null;
        for (let i = currentChatMessages.length - 1; i >= 0; i--) {
            const message = currentChatMessages[i];
            if (message.receiver_id == user_id) {
                mostRecentReceivedMessage = message;
                break;
            }
        }
        if (!mostRecentReceivedMessage) return null;

        if (
            userDmReadArg.last_read_message_id == null ||
            userDmReadArg.last_read_message_id != mostRecentReceivedMessage.id
        ) {
            socket.emit("dm message read", {
                threadId: activeChatDetails.threadId,
                userId: user_id,
                messageId: mostRecentReceivedMessage.id,
            });
        }
        return mostRecentReceivedMessage;
    }

    // If route is /profile/messages/:userId, auto-create/open a thread
    useEffect(() => {
        if (!userId) return;
        const fetchDataAndCreateThread = async () => {
            const response = await fetch(`${URL}/users/${userId}`);
            if (response.ok) {
                const data = await response.json();
                createNewMessageThread(Number(userId), data.user.username);
            }
        };
        fetchDataAndCreateThread();
    }, [userId]);

    const sendChatMessage = (message: string) => {
        if (!user?.loggedIn) return;
        const s = socket ?? getSocket();
        if (!s) {
            console.error("Socket not initialized");
            return;
        }
        if (!activeChatDetails) {
            console.error("User is not in active chat");
            return;
        }

        s.emit("dm message", {
            senderId: user.userId,
            receiverId: activeChatDetails.receiverId,
            message,
            threadId: activeChatDetails.threadId,
        });
    };

    // Ensure we hold a socket instance in state
    useEffect(() => {
        const s = getSocket();
        if (!socket) setSocket(s);
    }, [socket]);

    // Connect the socket with auth when user is logged in
    useEffect(() => {
        if (!user?.loggedIn) return;
        const s = socket ?? getSocket();
        if (!s?.connected) {
            const token = localStorage.getItem("accessToken");
            if (token) {
                const connected = connectSocket({
                    username: user.username,
                    userId: user.userId,
                    token,
                });
                setSocket(connected);
            }
        }
    }, [user.loggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

    // Socket handlers: join thread room, receive DMs, read receipts
    useEffect(() => {
        if (!socket || !user?.loggedIn || !activeChatDetails?.threadId) return;

        const join = () => {
            socket.emit("join dm", String(activeChatDetails.threadId));
            socket.once("joined dm", () => setDmJoined(true));
        };

        const handleMessage = ({
            thread_id,
            message,
        }: {
            thread_id: number;
            message: DbDirectMessage;
        }) => {
            setActiveChatDetails((prev) =>
                prev ? { ...prev, threadId: thread_id } : prev
            );
            setCurrentChatMessages((prev) =>
                prev ? [...prev, message] : [message]
            );
        };

        const handleMessageRead = (dmMessageRead: UserDmRead) => {
            if (
                dmMessageRead.user_id == Number(user.userId) ||
                dmMessageRead.last_read_message_id == null
            ) {
                return;
            }
            setLastReadMessageId(dmMessageRead.last_read_message_id);
        };

        socket.on("connect", join);
        if (socket.connected) join();

        socket.on("dm message", handleMessage);
        socket.on("dm message read", handleMessageRead);

        return () => {
            if (activeChatDetails?.threadId != null) {
                socket.emit("leave dm", String(activeChatDetails.threadId)); // ⬅️ was "leave room"
            }
            socket.off("connect", join);
            socket.off("dm message", handleMessage);
            socket.off("dm message read", handleMessageRead);
        };
    }, [socket, user?.loggedIn, activeChatDetails?.threadId]);

    // On successful join, send read receipt for latest received message
    useEffect(() => {
        if (
            dmJoined &&
            activeChatDetails?.threadId !== null &&
            userDmRead !== null
        ) {
            updateDmRead(Number(user.userId), userDmRead);
            setDmJoined(false);
        }
    }, [dmJoined, userDmRead, activeChatDetails?.threadId]);

    // Initial data for sidebar + following list
    useEffect(() => {
        if (!user.userId) return;

        const fetchData = async () => {
            const messagesResponse = await fetchWithAuth<{
                messages: DirectMessage[];
            }>(`dms/threads`, "GET");
            if (messagesResponse.success) {
                setMessages(messagesResponse.data.messages);
            }

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

    const createNewMessageThread = async (
        otherUserId: number,
        username: string
    ) => {
        setNewMessagePopupOpen(false);
        const response = await fetchWithAuth<{
            threadId: number;
            messages: DbDirectMessage[];
        }>(`dms/thread/${otherUserId}`, "GET");

        if (response.success) {
            const { threadId, messages } = response.data;
            setCurrentChatMessages(messages);
            setActiveChatDetails({
                receiverId: otherUserId,
                receiverUsername: username,
                threadId,
            });
        } else {
            const createRes = await fetchWithAuth<{ threadId: number }>(
                `dms/thread/${otherUserId}`,
                "POST"
            );
            if (createRes.success) {
                const { threadId } = createRes.data;
                setActiveChatDetails({
                    receiverId: otherUserId,
                    receiverUsername: username,
                    threadId,
                });
            } else {
                setActiveChatDetails({
                    receiverId: otherUserId,
                    receiverUsername: username,
                    threadId: null,
                });
            }
            setCurrentChatMessages([]);
        }
    };

    const openDirectMessage = async (
        otherUserId: number,
        username: string,
        threadId: number
    ) => {
        const response = await fetchWithAuth<{
            messages: DbDirectMessage[];
            threadId: number;
            userDmRead: UserDmRead;
            otherUserDmRead: UserDmRead;
        }>(`dms/thread/${otherUserId}`, "GET");

        if (response.success) {
            setNewMessagePopupOpen(false);
            setCurrentChatMessages(response.data.messages);
            setUserDmRead(response.data.userDmRead);
            setOtherUserDmRead(response.data.otherUserDmRead);
            setLastReadMessageId(
                response.data.otherUserDmRead.last_read_message_id ?? 0
            );
            setActiveChatDetails({
                receiverId: otherUserId,
                receiverUsername: username,
                threadId,
            });
        }
    };

    return (
        <div className=" max-w-[1440px] mx-auto px-6 ">
            <div className="flex w-full  bg-sky-800 h-[75vh]">
                {/* Left Sidebar Messages */}
                <div className="max-w-[400px] w-full overflow-y-scroll">
                    {messages.length === 0 && (
                        <div className="px-4 py-2">
                            <p className="text-lg text-white">
                                You have no messages to display
                            </p>
                        </div>
                    )}
                    {messages.map((message) => {
                        const otherUser =
                            message.senderUsername == user.username
                                ? message.receiverUsername
                                : message.senderUsername;
                        const otherUserId =
                            message.receiverId == Number(user.userId)
                                ? message.senderId
                                : message.receiverId;

                        return (
                            <DirectMessageDisplay
                                key={message.threadId} // ⬅️ add a key
                                username={otherUser}
                                message={message.message}
                                isRead={message.isRead}
                                sentAt={message.createdAt}
                                otherUserId={otherUserId}
                                threadId={message.threadId}
                                openDirectMessage={openDirectMessage}
                            />
                        );
                    })}
                </div>

                {/* Current Chat Message */}
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
                            <div className="overflow-y-auto pr-2">
                                {currentChatMessages.map((message) => (
                                    <DmDisplayMessage
                                        key={message.id} // ⬅️ add a key
                                        message={message}
                                        isUserMessage={
                                            message.sender_id ==
                                            Number(user.userId)
                                        }
                                        liked={false}
                                        isLastRead={
                                            lastReadMessageId == message.id
                                        }
                                    />
                                ))}
                            </div>
                            <div>
                                <SendMessage
                                    sendChatMessage={sendChatMessage}
                                />
                            </div>
                        </>
                    ) : (
                        !newMessagePopupOpen && (
                            <div className="flex justify-center items-center h-full">
                                <div className="bg-white hover:bg-sky-100 transition rounded-xl px-4 py-2 shadow-lg cursor-pointer">
                                    <p className="text-sky-950 font-bold">
                                        Send a Message
                                    </p>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
