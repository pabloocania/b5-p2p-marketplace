import { KioscoinUser } from "b5-api-client";

export interface UserMenuProps {
    readonly user: KioscoinUser | undefined;
    readonly onLogin: (user: KioscoinUser) => void;
    readonly onLogout: () => void;
}

export interface RegisterFormState {
    readonly email: string;
    readonly password: string;
    readonly username: string;
}

export interface FormInputProps {
    readonly type: string;
    readonly placeholder: string;
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly required?: boolean;
    readonly disabled?: boolean;
}

export interface EmailInputWithUsernameProps {
    readonly email: string;
    readonly onEmailChange: (email: string) => void;
    readonly onUsernameChange: (username: string) => void;
    readonly disabled?: boolean;
}

export interface LoadingButtonProps {
    readonly isLoading: boolean;
    readonly loadingText: string;
    readonly buttonText: string;
    readonly onClick: () => void;
    readonly disabled?: boolean;
}

export interface ErrorAlertProps {
    readonly error: string | null;
} 