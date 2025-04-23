class SongSelectObject {
    constructor(TLE, ART, DES, BPM) {
        this.TLE = TLE;
        this.ART = ART;
        this.DES = DES;
        this.BPM = BPM;
        this.render(); // 建立時自動顯示
    }

    render() {
        const container = document.getElementById('song-container');
        const box = document.createElement('div');
        box.className = 'song-box';
        box.innerHTML = `
            <strong>${this.TLE}</strong><br>
            <em>${this.ART}</em><br>
            <small>${this.DES}</small><br>
            BPM: ${this.BPM}
        `;
        container.appendChild(box);
    }
}

// 建立範例物件
new SongSelectObject("Song Title", "Artist Name", "A great song", 128);