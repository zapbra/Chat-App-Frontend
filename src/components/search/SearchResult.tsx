import { Link } from "react-router";

const highlightText = (text: string, highlightText: string) => {
    if (!highlightText) return <p>{text}</p>;
    const regex = new RegExp(`(${highlightText})`, "i");
    const parts = text.split(regex);

    return (
        <p>
            {parts.map((part, index) =>
                regex.test(part) ? (
                    <span key={index} className="font-bold">
                        {part}
                    </span>
                ) : (
                    <span key={index}>{part}</span>
                )
            )}
        </p>
    );
};

export default function SearchResult({
    id,
    username,
    search,
    hideResults,
}: {
    id: number;
    username: string;
    search: string;
    hideResults: () => void;
}) {
    return (
        <Link to={`/user/${id}`} onClick={hideResults}>
            <div className="bg-white hover:bg-sky-50 transition px-3 py-2 border-b border-b-slate-500  cursor-pointer">
                {highlightText(username, search)}
            </div>
        </Link>
    );
}
