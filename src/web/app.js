/* global __swStore */
(function () {
  'use strict';

  const logEl = document.getElementById('log');

  function log(msg) {
    const p = document.createElement('p');
    p.textContent = typeof msg === 'object' ? JSON.stringify(msg) : msg;
    logEl.appendChild(p);
    console.log(msg);
  }

  window.onerror = (msg) => {
    log(msg);
  };

  async function requestPermission() {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Denied notification permission');
    }
    return permission;
  }

  function checkSupport() {
    if (!('serviceWorker' in navigator)) {
      return log('No Service Worker support');
    }
    if (!('PushManager' in window)) {
      return log('No Push API support');
    }
    return true;
  }

  function main() {
    navigator.serviceWorker.register('sw-master.js')
      .then(reg => log('Service Worker registered'))
      .catch(err => log('Service Worker registration failed'));

    navigator.serviceWorker.addEventListener('message', (event) => {
      log(`Received: ${event.data}`);
    });

    document.getElementById('app_form').addEventListener('submit', async (event) => {
      try {
        event.preventDefault();
        await requestPermission();

        const payload = document.getElementById('payload').value;
        const delay = document.getElementById('delay').value;

        const registration = await navigator.serviceWorker.ready;
        registration.active.postMessage({tag: 'request-notification', content: {payload, delay}});
        log('Message sent to the Service Worker');
      } catch (err) {
        log(err.message)
      }
    });
  }

  checkSupport() && main();
})();
