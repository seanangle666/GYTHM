// 用來防止音樂一直下載
const _dbName = 'music-db';
const _storeName = 'audios';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(_dbName, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = () => {
            const db = request.result;
            db.createObjectStore(_storeName);  // 使用 'audio' 作為 object store 名稱
        };
    });
}

function getFromDB(key) {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(_storeName, 'readonly');
            const store = tx.objectStore(_storeName);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    });
}

function saveToDB(key, blob) {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(_storeName, 'readwrite');
            const store = tx.objectStore(_storeName);
            const request = store.put(blob, key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    });
}

