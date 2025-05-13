import { useContext, useState } from "react";
import { signUp } from "../services/auth";
import { FormUser, UserAuth } from "../types";
import { UserContext } from "../components/context/UserContext";
import { Link } from "react-router";
export default function SignUp() {
    const { user, setUser } = useContext(UserContext);

    const [errorMessage, setErrorMessage] = useState("");

    const [userData, setUserData] = useState<FormUser>({
        fullName: "",
        username: "",
        email: "",
        password: "",
        passwordConfirm: "",
    });

    const [loading, setLoading] = useState(false);

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
        const nameParts = userData.fullName.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const formattedUser = {
            ...userData,
            firstName,
            lastName,
            password_hash: userData.password,
        };
        try {
            const response = await signUp(formattedUser);
            // successfully signed up user
            // Next steps are add popup notification and redirects
            if (response.success) {
                setUser({
                    loggedIn: true,
                    username: response.data.user.username,
                    userId: response.data.user.id,
                });
                localStorage.setItem("accessToken", response.data.accessToken);
                localStorage.setItem(
                    "refreshToken",
                    response.data.refreshToken
                );
                // failed to sign up user
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
            <h1 className="text-6xl font-bold text-sky-900 mb-10">
                Create an Account to Chat Today!
            </h1>

            <form
                onSubmit={handleSubmit}
                className="bg-sky-500 rounded-2xl w-[480px] px-20 py-8 mb-6"
            >
                <label>
                    <p className="font-bold text-xl text-white mb-2">
                        Full Name
                    </p>
                    <input
                        type="text"
                        placeholder="John Doe"
                        name="fullName"
                        className="bg-white rounded-xl px-4 py-2 w-full mb-6"
                        value={userData.fullName}
                        onChange={handleChange}
                    />
                </label>

                <label>
                    <p className="font-bold text-xl text-white mb-2">
                        Username
                    </p>
                    <input
                        type="text"
                        placeholder="Username"
                        name="username"
                        className="bg-white rounded-xl px-4 py-2 w-full mb-6"
                        value={userData.username}
                        onChange={handleChange}
                    />
                </label>

                <label>
                    <p className="font-bold text-xl text-white mb-2">Email</p>
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
                    <p className="font-bold text-xl text-white mb-2">
                        Password
                    </p>
                    <input
                        type="text"
                        placeholder="Password"
                        name="password"
                        className="bg-white rounded-xl px-4 py-2 w-full mb-6"
                        value={userData.password}
                        onChange={handleChange}
                    />
                </label>

                <label>
                    <p className="font-bold text-xl text-white mb-2">
                        Password Confirm
                    </p>
                    <input
                        type="text"
                        placeholder="John Doe"
                        name="passwordConfirm"
                        className="bg-white rounded-xl px-4 py-2 w-full mb-16"
                        value={userData.passwordConfirm}
                        onChange={handleChange}
                    />
                </label>
                <p className="text-red-500">{errorMessage}</p>
                <div className="text-right">
                    {loading ? (
                        <span className="loader"></span>
                    ) : (
                        <button
                            type="submit"
                            className="rounded-xl px-6 py-4 bg-white cursor-pointer hover:bg-sky-50 transition duration-300"
                        >
                            <p className="text-lg font-bold text-sky-900">
                                Sign Up
                            </p>
                        </button>
                    )}
                </div>
            </form>

            <p className="text-sky-900 text-lg">
                Already have an account?{" "}
                <Link
                    to="/sign-in"
                    className="font-bold text-emerald-500 underline"
                >
                    Sign In
                </Link>{" "}
            </p>
        </div>
    );
}
