import { P2PMarketplaceAPIClient, FirebaseService } from "b5-api-client";

const p2pMarketAPIClient = new P2PMarketplaceAPIClient(
    process.env.NEXT_PUBLIC_KIOSCOIN_API_BASE ?? "https://bolsillo-argento-586dfd80364d.herokuapp.com"
);

const firebaseService = new FirebaseService(p2pMarketAPIClient, {
    emailVerificationUrl: process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_URL ?? "http://localhost:3000/auth/email-verified",
    emailVerificationContinueUrl: process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_CONTINUE_URL,
    actionCodeSettings: {
        url: process.env.NEXT_PUBLIC_EMAIL_LINK_URL ?? "http://localhost:3000/auth/verify-email",
        handleCodeInApp: true,
    }
});

export {
    p2pMarketAPIClient,
    firebaseService
};
