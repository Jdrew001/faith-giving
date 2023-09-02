export interface CHLoginRequestModel {
    UserName: string | undefined;
    Password: string  | undefined;
    RememberMe: boolean;
    ReturnUrl?: any;
    ServiceId?: any;
}

export interface CHLoginResponseModel {
    Token: string;
    ChurchServiceId: string;
}

export interface TokenData {
    token: string;
    refreshToken: string;
}