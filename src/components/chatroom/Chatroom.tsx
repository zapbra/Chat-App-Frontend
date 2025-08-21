import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { getSocket, connectSocket } from "../socket";
import SendMessage from "./SendMessage";
import { Message, ReactionMap } from "../../types";
import { useParams } from "react-router";
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [replying, setReplying] = useState(false);
    const [replyMessage, setReplyMessage] = useState<Message | null>(null);

    useEffect(() => {
        setSocket(getSocket());
    }, []);

    useEffect(() => {
        if (!user.loggedIn) return;
        const s = getSocket();
        if (!s.connected) {
            const token = localStorage.getItem("accessToken");
            if (token) {
                connectSocket({
                    username: user.username,
                    userId: user.userId,
                    token,
                });
            }
        }
    }, [user.loggedIn, user.username, user.userId]);

    const sendChatMessage = (message: string) => {
        console.log("sending message");
        const socket = getSocket();
        if (!socket.connected) {
            const token = localStorage.getItem("accessToken");
            if (token)
                connectSocket({
                    username: user.username,
                    userId: user.userId,
                    token,
                });
            console.warn("Socket not connected yet; message dropped"); // or queue it yourself
            return;
        }
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

    const fetchMessages = useCallback(
        async (roomId: number, oldestMsgId?: number, limit: number = LIMIT) => {
            if (!hasMore && oldestMsgId) return;
            if (oldestMsgId && lastBeforeIdRef.current === oldestMsgId) return;

            const url = oldestMsgId
                ? `${URL}/rooms/${roomId}?beforeId=${oldestMsgId}&limit=${limit}`
                : `${URL}/rooms/${roomId}`;

            try {
                const token = localStorage.getItem("accessToken");
                const response = await fetch(url, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!response.ok) throw new Error("Failed to fetch messages");

                const data = await response.json();

                if (!oldestMsgId) {
                    setRoomName(data.room?.name ?? "");
                }

                if (!data.messages || data.messages.length === 0) {
                    if (oldestMsgId) setHasMore(false);
                    return;
                }

                const mapped: Message[] = data.messages.map((m: any) => {
                    if (!m.reactions) return m;
                    const reactions = sortReactions(m.reactions, user.username);
                    return { ...m, reactions };
                });

                console.log("messages from db..");
                console.log(mapped);

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
                        return [...mapped, ...prev];
                    });
                } else {
                    shouldScrollToBottom.current = true;
                    setMessages(mapped);
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
        [hasMore, user.username]
    );

    // Initial data load — DO NOT early return for auth/socket
    useEffect(() => {
        (async () => {
            setLoading(true);
            setError(null);
            try {
                await Promise.all([
                    fetchMessages(roomId),
                    (async () => {
                        // members endpoint may require auth; guard it
                        if (user.loggedIn) {
                            const token = localStorage.getItem("accessToken");
                            const membersRes = await fetch(
                                `${URL}/rooms/${roomId}/members`,
                                {
                                    headers: token
                                        ? { Authorization: `Bearer ${token}` }
                                        : {},
                                }
                            );
                            if (membersRes.ok) {
                                const md = await membersRes.json();
                                setMembers(md.members || []);
                            } else {
                                setMembers([]);
                            }
                        } else {
                            setMembers([]);
                        }
                    })(),
                ]);
            } finally {
                setLoading(false);
            }
        })();
    }, [roomId, user.loggedIn, fetchMessages]);

    // Socket room join only when socket is ready AND (optionally) user is logged in
    useEffect(() => {
        if (!socket) return;

        const handleMessage = (msg: Message) => {
            shouldScrollToBottom.current = true;
            setMessages((prev) => [...prev, msg]);
        };

        const handleMemberUpdate = (newMembers: string[]) =>
            setMembers(newMembers);

        const join = () => {
            console.log("🔁 Connected — joining room", roomId);
            socket.emit("join room", String(roomId));
        };

        socket.on("connect", join);
        if (socket.connected) join();

        socket.on("chat message", handleMessage);
        socket.on("members:updated", handleMemberUpdate);

        return () => {
            // leave room only when navigating away from this room
            socket.emit("leave room", String(roomId));
            socket.off("connect", join);
            socket.off("chat message", handleMessage);
            socket.off("members:updated", handleMemberUpdate);
        };
    }, [socket, roomId]);

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

                    const updatedReaction = { ...existingReaction };

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
                                    isLastRead={null}
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
