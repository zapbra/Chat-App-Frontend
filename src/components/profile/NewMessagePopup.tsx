import { X } from "lucide-react";
import { Follower } from "../../types";
import NewMessageUserLink from "./NewMessageUserLink";

export default function NewMessagePopup({
    following,
    createNewMessageThread,
}: {
    following: Follower[];
    createNewMessageThread: (userId: number, username: string) => void;
}) {
    return (
        <div className="max-w-[75%] bg-white w-full mx-auto rounded-xl absolute top-[33%] -translate-y-1/2 left-1/2 -translate-x-1/2">
            <div className="flex justify-between items-center">
                <div className="pl-2"></div>
                <h2 className="text-xl font-bold text-center py-2">
                    New Message
                </h2>
                <div className="pr-2">
                    <X className="text-slate-500 hover:text-sky-950 transition cursor-pointer" />
                </div>
            </div>

            <div className="w-full bg-slate-300 h-[1px]"></div>
            <div className="flex gap-4 px-4 py-2">
                <p className="font-bold">To: </p>
                <input type="text" placeholder="Search..." className="w-full" />
            </div>
            <div className="w-full bg-slate-300 h-[1px]"></div>
            <div className="px-4 py-2">
                <p className="font-bold mb-2">Suggested</p>
            </div>
            <div className="px-4 pb-4">
                {following.map((follower) => {
                    return (
                        <NewMessageUserLink
                            createNewMessageThread={createNewMessageThread}
                            username={follower.username}
                            userId={follower.following_id}
                        />
                    );
                })}
            </div>
        </div>
    );
}
