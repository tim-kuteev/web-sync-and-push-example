/* global __swUtils */
(function () {
  'use strict';

  self.addEventListener('push', (event) => {
    __swUtils.broadcast('Push event');
    event.waitUntil(performPush(event.data));
  });

  self.addEventListener('notificationclick', (event) => {
    __swUtils.broadcast('Notification click event');
    event.notification.close();
    if (event.action === 'explore') {
      const url = encodeURI(`https://www.google.com/search?q=${event.notification.body}`);
      event.waitUntil(clients.openWindow(url));
    }
  });

  function performPush(data) {
    const payload = data ? data.text() : 'no payload';
    __swUtils.broadcast(`Show notification with push payload "${payload}"`);
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
