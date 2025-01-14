importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyAS3cxc8fUYrCLle9cBqtWGdq_dFefRnpc",
    authDomain: "b5-kioscoin-dev.firebaseapp.com",
    projectId: "b5-kioscoin-dev",
    storageBucket: "b5-kioscoin-dev.firebasestorage.app",
    messagingSenderId: "1007274753015",
    appId: "1:1007274753015:web:86f5e8da1c3a91a7a00cf2",
    measurementId: "G-MN0X3PZF7D"
};

// // Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging(app);

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.data?.title ?? "Default Title";
    const notificationOptions = {
        body: payload.data?.body ?? "Default Body",
        icon: "/icons/icon-192x192.png",
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});