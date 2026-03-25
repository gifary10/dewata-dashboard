// script.js
const app = {
    SID: '1jtNohehbhC6sU9i6qSOETPkKAvSblRqX03MqEWybZzA',
    get URL() { return `https://opensheet.elk.sh/${this.SID}`; },
    
    rawData: [],
    filtered: [],
    unit: null,
    chart: null,
    activeTab: 'Berobat',
    
    // Password mapping untuk setiap perusahaan
    companyPasswords: {
        'delonix hotel karawang': 'DHK',
        'PT. Sankei dharma indonesia': 'SDI'
    },
    
    // Pagination States
    currentPage: { Berobat: 1, Kecelakaan: 1, Konsultasi: 1 },
    rowsPerPage: 20,

    async init() {
        this.bindEvents();
        await this.fetchData();
    },

    async fetchData() {
        document.getElementById('global-loading').style.display = 'flex';
        try {
            const sheets = ['Berobat', 'Kecelakaan', 'Konsultasi'];
            const data = await Promise.all(sheets.map(s => fetch(`${this.URL}/${s}`).then(r => r.json())));
            
            this.rawData = [];
            data.forEach((rows, idx) => {
                const type = sheets[idx];
                rows.forEach(r => {
                    const date = this.parseDate(r.Tanggal || r.Timestamp);
                    this.rawData.push({ ...r, type, bulan: date.m, tahun: date.y });
                });
            });

            this.rawData.sort((a, b) => new Date(b.Tanggal || b.Timestamp) - new Date(a.Tanggal || a.Timestamp));
            
            this.populateUnitList();
            document.getElementById('global-loading').style.display = 'none';

            if(!this.unit) {
                document.getElementById('welcome-screen').classList.remove('d-none');
            } else {
                this.apply();
            }
        } catch (e) {
            console.error(e);
            alert("Koneksi gagal.");
            document.getElementById('global-loading').style.display = 'none';
        }
    },

    parseDate(s) {
        if(!s) return { m: 0, y: 0 };
        const d = new Date(s);
        if(isNaN(d)) {
            const parts = s.split('/');
            if(parts.length === 3) return { m: parseInt(parts[1]), y: parseInt(parts[2]) };
            return { m: 0, y: 0 };
        }
        return { m: d.getMonth() + 1, y: d.getFullYear() };
    },

    populateUnitList() {
        const units = [...new Set(this.rawData.map(r => r.Perusahaan).filter(Boolean))].sort();
        const sel = document.getElementById('welcome-company-select');
        sel.innerHTML = '<option value="">-- Pilih Unit --</option>' + 
            units.map(u => `<option value="${u}">${u}</option>`).join('');
    },

    enterDashboard() {
        const company = document.getElementById('welcome-company-select').value;
        const password = document.getElementById('welcome-password').value;
        const errorDiv = document.getElementById('password-error');
        
        if(!company) {
            alert("Pilih unit perusahaan!");
            return;
        }
        
        // Validasi password
        const companyLower = company.toLowerCase();
        let validPassword = false;
        
        // Cek password berdasarkan perusahaan yang dipilih
        for (let [key, value] of Object.entries(this.companyPasswords)) {
            if (companyLower.includes(key.toLowerCase()) || key.toLowerCase().includes(companyLower)) {
                if (password === value) {
                    validPassword = true;
                    break;
                }
            }
        }
        
        // Jika perusahaan tidak ada dalam daftar password, gunakan password default kosong
        // atau bisa juga ditolak. Sesuaikan dengan kebutuhan.
        if (!validPassword) {
            errorDiv.classList.remove('d-none');
            document.getElementById('welcome-password').value = '';
            document.getElementById('welcome-password').focus();
            return;
        }
        
        errorDiv.classList.add('d-none');
        this.unit = company;
        document.getElementById('active-company-name').textContent = company;
        document.getElementById('welcome-screen').classList.add('d-none');
        document.getElementById('main-dashboard').classList.remove('d-none');
        this.populateFilters();
        this.apply();
    },

    changeCompany() {
        this.unit = null;
        document.getElementById('main-dashboard').classList.add('d-none');
        document.getElementById('welcome-screen').classList.remove('d-none');
        document.getElementById('welcome-password').value = '';
        document.getElementById('password-error').classList.add('d-none');
    },

    populateFilters() {
        const base = this.rawData.filter(r => r.Perusahaan === this.unit);
        const depts = [...new Set(base.map(r => r.Departemen).filter(Boolean))].sort();
        const years = [...new Set(base.map(r => r.tahun).filter(Boolean))].sort();

        document.getElementById('filter-dept').innerHTML = '<option value="">Semua Dept</option>' + 
            depts.map(d => `<option value="${d}">${d}</option>`).join('');
        document.getElementById('filter-tahun').innerHTML = '<option value="">Semua Tahun</option>' + 
            years.map(y => `<option value="${y}">${y}</option>`).join('');
    },

    apply() {
        const name = document.getElementById('filter-nama').value.toLowerCase();
        const dept = document.getElementById('filter-dept').value;
        const month = document.getElementById('filter-bulan').value;
        const year = document.getElementById('filter-tahun').value;

        this.filtered = this.rawData.filter(r => {
            if(r.Perusahaan !== this.unit) return false;
            return (!name || r.Nama?.toLowerCase().includes(name)) &&
                   (!dept || r.Departemen === dept) &&
                   (!month || r.bulan == month) &&
                   (!year || r.tahun == year);
        });

        // Reset pagination on filter change
        Object.keys(this.currentPage).forEach(key => this.currentPage[key] = 1);

        // Update charts di tab aktif
        if (this.activeTab === 'Berobat') {
            this.renderBerobatCharts();
        } else if (this.activeTab === 'Kecelakaan') {
            this.renderKecelakaanCharts();
        } else if (this.activeTab === 'Konsultasi') {
            this.renderKonsultasiCharts();
        }
    },

    setTab(t) {
        this.activeTab = t;
        
        // Render charts sesuai tab yang dipilih
        if (t === 'Berobat') {
            this.renderBerobatCharts();
        } else if (t === 'Kecelakaan') {
            this.renderKecelakaanCharts();
        } else if (t === 'Konsultasi') {
            this.renderKonsultasiCharts();
        }
    },

    // Fungsi untuk merender charts di tab Konsultasi
    renderKonsultasiCharts() {
        const konsultasiData = this.filtered.filter(r => r.type === 'Konsultasi');
        const panel = document.getElementById('panel-konsultasi');
        
        // Kosongkan panel dan buat container charts
        panel.innerHTML = '';
        const chartsContainer = document.createElement('div');
        chartsContainer.id = 'konsultasi-charts-container';
        panel.appendChild(chartsContainer);
        
        // Buat charts menggunakan fungsi dari chart.js
        createKonsultasiCharts(konsultasiData, 'konsultasi-charts-container');
        
        // Render tabel konsultasi di dalam container yang sudah dibuat
        this.renderKonsultasiTable(konsultasiData);
    },

    // Fungsi untuk render tabel konsultasi
    renderKonsultasiTable(data) {
        const container = document.getElementById('konsultasi-table-container');
        if (!container) return;
        
        const headers = `
            <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>Tanggal</th>
                    <th>Waktu</th>
                    <th>Perusahaan</th>
                    <th>Departemen</th>
                    <th>Nama</th>
                    <th>Jenis Kelamin</th>
                    <th>Keluhan</th>
                    <th>Riwayat Penyakit</th>
                    <th>Saran</th>
                </tr>
            </thead>
        `;

        // Calculate Pagination
        const totalRows = data.length;
        const totalPages = Math.ceil(totalRows / this.rowsPerPage) || 1;
        const page = this.currentPage.Konsultasi;
        const start = (page - 1) * this.rowsPerPage;
        const end = start + this.rowsPerPage;
        const paginatedData = data.slice(start, end);

        let tableHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    ${headers}
                    <tbody>
        `;

        if (paginatedData.length === 0) {
            tableHTML += `<tr><td colspan="10" class="text-center py-5 text-muted">Data Kosong</td></tr>`;
        } else {
            paginatedData.forEach(r => {
                tableHTML += `
                    <tr>
                        <td>${r.Timestamp || '-'}</td>
                        <td>${r.Tanggal || '-'}</td>
                        <td>${r.Waktu || '-'}</td>
                        <td>${r.Perusahaan || '-'}</td>
                        <td>${r.Departemen || '-'}</td>
                        <td>${r.Nama || '-'}</td>
                        <td>${r['Jenis Kelamin'] || '-'}</td>
                        <td>${r.Keluhan || '-'}</td>
                        <td>${r['Riwayat Penyakit'] || '-'}</td>
                        <td>${r.Saran || '-'}</td>
                    </tr>
                `;
            });
        }

        tableHTML += `
                    </tbody>
                </table>
            </div>
            <div class="pagination-container">
                <div class="small text-muted">
                    Menampilkan ${totalRows > 0 ? start + 1 : 0}-${Math.min(end, totalRows)} dari ${totalRows} data
                </div>
                <nav>
                    <ul class="pagination pagination-sm mb-0">
        `;

        // Pagination controls
        tableHTML += `
            <li class="page-item ${page === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="app.goToPage('Konsultasi', ${page - 1})">
                    <i class="fa-solid fa-chevron-left"></i>
                </a>
            </li>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (totalPages > 5 && Math.abs(i - page) > 2 && i !== 1 && i !== totalPages) {
                if (i === page - 3 || i === page + 3) {
                    tableHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
                }
                continue;
            }
            tableHTML += `
                <li class="page-item ${page === i ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="app.goToPage('Konsultasi', ${i})">${i}</a>
                </li>
            `;
        }

        tableHTML += `
            <li class="page-item ${page === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="app.goToPage('Konsultasi', ${page + 1})">
                    <i class="fa-solid fa-chevron-right"></i>
                </a>
            </li>
        `;

        tableHTML += `
                    </ul>
                </nav>
            </div>
        `;

        container.innerHTML = tableHTML;
    },

    // Fungsi untuk merender charts di tab Berobat
    renderBerobatCharts() {
        const berobatData = this.filtered.filter(r => r.type === 'Berobat');
        const panel = document.getElementById('panel-berobat');
        
        // Kosongkan panel dan buat container charts
        panel.innerHTML = '';
        const chartsContainer = document.createElement('div');
        chartsContainer.id = 'berobat-charts-container';
        panel.appendChild(chartsContainer);
        
        // Buat charts menggunakan fungsi dari chart.js
        createBerobatCharts(berobatData, 'berobat-charts-container');
        
        // Render tabel berobat di dalam container yang sudah dibuat
        this.renderBerobatTable(berobatData);
    },
    
    // Fungsi untuk merender charts di tab Kecelakaan
    renderKecelakaanCharts() {
        const kecelakaanData = this.filtered.filter(r => r.type === 'Kecelakaan');
        const panel = document.getElementById('panel-kecelakaan');
        
        // Kosongkan panel dan buat container charts
        panel.innerHTML = '';
        const chartsContainer = document.createElement('div');
        chartsContainer.id = 'kecelakaan-charts-container';
        panel.appendChild(chartsContainer);
        
        // Buat charts menggunakan fungsi dari chart.js
        createKecelakaanCharts(kecelakaanData, 'kecelakaan-charts-container');
        
        // Render tabel kecelakaan di dalam container yang sudah dibuat
        this.renderKecelakaanTable(kecelakaanData);
    },

    // Fungsi untuk render tabel berobat
    renderBerobatTable(data) {
        const container = document.getElementById('berobat-table-container');
        if (!container) return;
        
        const headers = `
            <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>Tanggal</th>
                    <th>Waktu</th>
                    <th>Perusahaan</th>
                    <th>Departemen</th>
                    <th>Nama</th>
                    <th>Jenis Kelamin</th>
                    <th>Keluhan</th>
                    <th>Kategori Diagnosa</th>
                    <th>Nama Diagnosa</th>
                    <th>Kategori Obat</th>
                    <th>Nama Obat</th>
                    <th>Tindakan</th>
                    <th>Perlu Istirahat</th>
                    <th>Jumlah Hari Istirahat</th>
                    <th>Keterangan Berobat</th>
                </tr>
            </thead>
        `;

        // Calculate Pagination
        const totalRows = data.length;
        const totalPages = Math.ceil(totalRows / this.rowsPerPage) || 1;
        const page = this.currentPage.Berobat;
        const start = (page - 1) * this.rowsPerPage;
        const end = start + this.rowsPerPage;
        const paginatedData = data.slice(start, end);

        let tableHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    ${headers}
                    <tbody>
        `;

        if (paginatedData.length === 0) {
            tableHTML += `<tr><td colspan="16" class="text-center py-5 text-muted">Data Kosong</td></tr>`;
        } else {
            paginatedData.forEach(r => {
                tableHTML += `
                    <tr>
                        <td>${r.Timestamp || '-'}</td>
                        <td>${r.Tanggal || '-'}</td>
                        <td>${r.Waktu || '-'}</td>
                        <td>${r.Perusahaan || '-'}</td>
                        <td>${r.Departemen || '-'}</td>
                        <td>${r.Nama || '-'}</td>
                        <td>${r['Jenis Kelamin'] || '-'}</td>
                        <td>${r.Keluhan || '-'}</td>
                        <td>${r['Kategori Diagnosa'] || '-'}</td>
                        <td>${r['Nama Diagnosa'] || '-'}</td>
                        <td>${r['Kategori Obat'] || '-'}</td>
                        <td>${r['Nama Obat'] || '-'}</td>
                        <td>${r.Tindakan || '-'}</td>
                        <td>${r['Perlu Istirahat'] || '-'}</td>
                        <td>${r['Jumlah Hari Istirahat'] || '-'}</td>
                        <td>${r['Keterangan Berobat'] || '-'}</td>
                    </tr>
                `;
            });
        }

        tableHTML += `
                    </tbody>
                </table>
            </div>
            <div class="pagination-container">
                <div class="small text-muted">
                    Menampilkan ${totalRows > 0 ? start + 1 : 0}-${Math.min(end, totalRows)} dari ${totalRows} data
                </div>
                <nav>
                    <ul class="pagination pagination-sm mb-0">
        `;

        // Pagination controls
        tableHTML += `
            <li class="page-item ${page === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="app.goToPage('Berobat', ${page - 1})">
                    <i class="fa-solid fa-chevron-left"></i>
                </a>
            </li>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (totalPages > 5 && Math.abs(i - page) > 2 && i !== 1 && i !== totalPages) {
                if (i === page - 3 || i === page + 3) {
                    tableHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
                }
                continue;
            }
            tableHTML += `
                <li class="page-item ${page === i ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="app.goToPage('Berobat', ${i})">${i}</a>
                </li>
            `;
        }

        tableHTML += `
            <li class="page-item ${page === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="app.goToPage('Berobat', ${page + 1})">
                    <i class="fa-solid fa-chevron-right"></i>
                </a>
            </li>
        `;

        tableHTML += `
                    </ul>
                </nav>
            </div>
        `;

        container.innerHTML = tableHTML;
    },
    
    // Fungsi untuk render tabel kecelakaan
    renderKecelakaanTable(data) {
        const container = document.getElementById('kecelakaan-table-container');
        if (!container) return;
        
        const headers = `
            <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>Tanggal</th>
                    <th>Waktu</th>
                    <th>Perusahaan</th>
                    <th>Departemen</th>
                    <th>Nama</th>
                    <th>Jenis Kelamin</th>
                    <th>Lokasi Kejadian</th>
                    <th>Penyebab</th>
                    <th>Bagian Yang Terluka</th>
                    <th>Tindakan</th>
                    <th>Deskripsi Kejadian</th>
                    <th>Foto</th>
                </tr>
            </thead>
        `;

        // Calculate Pagination
        const totalRows = data.length;
        const totalPages = Math.ceil(totalRows / this.rowsPerPage) || 1;
        const page = this.currentPage.Kecelakaan;
        const start = (page - 1) * this.rowsPerPage;
        const end = start + this.rowsPerPage;
        const paginatedData = data.slice(start, end);

        let tableHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    ${headers}
                    <tbody>
        `;

        if (paginatedData.length === 0) {
            tableHTML += `<tr><td colspan="13" class="text-center py-5 text-muted">Data Kosong</td></tr>`;
        } else {
            paginatedData.forEach(r => {
                tableHTML += `
                    <tr class="row-danger-light">
                        <td>${r.Timestamp || '-'}</td>
                        <td>${r.Tanggal || '-'}</td>
                        <td>${r.Waktu || '-'}</td>
                        <td>${r.Perusahaan || '-'}</td>
                        <td>${r.Departemen || '-'}</td>
                        <td>${r.Nama || '-'}</td>
                        <td>${r['Jenis Kelamin'] || '-'}</td>
                        <td>${r['Lokasi Kejadian'] || '-'}</td>
                        <td>${r.Penyebab || '-'}</td>
                        <td>${r['Bagian Yang Terluka'] || '-'}</td>
                        <td>${r.Tindakan || '-'}</td>
                        <td>${r['Deskripsi Kejadian'] || '-'}</td>
                        <td>
                            ${r.FotoURL ? 
                                `<button class="btn btn-sm btn-dark" onclick="app.viewImg('${r.FotoURL}')">
                                    <i class="fa-solid fa-camera"></i>
                                </button>` 
                                : '-'}
                        </td>
                    </tr>
                `;
            });
        }

        tableHTML += `
                    </tbody>
                </table>
            </div>
            <div class="pagination-container">
                <div class="small text-muted">
                    Menampilkan ${totalRows > 0 ? start + 1 : 0}-${Math.min(end, totalRows)} dari ${totalRows} data
                </div>
                <nav>
                    <ul class="pagination pagination-sm mb-0">
        `;

        // Pagination controls
        tableHTML += `
            <li class="page-item ${page === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="app.goToPage('Kecelakaan', ${page - 1})">
                    <i class="fa-solid fa-chevron-left"></i>
                </a>
            </li>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (totalPages > 5 && Math.abs(i - page) > 2 && i !== 1 && i !== totalPages) {
                if (i === page - 3 || i === page + 3) {
                    tableHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
                }
                continue;
            }
            tableHTML += `
                <li class="page-item ${page === i ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="app.goToPage('Kecelakaan', ${i})">${i}</a>
                </li>
            `;
        }

        tableHTML += `
            <li class="page-item ${page === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="app.goToPage('Kecelakaan', ${page + 1})">
                    <i class="fa-solid fa-chevron-right"></i>
                </a>
            </li>
        `;

        tableHTML += `
                    </ul>
                </nav>
            </div>
        `;

        container.innerHTML = tableHTML;
    },

    goToPage(type, page) {
        event.preventDefault();
        const totalRows = this.filtered.filter(r => r.type === type).length;
        const totalPages = Math.ceil(totalRows / this.rowsPerPage);
        
        if (page < 1 || page > totalPages) return;
        
        this.currentPage[type] = page;
        
        if (type === 'Berobat' && this.activeTab === 'Berobat') {
            this.renderBerobatCharts();
        } else if (type === 'Kecelakaan' && this.activeTab === 'Kecelakaan') {
            this.renderKecelakaanCharts();
        } else if (type === 'Konsultasi' && this.activeTab === 'Konsultasi') {
            this.renderKonsultasiCharts();
        }
    },

    viewImg(url) {
        document.getElementById('img-preview').src = url;
        new bootstrap.Modal(document.getElementById('imgModal')).show();
    },

    bindEvents() {
        ['filter-nama', 'filter-dept', 'filter-bulan', 'filter-tahun'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.apply());
            document.getElementById(id).addEventListener('change', () => this.apply());
        });
        
        // Tambahkan event listener untuk enter key pada input password
        document.getElementById('welcome-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.enterDashboard();
            }
        });
    },

    resetFilters() {
        ['filter-nama', 'filter-dept', 'filter-bulan', 'filter-tahun'].forEach(id => document.getElementById(id).value = '');
        this.apply();
    }
};

window.onload = () => app.init();
