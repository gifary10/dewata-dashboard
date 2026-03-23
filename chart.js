// chart.js
// Chart initialization and configuration
let chart = null;
let charts = {}; // Untuk menyimpan multiple chart instances

// Fungsi untuk membuat chart di tab Konsultasi
function createKonsultasiCharts(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Hapus chart lama jika ada
    if (charts.konsultasiMonthly) charts.konsultasiMonthly.destroy();
    if (charts.konsultasiDept) charts.konsultasiDept.destroy();
    if (charts.konsultasiGender) charts.konsultasiGender.destroy();
    
    container.innerHTML = `
        <div class="row g-4">
            <div class="col-lg-6">
                <div class="content-section">
                    <h6 class="fw-bold mb-3"><i class="fa-solid fa-calendar-alt me-2 text-success"></i>Jumlah Konsultasi per Bulan</h6>
                    <div style="height: 300px; position: relative;">
                        <canvas id="chartKonsultasiMonthly"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="content-section">
                    <h6 class="fw-bold mb-3"><i class="fa-solid fa-building me-2 text-success"></i>Jumlah Konsultasi per Departemen</h6>
                    <div style="height: 300px; position: relative;">
                        <canvas id="chartKonsultasiDept"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="content-section">
                    <h6 class="fw-bold mb-3"><i class="fa-solid fa-venus-mars me-2 text-success"></i>Jenis Kelamin (Konsultasi)</h6>
                    <div style="height: 300px; position: relative;">
                        <canvas id="chartKonsultasiGender"></canvas>
                    </div>
                </div>
            </div>
        </div>
        <div class="content-section mt-4">
            <h6 class="fw-bold mb-3">Data Detail Konsultasi</h6>
            <div id="konsultasi-table-container"></div>
        </div>
    `;
    
    // Buat chart monthly (LINE CHART)
    const monthlyData = getMonthlyData(data);
    const monthlyCtx = document.getElementById('chartKonsultasiMonthly').getContext('2d');
    charts.konsultasiMonthly = new Chart(monthlyCtx, {
        type: 'line',
        data: {
            labels: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],
            datasets: [{
                label: 'Jumlah Konsultasi',
                data: monthlyData,
                borderColor: '#198754',
                backgroundColor: 'rgba(25, 135, 84, 0.1)',
                tension: 0.3,
                fill: true,
                borderWidth: 3,
                pointBackgroundColor: 'white',
                pointBorderColor: '#198754',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false },
                datalabels: {
                    display: true,
                    color: '#1e293b',
                    align: 'top',
                    offset: 4,
                    font: { weight: 'bold', size: 11 },
                    formatter: (value) => value > 0 ? value : ''
                }
            },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } }
            }
        }
    });
    
    // Buat chart departemen (BAR CHART horizontal dengan value)
    const deptData = getTopData(data, 'Departemen', 10);
    const deptCtx = document.getElementById('chartKonsultasiDept').getContext('2d');
    charts.konsultasiDept = new Chart(deptCtx, {
        type: 'bar',
        data: {
            labels: deptData.labels,
            datasets: [{
                label: 'Jumlah Konsultasi',
                data: deptData.values,
                backgroundColor: '#198754',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false },
                datalabels: {
                    display: true,
                    color: '#1e293b',
                    anchor: 'end',
                    align: 'right',
                    offset: 4,
                    font: { weight: 'bold', size: 11 },
                    formatter: (value) => value > 0 ? value : ''
                }
            },
            scales: {
                x: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } }
            }
        }
    });
    
    // Buat chart jenis kelamin (DOUGHNUT dengan value di tengah)
    const genderData = getGenderData(data);
    const genderCtx = document.getElementById('chartKonsultasiGender').getContext('2d');
    charts.konsultasiGender = new Chart(genderCtx, {
        type: 'doughnut',
        data: {
            labels: genderData.labels,
            datasets: [{
                data: genderData.values,
                backgroundColor: ['#0d6efd', '#dc3545', '#6c757d'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: { position: 'bottom' },
                tooltip: { enabled: true },
                datalabels: {
                    display: true,
                    color: 'white',
                    font: { weight: 'bold', size: 14 },
                    formatter: (value, context) => {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                        return percentage > 5 ? percentage + '%' : '';
                    }
                }
            }
        }
    });
}

// Fungsi untuk membuat chart di tab Berobat dengan line chart
function createBerobatCharts(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Hapus chart lama jika ada
    if (charts.berobatMonthly) charts.berobatMonthly.destroy();
    if (charts.berobatDept) charts.berobatDept.destroy();
    if (charts.berobatGender) charts.berobatGender.destroy();
    if (charts.berobatDiagnosaCategory) charts.berobatDiagnosaCategory.destroy();
    if (charts.berobatObatCategory) charts.berobatObatCategory.destroy();
    if (charts.berobatTopDiagnosa) charts.berobatTopDiagnosa.destroy();
    if (charts.berobatTopObat) charts.berobatTopObat.destroy();
    if (charts.berobatTopIstirahat) charts.berobatTopIstirahat.destroy();
    
    container.innerHTML = `
        <div class="row g-4">
            <div class="col-lg-6">
                <div class="content-section">
                    <h6 class="fw-bold mb-3"><i class="fa-solid fa-calendar-alt me-2 text-primary"></i>Jumlah per Bulan</h6>
                    <div style="height: 300px; position: relative;">
                        <canvas id="chartBerobatMonthly"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="content-section">
                    <h6 class="fw-bold mb-3"><i class="fa-solid fa-building me-2 text-primary"></i>Jumlah per Departemen</h6>
                    <div style="height: 300px; position: relative;">
                        <canvas id="chartBerobatDept"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="content-section">
                    <h6 class="fw-bold mb-3"><i class="fa-solid fa-venus-mars me-2 text-primary"></i>Jenis Kelamin</h6>
                    <div style="height: 300px; position: relative;">
                        <canvas id="chartBerobatGender"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="content-section">
                    <h6 class="fw-bold mb-3"><i class="fa-solid fa-tag me-2 text-primary"></i>Kategori Diagnosa</h6>
                    <div style="height: 300px; position: relative;">
                        <canvas id="chartBerobatDiagnosaCategory"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="content-section">
                    <h6 class="fw-bold mb-3"><i class="fa-solid fa-pills me-2 text-primary"></i>Kategori Obat</h6>
                    <div style="height: 300px; position: relative;">
                        <canvas id="chartBerobatObatCategory"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="content-section">
                    <h6 class="fw-bold mb-3"><i class="fa-solid fa-chart-bar me-2 text-primary"></i>Top 10 Nama Diagnosa</h6>
                    <div style="height: 300px; position: relative;">
                        <canvas id="chartBerobatTopDiagnosa"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="content-section">
                    <h6 class="fw-bold mb-3"><i class="fa-solid fa-capsules me-2 text-primary"></i>Top 10 Nama Obat</h6>
                    <div style="height: 300px; position: relative;">
                        <canvas id="chartBerobatTopObat"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="content-section">
                    <h6 class="fw-bold mb-3"><i class="fa-solid fa-bed me-2 text-primary"></i>Top 10 Jumlah Hari Istirahat</h6>
                    <div style="height: 300px; position: relative;">
                        <canvas id="chartBerobatTopIstirahat"></canvas>
                    </div>
                </div>
            </div>
        </div>
        <div class="content-section mt-4">
            <h6 class="fw-bold mb-3">Data Detail Berobat</h6>
            <div id="berobat-table-container"></div>
        </div>
    `;
    
    // Buat chart monthly (LINE CHART)
    const monthlyData = getMonthlyData(data);
    const monthlyCtx = document.getElementById('chartBerobatMonthly').getContext('2d');
    charts.berobatMonthly = new Chart(monthlyCtx, {
        type: 'line',
        data: {
            labels: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],
            datasets: [{
                label: 'Jumlah Kunjungan',
                data: monthlyData,
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                tension: 0.3,
                fill: true,
                borderWidth: 3,
                pointBackgroundColor: 'white',
                pointBorderColor: '#0d6efd',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false },
                datalabels: {
                    display: true,
                    color: '#1e293b',
                    align: 'top',
                    offset: 4,
                    font: { weight: 'bold', size: 11 },
                    formatter: (value) => value > 0 ? value : ''
                }
            },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } }
            }
        }
    });
    
    // Buat chart departemen (BAR CHART horizontal dengan value)
    const deptData = getTopData(data, 'Departemen', 10);
    const deptCtx = document.getElementById('chartBerobatDept').getContext('2d');
    charts.berobatDept = new Chart(deptCtx, {
        type: 'bar',
        data: {
            labels: deptData.labels,
            datasets: [{
                label: 'Jumlah Kunjungan',
                data: deptData.values,
                backgroundColor: '#198754',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false },
                datalabels: {
                    display: true,
                    color: '#1e293b',
                    anchor: 'end',
                    align: 'right',
                    offset: 4,
                    font: { weight: 'bold', size: 11 },
                    formatter: (value) => value > 0 ? value : ''
                }
            },
            scales: {
                x: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } }
            }
        }
    });
    
    // Buat chart jenis kelamin (DOUGHNUT dengan value di tengah)
    const genderData = getGenderData(data);
    const genderCtx = document.getElementById('chartBerobatGender').getContext('2d');
    charts.berobatGender = new Chart(genderCtx, {
        type: 'doughnut',
        data: {
            labels: genderData.labels,
            datasets: [{
                data: genderData.values,
                backgroundColor: ['#0d6efd', '#dc3545', '#6c757d'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: { position: 'bottom' },
                tooltip: { enabled: true },
                datalabels: {
                    display: true,
                    color: 'white',
                    font: { weight: 'bold', size: 14 },
                    formatter: (value, context) => {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                        return percentage > 5 ? percentage + '%' : '';
                    }
                }
            }
        }
    });
    
    // Buat chart kategori diagnosa (PIE dengan value)
    const diagCatData = getTopData(data, 'Kategori Diagnosa', 10);
    const diagCatCtx = document.getElementById('chartBerobatDiagnosaCategory').getContext('2d');
    charts.berobatDiagnosaCategory = new Chart(diagCatCtx, {
        type: 'pie',
        data: {
            labels: diagCatData.labels,
            datasets: [{
                data: diagCatData.values,
                backgroundColor: generateColors(diagCatData.labels.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: { enabled: true },
                datalabels: {
                    display: true,
                    color: 'white',
                    font: { weight: 'bold', size: 12 },
                    formatter: (value, context) => {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                        return percentage > 5 ? percentage + '%' : '';
                    }
                }
            }
        }
    });
    
    // Buat chart kategori obat (PIE dengan value)
    const obatCatData = getTopData(data, 'Kategori Obat', 10);
    const obatCatCtx = document.getElementById('chartBerobatObatCategory').getContext('2d');
    charts.berobatObatCategory = new Chart(obatCatCtx, {
        type: 'pie',
        data: {
            labels: obatCatData.labels,
            datasets: [{
                data: obatCatData.values,
                backgroundColor: generateColors(obatCatData.labels.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: { enabled: true },
                datalabels: {
                    display: true,
                    color: 'white',
                    font: { weight: 'bold', size: 12 },
                    formatter: (value, context) => {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                        return percentage > 5 ? percentage + '%' : '';
                    }
                }
            }
        }
    });
    
    // Buat chart top 10 nama diagnosa (BAR dengan value)
    const topDiagnosaData = getTopData(data, 'Nama Diagnosa', 10);
    const topDiagnosaCtx = document.getElementById('chartBerobatTopDiagnosa').getContext('2d');
    charts.berobatTopDiagnosa = new Chart(topDiagnosaCtx, {
        type: 'bar',
        data: {
            labels: topDiagnosaData.labels,
            datasets: [{
                label: 'Jumlah',
                data: topDiagnosaData.values,
                backgroundColor: '#ffc107',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false },
                datalabels: {
                    display: true,
                    color: '#1e293b',
                    anchor: 'end',
                    align: 'right',
                    offset: 4,
                    font: { weight: 'bold', size: 11 },
                    formatter: (value) => value > 0 ? value : ''
                }
            },
            scales: {
                x: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } }
            }
        }
    });
    
    // Buat chart top 10 nama obat (BAR dengan value)
    const topObatData = getTopData(data, 'Nama Obat', 10);
    const topObatCtx = document.getElementById('chartBerobatTopObat').getContext('2d');
    charts.berobatTopObat = new Chart(topObatCtx, {
        type: 'bar',
        data: {
            labels: topObatData.labels,
            datasets: [{
                label: 'Jumlah',
                data: topObatData.values,
                backgroundColor: '#0dcaf0',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false },
                datalabels: {
                    display: true,
                    color: '#1e293b',
                    anchor: 'end',
                    align: 'right',
                    offset: 4,
                    font: { weight: 'bold', size: 11 },
                    formatter: (value) => value > 0 ? value : ''
                }
            },
            scales: {
                x: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } }
            }
        }
    });
    
    // Buat chart top 10 jumlah hari istirahat (BAR dengan value)
    const topIstirahatData = getTopIstirahatData(data);
    const topIstirahatCtx = document.getElementById('chartBerobatTopIstirahat').getContext('2d');
    charts.berobatTopIstirahat = new Chart(topIstirahatCtx, {
        type: 'bar',
        data: {
            labels: topIstirahatData.labels,
            datasets: [{
                label: 'Jumlah Hari',
                data: topIstirahatData.values,
                backgroundColor: '#dc3545',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false },
                datalabels: {
                    display: true,
                    color: '#1e293b',
                    anchor: 'end',
                    align: 'right',
                    offset: 4,
                    font: { weight: 'bold', size: 11 },
                    formatter: (value) => value > 0 ? value : ''
                }
            },
            scales: {
                x: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } }
            }
        }
    });
}

