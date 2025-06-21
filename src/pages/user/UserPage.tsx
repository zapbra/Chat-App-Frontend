import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../components/context/UserContext";
import { MessageCircle, User } from "lucide-react";
import { useParams } from "react-router";
import { DbUser } from "../../types";
import { fetchWithAuth } from "../../services/auth";
import { toggleFollowUser } from "../../services/followers";
const URL = import.meta.env.VITE_API_BASE_URL;

export default function UserPage() {
    const { user } = useContext(UserContext);
    const { userId } = useParams();
    const [pageUser, setPageUser] = useState<DbUser | null>(null);
    const [followerCount, setFollowerCount] = useState<number | null>(null);
    const [followingCount, setFollowingCount] = useState<number | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    useEffect(() => {
        const fetchUserData = async () => {
            const response = await fetch(`${URL}/users/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setPageUser(data.user);
            }
            const followingResponse = await fetchWithAuth<{
                following: boolean;
            }>(`followers/${userId}/is-following`, "GET");

            if (followingResponse.success) {
                setIsFollowing(followingResponse.data.following);
            }
        };
        fetchUserData();
    }, []);
    return (
        <div className="max-w-[1440px] mx-auto flex justify-center">
            {/** Profile Top Section */}
            <div className="flex justify-center">
                <div className="mb-12 ">
                    <h1 className="text-2xl mb-6">{pageUser?.username}</h1>

                    <div className="flex gap-6 mb-6">
                        <p className="text-xl">{followerCount} Followers</p>
                        <div className="text-xl">
                            {followingCount} Following
                        </div>
                    </div>

                    <p className="mb-6">
                        <span className="text-slate-500">Followed by</span> Jane
                        Doe, Jon Blow & 17 others
                    </p>
                    <div className="flex gap-6">
                        <div
                            onClick={async () => {
                                const response = await toggleFollowUser(
                                    Number(userId)
                                );
                                if (response.success) {
                                    setIsFollowing(response.data.following);
                                }
                            }}
                            className="bg-white border-2 border-sky-500 hover:bg-sky-100 inline-flex gap-4 rounded-lg px-4 py-2 items-center cursor-pointer  transition"
                        >
                            <User className="text-sky-500" size="20" />
                            <p className="text-xl text-sky-500">
                                {" "}
                                {isFollowing ? "Unfollow" : "Follow"}
                            </p>
                        </div>

                        <div className="bg-sky-500 inline-flex gap-4 rounded-lg px-4 py-2 items-center cursor-pointer hover:bg-sky-700 transition">
                            <MessageCircle color="white" size="20" />
                            <p className="text-xl text-white">Message</p>
                        </div>
                    </div>
                </div>
            </div>
            {/** End of Profile Top Section */}
        </div>
    );
}
