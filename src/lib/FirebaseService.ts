import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
}

const firebaseConfig: FirebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export class FirebaseService {
    private readonly app: ReturnType<typeof initializeApp>;
    private messaging: ReturnType<typeof getMessaging> | null = null;

    constructor(config: FirebaseConfig) {
        this.app = initializeApp(config);
    }

    async fetchToken(): Promise<string | null> {
        try {
            if (this.messaging == null) {
                this.messaging = getMessaging(this.app);
            }
            const currentToken = await getToken(this.messaging);
            return currentToken;
        } catch (error) {
            console.error("An error occurred while retrieving token. ", error);
            return null;
        }
    }

    onMessageListener(callback: (payload: any) => void) {
        if (this.messaging == null) {
            this.messaging = getMessaging(this.app);
        }
        onMessage(this.messaging, callback);
    }
}

export const firebaseService = new FirebaseService(firebaseConfig);