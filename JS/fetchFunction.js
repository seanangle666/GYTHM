async function fetchWithProgress(url, onProgress) {
    const response = await fetch(url);

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const contentLength = response.headers.get('Content-Length');

    if (!contentLength) {
        console.warn('Content-Length 不明，無法追蹤進度');
        return response.blob();
    }

    const total = parseInt(contentLength, 10);
    let loaded = 0;

    const reader = response.body.getReader();
    const chunks = [];

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        if (onProgress) onProgress(loaded / total);
    }

    const blob = new Blob(chunks);
    return blob;
}

// 使用範例：
/*fetchWithProgress('https://example.com/largefile.zip', progress => {
  console.log(`下載進度：${(progress * 100).toFixed(2)}%`);
});*/
