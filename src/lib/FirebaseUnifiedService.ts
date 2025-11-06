import { initializeApp } from "firebase/app";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signOut,
    User,
    GoogleAuthProvider,
    FacebookAuthProvider,
    TwitterAuthProvider,
    signInWithPopup,
    isSignInWithEmailLink,
    sendSignInLinkToEmail,
    signInWithEmailLink,
    Auth,
    applyActionCode
} from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { p2pMarketAPIClient as client } from "./APIClients";
import { CreateUserRequest, KioscoinUser, UpdateUserSettingsRequest } from "b5-api-client";


const DEFAULT_EMAIL_VERIFICATION_PAGE =
    process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_URL ??
    process.env.REACT_APP_EMAIL_VERIFICATION_URL ??
    "http://localhost:3000/auth/email-verified";

const DEFAULT_EMAIL_LINK_URL =
    process.env.NEXT_PUBLIC_EMAIL_LINK_URL ??
    process.env.REACT_APP_EMAIL_LINK_URL ??
    "http://localhost:3000/auth/verify-email";

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const appendQueryParams = (
    base: string,
    params: Record<string, string | undefined>
): string => {
    const query = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
        .join("&");

    if (!query) {
        return base;
    }

    const separator = base.includes("?") ? "&" : "?";
    return `${base}${separator}${query}`;
};

// Auth provider type for better type safety
export enum AuthProvider {
    EMAIL = 'EMAIL',
    GOOGLE = 'GOOGLE',
    FACEBOOK = 'FACEBOOK',
    TWITTER = 'TWITTER'
}

// Immutable auth state class
export class AuthState {
    private constructor(
        public readonly isAuthenticated: boolean,
        public readonly user: UserData | null,
        public readonly provider: AuthProvider | null
    ) { }

    static authenticated(user: UserData, provider: AuthProvider): AuthState {
        return new AuthState(true, user, provider);
    }

    static unauthenticated(): AuthState {
        return new AuthState(false, null, null);
    }
}

// Enhanced UserData class with additional safety
export class UserData {
    private constructor(
        public readonly id: string,
        public readonly email: string,
        public readonly username: string,
        public readonly isEmailVerified: boolean,
        public readonly idToken: string | null
    ) { }

    static create(
        id: string,
        email: string,
        username: string,
        isEmailVerified: boolean,
        idToken: string | null
    ): UserData {
        return new UserData(
            id,
            email,
            username,
            isEmailVerified,
            idToken
        );
    }

    withEmailVerified(): UserData {
        return new UserData(
            this.id,
            this.email,
            this.username,
            true,
            this.idToken
        );
    }
}

// Enhanced AuthResult class
export class AuthResult {
    private constructor(
        public readonly success: boolean,
        public readonly user: KioscoinUser | null,
        public readonly userData: UserData | null,
        public readonly error: string | null,
        public readonly provider: AuthProvider | null
    ) { }

    static success(user: KioscoinUser, userData: UserData, provider: AuthProvider): AuthResult {
        return new AuthResult(true, user, userData, null, provider);
    }

    static failure(error: string): AuthResult {
        return new AuthResult(false, null, null, error, null);
    }
}

export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
}

export class FirebaseUnifiedService {
    private app: ReturnType<typeof initializeApp> | null = null;
    private messaging: ReturnType<typeof getMessaging> | null = null;
    private auth: Auth | null = null;
    private readonly actionCodeSettings: { url: string; handleCodeInApp: boolean };
    private readonly emailVerificationUrl: string;
    private readonly emailVerificationContinueUrl?: string;

    constructor() {
        const configuredEmailVerificationUrl =
            process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_URL ??
            process.env.REACT_APP_EMAIL_VERIFICATION_URL ??
            DEFAULT_EMAIL_VERIFICATION_PAGE;

        this.emailVerificationUrl = trimTrailingSlash(configuredEmailVerificationUrl);
        this.emailVerificationContinueUrl =
            process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_CONTINUE_URL ??
            process.env.REACT_APP_EMAIL_VERIFICATION_CONTINUE_URL ??
            undefined;

        this.actionCodeSettings = {
            url: DEFAULT_EMAIL_LINK_URL,
            handleCodeInApp: true,
        };
        this.initializeFirebase();
    }

