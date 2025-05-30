import { stringToReadableDate } from "../../utils/utils";

type MessageDisplayProps = {
    username: string;
    message: string;
    isRead: boolean;
    link: string;
    sent_at: string;
    chatRoom?: string | null;
};

export default function MessageDisplay({
    username,
    message,
    isRead,
    link,
    sent_at,
    chatRoom,
}: MessageDisplayProps) {
    let baseClass =
        "border-sky-500 border rounded-lg px-4 py-2 cursor-pointer mb-2 hover:underline";

    if (isRead) {
        baseClass += " bg-sky-50";
    }

    return (
        <div className={baseClass}>
            {chatRoom && (
                <>
                    <p className="bg-emerald-200 text-emerald-800 inline px-2 py-1 rounded ">
                        {chatRoom}
                    </p>
                    <div className="mb-1"></div>
                </>
            )}
            <div className="flex justify-between ">
                <p className="text-lg font-bold text-sky-500 mb-1">
                    {username}
                </p>
                {!isRead && (
                    <div className="div bg-sky-500 w-2 h-2 rounded-full"></div>
                )}
            </div>

            <p className="text-xs  mb-2">{message}</p>

            <p className="text-right text-xs text-slate-500">
                {stringToReadableDate(sent_at)}
            </p>
        </div>
    );
}
