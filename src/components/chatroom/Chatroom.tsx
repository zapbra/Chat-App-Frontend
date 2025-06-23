import React, {
    useState,
    useEffect,
    useContext,
    useRef,
    useCallback,
} from "react";
import { getSocket, initSocket } from "../socket";
import SendMessage from "./SendMessage";
import { DbReaction, Message, ReactionMap } from "../../types";
import { useParams } from "react-router";
import messages from "../../data/messages.json";
import DisplayMessage from "./DisplayMessage";
import { UserContext } from "../context/UserContext";
import { Link } from "react-router";
import ChatroomSidebar from "./ChatroomSidebar";
import {
    sortReactions,
    toggleMessageLike,
    toggleReaction,
} from "../../services/messages";
import { Socket } from "socket.io-client";
import Reply from "./Reply";

const typedMessages: Message[] = messages;

const URL = import.meta.env.VITE_API_BASE_URL;

const LIMIT = 30;

export default function Chatroom() {
    const { user } = useContext(UserContext);
    const params = useParams();
    const roomId = Number(params.roomId!);
    const [roomName, setRoomName] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesRef = useRef(messages);
    const chatRef = useRef<HTMLDivElement>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const shouldScrollToBottom = useRef(false);
    const lastBeforeIdRef = useRef<number | null>(null); // prevent repeat fetch
    const [hasMore, setHasMore] = useState(true);
    const [members, setMembers] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [replying, setReplying] = useState(false);
    const [replyMessage, setReplyMessage] = useState<Message | null>(null);

    useEffect(() => {
        const s = getSocket();
        if (s) {
            setSocket(s);
        } else {
            const interval = setInterval(() => {
                const maybeSocket = getSocket();
                if (maybeSocket) {
                    setSocket(maybeSocket);
                    clearInterval(interval);
                }
            }, 100); // poll every 100ms
            return () => clearInterval(interval);
        }
    }, []);

    const sendChatMessage = (message: string) => {
        const socket = getSocket();
        if (!socket) {
            // Might want to update this to handle errors more gracefully?
            console.error("Socket not initialized.");
            return;
        }
        // send message to chatroom and store in db
        socket.emit("chat message", {
            roomId: String(roomId),
            senderId: user.userId,
            username: user.username,
            message,
            replyId: replyMessage != null ? replyMessage.id : null,
        });
        // reset reply state to hide reply section
        if (replyMessage != null) {
            setReplyMessage(null);
            setReplying(false);
        }
    };

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // Fetch messages with proper error handling
    const fetchMessages = useCallback(
        async (roomId: number, oldestMsgId?: number, limit: number = LIMIT) => {
            if (!hasMore && oldestMsgId) return;
            if (oldestMsgId && lastBeforeIdRef.current === oldestMsgId) return;

            try {
                const url = oldestMsgId
                    ? `${URL}/rooms/${roomId}?beforeId=${oldestMsgId}&limit=${limit}`
                    : `${URL}/rooms/${roomId}`;

                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to fetch messages");

                const data = await response.json();
                if (data.messages.length === 0) {
                    setHasMore(false);
                    return;
                }

                const messages = data.messages.map((message) => {
                    if (!message.reactions) return message;
                    const reactions = sortReactions(
                        message.reactions,
                        user.username
                    );
                    return {
                        ...message,
                        reactions,
                    };
                });

                if (oldestMsgId) {
                    lastBeforeIdRef.current = oldestMsgId;
                    const container = chatRef.current;
                    const prevScrollHeight = container?.scrollHeight || 0;

                    setMessages((prev) => {
                        setTimeout(() => {
                            if (container) {
                                const newScrollHeight = container.scrollHeight;
                                container.scrollTop =
                                    newScrollHeight - prevScrollHeight;
                            }
                        }, 0);
                        return [...messages, ...prev];
                    });
                } else {
                    shouldScrollToBottom.current = true;
                    setMessages(messages);
                }
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load messages"
                );
                console.error(err);
            }
        },
        [hasMore]
    );

    // Socket connection handlers
    useEffect(() => {
        if (!user.loggedIn) return;

        const token = localStorage.getItem("accessToken");
        if (!token) return;
        if (!socket) return;
        const loadInitialData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [messagesRes, membersRes] = await Promise.all([
                    fetch(`${URL}/rooms/${roomId}`),
                    fetch(`${URL}/rooms/${roomId}/members`),
                ]);

                if (!messagesRes.ok) throw new Error("Failed to load messages");
                if (!membersRes.ok) throw new Error("Failed to load members");

                const [messagesData, membersData] = await Promise.all([
                    messagesRes.json(),
                    membersRes.json(),
                ]);
                setRoomName(messagesData.room.name);
                const messages = messagesData.messages.map((message) => {
                    if (!message.reactions) return message;
                    const reactions = sortReactions(
                        message.reactions,
                        user.username
                    );
                    return { ...message, reactions };
                });

                console.log("messages");
                console.log(messages);
                setMessages(messages);
                setMembers(membersData.members);
                shouldScrollToBottom.current = true;
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Initialization failed"
                );
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const handleMessage = (msg: Message) => {
            console.log("handling message");
            console.log("msg");
            console.log(msg);
            setMessages((prev) => {
                shouldScrollToBottom.current = true;
                return [...prev, msg];
            });
        };

        const handleMemberUpdate = (newMembers: string[]) => {
            setMembers(newMembers);
        };

        const handleConnect = () => {
            console.log("🔁 Connected — joining room", roomId);
            socket.emit("join room", String(roomId));
        };

        loadInitialData();

        socket.on("connect", handleConnect);

        // Join room only after socket connects
        if (socket.connected) {
            handleConnect();
        }

        socket.on("chat message", handleMessage);
        socket.on("members:updated", handleMemberUpdate);

        const handleBeforeUnload = () => {
            // Prevent leave room on refresh
            console.log("Preventing leave room on refresh");
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            if (!window.location.href.includes(`/chatroom/${roomId}`)) {
                console.log("🏃 Leaving room", roomId);
                socket.emit("leave room", String(roomId));
            }
            socket.off("chat message", handleMessage);
            socket.off("members:updated", handleMemberUpdate);
            socket.off("connect", handleConnect);
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [roomId, user, socket]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (!shouldScrollToBottom.current || !chatRef.current) return;
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
        shouldScrollToBottom.current = false;
    }, [messages]);

    // Infinite scroll handler
    useEffect(() => {
        const container = chatRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (container.scrollTop === 0 && messages.length > 0) {
                console.log("about to fetch messages... id...");
                console.log(messages[0].id);
                fetchMessages(roomId, Number(messages[0].id));
            }
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [messages, roomId, fetchMessages]);

    const handleToggleLike = async (messageId: number) => {
        const response = await toggleMessageLike(messageId);
        // Successfully liked / unliked message in the backend
        if (response.success) {
            setMessages((prevMessages) => {
                return prevMessages.map((message) => {
                    if (Number(message.id) != messageId) return message;

                    let updatedLikes = message.likes ? [...message.likes] : [];
                    let updatedCount = Number(message.likes_count);

                    // Actions to take if message was liked
                    if (response.data.liked) {
                        // add message to messages list
                        updatedLikes.push({
                            id: response.data.likeId,
                            username: user.username,
                        });
                        // update like count
                        updatedCount = Number(message.likes_count) + 1;

                        // Actions to take if the message was unliked
                    } else {
                        if (message.likes) {
                            // Remove the unliked message from list
                            updatedLikes = updatedLikes.filter(
                                (like) => like.username != user.username
                            );
                        }
                        // update like count
                        updatedCount = Number(message.likes_count) - 1;
                    }
                    return {
                        ...message,
                        likes: updatedLikes,
                        likes_count: String(updatedCount),
                    };
                });
            });
        }
    };

    const handleToggleReact = async (messageId: number, emoji: string) => {
        const response = await toggleReaction(messageId, emoji);

        if (response.success) {
            setMessages((prevMessages) =>
                prevMessages.map((message) => {
                    if (Number(message.id) !== messageId) return message;

                    const currentReactions = message.reactions ?? {};
                    const existingReaction = currentReactions[emoji] ?? {
                        count: 0,
                        users: [],
                        userReacted: false,
                    };

                    let updatedReaction = { ...existingReaction };

                    if (response.data.reactedTo) {
                        updatedReaction.count += 1;
                        updatedReaction.userReacted = true;
                        updatedReaction.users = [
                            ...updatedReaction.users,
                            user.username,
                        ];
                    } else {
                        updatedReaction.count -= 1;
                        updatedReaction.userReacted = false;
                        updatedReaction.users = updatedReaction.users.filter(
                            (u) => u !== user.username
                        );
                    }

                    // Remove emoji if no more reactions
                    const updatedReactions: ReactionMap = {
                        ...currentReactions,
                        [emoji]: updatedReaction,
                    };

                    if (updatedReaction.count <= 0) {
                        delete updatedReactions[emoji];
                    }

                    return {
                        ...message,
                        reactions:
                            Object.keys(updatedReactions).length > 0
                                ? updatedReactions
                                : null,
                    };
                })
            );
        }
    };

    const cancelReply = () => {
        setReplying(false);
        setReplyMessage(null);
    };

    const replyToMessage = (msg: Message) => {
        setReplying(true);
        setReplyMessage(msg);
    };

    if (loading)
        return <div className="loading-indicator">Loading chatroom...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;

    return (
        <div className=" max-w-[1440px] mx-auto px-6">
            <div className="flex justify-between mb-4">
                <Link to="/">
                    <button className="bg-sky-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-sky-700 transition mb-6">
                        Back to Chat Rooms
                    </button>
                </Link>
                <h1 className="text-6xl">{roomName}</h1>
                <div></div>
            </div>
            <div className="flex w-full justify-center">
                {/** Main Chat */}
                <div className="max-w-[800px] w-full  bg-sky-800 rounded-tl-lg rounded-bl-lg py-3 ">
                    <div
                        className="h-[75vh] overflow-y-auto px-10"
                        ref={chatRef}
                    >
                        {messages.map((message) => {
                            return (
                                <DisplayMessage
                                    key={message.id}
                                    message={message}
                                    isUserMessage={
                                        message.sender_id == user.userId
                                    }
                                    // Update SQL query to check if user liked message in future for performance
                                    liked={
                                        message.likes?.some(
                                            (like) =>
                                                like.username == user.username
                                        ) ?? false
                                    }
                                    toggleLikeMessage={handleToggleLike}
                                    toggleReactMessage={handleToggleReact}
                                    replyToMessage={replyToMessage}
                                />
                            );
                        })}
                    </div>
                    <div className="px-10">
                        {user.loggedIn ? (
                            <>
                                {replying && replyMessage != null && (
                                    <>
                                        <Reply
                                            username={replyMessage.username}
                                            message={replyMessage.message}
                                            cancelReply={cancelReply}
                                        />
                                    </>
                                )}
                                <SendMessage
                                    sendChatMessage={sendChatMessage}
                                />
                            </>
                        ) : (
                            <div className="flex justify-end bg-sky-500 rounded-lg px-2 py-2">
                                <Link to="/sign-up">
                                    <button className="bg-white hover:bg-sky-50 transition text-sky-500 text-lg px-4 py-2 rounded-lg cursor-pointer">
                                        Sign up to send messages
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                    {/* <p>{connected ? "true" : "false"}</p> */}
                </div>

                <ChatroomSidebar
                    chatterCount={members.length}
                    chatters={members}
                />
                {/** End of main chat */}
            </div>
        </div>
    );
}
