export default function ChatroomSidebar({
  chatterCount,
  chatters,
}: {
  chatterCount: number;
  chatters: string[];
}) {
  return (
    <div className="bg-sky-800 rounded-tr-lg rounded br-lg max-w-[300px] px-3 py-2">
      <div className="flex justify-between gap-8 mb-2">
        <h2 className="text-xl text-white font-bold">Active Chatters</h2>
        <p className="text-xl text-emerald-200 font-bold">{chatterCount} </p>
      </div>
      {chatters.map((chatter) => (
        <p
          key={chatter}
          className="text-emerald-200 hover:underline cursor-pointer"
        >
          {chatter}
        </p>
      ))}
    </div>
  );
}
