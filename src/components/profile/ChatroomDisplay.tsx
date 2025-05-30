type ChatroomDisplayProps = {
    roomName: string;
    mentions: number;
    newMessages: number;
    totalMessages: number;
};

export default function ChatroomDisplay({
    roomName,
    mentions,
    newMessages,
    totalMessages,
}: ChatroomDisplayProps) {
    let baseClass =
        "border-sky-500 border rounded-lg px-4 py-2 cursor-pointer mb-2 hover:underline";
    if (mentions == 0 && newMessages == 0 && totalMessages == 0) {
        baseClass += " bg-sky-50";
    }
    return (
        <div className={baseClass}>
            <p className="text-lg font-bold text-sky-500 mb-1">{roomName}</p>
            <div className="text-sm space-y-1">
                <div>
                    <span className="font-medium">0</span> Mentions
                </div>
                <div>
                    <span className="font-medium">347</span> New Messages
                </div>
                <div>
                    <span className="font-medium">1047</span> Total Messages
                </div>
            </div>
        </div>
    );
}
