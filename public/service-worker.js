
self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body,
    icon: data.icon || '/uploads/logo/estateflowlogo.png', // Default icon
    badge: '/uploads/logo/estateflowlogo.png',
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'New Notification', options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then(function (clientList) {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        client.focus();
        return client.navigate(urlToOpen);
      }
      return clients.openWindow(urlToOpen);
    })
  );
});
