// Chart.js configuration and chart creation functions

let charts = {};

// Register plugin
Chart.register(ChartDataLabels);

// Default datalabels configuration
Chart.defaults.set('plugins.datalabels', {
    color: '#1e293b',
    font: { weight: 'bold', size: 11 },
    formatter: function(value, context) {
        return value > 0 ? value : '';
    }
});

function createKonsultasiCharts(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Destroy existing charts
    if (charts.konsultasiMonthly) charts.konsultasiMonthly.destroy();
    if (charts.konsultasiDept) charts.konsultasiDept.destroy();
    if (charts.konsultasiGender) charts.konsultasiGender.destroy();
    
    container.innerHTML = `
        <div class="row g-4">
            <div class="col-lg-6"><div class="content-section"><h6 class="fw-bold mb-3"><i class="fa-solid fa-calendar-alt me-2 text-success"></i>Jumlah Konsultasi per Bulan</h6><div style="height: 300px;"><canvas id="chartKonsultasiMonthly"></canvas></div></div></div>
            <div class="col-lg-6"><div class="content-section"><h6 class="fw-bold mb-3"><i class="fa-solid fa-building me-2 text-success"></i>Jumlah Konsultasi per Departemen</h6><div style="height: 300px;"><canvas id="chartKonsultasiDept"></canvas></div></div></div>
            <div class="col-lg-6"><div class="content-section"><h6 class="fw-bold mb-3"><i class="fa-solid fa-venus-mars me-2 text-success"></i>Jenis Kelamin (Konsultasi)</h6><div style="height: 300px;"><canvas id="chartKonsultasiGender"></canvas></div></div></div>
        </div>
        <div class="content-section mt-4"><h6 class="fw-bold mb-3">Data Detail Konsultasi</h6><div id="konsultasi-table-container"></div></div>
    `;
    
    const monthlyData = getMonthlyData(data);
    charts.konsultasiMonthly = new Chart(document.getElementById('chartKonsultasiMonthly'), {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
            datasets: [{
                label: 'Jumlah Konsultasi',
                data: monthlyData,
                borderColor: '#198754',
                backgroundColor: 'rgba(25, 135, 84, 0.1)',
                tension: 0.3,
                fill: true,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                datalabels: { display: true, align: 'top', offset: 4 }
            },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
    
    const deptData = getTopData(data, 'Departemen', 10);
    charts.konsultasiDept = new Chart(document.getElementById('chartKonsultasiDept'), {
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
                datalabels: { display: true, anchor: 'end', align: 'right', offset: 4 }
            },
            scales: { x: { beginAtZero: true } }
        }
    });
    
    const genderData = getGenderData(data);
    charts.konsultasiGender = new Chart(document.getElementById('chartKonsultasiGender'), {
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
                datalabels: {
                    display: true,
                    color: 'white',
                    font: { weight: 'bold', size: 14 },
                    formatter: (value, ctx) => {
                        const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                        const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                        return pct > 5 ? pct + '%' : '';
                    }
                }
            }
        }
    });
}

