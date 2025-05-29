import { useState } from "react";
import LikerList from "./LikerListPortal";
import LikerListPortal from "./LikerListPortal";

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
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    let mainClass =
        "cursor-pointer rounded-4xl px-3 py-1 inline-flex items-center gap-2 relative";
    if (liked) {
        mainClass += " bg-emerald-200/50";
    } else {
        mainClass += " bg-slate-50/50";
    }
    return (
        <div
            className={mainClass}
            onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltipPosition({ x: rect.left, y: rect.top + rect.height });
                setShowLikers(true);
            }}
            onMouseLeave={() => setShowLikers(false)}
        >
            <p>{icon}</p>
            <p className="text-sm ">{likeCount}</p>
            {showLikers && (
                <LikerListPortal
                    likers={likedBy}
                    x={tooltipPosition.x}
                    y={tooltipPosition.y}
                />
            )}
        </div>
    );
}
