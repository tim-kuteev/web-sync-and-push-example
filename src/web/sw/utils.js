(function (global) {
  'use strict';

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async function broadcast(message) {
    for (const client of await clients.matchAll({includeUncontrolled: true, type: 'window'})) {
      client.postMessage(message);
    }
  }

  global.__swUtils = {
    urlBase64ToUint8Array,
    broadcast(message) {
      broadcast(message).catch(console.error);
    },
  };
})(self);
