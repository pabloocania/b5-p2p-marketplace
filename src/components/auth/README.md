# Firebase Authentication Setup

This document provides instructions on how to set up Firebase Authentication for email/password, email link, and social login in your application.

## Prerequisites

1. A Firebase project created in the [Firebase Console](https://console.firebase.google.com/)
2. Firebase SDK installed in your project

## Setting Up Email/Password Authentication

1. In the Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable the **Email/Password** provider
3. Configure any additional settings like password strength requirements

## Setting Up Email Link Authentication

1. In the Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable the **Email link (passwordless sign-in)** provider
3. Configure the action URL:
   - Set the action URL to your application's verification page (e.g., `https://your-app.com/auth/verify-email`)
   - This URL must be added to the authorized domains in your Firebase project
4. Customize the email template (optional):
   - Go to **Authentication** > **Templates**
   - Select **Email link sign-in**
   - Customize the subject, header image, and content

## Setting Up Social Login Providers

### Google Sign-In

1. In the Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable the **Google** provider
3. Configure the OAuth consent screen:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project
   - Go to **APIs & Services** > **OAuth consent screen**
   - Configure the consent screen with your app information
4. Create OAuth 2.0 client credentials:
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - Select **Web application** as the application type
   - Add your authorized JavaScript origins (e.g., `http://localhost:3000` for development)
   - Add your authorized redirect URIs (e.g., `http://localhost:3000/__/auth/handler`)
   - Copy the Client ID and Client Secret
5. Back in the Firebase Console, paste the Client ID and Client Secret in the Google provider settings

### Facebook Sign-In

1. In the Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable the **Facebook** provider
3. Create a Facebook Developer account and app:
   - Go to the [Facebook Developers](https://developers.facebook.com/) site
   - Create a new app or use an existing one
   - Add the Facebook Login product to your app
   - Configure the OAuth redirect URI (e.g., `https://your-app.firebaseapp.com/__/auth/handler`)
   - Copy the App ID and App Secret
4. Back in the Firebase Console, paste the App ID and App Secret in the Facebook provider settings

### Twitter Sign-In

1. In the Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable the **Twitter** provider
3. Create a Twitter Developer account and app:
   - Go to the [Twitter Developer Portal](https://developer.twitter.com/)
   - Create a new app or use an existing one
   - Configure the OAuth settings with your callback URL (e.g., `https://your-app.firebaseapp.com/__/auth/handler`)
   - Copy the API Key (Consumer Key) and API Secret Key (Consumer Secret)
4. Back in the Firebase Console, paste the API Key and API Secret Key in the Twitter provider settings

## Backend Integration

For the Kotlin backend to work with Firebase Authentication:

1. Set up Firebase Admin SDK in your Kotlin backend
2. Create endpoints to handle user creation and retrieval
3. Verify Firebase ID tokens in your backend API calls

## Testing

1. Test email/password registration and login
2. Test email link authentication
3. Test social login with each provider
4. Test password reset functionality
5. Test email verification

## Troubleshooting

- If social login popups are blocked, ensure your domain is added to the authorized domains in Firebase
- If you get CORS errors, check your Firebase project settings and ensure your domain is whitelisted
- For email link authentication, ensure your action URL is correctly configured and added to authorized domains
- For backend integration issues, verify that your Firebase Admin SDK is properly initialized
