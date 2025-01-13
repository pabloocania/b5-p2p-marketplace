importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

async function initializeFirebase() {
    try {
        const response = await fetch('https://bolsillo-argento-586dfd80364d.herokuapp.com/api/configuration'); // Adjust the endpoint path as needed
        if (!response.ok) {
            throw new Error('Failed to fetch Firebase configuration');
        }
        const data = await response.json();
        const firebaseConfig = data.config.firebase; // Access the nested firebase configuration

        firebase.initializeApp({
            apiKey: firebaseConfig.firebase_api_key,
            authDomain: firebaseConfig.firebase_auth_domain,
            projectId: firebaseConfig.firebase_project_id,
            storageBucket: firebaseConfig.firebase_storage_bucket,
            messagingSenderId: firebaseConfig.firebase_messaging_sender_id,
            appId: firebaseConfig.firebase_app_id,
            measurementId: firebaseConfig.firebase_measurement_id
        });

        console.log(response)

        const messaging = firebase.messaging();

        messaging.onBackgroundMessage((payload) => {
            console.log('[firebase-messaging-sw.js] Received background message ', payload);
            const notificationTitle = payload.notification?.title ?? 'Default Title';
            const notificationOptions = {
                body: payload.notification?.body ?? 'Default Body',
                icon: '/icons/icon-192x192.png',
                notificationTitle: "Kioscoin",
                vibrate: [100, 50, 100]
            };

            self.registration.showNotification(notificationTitle, notificationOptions);
        });
    } catch (error) {
        console.error('Error initializing Firebase:', error);
    }
}

initializeFirebase();