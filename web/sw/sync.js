(function () {
  'use strict';

  self.addEventListener('sync', (event) => {
    __swUtils.broadcast('Sync event');
    if (event.tag === 'request-notification') {
      event.waitUntil(requestNotification());
    }
  });

  self.addEventListener('message', (event) => {
    __swUtils.broadcast('Message event');
    if (event.data === 'request-notification') {
      event.waitUntil(requestNotification());
    }
  });

  async function requestNotification() {
    const subscription = await __swUtils.getSubscription();
    const promises = [];
    (await __swStore.getAll()).forEach(async (req) => {
      promises.push(performRequest(subscription, req));
    });
    return Promise.all(promises);
  }

  async function performRequest(subscription, req) {
    const response = await fetch(`${__apiUrl}/request-notification`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscription,
        payload: req.payload,
        delay: req.delay,
      }),
    });
    if (!response.ok) {
      __swUtils.broadcast('Notifications request failed: ' + response.statusText);
      return;
    }
    __swUtils.broadcast('Notifications requested');
    await __swStore.remove(req.id);
  }
})();
