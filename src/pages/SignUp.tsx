import { useContext, useState } from "react";
import { signUp } from "../services/auth";
import { FormUser, UserAuth } from "../types";
import { UserContext } from "../components/context/UserContext";
import { Link } from "react-router";
import { Eye, EyeClosed, EyeClosedIcon, EyeOff } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";

type Inputs = {
    fullName: string;
    username: string;
    email: string;
    password: string;
    passwordConfirm: string;
};

export default function SignUp() {
    const { user, setUser } = useContext(UserContext);
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<Inputs>();
    const [errorMessage, setErrorMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

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

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        console.log("data");
        console.log(data);
        setErrorMessage("");
        setLoading(true);
        const nameParts = data.fullName.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const formattedUser = {
            ...data,
            firstName,
            lastName,
            password_hash: data.password,
        };
        try {
            const response = await signUp(formattedUser);
            // successfully signed up user
            // Next steps are add popup notification and redirects
            if (response.success) {
                toast.success("Successfully signed up!");
                setUser({
                    loggedIn: true,
                    username: response.data.user.username,
                    userId: String(response.data.user.id),
                });
                localStorage.setItem("accessToken", response.data.accessToken);
                localStorage.setItem(
                    "refreshToken",
                    response.data.refreshToken
                );
                clearFormValues();
                // failed to sign up user
            } else {
                toast.error("Failed to sign up");
                setErrorMessage(response.error);
            }
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    const clearFormValues = () => {
        setValue("fullName", "");
        setValue("username", "");
        setValue("email", "");
        setValue("password", "");
        setValue("passwordConfirm", "");
    };
    return (
        <div className="mx-auto w-fit flex flex-col justify-center items-center">
            <Toaster />
            <h1 className="text-6xl font-bold text-sky-900 mb-2 text-center">
                Create an Account to Chat Today!
            </h1>
            <p className="text-sky-900 text-lg mb-8">
                Already have an account?{" "}
                <Link
                    to="/sign-in"
                    className="font-bold text-emerald-500 underline"
                >
                    Sign In
                </Link>{" "}
            </p>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-sky-500 rounded-2xl w-[480px] px-20 py-8 mb-6"
            >
                <label>
                    <p className="font-bold text-xl text-white mb-2">
                        Full Name
                    </p>
                    <input
                        {...register("fullName")}
                        type="text"
                        placeholder="John Doe"
                        name="fullName"
                        className="bg-white rounded-xl px-4 py-2 w-full mb-6"
                    />
                </label>

                <label>
                    <p className="font-bold text-xl text-white mb-2">
                        Username *
                    </p>
                    <input
                        {...register("username", {
                            required: "Username is required",
                            minLength: {
                                value: 3,
                                message:
                                    "Username must be at least 3 characters",
                            },
                            maxLength: {
                                value: 20,
                                message:
                                    "Username must be at most 20 characters",
                            },
                            pattern: {
                                value: /^[a-zA-Z0-9_]+$/,
                                message:
                                    "Username can only contain letters, numbers, and underscores",
                            },
                        })}
                        type="text"
                        placeholder="Username"
                        name="username"
                        className="bg-white rounded-xl px-4 py-2 w-full mb-2"
                    />
                </label>
                {errors.username && (
                    <p className="text-red-500 bg-sky-100 rounded px-2 py-2 mb-4">
                        {errors.username.message}
                    </p>
                )}

                <label>
                    <p className="font-bold text-xl text-white mb-2">Email *</p>
                    <input
                        {...register("email", {
                            required: "Email is required",
                        })}
                        type="email"
                        placeholder="example@hotmail.com"
                        name="email"
                        className="bg-white rounded-xl px-4 py-2 w-full mb-2"
                    />
                </label>

                {errors.email && (
                    <p className="text-red-500 bg-sky-100 rounded px-2 py-2 ">
                        {errors.email.message}
                    </p>
                )}
                <div className="mb-4"></div>
                <label>
                    <div className="flex justify-between">
                        <p className="font-bold text-xl text-white mb-2">
                            Password *
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
                        {...register("password", {
                            required: "Password is required",
                            minLength: {
                                value: 8,
                                message:
                                    "Password must be at least 8 characters",
                            },
                            validate: {
                                hasUpper: (v) =>
                                    /[A-Z]/.test(v) ||
                                    "Must include at least one uppercase letter",
                                hasLower: (v) =>
                                    /[a-z]/.test(v) ||
                                    "Must include at least one lowercase letter",
                                hasNumber: (v) =>
                                    /\d/.test(v) ||
                                    "Must include at least one number",
                                hasSymbol: (v) =>
                                    /[^A-Za-z0-9]/.test(v) ||
                                    "Must include at least one symbol",
                            },
                        })}
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        name="password"
                        className="bg-white rounded-xl px-4 py-2 w-full mb-2"
                    />
                </label>

                {errors.password && (
                    <p className="text-red-500 bg-sky-100 rounded px-2 py-2">
                        {errors.password.message}
                    </p>
                )}
                <div className="mb-4"></div>

                <label>
                    <div className="flex justify-between">
                        <p className="font-bold text-xl text-white mb-2">
                            Password Confirm *
                        </p>
                        {showPasswordConfirm ? (
                            <EyeOff
                                onClick={() => setShowPasswordConfirm(false)}
                                className="text-white cursor-pointer"
                            />
                        ) : (
                            <Eye
                                onClick={() => setShowPasswordConfirm(true)}
                                className="text-white cursor-pointer"
                            />
                        )}
                    </div>
                    <input
                        {...register("passwordConfirm", {
                            required: "Password confirm is required",
                            validate: (value) =>
                                value === watch("password") ||
                                "Passwords do not match",
                        })}
                        type={showPasswordConfirm ? "text" : "password"}
                        placeholder="Password confirm"
                        name="passwordConfirm"
                        className="bg-white rounded-xl px-4 py-2 w-full mb-2"
                    />
                </label>

                {errors.passwordConfirm && (
                    <p className="text-red-500 bg-sky-100 rounded px-2 py-2">
                        {errors.passwordConfirm.message}
                    </p>
                )}
                <div className="mb-14"></div>

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
        </div>
    );
}