    private async initializeFirebase() {
        try {
            const firebaseConfig = await this.fetchFirebaseConfig();
            this.app = initializeApp(firebaseConfig);
            this.auth = getAuth(this.app);
        } catch (error) {
            console.error("Failed to initialize Firebase app:", error);
        }
    }

    private async fetchFirebaseConfig(): Promise<FirebaseConfig> {
        try {
            const response = await client.getConfig<{ firebase: FirebaseConfig }>();
            return response.config.firebase;
        } catch (error) {
            console.error("Error fetching Firebase configuration:", error);
            throw new Error("Failed to initialize Firebase configuration");
        }
    }

    private buildEmailVerificationSettings(loginId: string) {
        return {
            url: this.buildEmailVerificationUrl(loginId),
            handleCodeInApp: false,
        };
    }

    private buildEmailVerificationUrl(loginId: string): string {
        return appendQueryParams(this.emailVerificationUrl, {
            loginId,
            continueUrl: this.emailVerificationContinueUrl,
        });
    }

    private async ensureBackendVerification(
        firebaseUser: User,
        backendUser: KioscoinUser,
        idToken: string
    ): Promise<KioscoinUser> {
        const firebaseVerified = firebaseUser.emailVerified;
        const backendVerified = backendUser.settings?.hasVerified ?? false;

        if (!firebaseVerified || backendVerified) {
            return backendUser;
        }

        if (!backendUser.id) {
            console.warn("Missing backend user id when attempting to mark verification status.");
            return backendUser;
        }

        const settingsUpdate: UpdateUserSettingsRequest["settings"] = {
            paymentMethods: (backendUser.settings?.paymentMethods ?? []).map((method) => ({ ...method })),
            hasVerified: true,
        };

        const preferredToken = backendUser.settings?.preferredTokenCode;
        if (preferredToken !== undefined && preferredToken !== null) {
            settingsUpdate.preferredTokenCode = preferredToken;
        }

        const request: UpdateUserSettingsRequest = {
            userId: backendUser.id,
            settings: settingsUpdate,
        };

        try {
            const response = await client.updateUserSettings(request, {
                Authorization: `Bearer ${idToken}`,
            });
            return response.users?.[0] ?? backendUser;
        } catch (error) {
            console.error("Failed to update backend verification status:", error);
            return backendUser;
        }
    }

