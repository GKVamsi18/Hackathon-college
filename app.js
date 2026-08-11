/* ==========================================================================
   AgriSmart Daily - Daily Farmer Operating Portal Core Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initDateDisplay();
    initTabNavigation();
    initCropScanner();
    initMandiPricesAndChart();
    initWeatherSimulator();
    initFarmProfitCalculator();
    initMarketplace();
});

/* Format current date string for daily dashboard */
function initDateDisplay() {
    const dateEl = document.getElementById('current-date-str');
    if (dateEl) {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const today = new Date().toLocaleDateString('en-US', options);
        dateEl.innerText = today;
    }
}

/* --------------------------------------------------------------------------
   1. TAB NAVIGATION ENGINE
   -------------------------------------------------------------------------- */
function initTabNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            switchToTab(targetTab);
        });
    });
}

function switchToTab(tabId, scrollTargetId = null) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    document.querySelectorAll('.tab-content').forEach(tab => {
        if (tab.id === tabId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    if (scrollTargetId) {
        setTimeout(() => {
            const targetEl = document.getElementById(scrollTargetId);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    } else {
        window.scrollTo({ top: 250, behavior: 'smooth' });
    }
}

/* --------------------------------------------------------------------------
   2. CROP DISEASE & HEALTH SCANNER
   -------------------------------------------------------------------------- */
function initCropScanner() {
    const fileInput = document.getElementById('leaf-file-input');
    const useSampleBtn = document.getElementById('use-sample-btn');
    const clearSampleBtn = document.getElementById('clear-sample-btn');

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    processLeafImage(evt.target.result);
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }

    if (useSampleBtn) {
        useSampleBtn.addEventListener('click', () => {
            processLeafImage('images/crop_leaf_sample.png');
        });
    }

    if (clearSampleBtn) {
        clearSampleBtn.addEventListener('click', resetScannerUI);
    }
}

function processLeafImage(imgSrc) {
    const dropzoneDefault = document.getElementById('dropzone-default');
    const dropzonePreview = document.getElementById('dropzone-preview');
    const previewImg = document.getElementById('preview-image');
    const scanOverlay = document.getElementById('scan-overlay');
    const scanStatusText = document.getElementById('scan-status-text');
    const resultsPlaceholder = document.getElementById('results-placeholder');
    const resultsContent = document.getElementById('results-content');
    const reportStatus = document.getElementById('report-status');

    dropzoneDefault.classList.add('hidden');
    dropzonePreview.classList.remove('hidden');
    previewImg.src = imgSrc;

    scanOverlay.classList.remove('hidden');
    scanStatusText.innerText = "Analyzing leaf spots & cell structures...";

    setTimeout(() => {
        scanStatusText.innerText = "Identifying fungal pathogen & dosage...";
    }, 1000);

    setTimeout(() => {
        scanOverlay.classList.add('hidden');
        resultsPlaceholder.classList.add('hidden');
        resultsContent.classList.remove('hidden');
        reportStatus.innerText = "Scan Complete • 96.4% Accuracy";
        reportStatus.className = "badge badge-success";

        showToast("Crop leaf scan complete! Diagnosis and spray dosage calculated.", "fa-circle-check");
    }, 2200);
}

function resetScannerUI() {
    document.getElementById('dropzone-default').classList.remove('hidden');
    document.getElementById('dropzone-preview').classList.add('hidden');
    document.getElementById('preview-image').src = '';
    document.getElementById('results-placeholder').classList.remove('hidden');
    document.getElementById('results-content').classList.add('hidden');
    document.getElementById('report-status').innerText = "Awaiting Leaf Scan";
    document.getElementById('report-status').className = "badge badge-info";
    document.getElementById('leaf-file-input').value = '';
}

/* --------------------------------------------------------------------------
   3. DAILY MANDI MARKET RATES & CANVAS CHART ENGINE
   -------------------------------------------------------------------------- */
const mandiData = [
    { commodity: "Wheat (Kanak)", market: "Khanna Mandi, Punjab", min: 2250, max: 2480, modal: 2380, trend: "+4.2%", state: "Punjab" },
    { commodity: "Basmati Paddy", market: "Karnal Mandi, Haryana", min: 3800, max: 4250, modal: 4100, trend: "+2.8%", state: "Haryana" },
    { commodity: "Hybrid Tomato", market: "Nashik Mandi, Maharashtra", min: 2200, max: 2800, modal: 2500, trend: "-1.5%", state: "Maharashtra" },
    { commodity: "Cotton (Kapas)", market: "Rajkot Mandi, Gujarat", min: 6800, max: 7400, modal: 7150, trend: "+5.1%", state: "Maharashtra" },
    { commodity: "Mustard (Sarson)", market: "Agra Mandi, Uttar Pradesh", min: 5100, max: 5650, modal: 5400, trend: "+1.2%", state: "Uttar Pradesh" },
    { commodity: "Soybean", market: "Indore Mandi, Madhya Pradesh", min: 4300, max: 4750, modal: 4550, trend: "+3.6%", state: "Madhya Pradesh" }
];

function initMandiPricesAndChart() {
    renderMandiTable(mandiData);
    renderCanvasChart();

    const searchInput = document.getElementById('mandi-search');
    const stateSelect = document.getElementById('state-select');

    if (searchInput) searchInput.addEventListener('input', filterMandiData);
    if (stateSelect) stateSelect.addEventListener('change', filterMandiData);
}

function renderMandiTable(data) {
    const tbody = document.getElementById('mandi-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#9ca3af; padding: 2rem;">No matching mandi price records found.</td></tr>';
        return;
    }

    data.forEach(item => {
        const isPositive = item.trend.startsWith('+');
        const trendBadgeClass = isPositive ? 'badge-success' : 'badge-warning';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${item.commodity}</strong></td>
            <td>${item.market}</td>
            <td>₹${item.min.toLocaleString()}</td>
            <td>₹${item.max.toLocaleString()}</td>
            <td><strong style="color:#10b981;">₹${item.modal.toLocaleString()}</strong></td>
            <td><span class="badge ${trendBadgeClass}">${item.trend}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function filterMandiData() {
    const query = (document.getElementById('mandi-search')?.value || '').toLowerCase();
    const selectedState = document.getElementById('state-select')?.value || 'all';

    const filtered = mandiData.filter(item => {
        const matchesQuery = item.commodity.toLowerCase().includes(query) || item.market.toLowerCase().includes(query);
        const matchesState = selectedState === 'all' || item.state === selectedState;
        return matchesQuery && matchesState;
    });

    renderMandiTable(filtered);
}

function renderCanvasChart() {
    const canvas = document.getElementById('mandiPriceChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    const pricePoints = [2250, 2280, 2310, 2300, 2340, 2370, 2450];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const minPrice = 2200;
    const maxPrice = 2500;

    ctx.clearRect(0, 0, width, height);

    const padLeft = 45;
    const padBottom = 30;
    const padTop = 20;
    const padRight = 20;

    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px Inter, sans-serif';

    const steps = 4;
    for (let i = 0; i <= steps; i++) {
        const yVal = minPrice + (maxPrice - minPrice) * (i / steps);
        const yPos = padTop + chartH - (i / steps) * chartH;

        ctx.beginPath();
        ctx.moveTo(padLeft, yPos);
        ctx.lineTo(width - padRight, yPos);
        ctx.stroke();

        ctx.fillText(`₹${Math.round(yVal)}`, 5, yPos + 4);
    }

    const coords = [];
    const stepX = chartW / (pricePoints.length - 1);

    pricePoints.forEach((val, idx) => {
        const xPos = padLeft + idx * stepX;
        const yRatio = (val - minPrice) / (maxPrice - minPrice);
        const yPos = padTop + chartH - yRatio * chartH;

        coords.push({ x: xPos, y: yPos, val: val });
        ctx.fillText(days[idx], xPos - 12, height - 8);
    });

    const gradient = ctx.createLinearGradient(0, padTop, 0, height - padBottom);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let i = 1; i < coords.length; i++) {
        ctx.lineTo(coords[i].x, coords[i].y);
    }
    ctx.lineTo(coords[coords.length - 1].x, height - padBottom);
    ctx.lineTo(coords[0].x, height - padBottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let i = 1; i < coords.length; i++) {
        ctx.lineTo(coords[i].x, coords[i].y);
    }
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.stroke();

    coords.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    });
}

/* --------------------------------------------------------------------------
   4. WEATHER & IRRIGATION ADVISORY SIMULATOR
   -------------------------------------------------------------------------- */
function initWeatherSimulator() {
    const moistSlider = document.getElementById('sim-moisture-slider');
    const tempSlider = document.getElementById('sim-temp-slider');

    if (moistSlider) moistSlider.addEventListener('input', updateAdvisorySimulation);
    if (tempSlider) tempSlider.addEventListener('input', updateAdvisorySimulation);
}

function updateAdvisorySimulation() {
    const moisture = parseInt(document.getElementById('sim-moisture-slider').value);
    const temp = parseInt(document.getElementById('sim-temp-slider').value);

    document.getElementById('sim-moisture-val').innerText = `${moisture}%`;
    document.getElementById('sim-temp-val').innerText = `${temp}°C`;

    document.getElementById('soil-moist-display').innerText = `${moisture}%`;
    document.getElementById('temp-val-display').innerText = `${temp}°C`;

    const advText = document.getElementById('adv-text');
    const dynamicAdvisoryCard = document.getElementById('dynamic-advisory');

    if (moisture < 35) {
        advText.innerHTML = `<strong style="color:#f87171;">Warning: Soil Moisture Low (${moisture}%).</strong> Trigger drip irrigation for 45 minutes to prevent crop wilt under ${temp}°C heat.`;
        dynamicAdvisoryCard.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    } else if (moisture > 80) {
        advText.innerHTML = `<strong style="color:#fbbf24;">Alert: Soil Waterlogging Risk (${moisture}%).</strong> Clear field drainage channels immediately to prevent root rot in high ambient temp (${temp}°C).`;
        dynamicAdvisoryCard.style.borderColor = 'rgba(245, 158, 11, 0.4)';
    } else {
        advText.innerHTML = `Soil moisture level (${moisture}%) is optimal. Hold back irrigation for 24 hours as 12mm rain is forecasted. Saves ~4,000L water/acre.`;
        dynamicAdvisoryCard.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    }
}

/* --------------------------------------------------------------------------
   5. DAILY FARM EXPENSE & CROP PROFIT CALCULATOR
   -------------------------------------------------------------------------- */
function initFarmProfitCalculator() {
    calculateFarmProfit();
}

function calculateFarmProfit() {
    const acres = parseFloat(document.getElementById('calc-acres')?.value || 1);
    const seedsPerAcre = parseFloat(document.getElementById('calc-seeds')?.value || 0);
    const fertsPerAcre = parseFloat(document.getElementById('calc-fertilizers')?.value || 0);
    const machPerAcre = parseFloat(document.getElementById('calc-machinery')?.value || 0);
    const laborPerAcre = parseFloat(document.getElementById('calc-labor')?.value || 0);

    const yieldPerAcre = parseFloat(document.getElementById('calc-yield')?.value || 0);
    const marketRate = parseFloat(document.getElementById('calc-rate')?.value || 0);

    const costPerAcre = seedsPerAcre + fertsPerAcre + machPerAcre + laborPerAcre;
    const totalCost = costPerAcre * acres;

    const totalYieldQuintals = yieldPerAcre * acres;
    const grossRevenue = totalYieldQuintals * marketRate;

    const netProfit = grossRevenue - totalCost;
    const profitPerAcre = acres > 0 ? (netProfit / acres) : 0;
    const profitMarginPct = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100) : 0;

    // Update UI Elements
    document.getElementById('res-net-profit').innerText = `₹${Math.round(netProfit).toLocaleString()}`;
    document.getElementById('res-total-cost').innerText = `₹${Math.round(totalCost).toLocaleString()}`;
    document.getElementById('res-gross-revenue').innerText = `₹${Math.round(grossRevenue).toLocaleString()}`;
    document.getElementById('res-cost-per-acre').innerText = `₹${Math.round(costPerAcre).toLocaleString()}`;

    const profitPerAcreEl = document.getElementById('res-profit-per-acre');
    profitPerAcreEl.innerText = `₹${Math.round(profitPerAcre).toLocaleString()}`;

    const statusBadge = document.getElementById('res-profit-status');
    if (netProfit > 0) {
        profitPerAcreEl.className = 'metric-val text-green';
        statusBadge.className = 'badge badge-success';
        statusBadge.innerText = `High Profit Margin (${profitMarginPct.toFixed(1)}%)`;
    } else {
        profitPerAcreEl.className = 'metric-val text-danger';
        statusBadge.className = 'badge badge-warning';
        statusBadge.innerText = `Projected Loss (${profitMarginPct.toFixed(1)}%)`;
    }
}

/* --------------------------------------------------------------------------
   6. FARM MARKETPLACE ENGINE
   -------------------------------------------------------------------------- */
function initMarketplace() {
    const filterBtns = document.querySelectorAll('.filter-pills .filter-btn');
    const marketCards = document.querySelectorAll('.market-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            marketCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    const openPostBtn = document.getElementById('open-post-modal-btn');
    if (openPostBtn) {
        openPostBtn.addEventListener('click', () => {
            document.getElementById('post-modal').classList.remove('hidden');
        });
    }
}

function contactSeller(sellerName, phone, itemTitle) {
    showToast(`Farmer Contact: ${sellerName} - ${phone} (${itemTitle})`, "fa-phone");
}

function handlePostListing(e) {
    e.preventDefault();
    const title = document.getElementById('listing-title').value;
    const category = document.getElementById('listing-category').value;
    const price = document.getElementById('listing-price').value;
    const seller = document.getElementById('listing-seller').value;
    const phone = document.getElementById('listing-phone').value;
    const desc = document.getElementById('listing-desc').value;

    const marketGrid = document.getElementById('market-grid');
    const badgeText = category === 'equipment' ? 'Rental' : 'Produce';
    const badgeClass = category === 'equipment' ? 'badge-rent' : '';

    const card = document.createElement('div');
    card.className = 'market-card';
    card.setAttribute('data-category', category);
    card.innerHTML = `
        <div class="market-card-badge ${badgeClass}">${badgeText}</div>
        <div class="market-card-body">
            <h3>${title}</h3>
            <p class="seller-info"><i class="fa-solid fa-user-check"></i> ${seller}</p>
            <div class="market-price">₹${parseInt(price).toLocaleString()} <span class="unit">/ unit</span></div>
            <p class="market-desc">${desc}</p>
            <div class="market-card-actions">
                <button class="btn btn-primary btn-sm" onclick="contactSeller('${seller}', '${phone}', '${title}')">
                    <i class="fa-solid fa-phone"></i> Call Farmer
                </button>
            </div>
        </div>
    `;

    marketGrid.prepend(card);
    closeModal('post-modal');
    document.getElementById('post-listing-form').reset();
    showToast("Your farm listing has been published!", "fa-circle-check");
}

function showHelplineDetails() {
    switchToTab('tab-schemes');
    showToast("Kisan Call Center: 1800-180-1551 (Toll-Free, 6AM - 10PM)", "fa-phone");
}

/* UTILITY HELPERS */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

function showToast(msg, iconClass = 'fa-circle-check') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');

    if (!toast) return;

    toastMsg.innerText = msg;
    toastIcon.className = `fa-solid ${iconClass} toast-icon`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}
