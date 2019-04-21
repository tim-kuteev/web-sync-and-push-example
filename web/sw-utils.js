__swUtils = (function () {

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async function getSubscription() {
    let subscription = await self.registration.pushManager.getSubscription();
    if (subscription) {
      return subscription;
    }
    let response = await fetch(`${__apiUrl}/vapid-key`);
    if (!response.ok) {
      throw new Error('Vapid key request failed');
    }
    const vapidPublicKey = await response.text();
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
    subscription = await self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });
    return subscription;
  }

  async function broadcast(message) {
    return (await clients.matchAll({includeUncontrolled: true, type: 'window'})).forEach(client => {
      client.postMessage(message);
    });
  }

  return {
    getSubscription,
    broadcast,
  };
})();
