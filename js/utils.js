// Utility functions for date parsing and data processing

function parseDateString(s) {
    if (!s) return { m: 0, y: 0 };
    const d = new Date(s);
    if (isNaN(d)) {
        const parts = s.split('/');
        if (parts.length === 3) {
            return { m: parseInt(parts[1]), y: parseInt(parts[2]) };
        }
        return { m: 0, y: 0 };
    }
    return { m: d.getMonth() + 1, y: d.getFullYear() };
}

function getMonthlyData(data) {
    const monthly = Array(12).fill(0);
    data.forEach(r => {
        if (r.bulan > 0 && r.bulan <= 12) monthly[r.bulan - 1]++;
    });
    return monthly;
}

function getDailyData(data) {
    const daily = {};
    data.forEach(r => {
        let tanggal = r.Tanggal;
        if (tanggal) {
            let dateStr;
            try {
                const date = new Date(tanggal);
                if (!isNaN(date)) dateStr = `${date.getDate()}`;
                else {
                    const parts = tanggal.split('/');
                    if (parts.length === 3) dateStr = `${parseInt(parts[0])}`;
                    else dateStr = tanggal;
                }
            } catch (e) {
                dateStr = tanggal;
            }
            daily[dateStr] = (daily[dateStr] || 0) + 1;
        }
    });
    const sorted = [];
    for (let i = 1; i <= 31; i++) {
        const key = i.toString();
        sorted.push({ label: i.toString(), value: daily[key] || 0 });
    }
    return { labels: sorted.map(item => item.label), values: sorted.map(item => item.value) };
}

function getGenderData(data) {
    const gender = { 'Laki-laki': 0, 'Perempuan': 0, 'Lainnya': 0 };
    data.forEach(r => {
        const g = r['Jenis Kelamin'] || 'Lainnya';
        if (g.toLowerCase().includes('laki')) gender['Laki-laki']++;
        else if (g.toLowerCase().includes('perempuan')) gender['Perempuan']++;
        else gender['Lainnya']++;
    });
    return {
        labels: Object.keys(gender).filter(k => gender[k] > 0),
        values: Object.values(gender).filter(v => v > 0)
    };
}

function getTopData(data, field, limit) {
    const count = {};
    data.forEach(r => {
        const val = r[field];
        if (val && val !== '-' && val !== '') {
            if (field === 'Nama Obat') {
                const obatList = val.split(/[,;]/).map(o => o.trim()).filter(o => o && o !== '-');
                obatList.forEach(obat => {
                    count[obat] = (count[obat] || 0) + 1;
                });
            } else {
                count[val] = (count[val] || 0) + 1;
            }
        }
    });
    const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, limit);
    return { labels: sorted.map(item => item[0]), values: sorted.map(item => item[1]) };
}

function getTopIstirahatData(data) {
    const istirahat = {};
    data.forEach(r => {
        const hari = parseInt(r['Jumlah Hari Istirahat']);
        if (hari && hari > 0) {
            const nama = r.Nama || 'Tidak diketahui';
            const key = `${nama} (${hari} hari)`;
            istirahat[key] = hari;
        }
    });
    const sorted = Object.entries(istirahat).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return { labels: sorted.map(item => item[0]), values: sorted.map(item => item[1]) };
}