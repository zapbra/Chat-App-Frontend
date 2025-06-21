import { useContext } from "react";
import { UserContext } from "./context/UserContext";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import SearchBar from "./search/SearchBar";
export default function Navbar() {
    const { user, setUser, resetUserContext } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        resetUserContext();
        navigate("/sign-in");
    };
    return (
        <div className="bg-sky-500  px-2 py-4 mb-10">
            <div className="max-w-[1440px] flex justify-between mx-auto">
                <div className="">
                    <Link to="/">
                        <div className="bg-white px-4 py-2 rounded-2xl cursor-pointer hover:bg-sky-100 transition duration-300 ">
                            <p className="text-base font-bold text-sky-900">
                                Explore Chat Rooms
                            </p>
                        </div>
                    </Link>
                </div>
                <SearchBar />
                <div className="flex gap-4">
                    {user?.loggedIn ? (
                        <>
                            <Link to="/account">
                                <div className="bg-white px-4 py-2 rounded-2xl cursor-pointer hover:bg-sky-100 duration-300 transition">
                                    <p className="text-base font-bold text-sky-900">
                                        Account
                                    </p>
                                </div>
                            </Link>

                            <div
                                onClick={handleLogout}
                                className="bg-sky-900 px-4 py-2 rounded-2xl cursor-pointer hover:bg-sky-700 duration-300  transition"
                            >
                                <p className="text-base font-bold text-white">
                                    Sign Out
                                </p>
                            </div>
                        </>
                    ) : (
                        <Link to="/sign-up">
                            <div className="bg-white px-4 py-2 rounded-2xl cursor-pointer hover:bg-sky-100 duration-300  transition">
                                <p className="text-base font-bold text-sky-900">
                                    Sign Up
                                </p>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