function createBerobatCharts(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Destroy existing charts
    if (charts.berobatDaily) charts.berobatDaily.destroy();
    if (charts.berobatMonthly) charts.berobatMonthly.destroy();
    if (charts.berobatDept) charts.berobatDept.destroy();
    if (charts.berobatGender) charts.berobatGender.destroy();
    if (charts.berobatTopDiagnosa) charts.berobatTopDiagnosa.destroy();
    if (charts.berobatTopObat) charts.berobatTopObat.destroy();
    if (charts.berobatTopIstirahat) charts.berobatTopIstirahat.destroy();
    
    container.innerHTML = `
        <div class="row g-4">
            <div class="col-12"><div class="content-section"><h6 class="fw-bold mb-3"><i class="fa-solid fa-calendar-day me-2 text-primary"></i>Kunjungan Harian</h6><div style="height: 350px;"><canvas id="chartBerobatDaily"></canvas></div></div></div>
            <div class="col-lg-6"><div class="content-section"><h6 class="fw-bold mb-3"><i class="fa-solid fa-calendar-alt me-2 text-primary"></i>Jumlah per Bulan</h6><div style="height: 300px;"><canvas id="chartBerobatMonthly"></canvas></div></div></div>
            <div class="col-lg-6"><div class="content-section"><h6 class="fw-bold mb-3"><i class="fa-solid fa-building me-2 text-primary"></i>Jumlah per Departemen</h6><div style="height: 300px;"><canvas id="chartBerobatDept"></canvas></div></div></div>
            <div class="col-lg-6"><div class="content-section"><h6 class="fw-bold mb-3"><i class="fa-solid fa-venus-mars me-2 text-primary"></i>Jenis Kelamin</h6><div style="height: 300px;"><canvas id="chartBerobatGender"></canvas></div></div></div>
            <div class="col-lg-6"><div class="content-section"><h6 class="fw-bold mb-3"><i class="fa-solid fa-chart-bar me-2 text-primary"></i>Top 10 Nama Diagnosa</h6><div style="height: 300px;"><canvas id="chartBerobatTopDiagnosa"></canvas></div></div></div>
            <div class="col-lg-6"><div class="content-section"><h6 class="fw-bold mb-3"><i class="fa-solid fa-capsules me-2 text-primary"></i>Top 10 Nama Obat</h6><div style="height: 300px;"><canvas id="chartBerobatTopObat"></canvas></div></div></div>
            <div class="col-lg-6"><div class="content-section"><h6 class="fw-bold mb-3"><i class="fa-solid fa-bed me-2 text-primary"></i>Top 10 Jumlah Hari Istirahat</h6><div style="height: 300px;"><canvas id="chartBerobatTopIstirahat"></canvas></div></div></div>
        </div>
        <div class="content-section mt-4"><h6 class="fw-bold mb-3">Data Detail Berobat</h6><div id="berobat-table-container"></div></div>
    `;
    
    const dailyData = getDailyData(data);
    charts.berobatDaily = new Chart(document.getElementById('chartBerobatDaily'), {
        type: 'bar',
        data: {
            labels: dailyData.labels,
            datasets: [{
                label: 'Jumlah Kunjungan',
                data: dailyData.values,
                backgroundColor: '#0d6efd',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                datalabels: { display: true, align: 'top', offset: 4 }
            },
            scales: {
                x: { ticks: { maxRotation: 45, minRotation: 45, autoSkip: true, maxTicksLimit: 31 } },
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
    
    const monthlyData = getMonthlyData(data);
    charts.berobatMonthly = new Chart(document.getElementById('chartBerobatMonthly'), {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
            datasets: [{
                label: 'Jumlah Kunjungan',
                data: monthlyData,
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                tension: 0.3,
                fill: true,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                datalabels: { display: true, align: 'top', offset: 4 }
            },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
    
    const deptData = getTopData(data, 'Departemen', 10);
    charts.berobatDept = new Chart(document.getElementById('chartBerobatDept'), {
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
                datalabels: { display: true, anchor: 'end', align: 'right', offset: 4 }
            },
            scales: { x: { beginAtZero: true } }
        }
    });
    
    const genderData = getGenderData(data);
    charts.berobatGender = new Chart(document.getElementById('chartBerobatGender'), {
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
                datalabels: {
                    display: true,
                    color: 'white',
                    font: { weight: 'bold', size: 14 },
                    formatter: (value, ctx) => {
                        const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                        const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                        return pct > 5 ? pct + '%' : '';
                    }
                }
            }
        }
    });
    
    const topDiagnosaData = getTopData(data, 'Nama Diagnosa', 10);
    charts.berobatTopDiagnosa = new Chart(document.getElementById('chartBerobatTopDiagnosa'), {
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
                datalabels: { display: true, anchor: 'end', align: 'right', offset: 4 }
            },
            scales: { x: { beginAtZero: true } }
        }
    });
    
    const topObatData = getTopData(data, 'Nama Obat', 10);
    charts.berobatTopObat = new Chart(document.getElementById('chartBerobatTopObat'), {
        type: 'bar',
        data: {
            labels: topObatData.labels,
            datasets: [{
                label: 'Jumlah Penggunaan',
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
                datalabels: { display: true, anchor: 'end', align: 'right', offset: 4 }
            },
            scales: { x: { beginAtZero: true } }
        }
    });
    
    const topIstirahatData = getTopIstirahatData(data);
    charts.berobatTopIstirahat = new Chart(document.getElementById('chartBerobatTopIstirahat'), {
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
                datalabels: { display: true, anchor: 'end', align: 'right', offset: 4 }
            },
            scales: { x: { beginAtZero: true } }
        }
    });
}

function createKecelakaanCharts(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Destroy existing charts
    if (charts.kecelakaanMonthly) charts.kecelakaanMonthly.destroy();
    if (charts.kecelakaanDept) charts.kecelakaanDept.destroy();
    if (charts.kecelakaanGender) charts.kecelakaanGender.destroy();
    
    container.innerHTML = `
        <div class="row g-4">
            <div class="col-lg-6"><div class="content-section"><h6 class="fw-bold mb-3"><i class="fa-solid fa-calendar-alt me-2 text-danger"></i>Jumlah Kecelakaan per Bulan</h6><div style="height: 300px;"><canvas id="chartKecelakaanMonthly"></canvas></div></div></div>
            <div class="col-lg-6"><div class="content-section"><h6 class="fw-bold mb-3"><i class="fa-solid fa-building me-2 text-danger"></i>Jumlah Kecelakaan per Departemen</h6><div style="height: 300px;"><canvas id="chartKecelakaanDept"></canvas></div></div></div>
            <div class="col-lg-6"><div class="content-section"><h6 class="fw-bold mb-3"><i class="fa-solid fa-venus-mars me-2 text-danger"></i>Jenis Kelamin (Korban Kecelakaan)</h6><div style="height: 300px;"><canvas id="chartKecelakaanGender"></canvas></div></div></div>
        </div>
        <div class="content-section mt-4"><h6 class="fw-bold mb-3">Data Detail Kecelakaan</h6><div id="kecelakaan-table-container"></div></div>
    `;
    
    const monthlyData = getMonthlyData(data);
    charts.kecelakaanMonthly = new Chart(document.getElementById('chartKecelakaanMonthly'), {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
            datasets: [{
                label: 'Jumlah Kecelakaan',
                data: monthlyData,
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                tension: 0.3,
                fill: true,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                datalabels: { display: true, align: 'top', offset: 4 }
            },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
    
    const deptData = getTopData(data, 'Departemen', 10);
    charts.kecelakaanDept = new Chart(document.getElementById('chartKecelakaanDept'), {
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
                datalabels: { display: true, anchor: 'end', align: 'right', offset: 4 }
            },
            scales: { x: { beginAtZero: true } }
        }
    });
    
    const genderData = getGenderData(data);
    charts.kecelakaanGender = new Chart(document.getElementById('chartKecelakaanGender'), {
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
                datalabels: {
                    display: true,
                    color: 'white',
                    font: { weight: 'bold', size: 14 },
                    formatter: (value, ctx) => {
                        const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                        const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                        return pct > 5 ? pct + '%' : '';
                    }
                }
            }
        }
    });
}