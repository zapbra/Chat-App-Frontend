import { useState } from "react";
import { SendHorizonal } from "lucide-react";

export default function SendMessage({
    sendChatMessage,
}: {
    sendChatMessage: (message: string) => void;
}) {
    const [message, setMessage] = useState("");
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendChatMessage(message);
        setMessage("");
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="div bg-white flex w-full rounded-lg">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="bg-white  px-2 py-1 w-full rounded-lg py-2"
                />
                <button type="submit" className="px-2 cursor-pointer">
                    <SendHorizonal className="text-slate-500 hover:text-slate-900 transition" />
                </button>
            </div>
        </form>
    );
}
