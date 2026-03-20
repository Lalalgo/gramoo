// ════════════════════════════════════════
// GRAMOO — firebase-config.js
// Central Firebase configuration
// ════════════════════════════════════════
// NOTE: Firebase web API keys are intentionally public (they identify the project,
// not grant admin access). Security is enforced via Firestore Security Rules.
// See: https://firebase.google.com/docs/projects/api-keys

export const firebaseConfig = {
    apiKey:            "AIzaSyAeeN9ijnSuA3IyV43QQsiEshTrRdEjL0A",
    authDomain:        "gramoo-44d83.firebaseapp.com",
    projectId:         "gramoo-44d83",
    storageBucket:     "gramoo-44d83.firebasestorage.app",
    messagingSenderId: "527489942630",
    appId:             "1:527489942630:web:08bc4f70cb17185ee199a7"
};

// EmailJS config — public keys only, safe for client-side
export const EJS_CONFIG = {
    SERVICE:     'service_un25x5y',
    TPL_LISTING: 'template_g721f9g',
    PUBKEY:      'OAlzCN74cs01xSoZH'
};

export const ADMIN_EMAIL = 'kr.deepak2509@gmail.com';
