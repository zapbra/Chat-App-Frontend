import { Heart } from "lucide-react";
import { Message } from "../../types";
import { stringToReadableDate } from "../../utils/utils";
import EmojiDisplay from "./EmojiDisplay";
import { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import LikerList from "./LikerListPortal";

type DisplayMessageProps = {
    message: Message;
    isUserMessage: boolean;
    liked: boolean;
    toggleLikeMessage: (messageId: number) => void;
    toggleReactMessage: (messageId: number, emoji: string) => void;
};

export default function DisplayMessage({
    message,
    isUserMessage,
    liked,
    toggleLikeMessage,
    toggleReactMessage,
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

    const handleEmojiClick = (emojiData: any) => {
        toggleReactMessage(Number(message.id), emojiData.emoji);
        setShowEmojiPicker(false);
    };
    return (
        <div className={baseClass}>
            <div
                ref={pickerRef}
                className="bg-slate-50 px-6 py-2 rounded-2xl mb-2"
            >
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
                        <span className="text-slate-500 text-sm hover:underline cursor-pointer">
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
                        onLike={() => {}}
                        onDislike={() => {}}
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
                                onLike={() => {}}
                                onDislike={() => {}}
                            />
                        );
                    })}
            </div>
        </div>
    );
}
