import React, { useState, useEffect, useContext, useRef } from "react";
import { socket } from "../socket";
import SendMessage from "./SendMessage";
import { Message } from "../../types";
import { useParams } from "react-router";
import messages from "../../data/messages.json";
import DisplayMessage from "./DisplayMessage";
import { UserContext } from "../context/UserContext";
import { Link } from "react-router";

const typedMessages: Message[] = messages;

const URL = import.meta.env.VITE_API_BASE_URL;

const LIMIT = 30;

export default function Chatroom() {
  const { user } = useContext(UserContext);
  const params = useParams();
  const roomId = Number(params.roomId!);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef(messages);
  const [connected, setConnected] = useState(socket.connected);
  const chatRef = useRef<HTMLDivElement>(null);
  const shouldScrollToBottom = useRef(false);
  const lastBeforeIdRef = useRef<number | null>(null); // prevent repeat fetch
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  /**
   * Fetches a batch of older messages, typically on page scroll
   * @param roomId Room id to send the message to
   * @param oldestMsgId id of oldest message to handling fetching older messages
   * @param limit amount of messages to fetch at a time
   */
  const fetchMessages = async (
    roomId: number,
    oldestMsgId: number,
    limit: number = LIMIT
  ) => {
    if (!hasMore) return;
    if (lastBeforeIdRef.current === oldestMsgId) return; // avoid refetching
    const container = chatRef.current;
    if (!container) return;
    const prevScrollHeight = container.scrollHeight;

    const response = await fetch(
      `${URL}/rooms/${roomId}?beforeId=${oldestMsgId}&limit=${limit}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    // set messages if retrieved with no errors
    if (response.ok) {
      const data = await response.json();
      console.log("fetched data");
      console.log(data);
      if (data.messages.length === 0) {
        setHasMore(false);
        return;
      }

      lastBeforeIdRef.current = oldestMsgId;

      setMessages((prev) => {
        setTimeout(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - prevScrollHeight;
        }, 0);
        return [...data.messages, ...prev];
      });
    } else {
      // show an error message or popup if failed to get room
    }
  };

  // Handles connect and disconnect
  useEffect(() => {
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  // Handles joining/leaving the room, receiving chat messages in this room and fetches the initial messages.
  useEffect(() => {
    const fetchInitialMessages = async () => {
      const response = await fetch(`${URL}/rooms/${roomId}`);

      // set messages if retrieved with no errors
      if (response.ok) {
        const data = await response.json();
        shouldScrollToBottom.current = true;
        setMessages(data.messages);
      } else {
        // show an error message or popup if failed to get room
      }
    };

    fetchInitialMessages();

    const handleMessage = (msg: Message) => {
      setMessages((prev) => {
        shouldScrollToBottom.current = true;
        return [...prev, msg];
      });
    };

    socket.emit("join room", roomId);
    socket.on(`chat message`, handleMessage);

    return () => {
      socket.emit("leave room", roomId);
      socket.off(`chat message`, handleMessage);
    };
  }, []);

  // Handles scrollbar scrolling to bottom on new message being sent.
  // Only scrolls to the bottom when a new message is sent by user, flags to prevent it scrolling to bottom when new
  // messages are fetched
  useEffect(() => {
    const container = chatRef.current;
    if (!container) return;

    if (shouldScrollToBottom.current) {
      container.scrollTop = container.scrollHeight;
      shouldScrollToBottom.current = false;
    }
  }, [messages]);

  // Handles fetching new messages when user scrolls to the top of the page
  useEffect(() => {
    const container = chatRef.current;
    if (!container) return;
    const handleScroll = () => {
      const isTop = container.scrollTop === 0;

      if (isTop) {
        fetchMessages(roomId, Number(messagesRef.current[0].id));
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className=" max-w-[1440px] mx-auto">
      <Link to="/">
        <button className="bg-sky-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-sky-700 transition mb-6">
          Back to Chat Rooms
        </button>
      </Link>
      <div className="max-w-[800px] mx-auto bg-sky-800 rounded-lg  py-3 ">
        <div className="h-[75vh] overflow-y-auto px-10" ref={chatRef}>
          {messages.map((message) => {
            return (
              <DisplayMessage
                message={message}
                isUserMessage={message.sender_id == user.userId}
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
    </div>
  );
}
