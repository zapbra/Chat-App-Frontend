import { X } from "lucide-react";

export default function Reply({
    username,
    message,
    cancelReply,
}: {
    username: string;
    message: string;
    cancelReply: () => void;
}) {
    return (
        <div className="bg-sky-100 rounded-2xl mb-2 py-1 px-3">
            <div className="flex justify-between items-center">
                <p className="text-sm mb-1">Replying To</p>

                <X
                    onClick={cancelReply}
                    size={20}
                    className="text-slate-500 hover:text-slate-900 transition cursor-pointer"
                />
            </div>

            <div className="ml-2">
                <p className="text-emerald-300 font-bold">{username}</p>
                <p className="text-slate-500">{message}</p>
            </div>
        </div>
    );
}
