// Budget App Service Worker — Push Notifications
const CACHE_NAME = 'budget-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Listen for schedule message from main app
let _notifTimer = null;

self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_NOTIF') {
    clearTimeout(_notifTimer);
    const ms = e.data.msUntil;
    const time = e.data.time || '21:00';
    _notifTimer = setTimeout(() => {
      showDailyNotif(time);
    }, ms);
  }
});

function showDailyNotif(time) {
  self.registration.showNotification('💸 בוט התקציב', {
    body: 'היי! רשמת את כל ההוצאות של היום? פתח ותכתוב לי 📝',
    icon: 'https://raw.githubusercontent.com/lielmudahi12-droid/budget/main/icon.png',
    badge: 'https://raw.githubusercontent.com/lielmudahi12-droid/budget/main/icon.png',
    dir: 'rtl',
    lang: 'he',
    vibrate: [200, 100, 200],
    tag: 'daily-reminder',
    renotify: true,
    actions: [
      { action: 'open', title: '📝 פתח אפליקציה' },
      { action: 'dismiss', title: 'סגור' }
    ]
  });

  // Reschedule for tomorrow
  const [hh, mm] = time.split(':').map(Number);
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hh, mm, 0, 0);
  const msUntilTomorrow = next - Date.now();
  setTimeout(() => showDailyNotif(time), msUntilTomorrow);
}

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('index.html') || client.url.includes('budget')) {
          return client.focus();
        }
      }
      return clients.openWindow('/budget/');
    })
  );
});
