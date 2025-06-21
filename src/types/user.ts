export interface User {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password_hash: string;
}

export interface DbUser {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    created_at: string;
}

export interface FormUser {
    fullName: string;
    username: string;
    email: string;
    password: string;
    passwordConfirm: string;
}

export interface SearchUser {
    id: number;
    username: string;
}

export interface Follower {
    id: number;
    follower_id: number;
    following_id: number;
    username: string;
}
