(function () {
  'use strict';

  self.addEventListener('push', (event) => {
    event.waitUntil(performPush(event.data));
  });

  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'explore') {
      event.waitUntil(clients.openWindow('https://google.com'));
    }
  });

  function performPush(data) {
    const payload = data ? data.text() : 'no payload';
    __swUtils.broadcast('Push received: ' + payload);
    /*if ((await clients.matchAll()).some(client => client.visibilityState === 'visible')) {
      return;
    }*/
    return self.registration.showNotification('Push Notification', {
      body: payload,
      icon: 'assets/img.jpg',
      actions: [
        {action: 'explore', title: 'Explore', icon: 'assets/google.png'},
      ],
    });
  }
})();