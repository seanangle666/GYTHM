let song = {
    'songId': 1,
    'level': 0,
    'url': { directory: null, fileName: null },
    'data': null,
}

song.url.directory = './asset/CHART/' + String(song.songId).padStart(4, '0') + '/';
song.url.fileName = 'chart_' + song.level + '.txt';

fetchWithProgress(song.url.directory + song.url.fileName, progress => {
    console.log(`下載進度：${(progress * 100).toFixed(2)}%`);
})
    .then(response => response.text())
    .then(data => {
        console.log('譜面下載完成');
        song.data = decode(data);
        if (song.data.infos['DLY']) {
            startTimeDelay += parseFloat(song.data.infos['DLY']);
        };
    })
    .catch(error => console.error('讀取檔案失敗:', error));