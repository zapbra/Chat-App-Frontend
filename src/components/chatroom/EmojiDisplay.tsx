import { useState } from "react";
import LikerList from "./LikerList";

type EmojiDisplayProps = {
    icon: string;
    likeCount: number;
    liked: boolean;
    likedBy: string[];
    onLike: () => void;
    onDislike: () => void;
};

export default function EmojiDisplay({
    icon,
    likeCount,
    liked,
    likedBy,
    onLike,
    onDislike,
}: EmojiDisplayProps) {
    const [showLikers, setShowLikers] = useState(false);

    return (
        <div
            className="bg-slate-50/50 cursor-pointer rounded-4xl px-3 py-1 inline-flex items-center gap-2 relative"
            onMouseEnter={() => setShowLikers(true)}
            onMouseLeave={() => setShowLikers(false)}
        >
            <p>{icon}</p>
            <p className="text-sm ">{likeCount}</p>
            {showLikers && (
                <LikerList
                    likers={[
                        "Frank",
                        "Angela",
                        "Antonio",
                        "Frank",
                        "Angela",
                        "Antonio",
                        "Frank",
                        "Angela",
                        "Antonio",
                        "Frank",
                        "Angela",
                        "Antonio",
                        "Frank",
                        "Angela",
                        "Antonio",
                        "Frank",
                        "Angela",
                        "Antonio",
                        "Frank",
                        "Angela",
                        "Antonio",
                    ]}
                />
            )}
        </div>
    );
}
