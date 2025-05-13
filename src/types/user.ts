export interface User {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password_hash: string;
}

export interface FormUser {
    fullName: string;
    username: string;
    email: string;
    password: string;
    passwordConfirm: string;
}
