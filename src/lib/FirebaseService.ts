import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { p2pMarketAPIClient as client } from "./APIClients";

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
    private app: ReturnType<typeof initializeApp> | null = null;
    private messaging: ReturnType<typeof getMessaging> | null = null;

    constructor() {
        this.initializeFirebase();
    }

    private async initializeFirebase() {
        try {
            const firebaseConfig = await this.fetchFirebaseConfig();
            this.app = initializeApp(firebaseConfig);
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
}

export const firebaseService = new FirebaseService();