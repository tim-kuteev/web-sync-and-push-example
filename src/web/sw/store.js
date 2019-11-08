(function (global) {
  'use strict';

  const DB_NAME = 'sw-store';
  const STORE_NAME = 'outbox';

  class Store {
    constructor() {
      this.db = this.openDb();
    }

    openDb() {
      return new Promise((resolve, reject) => {
        const dbOpen = indexedDB.open(DB_NAME, 1);
        dbOpen.onupgradeneeded = () => {
          dbOpen.result.createObjectStore(STORE_NAME, {keyPath: 'id'});
        };
        dbOpen.onerror = () => reject(dbOpen.error);
        dbOpen.onsuccess = () => resolve(dbOpen.result);
      });
    }

    async transaction(mode, cb) {
      const db = await this.db;
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const request = cb(transaction.objectStore(STORE_NAME));
        transaction.onerror = () => reject(transaction.error);
        transaction.oncomplete = () => resolve(request.result);
      });
    }

    add(val) {
      return this.transaction('readwrite', store => {
        return store.add(val);
      });
    }

    remove(id) {
      return this.transaction('readwrite', store => {
        return store.delete(id);
      });
    }

    getAll() {
      return this.transaction('readonly', store => {
        return store.getAll();
      });
    }
  }

  global.__swStore = new Store();
})(self);
