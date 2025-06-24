import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../../components/context/UserContext";
import recentMessages from "../../data/recent_messages.json";
import DirectMessageDisplay from "../../components/profile/DirectMessageDisplay";
import DisplayMessage from "../../components/chatroom/DisplayMessage";
import TestMessages from "../../data/messages.json";
import SendMessage from "../../components/chatroom/SendMessage";
import {
    DbDirectMessage,
    DirectMessage,
    UserDmRead,
} from "../../types/directMessages";
import { fetchWithAuth } from "../../services/auth";
import { Follower, Message } from "../../types";
import NewMessagePopup from "../../components/profile/NewMessagePopup";
import { Socket } from "socket.io-client";
import { initSocket } from "../../components/socket";
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
    // Optimize this to only fetch when the send message is clicked
    const [following, setFollowing] = useState<Follower[]>([]);

    const [socket, setSocket] = useState<Socket | null>(null);

    const [userDmRead, setUserDmRead] = useState<UserDmRead | null>(null);
    const [otherUserDmRead, setOtherUserDmRead] = useState<UserDmRead | null>(
        null
    );
    const [dmJoined, setDmJoined] = useState(false);
    const [lastReadMessageId, setLastReadMessageId] = useState(0);

    const userDmReadRef = useRef(userDmRead);

    // This is supposed to update the value faster so it can be accessed not stale

    function updateDmRead(
        user_id: number,
        userDmReadArg: UserDmRead
    ): DbDirectMessage | null {
        if (currentChatMessages === null) return null;
        if (!socket) {
            return null;
        }
        if (!activeChatDetails) {
            return null;
        }
        let mostRecentReceivedMessage = null;
        // Iterate over the current chat messages to find the most recent one
        // where the receiver_id matches the id arg.
        // This is to check if it's been read
        for (let i = currentChatMessages.length - 1; i >= 0; i--) {
            const message = currentChatMessages[i];
            if (message.receiver_id == user_id) {
                mostRecentReceivedMessage = message;
                break;
            }
        }
        // User has not received any message for this chat, so no message to set read to true
        if (mostRecentReceivedMessage == null) {
            return null;
        }

        // Check if no message has been read or the most recently read one isn't updated
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

    // Load / create a dm thread based on optional userId param
    useEffect(() => {
        if (!userId) return;
        const fetchDataAndCreateThread = async () => {
            const response = await fetch(`${URL}/users/${userId}`);
            // Might want to handle edge case where provided user doesn't exist, but it's not a big deal
            if (response.ok) {
                const data = await response.json();
                createNewMessageThread(Number(userId), data.user.username);
            }
        };
        fetchDataAndCreateThread();
    }, [userId]);
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
        };

        const handleMessage = ({
            thread_id,
            message,
        }: {
            thread_id: number;
            message: DbDirectMessage;
        }) => {
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

        const handleMessageRead = (dmMessageRead: UserDmRead) => {
            // exit function because the event "dm message read" was trigged by this user
            // so, it doesn't need to display that this user read the message
            if (
                dmMessageRead.user_id == Number(user.userId) ||
                dmMessageRead.last_read_message_id == null
            ) {
                return;
            }
            // Program it so it sets a flag for a message showing a read icon. Possibly
            // need to add some code to remove the old read icon from other message
            setLastReadMessageId(dmMessageRead.last_read_message_id);
        };
        // Join dm only after socket connects
        if (socket.connected && activeChatDetails.threadId != null) {
            socket.emit("join dm", String(activeChatDetails.threadId));

            socket.once("joined dm", () => {
                setDmJoined(true);
            });
        }

        socket.on("dm message read", handleMessageRead);
        socket.on("dm message", handleMessage);
        return () => {
            socket.emit("leave room", String(activeChatDetails.threadId));
            socket.off("dm message", handleMessage);
            socket.off("connect", handleConnect);
        };
    }, [socket, activeChatDetails?.threadId]);

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

    // Use effect to load initial data
    useEffect(() => {
        if (!user.userId) return;

        const fetchData = async () => {
            const messagesResponse = await fetchWithAuth<{
                messages: DirectMessage[];
            }>(`dms/threads`, "GET");
            if (messagesResponse.success) {
                const fetchedMessages = messagesResponse.data.messages;
                setMessages(fetchedMessages);
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

    const createNewMessageThread = async (
        otherUserId: number,
        username: string
    ) => {
        setNewMessagePopupOpen(false);
        // Check if thread between users exists
        const response = await fetchWithAuth<{
            threadId: number;
            messages: DbDirectMessage[];
        }>(`dms/thread/${otherUserId}`, "GET");
        // Thread does exist, so populate local data with thread information
        if (response.success) {
            const { threadId, messages } = response.data;
            setCurrentChatMessages(messages);
            setActiveChatDetails({
                receiverId: otherUserId,
                receiverUsername: username,
                threadId: threadId,
            });
            // Thread does not exist, create thread
        } else {
            const response = await fetchWithAuth<{ threadId: number }>(
                `dms/thread/${otherUserId}`,
                "POST"
            );
            // Thread successfully created, populate local data with thread infromation
            if (response.success) {
                const { threadId } = response.data;
                setActiveChatDetails({
                    receiverId: otherUserId,
                    receiverUsername: username,
                    threadId: threadId,
                });
            } else {
                setActiveChatDetails({
                    receiverId: otherUserId,
                    receiverUsername: username,
                    threadId: null,
                });
            }
            // Set messages to empty, because a new thread will always have no messages
            setCurrentChatMessages([]);
        }
    };

    /**
     * Retrieves a list of messages when a direct message is opened and
     * populates the screen with the messages
     */
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
                threadId: threadId,
            });
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
                                threadId={message.threadId}
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
                            <div className="overflow-y-auto pr-2">
                                {currentChatMessages.map((message) => {
                                    return (
                                        <DisplayMessage
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
