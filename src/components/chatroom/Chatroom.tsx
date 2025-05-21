import React, {
    useState,
    useEffect,
    useContext,
    useRef,
    useCallback,
} from "react";
import { useSocket } from "../socket";
import SendMessage from "./SendMessage";
import { Message } from "../../types";
import { useParams } from "react-router";
import messages from "../../data/messages.json";
import DisplayMessage from "./DisplayMessage";
import { UserContext } from "../context/UserContext";
import { Link } from "react-router";
import ChatroomSidebar from "./ChatroomSidebar";

const typedMessages: Message[] = messages;

const URL = import.meta.env.VITE_API_BASE_URL;

const LIMIT = 30;

export default function Chatroom() {
    const { user } = useContext(UserContext);
    const params = useParams();
    const roomId = Number(params.roomId!);
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesRef = useRef(messages);
    const socket = useSocket();
    const [connected, setConnected] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);
    const shouldScrollToBottom = useRef(false);
    const lastBeforeIdRef = useRef<number | null>(null); // prevent repeat fetch
    const [hasMore, setHasMore] = useState(true);
    const [members, setMembers] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                        return [...data.messages, ...prev];
                    });
                } else {
                    shouldScrollToBottom.current = true;
                    setMessages(data.messages);
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
        if (!socket) return;

        const handleConnect = () => setConnected(true);
        const handleDisconnect = () => setConnected(false);

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
        };
    }, [socket]);

    // Room initialization and cleanup
    useEffect(() => {
        if (!socket || !user) return;
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

                setMessages(messagesData.messages);
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
            setMessages((prev) => {
                shouldScrollToBottom.current = true;
                return [...prev, msg];
            });
        };

        const handleMemberUpdate = (newMembers: string[]) => {
            setMembers(newMembers);
        };

        loadInitialData();
        socket.emit("join room", roomId);
        socket.on("chat message", handleMessage);
        socket.on("members:updated", handleMemberUpdate);

        return () => {
            socket.emit("leave room", roomId);
            socket.off("chat message", handleMessage);
            socket.off("members:updated", handleMemberUpdate);
        };
    }, [socket, roomId, user]);

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
                fetchMessages(roomId, Number(messages[0].id));
            }
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [messages, roomId, fetchMessages]);

    if (loading)
        return <div className="loading-indicator">Loading chatroom...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;

    return (
        <div className=" max-w-[1440px] mx-auto px-6">
            <Link to="/">
                <button className="bg-sky-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-sky-700 transition mb-6">
                    Back to Chat Rooms
                </button>
            </Link>
            <div className="flex w-full justify-center">
                {/** Main Chat */}
                <div className="max-w-[800px]  bg-sky-800 rounded-tl-lg rounded-bl-lg py-3 ">
                    <div
                        className="h-[75vh] overflow-y-auto px-10"
                        ref={chatRef}
                    >
                        {messages.map((message) => {
                            return (
                                <DisplayMessage
                                    message={message}
                                    isUserMessage={
                                        message.sender_id == user.userId
                                    }
                                />
                            );
                        })}
                    </div>
                    <div className="px-10">
                        {user.loggedIn ? (
                            <SendMessage roomId={roomId} />
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
