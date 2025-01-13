/// <reference lib="webworker" />

// import { initializeApp } from 'firebase/app';
// import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

// const firebaseConfig = {
//     apiKey: "AIzaSyAS3cxc8fUYrCLle9cBqtWGdq_dFefRnpc",
//     authDomain: "b5-kioscoin-dev.firebaseapp.com",
//     projectId: "b5-kioscoin-dev",
//     storageBucket: "b5-kioscoin-dev.firebasestorage.app",
//     messagingSenderId: "1007274753015",
//     appId: "1:1007274753015:web:86f5e8da1c3a91a7a00cf2",
//     measurementId: "G-MN0X3PZF7D"
// };

// // // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const messaging = getMessaging(app);

// onBackgroundMessage(messaging, (payload) => {
//     console.log('[firebase-messaging-sw.js] Received background message ', payload);
//     // Customize notification here
//     const notificationTitle = payload.notification?.title ?? 'Default Title';
//     const notificationOptions = {
//         body: payload.notification?.body ?? 'Default Body',
//         icon: '/icons/icon-192x192.png',
//     };

//     (self as unknown as ServiceWorkerGlobalScope).registration.showNotification(notificationTitle, notificationOptions);
// });