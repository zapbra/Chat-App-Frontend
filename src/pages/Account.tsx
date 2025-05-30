import { useContext, useState } from "react";
import { UserContext } from "../components/context/UserContext";
import { MessageCircle } from "lucide-react";
import RecentMessagesData from "../data/recent_messages.json";
import ProfileChatroomsData from "../data/profile_chatrooms.json";
import MessageDisplay from "../components/profile/MessageDisplay";
import ChatroomDisplay from "../components/profile/ChatroomDisplay";

export default function Account() {
    const { user } = useContext(UserContext);
    const [followerCount, setFollowerCount] = useState<number | null>(null);
    const [followingCount, setFollowingCount] = useState<number | null>(null);

    return (
        <div className="max-w-[1440px] mx-auto flex justify-center">
            <div>
                {/** Profile Top Section */}
                <div className="flex justify-center">
                    <div className="mb-12 ">
                        <h1 className="text-2xl mb-6">{user.username}</h1>

                        <div className="flex gap-6 mb-6">
                            <p className="text-xl">{followerCount} Followers</p>
                            <div className="text-xl">
                                {followingCount} Following
                            </div>
                        </div>

                        <p className="mb-6">
                            <span className="text-slate-500">Followed by</span>{" "}
                            Jane Doe, Jon Blow & 17 others
                        </p>

                        <div className="bg-sky-500 inline-flex gap-4 rounded-lg px-4 py-2 items-center cursor-pointer hover:bg-sky-700 transition">
                            <MessageCircle color="white" size="20" />
                            <p className="text-xl text-white">Check Messages</p>
                        </div>
                    </div>
                </div>
                {/** End of Profile Top Section */}

                {/** Overview Section */}
                <div className="grid grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-2">
                            Recent Messages
                        </h3>
                        {RecentMessagesData.map((message) => {
                            return (
                                <MessageDisplay
                                    username={message.username}
                                    message={message.message}
                                    isRead={message.isRead}
                                    link={message.link}
                                    sent_at={message.sent_at}
                                    chatRoom={message.chatroom}
                                />
                            );
                        })}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-2">
                            Chat Mentions
                        </h3>

                        {RecentMessagesData.map((message) => {
                            return (
                                <MessageDisplay
                                    username={message.username}
                                    message={message.message}
                                    isRead={message.isRead}
                                    link={message.link}
                                    sent_at={message.sent_at}
                                    chatRoom={message.chatroom}
                                />
                            );
                        })}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-2">
                            Favorite Chatrooms
                        </h3>

                        {ProfileChatroomsData.map((chatroom) => {
                            return (
                                <ChatroomDisplay
                                    roomName={chatroom.name}
                                    mentions={chatroom.mentions}
                                    newMessages={chatroom.newMessages}
                                    totalMessages={chatroom.totalMessages}
                                />
                            );
                        })}
                    </div>
                </div>
                {/** End of Overview Section */}
            </div>
        </div>
    );
}