    // Messaging methods
    public async requestNotificationPermission(): Promise<string | null> {
        if (!this.app) {
            await this.initializeFirebase();
        }

        if (!this.messaging) {
            console.warn("Messaging is not available");
            return null;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                const token = await getToken(this.messaging, {
                    vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
                });
                return token;
            }
            return null;
        } catch (error) {
            console.error("Failed to get notification token:", error);
            return null;
        }
    }
    async fetchToken(): Promise<string | null> {
        try {
            if (!this.messaging && this.app) {
                this.messaging = getMessaging(this.app);
            }
            if (this.messaging) {
                const currentToken = await getToken(this.messaging);
                return currentToken;
            }
            return null;
        } catch (error) {
            console.error("An error occurred while retrieving token. ", error);
            return null;
        }
    }

    onMessageListener(callback: (payload: any) => void) {
        if (!this.messaging && this.app) {
            this.messaging = getMessaging(this.app);
        }
        if (this.messaging) {
            onMessage(this.messaging, callback);
        } else {
            console.error("Messaging is not initialized.");
        }
    }

    // Authentication methods
    async signInWithEmail(email: string, password: string): Promise<AuthResult> {
        try {
            if (!this.auth) {
                console.error("Firebase Auth not initialized");
                return AuthResult.failure("Firebase Auth not initialized");
            }
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            const idToken = await userCredential.user.getIdToken();
            const backendUser = await this.getUserFromBackend(userCredential.user.uid, idToken);

            if (backendUser) {
                const syncedBackendUser = await this.ensureBackendVerification(
                    userCredential.user,
                    backendUser,
                    idToken
                );
                return this._createSuccessAuthResult(
                    userCredential.user,
                    syncedBackendUser,
                    AuthProvider.EMAIL,
                    idToken
                );
            } else {
                return AuthResult.failure('User not found in backend');
            }
        } catch (error: any) {
            console.error('Detailed error signing in with email:', {
                code: error.code,
                message: error.message,
                fullError: error
            });
            return AuthResult.failure(error.message || 'Authentication failed');
        }
    }

    async createUserWithEmail(email: string, password: string, username: string): Promise<AuthResult> {
        try {
            if (!this.auth) {
                return AuthResult.failure("Firebase Auth not initialized");
            }

            // First create the user in Firebase
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            const user = userCredential.user;
            const idToken = await user.getIdToken();
            // Send email verification
            await sendEmailVerification(user, this.buildEmailVerificationSettings(user.uid));

            const backendUser = await this.createUserInBackend(user.uid, username, idToken);

            if (backendUser) {
                return this._createSuccessAuthResult(user, backendUser, AuthProvider.EMAIL, idToken);
            } else {
                return AuthResult.failure('Failed to create user in backend');
            }
        } catch (error: any) {
            console.error('Error creating user with email:', error);
            return AuthResult.failure(error.message || 'User creation failed');
        }
    }

    async signInWithGoogle(): Promise<AuthResult> {
        try {
            if (!this.auth) {
                return AuthResult.failure("Firebase Auth not initialized");
            }

            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(this.auth, provider);
            const user = userCredential.user;
            const idToken = await user.getIdToken();

            // Get or create user in your Kotlin backend
            const backendUser = await this.getUserFromBackend(user.uid, idToken);
            if (backendUser) {
                const syncedBackendUser = await this.ensureBackendVerification(user, backendUser, idToken);
                // Use the new helper method
                return this._createSuccessAuthResult(user, syncedBackendUser, AuthProvider.GOOGLE, idToken);
            } else {
                return AuthResult.failure('Failed to get or create user in backend');
            }
        } catch (error: any) {
            console.error('Error signing in with Google:', error);
            return AuthResult.failure(error.message || 'Google authentication failed');
        }
    }

    async signInWithFacebook(): Promise<AuthResult> {
        try {
            if (!this.auth) {
                return AuthResult.failure("Firebase Auth not initialized");
            }

            const provider = new FacebookAuthProvider();
            const userCredential = await signInWithPopup(this.auth, provider);
            const user = userCredential.user;
            const idToken = await user.getIdToken();

            // Get or create user in your Kotlin backend
            const backendUser = await this.getUserFromBackend(user.uid, idToken);
            if (backendUser) {
                const syncedBackendUser = await this.ensureBackendVerification(user, backendUser, idToken);
                // Use the new helper method
                return this._createSuccessAuthResult(user, syncedBackendUser, AuthProvider.FACEBOOK, idToken);
            } else {
                return AuthResult.failure('Failed to get or create user in backend');
            }
        } catch (error: any) {
            console.error('Error signing in with Facebook:', error);
            return AuthResult.failure(error.message || 'Facebook authentication failed');
        }
    }

    async signInWithTwitter(): Promise<AuthResult> {
        try {
            if (!this.auth) {
                return AuthResult.failure("Firebase Auth not initialized");
            }

            const provider = new TwitterAuthProvider();
            const userCredential = await signInWithPopup(this.auth, provider);
            const user = userCredential.user;
            const idToken = await user.getIdToken();

            // Get or create user in your Kotlin backend
            const backendUser = await this.getUserFromBackend(user.uid, idToken);
            if (backendUser) {
                const syncedBackendUser = await this.ensureBackendVerification(user, backendUser, idToken);
                // Use the new helper method
                return this._createSuccessAuthResult(user, syncedBackendUser, AuthProvider.TWITTER, idToken);
            } else {
                return AuthResult.failure('Failed to get or create user in backend');
            }
        } catch (error: any) {
            console.error('Error signing in with Twitter:', error);
            return AuthResult.failure(error.message || 'Twitter authentication failed');
        }
    }

    async sendEmailVerification(): Promise<boolean> {
        try {
            if (!this.auth) {
                return false;
            }

            const user = this.auth.currentUser;
            if (user) {
                await sendEmailVerification(user, this.buildEmailVerificationSettings(user.uid));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error sending email verification:', error);
            return false;
        }
    }

    async sendPasswordResetEmail(email: string): Promise<boolean> {
        try {
            if (!this.auth) {
                return false;
            }

            await sendPasswordResetEmail(this.auth, email);
            return true;
        } catch (error) {
            console.error('Error sending password reset email:', error);
            return false;
        }
    }

    async signOut(): Promise<void> {
        try {
            if (!this.auth) {
                return;
            }

            await signOut(this.auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }

    getCurrentUser(): User | null {
        if (!this.auth) {
            return null;
        }
        return this.auth.currentUser;
    }

    async sendSignInLinkToEmail(email: string): Promise<boolean> {
        try {
            if (!this.auth) {
                return false;
            }

            await sendSignInLinkToEmail(this.auth, email, this.actionCodeSettings);
            // Save the email locally to use it later when the user clicks the link
            window.localStorage.setItem('emailForSignIn', email);
            return true;
        } catch (error: any) {
            console.error('Error sending sign-in link to email:', error);
            return false;
        }
    }

    isSignInWithEmailLink(): boolean {
        if (!this.auth) {
            return false;
        }
        return isSignInWithEmailLink(this.auth, window.location.href);
    }

    async signInWithEmailLink(email: string): Promise<AuthResult> {
        try {
            if (!this.auth) {
                return AuthResult.failure("Firebase Auth not initialized");
            }

            if (!this.isSignInWithEmailLink()) {
                return AuthResult.failure("Invalid sign-in link");
            }

            const userCredential = await signInWithEmailLink(this.auth, email, window.location.href);
            const user = userCredential.user;

            // Clear the email from localStorage
            window.localStorage.removeItem('emailForSignIn');

            const idToken = await user.getIdToken();

            // Get or create user in your Kotlin backend
            const backendUser = await this.getUserFromBackend(user.uid, idToken);
            if (backendUser) {
                // Use the new helper method
                const syncedBackendUser = await this.ensureBackendVerification(user, backendUser, idToken);
                return this._createSuccessAuthResult(user, syncedBackendUser, AuthProvider.EMAIL, idToken);
            } else {
                return AuthResult.failure('Failed to get or create user in backend');
            }
        } catch (error: any) {
            console.error('Error signing in with email link:', error);
            return AuthResult.failure(error.message || 'Email link authentication failed');
        }
    }

    getEmailForSignIn(): string | null {
        return window.localStorage.getItem('emailForSignIn');
    }

    async applyEmailVerificationCode(oobCode: string): Promise<void> {
        if (!this.auth) {
            await this.initializeFirebase();
        }

        if (!this.auth) {
            throw new Error("Firebase Auth not initialized");
        }

        await applyActionCode(this.auth, oobCode);
    }

    // Helper method to create success AuthResult
    private _createSuccessAuthResult(
        user: User,
        backendUser: KioscoinUser,
        provider: AuthProvider,
        idToken: string
    ): AuthResult {
        const userData = UserData.create(
            user.uid,
            user.email || '',
            backendUser.username || '',
            user.emailVerified,
            idToken
        );
        return AuthResult.success(backendUser, userData, provider);
    }

    // Backend integration methods
    private async getUserFromBackend(userId: string, authToken: string): Promise<KioscoinUser | null> {
        try {
            const response = await client.getUser(userId, {
                Authorization: `Bearer ${authToken}`,
            });
            return response.users[0];
        } catch (error) {
            console.error('Error getting user from backend:', error);
            return null;
        }
    }

    private async createUserInBackend(userId: string, username: string, idToken: string): Promise<KioscoinUser | null> {
        try {
            const createUserRequest: CreateUserRequest = {
                id: userId,
                username: username
            }
            const response = await client.createUser(createUserRequest, {
                Authorization: `Bearer ${idToken}`
            });
            return response.users[0];
        } catch (error) {
            console.error('Error creating user in backend:', error);
            return null;
        }
    }
}
export const firebaseService = new FirebaseUnifiedService();
