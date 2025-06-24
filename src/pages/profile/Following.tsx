import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../components/context/UserContext";
import { Follower } from "../../types";
import FollowerDisplay from "./FollowerDisplay";

const URL = import.meta.env.VITE_API_BASE_URL;

export default function Following() {
    const { user } = useContext(UserContext);
    const [following, setFollowing] = useState<Follower[]>([]);

    useEffect(() => {
        if (!user.userId) return;
        const fetchFollowingList = async () => {
            const response = await fetch(
                `${URL}/followers/${user.userId}/following`
            );
            if (response.ok) {
                const data = await response.json();
                setFollowing(data.following);
            }
        };

        fetchFollowingList();
    }, [user]);
    return (
        <div className="max-w-[1000px] mx-auto w-full">
            <div className="flex flex-col justify-around">
                {following.map((follower) => {
                    return <FollowerDisplay follower={follower} />;
                })}
            </div>
        </div>
    );
}
