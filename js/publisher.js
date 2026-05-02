import { auth, db } from './firebase-config.js';
import { ref, push, set, onValue, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const uploadForm = document.getElementById('uploadForm');
const myAppsList = document.getElementById('myAppsList');
const uploadModal = document.getElementById('uploadModal');

// Show/Hide Modal
window.showUploadModal = () => uploadModal.style.display = 'flex';
window.hideUploadModal = () => uploadModal.style.display = 'none';

// Fetch Publisher's Apps
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('userName').textContent = user.email;
        loadPublisherApps(user.uid);
    }
});

function loadPublisherApps(uid) {
    const appsRef = ref(db, 'apps');
    // Using simple filtration since complex queries need indexing
    onValue(appsRef, (snapshot) => {
        const data = snapshot.val();
        let apps = [];
        if (data) {
            apps = Object.entries(data)
                .map(([id, app]) => ({ id, ...app }))
                .filter(app => app.publisherId === uid);
        }
        renderTable(apps);
        updateStats(apps);
    });
}

function renderTable(apps) {
    if (apps.length === 0) {
        myAppsList.innerHTML = `<tr><td colspan="4" style="padding: 30px; text-align: center; color: var(--text-muted);">No apps uploaded yet.</td></tr>`;
        return;
    }

    myAppsList.innerHTML = apps.map(app => `
        <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 16px; display: flex; align-items: center; gap: 12px;">
                <img src="${app.logo}" style="width: 40px; height: 40px; border-radius: 8px;">
                <div>
                    <div style="font-weight: 500;">${app.name}</div>
                    <div style="font-size: 12px; color: var(--text-muted);">${app.packageName}</div>
                </div>
            </td>
            <td style="padding: 16px;">${app.category}</td>
            <td style="padding: 16px;">
                <span class="badge badge-${app.status}">${app.status.toUpperCase()}</span>
            </td>
            <td style="padding: 16px;">
                <button class="btn btn-outline" style="padding: 4px 12px; font-size: 12px;" onclick="alert('Editing coming soon')">Edit</button>
            </td>
        </tr>
    `).join('');
}

function updateStats(apps) {
    document.getElementById('totalApps').textContent = apps.length;
    document.getElementById('approvedApps').textContent = apps.filter(a => a.status === 'approved').length;
    document.getElementById('pendingApps').textContent = apps.filter(a => a.status === 'pending').length;
}

// Handle Form Submission
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const newApp = {
        name: document.getElementById('appName').value,
        category: document.getElementById('appCategory').value,
        packageName: document.getElementById('appPackage').value,
        description: document.getElementById('appDesc').value,
        logo: document.getElementById('appLogo').value,
        downloadUrl: document.getElementById('appUrl').value,
        publisherId: user.uid,
        status: 'pending',
        createdAt: Date.now()
    };

    try {
        const appsRef = ref(db, 'apps');
        const newAppRef = push(appsRef);
        await set(newAppRef, newApp);
        
        hideUploadModal();
        uploadForm.reset();
        alert("App submitted for review!");
    } catch (error) {
        alert("Error: " + error.message);
    }
});
