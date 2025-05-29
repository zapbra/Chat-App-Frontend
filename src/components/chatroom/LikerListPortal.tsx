import { useContext } from "react";
import { createPortal } from "react-dom";
import { UserContext } from "../context/UserContext";

export default function LikerListPortal({
    likers,
    x,
    y,
}: {
    likers: string[];
    x: number;
    y: number;
}) {
    const { user } = useContext(UserContext);

    return createPortal(
        <div
            className="fixed bg-slate-50/75 px-4 py-2 rounded-2xl top-[100%] left-0 z-50"
            style={{ top: y, left: x }}
        >
            {likers.map((liker) => {
                return (
                    <p
                        className={
                            user.username == liker
                                ? "text-emerald-500"
                                : "text-cyan-500"
                        }
                    >
                        {liker}
                    </p>
                );
            })}
        </div>,
        document.body
    );
}
