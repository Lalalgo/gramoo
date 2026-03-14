// ════════════════════════════════════════
// GRAMOO — firebase-config.js
// Firebase init — db, auth export karta hai
// Dono gramoo.js aur shop.js use karte hain
// ════════════════════════════════════════

import { initializeApp }   from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey:            "AIzaSyAeeN9ijnSuA3IyV43QQsiEshTrRdEjL0A",
    authDomain:        "gramoo-44d83.firebaseapp.com",
    projectId:         "gramoo-44d83",
    storageBucket:     "gramoo-44d83.firebasestorage.app",
    messagingSenderId: "527489942630",
    appId:             "1:527489942630:web:08bc4f70cb17185ee199a7"
};

const app      = initializeApp(firebaseConfig);
const db       = getFirestore(app);
const auth     = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export { app, db, auth, provider };
