import { MessageCircle, User } from "lucide-react";
import { Follower } from "../../types";
import { Link } from "react-router";

export default function FollowerDisplay({ follower }: { follower: Follower }) {
    return (
        <div className="grid grid-cols-2 py-5 border-b border-slate-300">
            <div className="flex justify-center items-center">
                <p className="text-xl ">{follower.username}</p>
            </div>
            <div className="flex gap-4">
                <Link to={`/user/${follower.following_id}`}>
                    <div className="cursor-pointer bg-sky-500 hover:bg-sky-700 transition rounded-xl px-6 py-2 flex gap-4">
                        <User color="white" />
                        <p className="text-white">View Profile</p>
                    </div>
                </Link>

                <Link to={`/profile/messages/${follower.id}`}>
                    <div className="cursor-pointer bg-white hover:bg-sky-100 transition border border-sky-500 rounded-xl flex gap-4 px-6 py-2">
                        <MessageCircle className="text-sky-500" />
                        <p className="text-sky-500">Send Message</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
