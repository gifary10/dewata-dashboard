// Main Application Logic

const app = {
    SID: '1jtNohehbhC6sU9i6qSOETPkKAvSblRqX03MqEWybZzA',
    get URL() { return `https://opensheet.elk.sh/${this.SID}`; },
    rawData: [],
    filtered: [],
    unit: null,
    activeTab: 'Berobat',
    companyPasswords: {
        'delonix hotel karawang': 'DHK',
        'PT. Sankei dharma indonesia': 'SDI'
    },
    currentPage: {
        Berobat: 1,
        Kecelakaan: 1,
        Konsultasi: 1
    },
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
                    const date = parseDateString(r.Tanggal || r.Timestamp);
                    this.rawData.push({ ...r, type, bulan: date.m, tahun: date.y });
                });
            });
            
            this.rawData.sort((a, b) => new Date(b.Tanggal || b.Timestamp) - new Date(a.Tanggal || a.Timestamp));
            this.populateUnitList();
            document.getElementById('global-loading').style.display = 'none';
            
            if (!this.unit) {
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
        
        if (!company) {
            alert("Pilih unit perusahaan!");
            return;
        }
        
        const companyLower = company.toLowerCase();
        let validPassword = false;
        
        for (let [key, value] of Object.entries(this.companyPasswords)) {
            if (companyLower.includes(key.toLowerCase()) || key.toLowerCase().includes(companyLower)) {
                if (password === value) {
                    validPassword = true;
                    break;
                }
            }
        }
        
        if (!validPassword) {
            errorDiv.classList.remove('d-none');
            document.getElementById('welcome-password').value = '';
            document.getElementById('welcome-password').focus();
            return;
        }
        
        errorDiv.classList.add('d-none');
        this.unit = company;
        
        // Update company name in both locations
        const companyNameElements = document.querySelectorAll('#active-company-name, #active-company-name-sidebar');
        companyNameElements.forEach(el => {
            if (el) el.textContent = company;
        });
        
        document.getElementById('welcome-screen').classList.add('d-none');
        document.getElementById('main-dashboard').classList.remove('d-none');
        this.populateFilters();
        this.apply();
        
        // Show sidebar on desktop
        if (window.innerWidth > 992) {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.remove('collapsed');
        }
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
        
        const deptSelect = document.getElementById('filter-dept');
        const tahunSelect = document.getElementById('filter-tahun');
        
        if (deptSelect) {
            deptSelect.innerHTML = '<option value="">Semua Departemen</option>' + 
                depts.map(d => `<option value="${d}">${d}</option>`).join('');
        }
        
        if (tahunSelect) {
            tahunSelect.innerHTML = '<option value="">Semua Tahun</option>' + 
                years.map(y => `<option value="${y}">${y}</option>`).join('');
        }
    },

    apply() {
        const name = document.getElementById('filter-nama').value.toLowerCase();
        const dept = document.getElementById('filter-dept').value;
        const month = document.getElementById('filter-bulan').value;
        const year = document.getElementById('filter-tahun').value;
        
        this.filtered = this.rawData.filter(r => {
            if (r.Perusahaan !== this.unit) return false;
            return (!name || r.Nama?.toLowerCase().includes(name)) &&
                   (!dept || r.Departemen === dept) &&
                   (!month || r.bulan == month) &&
                   (!year || r.tahun == year);
        });
        
        Object.keys(this.currentPage).forEach(key => this.currentPage[key] = 1);
        this.setTab(this.activeTab);
    },

    setTab(t) {
        this.activeTab = t;
        if (t === 'Berobat') {
            this.renderBerobatCharts();
        } else if (t === 'Kecelakaan') {
            this.renderKecelakaanCharts();
        } else if (t === 'Konsultasi') {
            this.renderKonsultasiCharts();
        }
    },

    renderKonsultasiCharts() {
        const data = this.filtered.filter(r => r.type === 'Konsultasi');
        const panel = document.getElementById('panel-konsultasi');
        if (!panel) return;
        panel.innerHTML = '';
        const chartsContainer = document.createElement('div');
        chartsContainer.id = 'konsultasi-charts-container';
        panel.appendChild(chartsContainer);
        createKonsultasiCharts(data, 'konsultasi-charts-container');
        this.renderKonsultasiTable(data);
    },

    renderKonsultasiTable(data) {
        const container = document.getElementById('konsultasi-table-container');
        if (!container) return;
        
        const totalPages = Math.ceil(data.length / this.rowsPerPage) || 1;
        const page = this.currentPage.Konsultasi;
        const paginatedData = data.slice((page - 1) * this.rowsPerPage, page * this.rowsPerPage);
        
        let tableHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Timestamp</th><th>Tanggal</th><th>Waktu</th><th>Perusahaan</th>
                            <th>Departemen</th><th>Nama</th><th>Jenis Kelamin</th><th>Keluhan</th>
                            <th>Riwayat Penyakit</th><th>Saran</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        if (paginatedData.length === 0) {
            tableHTML += `<tr><td colspan="10" class="text-center py-5">Data Kosong</td></tr>`;
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
        
        tableHTML += `</tbody></table></div>${this.renderPagination('Konsultasi', page, totalPages)}`;
        container.innerHTML = tableHTML;
    },

    renderBerobatCharts() {
        const data = this.filtered.filter(r => r.type === 'Berobat');
        const panel = document.getElementById('panel-berobat');
        if (!panel) return;
        panel.innerHTML = '';
        const chartsContainer = document.createElement('div');
        chartsContainer.id = 'berobat-charts-container';
        panel.appendChild(chartsContainer);
        createBerobatCharts(data, 'berobat-charts-container');
        this.renderBerobatTable(data);
    },

    renderBerobatTable(data) {
        const container = document.getElementById('berobat-table-container');
        if (!container) return;
        
        const totalPages = Math.ceil(data.length / this.rowsPerPage) || 1;
        const page = this.currentPage.Berobat;
        const paginatedData = data.slice((page - 1) * this.rowsPerPage, page * this.rowsPerPage);
        
        let tableHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Timestamp</th><th>Tanggal</th><th>Waktu</th><th>Perusahaan</th>
                            <th>Departemen</th><th>Nama</th><th>Jenis Kelamin</th><th>Keluhan</th>
                            <th>Kategori Diagnosa</th><th>Nama Diagnosa</th><th>Kategori Obat</th>
                            <th>Nama Obat</th><th>Tindakan</th><th>Perlu Istirahat</th>
                            <th>Jumlah Hari Istirahat</th><th>Keterangan Berobat</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        if (paginatedData.length === 0) {
            tableHTML += `<tr><td colspan="16" class="text-center py-5">Data Kosong</td></tr>`;
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
        
        tableHTML += `</tbody></table></div>${this.renderPagination('Berobat', page, totalPages)}`;
        container.innerHTML = tableHTML;
    },

    renderKecelakaanCharts() {
        const data = this.filtered.filter(r => r.type === 'Kecelakaan');
        const panel = document.getElementById('panel-kecelakaan');
        if (!panel) return;
        panel.innerHTML = '';
        const chartsContainer = document.createElement('div');
        chartsContainer.id = 'kecelakaan-charts-container';
        panel.appendChild(chartsContainer);
        createKecelakaanCharts(data, 'kecelakaan-charts-container');
        this.renderKecelakaanTable(data);
    },

    renderKecelakaanTable(data) {
        const container = document.getElementById('kecelakaan-table-container');
        if (!container) return;
        
        const totalPages = Math.ceil(data.length / this.rowsPerPage) || 1;
        const page = this.currentPage.Kecelakaan;
        const paginatedData = data.slice((page - 1) * this.rowsPerPage, page * this.rowsPerPage);
        
        let tableHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Timestamp</th><th>Tanggal</th><th>Waktu</th><th>Perusahaan</th>
                            <th>Departemen</th><th>Nama</th><th>Jenis Kelamin</th><th>Lokasi Kejadian</th>
                            <th>Penyebab</th><th>Bagian Yang Terluka</th><th>Tindakan</th>
                            <th>Deskripsi Kejadian</th><th>Foto</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        if (paginatedData.length === 0) {
            tableHTML += `<tr><td colspan="13" class="text-center py-5">Data Kosong</td></tr>`;
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
                        <td>${r.FotoURL ? `<button class="btn btn-sm btn-dark" onclick="app.viewImg('${r.FotoURL}')"><i class="fa-solid fa-camera"></i></button>` : '-'}</td>
                    </tr>
                `;
            });
        }
        
        tableHTML += `</tbody></table></div>${this.renderPagination('Kecelakaan', page, totalPages)}`;
        container.innerHTML = tableHTML;
    },

    renderPagination(type, page, totalPages) {
        return `
            <div class="pagination-container">
                <div class="small text-muted">Menampilkan halaman ${page} dari ${totalPages}</div>
                <nav>
                    <ul class="pagination pagination-sm mb-0">
                        <li class="page-item ${page === 1 ? 'disabled' : ''}">
                            <a class="page-link" href="#" onclick="app.goToPage('${type}', ${page - 1})">
                                <i class="fa-solid fa-chevron-left"></i>
                            </a>
                        </li>
                        ${this.generatePageNumbers(type, page, totalPages)}
                        <li class="page-item ${page === totalPages ? 'disabled' : ''}">
                            <a class="page-link" href="#" onclick="app.goToPage('${type}', ${page + 1})">
                                <i class="fa-solid fa-chevron-right"></i>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        `;
    },

    generatePageNumbers(type, page, totalPages) {
        let html = '';
        const maxPages = Math.min(totalPages, 5);
        for (let i = 1; i <= maxPages; i++) {
            html += `
                <li class="page-item ${page === i ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="app.goToPage('${type}', ${i})">${i}</a>
                </li>
            `;
        }
        return html;
    },

    goToPage(type, page) {
        event.preventDefault();
        const totalRows = this.filtered.filter(r => r.type === type).length;
        const totalPages = Math.ceil(totalRows / this.rowsPerPage);
        if (page < 1 || page > totalPages) return;
        this.currentPage[type] = page;
        this.setTab(this.activeTab);
    },

    viewImg(url) {
        document.getElementById('img-preview').src = url;
        new bootstrap.Modal(document.getElementById('imgModal')).show();
    },

    bindEvents() {
        const filterIds = ['filter-nama', 'filter-dept', 'filter-bulan', 'filter-tahun'];
        filterIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.apply());
                element.addEventListener('change', () => this.apply());
            }
        });
        
        const welcomePassword = document.getElementById('welcome-password');
        if (welcomePassword) {
            welcomePassword.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.enterDashboard();
            });
        }
    },

    resetFilters() {
        const filterIds = ['filter-nama', 'filter-dept', 'filter-bulan', 'filter-tahun'];
        filterIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
        this.apply();
    }
};

// Initialize app when page loads
window.onload = () => app.init();