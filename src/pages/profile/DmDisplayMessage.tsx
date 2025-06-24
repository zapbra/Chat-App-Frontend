import { stringToReadableDate } from "../../utils/utils";
import { useRef } from "react";
import { DbDirectMessage } from "../../types/directMessages";

type DmDisplayMessageProps = {
    message: DbDirectMessage;
    isUserMessage: boolean;
    liked: boolean;
    isLastRead: boolean | null;
};

export default function DmDisplayMessage({
    message,
    isUserMessage,
    isLastRead,
}: DmDisplayMessageProps) {
    let baseClass = " w-fit mb-2 relative";
    const pickerRef = useRef<HTMLDivElement>(null);

    if (isUserMessage) {
        baseClass += " ml-auto";
    }

    return (
        <div className={baseClass}>
            <div
                ref={pickerRef}
                className="bg-slate-50 px-6 py-2 rounded-2xl mb-2"
            >
                <p className="mb-2">{message.message}</p>

                <div className="flex justify-between items-end gap-8">
                    <p className="text-slate-400 ml-auto text-xs w-fit">
                        {stringToReadableDate(
                            message.updated_at
                                ? message.updated_at
                                : message.created_at
                        )}
                    </p>
                </div>
            </div>
            <div className="mb-4 flex gap-2 flex-wrap">
                {isLastRead && <p className="text-slate-300">Read</p>}
            </div>
        </div>
    );
}