// Fungsi untuk membuat chart di tab Kecelakaan
function createKecelakaanCharts(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Hapus chart lama jika ada
    if (charts.kecelakaanMonthly) charts.kecelakaanMonthly.destroy();
    if (charts.kecelakaanDept) charts.kecelakaanDept.destroy();
    if (charts.kecelakaanGender) charts.kecelakaanGender.destroy();
    
    container.innerHTML = `
        <div class="row g-4">
            <div class="col-lg-6">
                <div class="content-section">
                    <h6 class="fw-bold mb-3"><i class="fa-solid fa-calendar-alt me-2 text-danger"></i>Jumlah Kecelakaan per Bulan</h6>
                    <div style="height: 300px; position: relative;">
                        <canvas id="chartKecelakaanMonthly"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="content-section">
                    <h6 class="fw-bold mb-3"><i class="fa-solid fa-building me-2 text-danger"></i>Jumlah Kecelakaan per Departemen</h6>
                    <div style="height: 300px; position: relative;">
                        <canvas id="chartKecelakaanDept"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="content-section">
                    <h6 class="fw-bold mb-3"><i class="fa-solid fa-venus-mars me-2 text-danger"></i>Jenis Kelamin (Korban Kecelakaan)</h6>
                    <div style="height: 300px; position: relative;">
                        <canvas id="chartKecelakaanGender"></canvas>
                    </div>
                </div>
            </div>
        </div>
        <div class="content-section mt-4">
            <h6 class="fw-bold mb-3">Data Detail Kecelakaan</h6>
            <div id="kecelakaan-table-container"></div>
        </div>
    `;
    
    // Buat chart monthly (LINE CHART)
    const monthlyData = getMonthlyData(data);
    const monthlyCtx = document.getElementById('chartKecelakaanMonthly').getContext('2d');
    charts.kecelakaanMonthly = new Chart(monthlyCtx, {
        type: 'line',
        data: {
            labels: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],
            datasets: [{
                label: 'Jumlah Kecelakaan',
                data: monthlyData,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                tension: 0.3,
                fill: true,
                borderWidth: 3,
                pointBackgroundColor: 'white',
                pointBorderColor: '#dc3545',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false },
                datalabels: {
                    display: true,
                    color: '#1e293b',
                    align: 'top',
                    offset: 4,
                    font: { weight: 'bold', size: 11 },
                    formatter: (value) => value > 0 ? value : ''
                }
            },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } }
            }
        }
    });
    
    // Buat chart departemen (BAR CHART horizontal dengan value)
    const deptData = getTopData(data, 'Departemen', 10);
    const deptCtx = document.getElementById('chartKecelakaanDept').getContext('2d');
    charts.kecelakaanDept = new Chart(deptCtx, {
        type: 'bar',
        data: {
            labels: deptData.labels,
            datasets: [{
                label: 'Jumlah Kecelakaan',
                data: deptData.values,
                backgroundColor: '#dc3545',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false },
                datalabels: {
                    display: true,
                    color: '#1e293b',
                    anchor: 'end',
                    align: 'right',
                    offset: 4,
                    font: { weight: 'bold', size: 11 },
                    formatter: (value) => value > 0 ? value : ''
                }
            },
            scales: {
                x: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } }
            }
        }
    });
    
    // Buat chart jenis kelamin (DOUGHNUT dengan value di tengah)
    const genderData = getGenderData(data);
    const genderCtx = document.getElementById('chartKecelakaanGender').getContext('2d');
    charts.kecelakaanGender = new Chart(genderCtx, {
        type: 'doughnut',
        data: {
            labels: genderData.labels,
            datasets: [{
                data: genderData.values,
                backgroundColor: ['#0d6efd', '#dc3545', '#6c757d'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: { position: 'bottom' },
                tooltip: { enabled: true },
                datalabels: {
                    display: true,
                    color: 'white',
                    font: { weight: 'bold', size: 14 },
                    formatter: (value, context) => {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                        return percentage > 5 ? percentage + '%' : '';
                    }
                }
            }
        }
    });
}

// Helper functions untuk chart
function getMonthlyData(data) {
    const monthly = Array(12).fill(0);
    data.forEach(r => {
        if (r.bulan > 0 && r.bulan <= 12) {
            monthly[r.bulan - 1]++;
        }
    });
    return monthly;
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
            count[val] = (count[val] || 0) + 1;
        }
    });
    
    const sorted = Object.entries(count)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);
    
    return {
        labels: sorted.map(item => item[0]),
        values: sorted.map(item => item[1])
    };
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
    
    const sorted = Object.entries(istirahat)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    return {
        labels: sorted.map(item => item[0]),
        values: sorted.map(item => item[1])
    };
}

function generateColors(count) {
    const colors = [
        '#0d6efd', '#dc3545', '#198754', '#ffc107', '#0dcaf0',
        '#6f42c1', '#fd7e14', '#20c997', '#e83e8c', '#6610f2'
    ];
    return Array(count).fill().map((_, i) => colors[i % colors.length]);
}