import { createContext } from "react";
import { UserAuth, UserContextType } from "../../types";

const initialContext: UserAuth = {
    loggedIn: false,
    username: "",
    userId: "",
};
export const UserContext = createContext<UserContextType>({
    user: initialContext,
    setUser: () => {},
    resetUserContext: () => {},
});
