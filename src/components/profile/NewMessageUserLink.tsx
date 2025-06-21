import { Link } from "react-router";

export default function NewMessageUserLink({
    username,
    userId,
    createNewMessageThread,
}: {
    username: string;
    userId: number;
    createNewMessageThread: (userId: number, username: string) => void;
}) {
    return (
        <div
            onClick={() => createNewMessageThread(userId, username)}
            className="cursor-pointer hover:px-4 transition-[padding] px-1 py-2 border-b border-b-slate-300 bg-white hover:bg-sky-50 transition"
        >
            <p className="">{username}</p>
        </div>
    );
}
