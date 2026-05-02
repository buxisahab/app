import { auth, db } from './firebase-config.js';
import { ref, onValue, update, set, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const adminAppList = document.getElementById('adminAppList');
const publisherList = document.getElementById('publisherList');
const pubModal = document.getElementById('pubModal');

// Tab Switching
window.showTab = (tab) => {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.getElementById(tab + 'Tab').style.display = 'block';
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    event.currentTarget.classList.add('active');
};

// Fetch All Apps
onValue(ref(db, 'apps'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        const apps = Object.entries(data).map(([id, app]) => ({ id, ...app }));
        renderAdminApps(apps);
    }
});

function renderAdminApps(apps) {
    adminAppList.innerHTML = apps.map(app => `
        <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 16px; display: flex; align-items: center; gap: 12px;">
                <img src="${app.logo}" style="width: 40px; height: 40px; border-radius: 8px;">
                <div>
                    <div style="font-weight: 500;">${app.name}</div>
                    <div style="font-size: 12px; color: var(--text-muted);">${app.packageName}</div>
                </div>
            </td>
            <td style="padding: 16px;">${app.publisherId.substring(0, 8)}...</td>
            <td style="padding: 16px;">
                <span class="badge badge-${app.status}">${app.status.toUpperCase()}</span>
            </td>
            <td style="padding: 16px;">
                <div style="display: flex; gap: 8px;">
                    ${app.status === 'pending' ? `
                        <button class="btn btn-primary" style="padding: 4px 12px; font-size: 12px;" onclick="updateAppStatus('${app.id}', 'approved')">Approve</button>
                        <button class="btn btn-outline" style="padding: 4px 12px; font-size: 12px; color: red;" onclick="updateAppStatus('${app.id}', 'rejected')">Reject</button>
                    ` : `
                        <button class="btn btn-outline" style="padding: 4px 12px; font-size: 12px;" onclick="updateAppStatus('${app.id}', 'pending')">Hold</button>
                    `}
                </div>
            </td>
        </tr>
    `).join('');
}

window.updateAppStatus = async (appId, status) => {
    try {
        await update(ref(db, `apps/${appId}`), { status });
    } catch (error) {
        alert("Error: " + error.message);
    }
};

// Fetch All Users (Publishers)
onValue(ref(db, 'users'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        const users = Object.entries(data).map(([id, user]) => ({ id, ...user }));
        renderPublishers(users);
    }
});

function renderPublishers(users) {
    publisherList.innerHTML = users.map(user => `
        <tr style="border-bottom: 1px solid var(--border-color);">
            <td style="padding: 16px;">${user.email}</td>
            <td style="padding: 16px;">${user.role}</td>
            <td style="padding: 16px;">
                <span class="badge badge-${user.status === 'active' ? 'approved' : 'rejected'}">${user.status}</span>
            </td>
            <td style="padding: 16px;">
                <button class="btn btn-outline" style="padding: 4px 12px; font-size: 12px;" onclick="toggleUserStatus('${user.id}', '${user.status}')">
                    ${user.status === 'active' ? 'Ban' : 'Unban'}
                </button>
            </td>
        </tr>
    `).join('');
}

window.toggleUserStatus = async (uid, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    await update(ref(db, `users/${uid}`), { status: newStatus });
};

// Publisher Management Modals
window.showAddPublisherModal = () => pubModal.style.display = 'flex';
window.hidePubModal = () => pubModal.style.display = 'none';

document.getElementById('pubForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('pubEmail').value;
    const name = document.getElementById('pubName').value;

    // IMPORTANT NOTE: In a real app, you'd use a Cloud Function to create the auth user.
    // For this prototype, the admin adds the user to the DB, 
    // and the user should be manually created in Firebase Console with the same UID or Email.
    alert("In this prototype, please create the user manually in Firebase Auth Console, then add their UID to the database under 'users' with role: 'publisher'.");
    
    // We can try to push to users if we had the UID, but we don't.
    // So we'll just show a message.
});

auth.onAuthStateChanged(user => {
    if (user) document.getElementById('adminEmail').textContent = user.email;
});
