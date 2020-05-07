/* global __swStore */
(function () {
  'use strict';

  const logEl = document.getElementById('log');
  const formEl = document.getElementById('app_form');
  const payloadEl = document.getElementById('payload');
  const delayEl = document.getElementById('delay');

  function log(msg, ...rest) {
    const p = document.createElement('p');
    p.textContent = typeof msg === 'object' ? JSON.stringify(msg) : msg;
    logEl.appendChild(p);
    console.log(msg, ...rest);
  }

  window.onerror = (msg) => {
    log(msg);
  };

  function checkSupport() {
    if (!('serviceWorker' in navigator)) {
      return log('No Service Worker support');
    }
    if (!('PushManager' in window)) {
      return log('No Push API support');
    }
    return true;
  }

  async function registerSW() {
    let registration;
    try {
      registration = await navigator.serviceWorker.register('sw-master.js');
      log('Service Worker registered');
    } catch (err) {
      log('Service Worker registration failed', err);
      return;
    }
    navigator.serviceWorker.addEventListener('message', (event) => {
      log(`Received from Service Worker: ${event.data}`);
    });
    return registration;
  }

  async function handleSubmit(registration) {
    log('Submit form');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      log('Denied notification permission');
      return;
    }

    // const registration = await navigator.serviceWorker.ready;
    registration.active.postMessage({
      tag: 'request-notification',
      content: {
        payload: payloadEl.value,
        delay: delayEl.value,
      },
    });
    log('Message sent to the Service Worker');
  }

  async function main() {
    if (!checkSupport()) {
      return;
    }
    const registration = await registerSW();
    if (!registration) {
      return;
    }
    formEl.addEventListener('submit', (event) => {
      event.preventDefault();
      handleSubmit(registration).catch(err => log(err.message, err));
    });
  }

  main().catch(err => log(err.message, err));
})();
