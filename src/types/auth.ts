export interface UserAuth {
    loggedIn: boolean;
    username: string;
    userId: string;
}

export interface UserContextType {
    user: UserAuth;
    setUser: React.Dispatch<React.SetStateAction<UserAuth>>;
    resetUserContext: () => void;
}

export interface LoginResponse {
    message: string;
    accessToken: string;
    refreshToken: string;
    user: {
        id: number;
        username: string;
        email: string;
    };
}
