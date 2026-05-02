import { db } from './firebase-config.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const appGrid = document.getElementById('appGrid');
const searchInput = document.getElementById('searchInput');
const detailsModal = document.getElementById('detailsModal');
const closeModal = document.querySelector('.close-modal');
const themeToggle = document.getElementById('themeToggle');

let allApps = [];

// Theme Toggle
themeToggle?.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggle.innerHTML = isDark ? '<i class="fa fa-moon"></i>' : '<i class="fa fa-sun"></i>';
});

// Fetch Apps
const appsRef = ref(db, 'apps');
onValue(appsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        allApps = Object.entries(data)
            .map(([id, app]) => ({ id, ...app }))
            .filter(app => app.status === 'approved');
        renderApps(allApps);
    } else {
        appGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No apps available yet.</p>';
    }
});

function renderApps(apps) {
    appGrid.innerHTML = apps.map(app => `
        <div class="app-card" onclick="window.showAppDetails('${app.id}')">
            <img src="${app.logo}" alt="${app.name}" class="app-logo">
            <div class="app-info">
                <h3>${app.name}</h3>
                <p class="category">${app.category}</p>
                <div class="rating">
                    <span>4.8</span>
                    <i class="fa fa-star" style="color: var(--primary-color); font-size: 10px;"></i>
                </div>
            </div>
        </div>
    `).join('');
}

// Search & Filter
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allApps.filter(app => 
        app.name.toLowerCase().includes(query) || 
        app.description.toLowerCase().includes(query)
    );
    renderApps(filtered);
});

document.querySelectorAll('.filters button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.filters button.active').classList.remove('active');
        btn.classList.add('active');
        const category = btn.dataset.category;
        const filtered = category === 'all' ? allApps : allApps.filter(app => app.category === category);
        renderApps(filtered);
    });
});

// Modal Logic
window.showAppDetails = (appId) => {
    const app = allApps.find(a => a.id === appId);
    if (!app) return;

    document.getElementById('modalLogo').src = app.logo;
    document.getElementById('modalTitle').textContent = app.name;
    document.getElementById('modalPublisher').textContent = "Publisher ID: " + app.publisherId.substring(0, 8);
    document.getElementById('modalCategory').textContent = app.category;
    document.getElementById('modalDescription').textContent = app.description;
    document.getElementById('modalPackage').textContent = app.packageName;
    document.getElementById('downloadBtn').href = app.downloadUrl;

    detailsModal.style.display = 'flex';
};

closeModal?.addEventListener('click', () => {
    detailsModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === detailsModal) detailsModal.style.display = 'none';
});
