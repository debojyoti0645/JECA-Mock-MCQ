// This file contains JavaScript code that handles button click events and navigation logic for the subject pages.

document.addEventListener('DOMContentLoaded', function() {
    // Subject button navigation
    const buttons = document.querySelectorAll('.subject-button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const subjectPage = this.getAttribute('data-subject');
            window.location.href = `subjects/${subjectPage}.html`;
        });
    });

    // Firebase Auth & Modal logic
    const firebaseConfig = {
        apiKey: "AIzaSyDa_0HRwSks6FaUemlg3i6RSGWXkPbQhHE",
        authDomain: "jeca-mock.firebaseapp.com",
        projectId: "jeca-mock",
        storageBucket: "jeca-mock.firebasestorage.app",
        messagingSenderId: "809913801571",
        appId: "1:809913801571:web:57f71b72c7132be2b11156",
        measurementId: "G-1E7JPTTPF6"
    };
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const authModal = document.getElementById('auth-modal');
    const authForm = document.getElementById('auth-form');
    const authTitle = document.getElementById('auth-title');
    const authToggle = document.getElementById('auth-toggle');
    const authError = document.getElementById('auth-error');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userBar = document.getElementById('user-bar');
    const userEmail = document.getElementById('user-email');
    const authName = document.getElementById('auth-name');
    const authConfirm = document.getElementById('auth-confirm');
    const authClose = document.getElementById('auth-close');
    const userNameSpan = document.getElementById('user-name');
    const userDetailsDropdown = document.getElementById('user-details-dropdown');
    const dropdownName = document.getElementById('dropdown-name');
    const dropdownEmail = document.getElementById('dropdown-email');
    const dropdownJoined = document.getElementById('dropdown-joined');
    const dropdownExams = document.getElementById('dropdown-exams');

    let isLogin = true;
    let userDocUnsub = null;

    // Password eye toggle logic
    document.querySelectorAll('.toggle-password').forEach(function(eye) {
        eye.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;
            if (input.type === 'password') {
                input.type = 'text';
                this.innerHTML = '&#128064;'; // open eye
            } else {
                input.type = 'password';
                this.innerHTML = '&#128065;'; // closed eye
            }
        });
    });

    // Show/hide confirm password eye icon with field
    const confirmWrapper = document.getElementById('confirm-wrapper');
    function showAuthModal(login = true) {
        isLogin = login;
        authTitle.textContent = login ? 'Login' : 'Sign Up';
        authToggle.textContent = login ? "Don't have an account? Sign up" : "Already have an account? Login";
        authError.textContent = '';
        authName.style.display = login ? 'none' : '';
        confirmWrapper.style.display = login ? 'none' : '';
        authConfirm.style.display = login ? 'none' : '';
        authModal.style.display = 'flex';
    }
    function hideAuthModal() { authModal.style.display = 'none'; }
    authClose.onclick = hideAuthModal;
    // Optional: close modal when clicking outside the modal box
    authModal.addEventListener('click', function(e) {
        if (e.target === authModal) hideAuthModal();
    });

    loginBtn.onclick = () => showAuthModal(true);
    signupBtn.onclick = () => showAuthModal(false);
    authToggle.onclick = () => showAuthModal(!isLogin);

    authForm.onsubmit = async (e) => {
        e.preventDefault();
        authError.textContent = '';
        const name = authName.value.trim();
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;
        const confirm = authConfirm.value;
        if (!isLogin) {
            // Sign Up logic
            try {
                const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                // Create user document in Firestore
                await firebase.firestore().collection('users').doc(user.uid).set({
                    name: name,
                    email: email,
                    joined: firebase.firestore.FieldValue.serverTimestamp(),
                    examsTaken: 0
                });
                // Optionally, create an empty cbt-exams subcollection (not required, but you can add a welcome doc if you want)
                // await firebase.firestore().collection('users').doc(user.uid).collection('cbt-exams').add({created: firebase.firestore.FieldValue.serverTimestamp(), welcome: true});
                hideAuthModal();
            } catch (error) {
                authError.textContent = error.message;
            }
        } else {
            // Login logic
            try {
                await firebase.auth().signInWithEmailAndPassword(email, password);
                hideAuthModal();
            } catch (err) {
                // Friendly error messages
                let msg = err.message;
                if (err.code === 'auth/email-already-in-use') msg = "Email already in use.";
                if (err.code === 'auth/invalid-email') msg = "Invalid email address.";
                if (err.code === 'auth/user-not-found') msg = "No user found with this email.";
                if (err.code === 'auth/wrong-password') msg = "Incorrect password.";
                if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
                authError.textContent = msg;
            }
        }
    };

    logoutBtn.onclick = () => firebase.auth().signOut();

    // Show/hide user details dropdown
    userNameSpan.onclick = function(e) {
        e.stopPropagation();
        userDetailsDropdown.style.display = userDetailsDropdown.style.display === 'block' ? 'none' : 'block';
    };
    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (userDetailsDropdown.style.display === 'block') {
            userDetailsDropdown.style.display = 'none';
        }
    });

    firebase.auth().onAuthStateChanged(async user => {
        if (user) {
            // Fetch user Firestore data
            const usersRef = firebase.firestore().collection('users');
            // Try to find doc with email as prefix
            const query = usersRef.where('email', '==', user.email).limit(1);
            const snap = await query.get();
            let userData = null, docId = null;
            if (!snap.empty) {
                const doc = snap.docs[0];
                userData = doc.data();
                docId = doc.id;
            }
            // Show name if available, else fallback to email
            userNameSpan.textContent = userData && userData.name ? userData.name : user.email;
            userNameSpan.style.display = '';
            userEmail.style.display = 'none';
            logoutBtn.style.display = '';
            loginBtn.style.display = 'none';
            signupBtn.style.display = 'none';

            // Fill dropdown
            dropdownName.textContent = userData && userData.name ? userData.name : user.email;
            dropdownEmail.textContent = user.email;
            if (userData && userData.createdAt && userData.createdAt.toDate) {
                const date = userData.createdAt.toDate();
                dropdownJoined.textContent = date.toLocaleDateString();
            } else {
                dropdownJoined.textContent = user.metadata && user.metadata.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString()
                    : '';
            }
            // Exams taken: try to fetch from userData.examsTaken or fallback to 0
            dropdownExams.textContent = userData && typeof userData.examsTaken === 'number'
                ? userData.examsTaken
                : '0';

            // Optionally, listen for live updates to user doc
            if (userDocUnsub) userDocUnsub();
            if (docId) {
                userDocUnsub = usersRef.doc(docId).onSnapshot(doc => {
                    const d = doc.data();
                    if (d) {
                        dropdownName.textContent = d.name || user.email;
                        dropdownEmail.textContent = user.email;
                        if (d.createdAt && d.createdAt.toDate) {
                            dropdownJoined.textContent = d.createdAt.toDate().toLocaleDateString();
                        }
                        dropdownExams.textContent = typeof d.examsTaken === 'number' ? d.examsTaken : '0';
                    }
                });
            }
        } else {
            userNameSpan.style.display = 'none';
            userEmail.style.display = '';
            logoutBtn.style.display = 'none';
            loginBtn.style.display = '';
            signupBtn.style.display = '';
            userDetailsDropdown.style.display = 'none';
            if (userDocUnsub) userDocUnsub();
        }
        hideAuthModal();
    });

    // Helper to generate a 4-digit random number as string
    function generateWebsiteId() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
});