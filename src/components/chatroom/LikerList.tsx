export default function LikerList({ likers }: { likers: string[] }) {
    return (
        <div className="bg-slate-50/50 px-4 py-2 rounded-2xl absolute top-[100%] left-0 z-50">
            {likers.map((liker) => {
                return <p>{liker}</p>;
            })}
        </div>
    );
}
