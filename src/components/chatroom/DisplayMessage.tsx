import { Message } from "../../types";
import { stringToReadableDate } from "../../utils/utils";
import EmojiDisplay from "./EmojiDisplay";
import { useEffect, useRef, useState } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

type DisplayMessageProps = {
    message: Message;
    isUserMessage: boolean;
    liked: boolean;
    toggleLikeMessage: (messageId: number) => void;
    toggleReactMessage: (messageId: number, emoji: string) => void;
    replyToMessage: (msg: Message) => void;
    isLastRead: boolean | null;
};

export default function DisplayMessage({
    message,
    isUserMessage,
    liked,
    toggleLikeMessage,
    toggleReactMessage,
    replyToMessage,
    isLastRead,
}: DisplayMessageProps) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    let baseClass = " w-fit mb-2 relative";
    const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });
    const pickerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLSpanElement>(null);

    let usernameClass = "font-bold";
    if (isUserMessage) {
        baseClass += " ml-auto";
        usernameClass += " text-emerald-500";
    } else {
        usernameClass += " text-cyan-500";
    }

    const toggleEmojiPicker = () => {
        if (!showEmojiPicker && pickerRef.current) {
            const rect = pickerRef.current.getBoundingClientRect();
            let top = rect.top + window.scrollY - 450;
            if (top < 0) {
                top = rect.bottom + 8;
            }
            setPickerPos({
                top: top,
                left: rect.left,
            });
        }

        setShowEmojiPicker((prev) => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(event.target as Node) &&
                !triggerRef.current?.contains(event.target as Node)
            ) {
                setShowEmojiPicker(false);
            }
        };

        window.addEventListener("click", handleClickOutside);

        return () => {
            window.removeEventListener("click", handleClickOutside);
        };
    }, [showEmojiPicker]);

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        toggleReactMessage(Number(message.id), emojiData.emoji);
        setShowEmojiPicker(false);
    };
    return (
        <div className={baseClass}>
            <div
                ref={pickerRef}
                className="bg-slate-50 px-6 py-2 rounded-2xl mb-2"
            >
                {message.replying_to_id != null && (
                    <div className="bg-slate-200 rounded px-2 py-1 mb-2">
                        <p className="text-slate-400">Replying to</p>
                        <p className="text-sky-500 font-bold">
                            {message.replying_to_username}
                        </p>
                        <p className="text-slate-400">
                            {message.replying_to_message}
                        </p>
                    </div>
                )}
                {showEmojiPicker && (
                    <div
                        className="fixed z-50 bottom-full"
                        style={{
                            top: pickerPos.top,
                            left: pickerPos.left,
                        }}
                    >
                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                )}
                <p className={usernameClass}>{message.username}</p>
                <p className="mb-2">{message.message}</p>

                <div className="flex justify-between items-end gap-8">
                    <div>
                        {liked ? (
                            <span
                                onClick={() =>
                                    toggleLikeMessage(Number(message.id))
                                }
                                className="text-slate-500 mr-2 text-sm hover:underline cursor-pointer"
                            >
                                Unlike
                            </span>
                        ) : (
                            <span
                                onClick={() =>
                                    toggleLikeMessage(Number(message.id))
                                }
                                className="text-slate-500 mr-2 text-sm hover:underline cursor-pointer"
                            >
                                Like
                            </span>
                        )}

                        <span
                            onClick={toggleEmojiPicker}
                            ref={triggerRef}
                            className="text-slate-500 mr-2 text-sm hover:underline cursor-pointer"
                        >
                            React
                        </span>
                        <span
                            onClick={() => replyToMessage(message)}
                            className="text-slate-500 text-sm hover:underline cursor-pointer"
                        >
                            Reply
                        </span>
                    </div>
                    <p className="text-slate-400 ml-auto text-xs w-fit">
                        {stringToReadableDate(
                            message.updated_at
                                ? message.updated_at
                                : message.created_at
                        )}
                    </p>
                </div>
            </div>
            <div className="mb-4 flex gap-2 flex-wrap">
                {liked && (
                    <EmojiDisplay
                        icon="❤️"
                        likeCount={Number(message.likes_count)}
                        liked={liked}
                        likedBy={
                            message.likes?.map((like) => like.username) ?? []
                        }
                    />
                )}
                {message.reactions &&
                    Object.entries(message.reactions).map(([key, value]) => {
                        return (
                            <EmojiDisplay
                                icon={key}
                                likeCount={value.count}
                                liked={value.userReacted}
                                likedBy={value.users}
                            />
                        );
                    })}

                {isLastRead && <p className="text-slate-300">Read</p>}
            </div>
        </div>
    );
}
