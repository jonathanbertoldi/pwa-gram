var dbPromise = idb.open('posts-store', 1, (db) => {
  if (!db.objectStoreNames.contains('posts')) {
    db.createObjectStore('posts', { keyPath: 'id' });
  }
});

function writeData(st, data) {
  return dbPromise.then((db) => {
    let tx = db.transaction(st, 'readwrite');
    let store = tx.objectStore(st);
    store.put(data[key]);
    return tx.complete;
  });
}