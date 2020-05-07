/* global __swUtils, __swStore */
(function (global) {
  'use strict';

  global.addEventListener('message', (event) => {
    __swUtils.broadcast('Message event');
    if (event.data.tag === 'request-notification') {
      event.waitUntil(requestNotification(event.data.content));
    }
  });

  global.addEventListener('sync', (event) => {
    __swUtils.broadcast('Sync event');
    if (event.tag === 'flush-queue') {
      event.waitUntil(flushQueue());
    }
  });

  async function requestNotification(req) {
    try {
      if (navigator.onLine) {
        __swUtils.broadcast('Online - performing request');
        return await performRequest(req)
      }
      __swUtils.broadcast('Offline - storing request');
      await __swStore.add({
        id: Date.now(),
        payload: req.payload,
        delay: req.delay,
      });
      __swUtils.broadcast('Request stored');

      const tags = await global.registration.sync.getTags();
      if (!tags.includes('flush-queue')) {
        await global.registration.sync.register('flush-queue');
        __swUtils.broadcast('Sync registered');
      }
    } catch (err) {
      __swUtils.broadcast(err.message);
    }
  }

  async function flushQueue() {
    try {
      const promises = [];
      for (const req of await __swStore.getAll()) {
        await __swStore.remove(req.id);
        promises.push(performRequest(req));
      }
      return await Promise.all(promises);
    } catch (err) {
      __swUtils.broadcast(err.message);
    }
  }

  async function performRequest(req) {
    const subscription = await getSubscription();
    const response = await fetch('/api/request-notification', {
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
  }

  async function getSubscription() {
    let subscription = await global.registration.pushManager.getSubscription();
    if (subscription) {
      return subscription;
    }
    let response = await fetch('/api/vapid-key');
    if (!response.ok) {
      throw new Error('Vapid key request failed');
    }
    const vapidPublicKey = await response.text();
    const convertedVapidKey = __swUtils.urlBase64ToUint8Array(vapidPublicKey);
    return global.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });
  }
})(self);
