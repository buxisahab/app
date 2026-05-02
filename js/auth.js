import { auth, db } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const loginForm = document.getElementById('loginForm');
const googleBtn = document.getElementById('googleLogin');
const errorMsg = document.getElementById('errorMsg');

// Handle Email/Password Login
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            checkUserRole(userCredential.user.uid);
        } catch (error) {
            showError(error.message);
        }
    });
}

// Handle Google Login
if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            checkUserRole(result.user.uid);
        } catch (error) {
            showError(error.message);
        }
    });
}

async function checkUserRole(uid) {
    const masterAdminUid = 'AKlMefBDCfWF1PP3V5R8KZHLVKj2';
    const masterPubUid = 'M02DIq3ymXWmIpBlfMTmBFAoSjb2';

    if (uid === masterAdminUid) {
        window.location.href = 'admin.html';
        return;
    }
    if (uid === masterPubUid) {
        window.location.href = 'publisher.html';
        return;
    }

    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.status === 'banned') {
            await signOut(auth);
            showError("Your account has been suspended. Please contact support.");
            return;
        }

        if (userData.role === 'admin') {
            window.location.href = 'admin.html';
        } else if (userData.role === 'publisher') {
            window.location.href = 'publisher.html';
        } else {
            showError("Unauthorized access. User role not recognized.");
        }
    } else {
        await signOut(auth);
        showError("No account found. Please contact admin to create a publisher account.");
    }
}

function showError(msg) {
    if (errorMsg) {
        errorMsg.textContent = msg;
        errorMsg.style.display = 'block';
    }
}

// Global Protection Helper
export function protectPage(allowedRole) {
    const masterAdminUid = 'AKlMefBDCfWF1PP3V5R8KZHLVKj2';
    const masterPubUid = 'M02DIq3ymXWmIpBlfMTmBFAoSjb2';

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        // Master bypass
        if (user.uid === masterAdminUid && allowedRole === 'admin') return;
        if (user.uid === masterPubUid && allowedRole === 'publisher') return;

        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            const userData = snapshot.val();
            if (userData.role !== allowedRole) {
                window.location.href = 'login.html';
            }
        } else {
            window.location.href = 'login.html';
        }
    });
}

// Logout logic
window.logout = () => {
    signOut(auth).then(() => {
        window.location.href = 'login.html';
    });
};
