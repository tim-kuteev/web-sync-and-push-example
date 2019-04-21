(function () {
  'use strict';

  const logEl = document.querySelector('.log');

  function log(msg) {
    const p = document.createElement('p');
    p.textContent = typeof msg === 'object' ? JSON.stringify(msg) : msg;
    logEl.appendChild(p);
    console.log(msg);
  }

  window.onerror = (msg) => {
    log(msg);
  };

  function requestPermission() {
    return new Promise((resolve, reject) => {
      Notification.requestPermission((result) => {
        if (result !== 'granted') {
          return reject(Error('Denied notification permission'));
        }
        resolve(result);
      });
    });
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
      .then(reg => log('Service worker registered'))
      .catch(err => log('Service worker registration failed'));

    navigator.serviceWorker.addEventListener('message', (event) => {
      log(event.data);
    });

    document.querySelector('.notification').addEventListener('click', async (event) => {
      try {
        event.preventDefault();
        await requestPermission();

        const payload = document.getElementById('payload').value;
        const delay = document.getElementById('delay').value;
        await __swStore.add({
          id: Date.now(),
          payload: payload,
          delay: delay,
        });
        log('Request stored');

        const registration = await navigator.serviceWorker.ready;
        if (registration.sync && registration.sync.getTags) {
          const tags = await registration.sync.getTags();
          if (!tags.includes('request-notification')) {
            await registration.sync.register('request-notification');
            log('Sync registered');
          }
        } else {
          log('Background sync is not supported, using postMessage');
          registration.active.postMessage('request-notification');
        }
      } catch (err) {
        log(err.message)
      }
    });
  }

  checkSupport() && main();
})();
