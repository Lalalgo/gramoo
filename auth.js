// ════════════════════════════════════════
// GRAMOO — auth.js
// Google login, auth UI, My Listings panel
// ════════════════════════════════════════

import { db, auth, provider } from "./firebase-config.js";
import { getDist, timeAgo, encPhone, decPhone, checkSpam, validatePhone, getDeviceType, getBrowserName } from "./utils.js";
import { sendListingEmail } from "./email.js";
import { catIcons, grainMeta, shopMeta, suchnaMeta, GRAIN_SUBTYPES, MASTER_ITEMS, DEMO_SHOPS, DEMO_SHOP, sampleSell, sampleBuy, sampleShop, sampleSuchna } from "./data.js";

// ── Shared State Access ───────────────────────────────────
// G aur DOM gramoo.js se milte hain — window par shared hain
const G   = window._G   || {};
const DOM = window._DOM || {};


// G aur DOM — gramoo.js core se share hota hai
// Direct window._G / window._DOM use karo ya gramoo.js G/DOM import karo

// ── Google Auth ───────────────────────────────────────────
async function googleLogin() {
    // Already logged in hai to kuch mat karo — login box hata do
    const currentUser = (window._G && window._G.currentUser) || null;
    if (currentUser) {
        const box = document.getElementById("loginRequiredBox");
        if (box) box.remove();
        return;
    }
    try {
        const isMobile = /mobile|android|iphone|ipad/i.test(navigator.userAgent);
        if (isMobile) {
            // Mobile: redirect — COOP error nahi aata
            await signInWithRedirect(auth, provider);
        } else {
            // Desktop: popup
            const result = await signInWithPopup(auth, provider);
            if (result?.user) {
                const box = document.getElementById("loginRequiredBox");
                if (box) box.remove();
            }
        }
    } catch(e) {
        const ignore = ["auth/popup-closed-by-user","auth/cancelled-popup-request","auth/user-cancelled"];
        if (!ignore.includes(e.code)) alert("Login failed: " + e.message);
    }
}

function updateAuthUI(user) {
    G.currentUser = user;
    const authBtn  = document.getElementById("authBtn");
    const userInfo = document.getElementById("userInfo");
    if (!authBtn || !userInfo) return;
    if (user) {
        authBtn.style.display  = "none";
        userInfo.style.display = "flex";
        const photo = document.getElementById("userPhoto");
        const name  = document.getElementById("userName");
        if (photo) { photo.src = user.photoURL || ""; photo.style.display = user.photoURL ? "block" : "none"; }
        if (name)  name.textContent = user.displayName ? user.displayName.split(" ")[0] : "User";
    } else {
        authBtn.style.display  = "flex";
        userInfo.style.display = "none";
    }
}

function startAuthListener() {
    // Mobile redirect ke baad result handle karo
    getRedirectResult(auth).then(result => {
        if (result?.user) {
            const box = document.getElementById("loginRequiredBox");
            if (box) box.remove();
        }
    }).catch(() => {});

    onAuthStateChanged(auth, user => {
        updateAuthUI(user);
        // Login hote hi loginRequiredBox auto-remove
        if (user) {
            const box = document.getElementById("loginRequiredBox");
            if (box) box.remove();
        }
    });
}

function openMyListings() {
    const panel = document.getElementById("myListingsPanel");
    if (!panel) return;
    panel.classList.add("active");
    renderMyListings();
}
function closeMyListings() {
    const panel = document.getElementById("myListingsPanel");
    if (panel) panel.classList.remove("active");
}

function renderMyListings() {
    const body = document.getElementById("myListingsBody");
    if (!body || !G.currentUser) return;
    const uid = G.currentUser.uid;
    const all = [...(G.allSell||[]), ...(G.allBuy||[]), ...(G.allShop||[]), ...(G.allSuchna||[])]
        .filter(i => i.uid === uid);
    if (!all.length) {
        body.innerHTML = '<p style="text-align:center;color:#888;padding:20px">अभी कोई listing नहीं</p>';
        return;
    }
    body.innerHTML = all.map(i => `
        <div class="my-listing-item">
            <div>
                <div class="my-listing-title">${i.name||i.title||"—"}</div>
                <div class="my-listing-meta">${i.grain||i.product||i.type||""} • ${i.loc||""}</div>
            </div>
        </div>`).join("");
}


// ── Window Exports (type=module ke liye zaroori) ─────────
window.updateSubtypeDropdown = updateSubtypeDropdown;
window.runShopSearch     = runShopSearch;
window.openForm          = openForm;
window.closeForm         = closeForm;
window.closeFormOutside  = (e) => { if(e.target===DOM.modalOverlay()) closeForm(); };
window.switchMainTab     = switchMainTab;
window.switchSubTab      = switchSubTab;
window.switchFormTab     = switchFormTab;
window.filterListings    = filterListings;
window.openLocationPopup = openLocationPopup;
window.closeLocationPopup= closeLocationPopup;
window.autoLocation      = autoLocation;
window.setManualLocation = setManualLocation;
window.validatePhone     = validatePhone;
window.openMissedCall    = openMissedCall;
window.closeMissedCall   = closeMissedCall;
window.addAnaajListing   = addAnaajListing;
window.addShopListing    = addShopListing;
window.addSuchnaListing  = addSuchnaListing;
window.openMyListings    = openMyListings;
window.closeMyListings   = closeMyListings;
window.googleLogin       = googleLogin;



export { googleLogin, updateAuthUI, startAuthListener, openMyListings, closeMyListings };
