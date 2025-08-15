import { useContext, useState } from "react";
import { login } from "../services/auth";
import { UserContext } from "../components/context/UserContext";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router";

export default function SignIn() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const [userData, setUserData] = useState({
        email: "",
        password: "",
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setUserData((prevUser) => ({
            ...prevUser,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage("");
        setLoading(true);
        try {
            const response = await login(userData.email, userData.password);
            if (response.success) {
                localStorage.setItem("accessToken", response.data.accessToken);
                localStorage.setItem(
                    "refreshToken",
                    response.data.refreshToken
                );
                setUser({
                    loggedIn: true,
                    username: response.data.user.username,
                    userId: String(response.data.user.id),
                });
                setUserData({
                    email: "",
                    password: "",
                });
                navigate("/");
            } else {
                setErrorMessage(response.error);
            }
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    return (
        <div className="mx-auto w-fit flex flex-col justify-center items-center">
            <h1 className="text-6xl font-bold text-sky-900 mb-10 text-center">
                Login to Chat Today!
            </h1>

            <p className="text-sky-900 text-lg mb-8">
                Dont have an account?{" "}
                <Link
                    to="/sign-up"
                    className="font-bold text-emerald-500 underline"
                >
                    Sign Up
                </Link>{" "}
            </p>

            <form
                onSubmit={handleSubmit}
                className="bg-sky-500 rounded-2xl w-[480px] px-20 py-8 mb-6"
            >
                <label>
                    <p className="font-bold text-xl text-white mb-2">
                        Email or Username
                    </p>
                    <input
                        type="text"
                        placeholder="example@hotmail.com"
                        name="email"
                        className="bg-white rounded-xl px-4 py-2 w-full mb-6"
                        value={userData.email}
                        onChange={handleChange}
                    />
                </label>

                <label>
                    <div className="flex justify-between">
                        <p className="font-bold text-xl text-white mb-2">
                            Password
                        </p>

                        {showPassword ? (
                            <EyeOff
                                className="text-white cursor-pointer"
                                onClick={() => setShowPassword(false)}
                            />
                        ) : (
                            <Eye
                                onClick={() => setShowPassword(true)}
                                className="text-white cursor-pointer"
                            />
                        )}
                    </div>

                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        name="password"
                        className="bg-white rounded-xl px-4 py-2 w-full mb-6"
                        value={userData.password}
                        onChange={handleChange}
                    />
                </label>

                <div className="text-right">
                    {loading ? (
                        <span className="loader"></span>
                    ) : (
                        <button
                            type="submit"
                            className="rounded-xl px-6 py-4 bg-white cursor-pointer hover:bg-sky-50 transition duration-300"
                        >
                            <p className="text-lg font-bold text-sky-900">
                                Sign In
                            </p>
                        </button>
                    )}
                </div>
            </form>

            <p className="text-red-500">{errorMessage}</p>
        </div>
    );
}
