export interface UserRequest {
    username: string;
    userNickname: string;
    password: string;
    passcode: string;
}

export interface UserResponse {
    username: string;
    userNickname: string;
}