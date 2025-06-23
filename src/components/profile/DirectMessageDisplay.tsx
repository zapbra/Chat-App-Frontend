import { stringToReadableDate } from "../../utils/utils";

type DirectMessageDisplayProps = {
    username: string;
    message: string;
    isRead: boolean | null;
    sentAt: string;
    otherUserId: number;
    threadId: number;
    openDirectMessage: (
        otherUserId: number,
        username: string,
        threadId: number
    ) => void;
};

export default function DirectMessageDisplay({
    username,
    message,
    isRead,
    sentAt,
    otherUserId,
    threadId,
    openDirectMessage,
}: DirectMessageDisplayProps) {
    let baseStyle =
        "px-3 py-2 flex justify-between w-full border-b  border-slate-500 cursor-pointer group";
    if (isRead) {
        baseStyle += " bg-white";
    } else {
        baseStyle += " bg-sky-50";
    }

    return (
        <div
            className={`${baseStyle} `}
            onClick={() => openDirectMessage(otherUserId, username, threadId)}
        >
            {/* Left section */}
            <div className="flex flex-col justify-between">
                <h3 className="group-hover:underline text-xl">{username}</h3>
                <p className="text-base text-slate-500 truncate">{message}</p>
            </div>

            {/* Right section */}
            <div className="flex flex-col justify-between items-end">
                {!isRead && (
                    <div className="bg-sky-500 w-4 h-4 rounded-full mb-1" />
                )}
                <p className="text-sm text-slate-500 whitespace-nowrap">
                    {stringToReadableDate(sentAt)}
                </p>
            </div>
        </div>
    );
}
