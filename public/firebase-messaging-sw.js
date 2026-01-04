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

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging(app);

/**
 * Get user's preferred language
 * Default is Spanish, only switches to English if browser is explicitly set to English
 */
function getPreferredLanguage() {
    const browserLang = self.navigator?.language?.toLowerCase() || 'es';
    // Only use English if explicitly set, otherwise default to Spanish
    if (browserLang === 'en' || browserLang === 'en-us' || browserLang === 'en-gb') {
        return 'en';
    }
    return 'es';
}

/**
 * Get the notification body in the user's preferred language
 */
function getLocalizedBody(data) {
    const lang = getPreferredLanguage();
    // Try language-specific body first, then fall back
    return data[`body_${lang}`] || data.body_es || data.body || 'Nueva notificación';
}

/**
 * Handle background messages from Firebase
 */
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const data = payload.data || {};
    const notificationTitle = data.title || 'Kioscoin';
    const notificationBody = getLocalizedBody(data);

    const notificationOptions = {
        body: notificationBody,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: data.orderId ? `order-${data.orderId}` : `notification-${Date.now()}`,
        renotify: true,
        // Pass data for click handling
        data: {
            category: data.category || 'ORDER_EVENT',
            eventType: data.eventType,
            orderId: data.orderId,
            amount: data.amount,
            tokenCode: data.tokenCode,
            fiatAmount: data.fiatAmount,
            fiatCode: data.fiatCode,
            url: data.orderId ? `/?orderId=${data.orderId}` : '/'
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * Handle notification click - navigate to the order or app
 */
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event.notification);

    event.notification.close();

    const notificationData = event.notification.data || {};
    const urlToOpen = notificationData.url || '/';

    // Try to focus an existing window or open a new one
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there's already a window open
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    // Navigate existing window to the order
                    client.navigate(urlToOpen);
                    return client.focus();
                }
            }
            // No existing window, open a new one
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
