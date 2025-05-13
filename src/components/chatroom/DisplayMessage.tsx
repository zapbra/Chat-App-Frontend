import { Message } from "../../types";
import { stringToReadableDate } from "../../utils/utils";

export default function DisplayMessage({
    message,
    isUserMessage,
}: {
    message: Message;
    isUserMessage: boolean;
}) {
    let baseClass = "bg-slate-50 px-6 py-2 rounded-2xl w-fit mb-2";
    let usernameClass = "font-bold";
    if (isUserMessage) {
        baseClass += " ml-auto";
        usernameClass += " text-emerald-500";
    } else {
        usernameClass += " text-cyan-500";
    }

    return (
        <div className={baseClass}>
            <p className={usernameClass}>{message.username}</p>
            <p>{message.message}</p>
            <p className="text-slate-400 ml-auto text-xs w-fit">
                {stringToReadableDate(
                    message.updated_at ? message.updated_at : message.created_at
                )}
            </p>
        </div>
    );
}
