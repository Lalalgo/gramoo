// ════════════════════════════════════════════════════════
// GRAMOO — gramoo.js  (ES Module)
// ════════════════════════════════════════════════════════
// SECTIONS:
//  1.  Firebase Init
//  2.  Meta (icons/colors)
//  3.  Sample Data
//  4.  Global State (G)
//  5.  DOM Cache
//  6.  Helpers (getDist, timeAgo)
//  7.  Phone Encrypt/Decrypt
//  8.  Spam Control
//  9.  Render Functions
//  10. Filter & Display
//  11. Stats & Activity
//  12. UI Tab Switching
//  13. Form Open/Close
//  14. Location
//  15. Phone Validation
//  16. Missed Call
//  17. Form Submit
//  18. Event Listeners (Event Delegation — no inline onclick)
//  19. Firebase Listeners
//  20. Init
// ════════════════════════════════════════════════════════

// ── Imports — Firebase ───────────────────────────────────
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDoc, doc, setDoc }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Imports — Local Modules ───────────────────────────────
import { db, auth, provider } from "./firebase-config.js";
import { getDist, timeAgo, encPhone, decPhone, checkSpam, validatePhone, getDeviceType, getBrowserName } from "./utils.js";
import { sendListingEmail } from "./email.js";
import { catIcons, grainMeta, shopMeta, suchnaMeta, GRAIN_SUBTYPES, MASTER_ITEMS, DEMO_SHOPS, DEMO_SHOP, sampleSell, sampleBuy, sampleShop, sampleSuchna } from "./data.js";
import { renderGrain, renderShop, renderSuchna, filterListings, updateStats, updateActivity } from "./render.js";
import { initShopSearch, runShopSearch, renderShopSection, startShopListener } from "./shop-search.js";
import { openForm, closeForm, switchFormTab, addAnaajListing, addShopListing, addSuchnaListing, openLocationPopup, closeLocationPopup, autoLocation, setManualLocation, openMissedCall, closeMissedCall } from "./forms.js";
import { googleLogin, updateAuthUI, startAuthListener, openMyListings, closeMyListings } from "./auth.js";



// ── Grain Subtype Dropdown ──────────────────────────────

function updateSubtypeDropdown() {
    const grain   = document.getElementById("fGrain")?.value || "";
    const wrap    = document.getElementById("fSubtypeWrap");
    const sel     = document.getElementById("fSubtype");
    const desc    = document.getElementById("fDesc");
    const descLbl = document.getElementById("fDescLabel");

    // Subtype dropdown
    if (wrap && sel) {
        const list = GRAIN_SUBTYPES[grain] || [];
        if (!grain || !list.length) {
            wrap.style.display = "none";
            sel.innerHTML = "";
        } else {
            wrap.style.display = "block";
            sel.innerHTML = `<option value="">-- किस्म चुनें (optional) --</option>` +
                list.map(s => `<option value="${s}">${s}</option>`).join("");
        }
    }

    // fDesc placeholder + label update
    if (desc) {
        if (grain) {
            const typeVal = document.getElementById("fType")?.value || "बेचना है";
            if (typeVal === "बेचना है") {
                desc.placeholder = `अपने ${grain} के बारे में बताएं — जैसे: नया माल है, खेत से सीधे, जैविक, कब से उपलब्ध, कोई खास बात...`;
            } else {
                desc.placeholder = `आपको कैसा ${grain} चाहिए — जैसे: अच्छी किस्म, कम नमी, जल्दी चाहिए, delivery चाहिए...`;
            }
        } else {
            desc.placeholder = "जैसे: नया माल, जैविक, जल्दी चाहिए...";
        }
    }
    if (descLbl && grain) {
        descLbl.innerHTML = `अपने <b style="color:#1b5e20">${grain}</b> के बारे में बताएं <span style="font-weight:400;color:#aaa;font-size:11px;">(optional — पर लिखें तो जल्दी मिलेगा)</span>`;
    } else if (descLbl) {
        descLbl.innerHTML = `कोई खास बात? <span style="font-weight:400;color:#aaa;font-size:11px;">(optional)</span>`;
    }
}

// ── 4. Global State ──────────────────────────────────────
const G = {
    currentUser: null,
    mainTab:"anaaj", subTab:"becho",
    userLat:null, userLng:null, userLocName:"सभी क्षेत्र",
    allSell:[...sampleSell], allBuy:[...sampleBuy],
    allShop:[...sampleShop], allSuchna:[...sampleSuchna],
    allShopsFull: [] // approved shops from Firebase
};
window._G = G; // debug ke liye

// ── 5. DOM Cache ─────────────────────────────────────────
const DOM = {
    loadingScreen:    () => document.getElementById("loadingScreen"),
    fbStatus:         () => document.getElementById("fbStatus"),
    locationName:     () => document.getElementById("locationName"),
    locationSub:      () => document.getElementById("locationSub"),
    distanceSelect:   () => document.getElementById("distanceSelect"),
    searchInput:      () => document.getElementById("searchInput"),
    totalListings:    () => document.getElementById("totalListings"),
    noticeCount:      () => document.getElementById("noticeCount"),
    sideDeals:        () => document.getElementById("sideDeals"),
    listingsContainer:() => document.getElementById("listingsContainer"),
    activityFeed:     () => document.getElementById("activityFeed"),
    subTabsRow:       () => document.getElementById("subTabsRow"),
    postBarText:      () => document.getElementById("postBarText"),
    postBtn:          () => document.getElementById("postBtn"),
    modalOverlay:     () => document.getElementById("modalOverlay"),
    successMsg:       () => document.getElementById("successMsg"),
    savingIndicator:  () => document.getElementById("savingIndicator"),
    locationPopup:    () => document.getElementById("locationPopup"),
    stateSelect:      () => document.getElementById("stateSelect"),
    missedOverlay:    () => document.getElementById("missedOverlay"),
    // Forms
    fName:  () => document.getElementById("fName"),
    fGrain: () => document.getElementById("fGrain"),
    fQty:   () => document.getElementById("fQty"),
    fPrice: () => document.getElementById("fPrice"),
    fLoc:   () => document.getElementById("fLoc"),
    fWA:    () => document.getElementById("fWA"),
    fDesc:  () => document.getElementById("fDesc"),
    sName:     () => document.getElementById("sName"),
    sCategory: () => document.getElementById("sCategory"),
    sProduct:  () => document.getElementById("sProduct"),
    sPrice:    () => document.getElementById("sPrice"),
    sLoc:      () => document.getElementById("sLoc"),
    sWA:       () => document.getElementById("sWA"),
    sDesc:     () => document.getElementById("sDesc"),
    nName:  () => document.getElementById("nName"),
    nType:  () => document.getElementById("nType"),
    nLoc:   () => document.getElementById("nLoc"),
    nTitle: () => document.getElementById("nTitle"),
    nDesc:  () => document.getElementById("nDesc"),
    nPhone: () => document.getElementById("nPhone"),
    nValid: () => document.getElementById("nValid"),
    nUrgent:() => document.getElementById("nUrgent"),
};







// ── 12. UI Tab Switching ─────────────────────────────────
function switchMainTab(tab, el) {
    G.mainTab = tab;
    document.querySelectorAll(".main-tab").forEach(t => t.classList.remove("active"));
    el.classList.add("active");

    const isShop   = tab === "shop";
    const isSuchna = tab === "suchna";

    // Elements to hide/show
    const mainLayout  = document.getElementById("mainListingLayout") || document.querySelector(".main-layout");
    const shopSection = document.getElementById("shopSection");
    const postBarEl   = document.querySelector(".post-bar");
    const heroEl      = document.querySelector(".hero");
    const mainTabsEl  = document.querySelector(".main-tabs");
    const subTabsEl   = DOM.subTabsRow();

    if (mainLayout)  mainLayout.style.display  = isShop ? "none" : "";
    if (shopSection) shopSection.style.display = isShop ? "block" : "none";
    if (heroEl)      heroEl.style.display      = isShop ? "none" : "";
    if (mainTabsEl)  mainTabsEl.style.display  = isShop ? "none" : "";

    // Back bar — shop mode mein dikhao
    let backBar = document.getElementById("shopBackBar");
    if (isShop) {
        if (!backBar) {
            backBar = document.createElement("div");
            backBar.id = "shopBackBar";
            backBar.style.cssText = "background:#1b5e20;padding:10px 16px;display:flex;align-items:center;gap:10px;position:sticky;top:0;z-index:99;";
            backBar.innerHTML = `<button onclick="switchMainTab('anaaj', document.querySelectorAll('.main-tab')[0])"
                style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:white;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">
                ← वापस
            </button>
            <span style="color:white;font-size:14px;font-weight:700;">🏪 नज़दीकी किसान दुकान</span>`;
            if (shopSection && shopSection.parentNode) {
                shopSection.parentNode.insertBefore(backBar, shopSection);
            }
        }
        backBar.style.display = "flex";
    } else {
        if (backBar) backBar.style.display = "none";
    }

    if (subTabsEl) subTabsEl.style.display = tab==="anaaj" ? "flex" : "none";

    if (isShop) {
        renderShopSection();
        return;
    }


    filterListings();
}

// Search state




window.filterShops    = runShopSearch;
window.runShopSearch  = runShopSearch;

let _shopSearchInited = false;


function switchSubTab(tab, el) {
    G.subTab = tab;
    document.querySelectorAll(".sub-tab").forEach(t => t.classList.remove("active"));
    el.classList.add("active");
    filterListings();
}


// Login required popup — contact/submit ke waqt









// ── 18. Event Listeners (Event Delegation) ───────────────
function bindEvents() {

    // Auth buttons
    const authBtn            = document.getElementById("authBtn");
    const btnLogout          = document.getElementById("btnLogout");
    const btnMyListings      = document.getElementById("btnMyListings");
    const btnCloseMyListings = document.getElementById("btnCloseMyListings");
    if (authBtn)            authBtn.addEventListener("click", googleLogin);
    if (btnLogout)          btnLogout.addEventListener("click", () => signOut(auth));
    if (btnMyListings)      btnMyListings.addEventListener("click", openMyListings);
    if (btnCloseMyListings) btnCloseMyListings.addEventListener("click", closeMyListings);

    // Header btn — null-safe
    const headerBtn = document.querySelector(".header-btn");
    if (headerBtn) headerBtn.addEventListener("click", openForm);

    // Post bar
    const postBtn = DOM.postBtn();
    if (postBtn) postBtn.addEventListener("click", openForm);

    // Main tabs
    const mainTabs = document.querySelector(".main-tabs");
    if (mainTabs) mainTabs.addEventListener("click", e => {
        const tab = e.target.closest(".main-tab");
        if (tab) switchMainTab(tab.dataset.tab, tab);
    });

    // Sub tabs
    const subTabsRow = DOM.subTabsRow();
    if (subTabsRow) subTabsRow.addEventListener("click", e => {
        const tab = e.target.closest(".sub-tab");
        if (tab) switchSubTab(tab.dataset.tab, tab);
    });

    // Search & distance
    const searchInput   = DOM.searchInput();
    const distanceSelect = DOM.distanceSelect();
    if (searchInput)    searchInput.addEventListener("input", filterListings);
    if (distanceSelect) distanceSelect.addEventListener("change", filterListings);

    // Location bar
    const btnLocation = document.querySelector(".btn-location");
    const btnGps      = document.querySelector(".btn-gps");
    const btnManual   = document.querySelector(".btn-manual");
    const locPopup    = DOM.locationPopup();
    if (btnLocation) btnLocation.addEventListener("click", openLocationPopup);
    if (btnGps)      btnGps.addEventListener("click", autoLocation);
    if (btnManual)   btnManual.addEventListener("click", setManualLocation);
    if (locPopup)    locPopup.addEventListener("click", e => { if(e.target===locPopup) closeLocationPopup(); });

    // Form modal
    const modalOverlay = DOM.modalOverlay();
    const btnClose     = document.querySelector(".btn-close");
    const modalTabs    = document.querySelector(".modal-tabs");
    if (modalOverlay) modalOverlay.addEventListener("click", e => { if(e.target===modalOverlay) closeForm(); });
    if (btnClose)     btnClose.addEventListener("click", closeForm);
    if (modalTabs)    modalTabs.addEventListener("click", e => {
        const tab = e.target.closest(".modal-tab");
        if (tab) switchFormTab(tab.dataset.form, tab);
    });

    // Form submits
    const anaajForm  = document.getElementById("anaaj-form");
    const shopForm   = document.getElementById("shop-form");
    const suchnaForm = document.getElementById("suchna-form");
    if (anaajForm)  anaajForm.querySelector("form")?.addEventListener("submit", addAnaajListing);
    if (shopForm)   shopForm.querySelector("form")?.addEventListener("submit", addShopListing);
    if (suchnaForm) suchnaForm.querySelector("form")?.addEventListener("submit", addSuchnaListing);

    // Phone validation
    if (modalOverlay) modalOverlay.addEventListener("input", e => {
        const inp = e.target;
        if      (inp.id==="fWA")    validatePhone(inp,"fWAErr","fWAOk");
        else if (inp.id==="sWA")    validatePhone(inp,"sWAErr","sWAOk");
        else if (inp.id==="nPhone") validatePhone(inp,"nPhErr","nPhOk");
    });

    // Card buttons — EVENT DELEGATION
    const listingsCont = DOM.listingsContainer();
    if (listingsCont) listingsCont.addEventListener("click", e => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;
        const action = btn.dataset.action;
        if (action==="wa-grain") {
            if (!G.currentUser) { requireLogin("संपर्क करने के लिए Login करें"); return; }
            const {wa, grain, qty, price} = btn.dataset;
            if (wa==="SAMPLE") { alert("यह नमूना डेटा है।"); return; }
            window.open(`https://wa.me/91${decPhone(wa)}?text=${encodeURIComponent(`नमस्ते! Gramoo पर आपकी ${grain} (${qty} KG @ ₹${price}/KG) देखी। उपलब्ध है?`)}`, "_blank");
        }
        else if (action==="wa-shop") {
            if (!G.currentUser) { requireLogin("संपर्क करने के लिए Login करें"); return; }
            const {wa, prod} = btn.dataset;
            if (wa==="SAMPLE") { alert("यह नमूना डेटा है।"); return; }
            window.open(`https://wa.me/91${decPhone(wa)}?text=${encodeURIComponent(`नमस्ते! Gramoo पर आपका ${prod} देखा। अधिक जानकारी दें।`)}`, "_blank");
        }
        else if (action==="wa-suchna") {
            if (!G.currentUser) { requireLogin("संपर्क करने के लिए Login करें"); return; }
            const {ph, title} = btn.dataset;
            if (ph==="SAMPLE") { alert("यह नमूना डेटा है।"); return; }
            window.open(`https://wa.me/91${decPhone(ph)}?text=${encodeURIComponent(`नमस्ते! Gramoo पर "${title}" देखी। जानकारी दें।`)}`, "_blank");
        }
        else if (action==="wa-fullshop") {
            if (!G.currentUser) { requireLogin("संपर्क करने के लिए Login करें"); return; }
            const {phone, naam} = btn.dataset;
            if (!phone || phone==="SAMPLE") { alert("यह नमूना दुकान है।"); return; }
            window.open(`https://wa.me/91${decPhone(phone)}?text=${encodeURIComponent(`नमस्ते! Gramoo पर आपकी दुकान "${naam}" देखी। उपलब्ध stock जानना था।`)}`, "_blank");
        }
        else if (action==="call") {
            if (!G.currentUser) { requireLogin("संपर्क करने के लिए Login करें"); return; }
            const {ph} = btn.dataset;
            if (ph==="SAMPLE") return;
            window.open("tel:"+decPhone(ph));
        }
    });


    // Report Problem overlay close
    const rpOverlay = document.getElementById("rpOverlay");
    if (rpOverlay) rpOverlay.addEventListener("click", e => {
        if (e.target === rpOverlay) closeReportProblem();
    });

    // Missed call
    const missedDone = document.querySelector(".btn-missed-done");
    const missedSkip = document.querySelector(".btn-missed-skip");
    if (missedDone) missedDone.addEventListener("click", closeMissedCall);
    if (missedSkip) missedSkip.addEventListener("click", closeMissedCall);

    // Shop section card buttons (document level delegation)
    document.addEventListener("click", e => {
        const btn = e.target.closest("button[data-action='wa-fullshop']");
        if (!btn) return;
        if (!G.currentUser) { requireLogin("संपर्क करने के लिए Login करें"); return; }
        const {phone, naam} = btn.dataset;
        if (!phone || phone==="SAMPLE") { alert("यह नमूना दुकान है।"); return; }
        window.open(`https://wa.me/91${decPhone(phone)}?text=${encodeURIComponent(`नमस्ते! Gramoo पर आपकी दुकान "${naam}" देखी। उपलब्ध stock जानना था।`)}`, "_blank");
    });
}

// ── 19. Firebase Listeners ───────────────────────────────
function startListeners() {
    onSnapshot(query(collection(db,"sell"),   orderBy("createdAt","desc")), snap => {
        const d = snap.docs.map(x=>({id:x.id,...x.data()}));
        G.allSell = d.length ? d : sampleSell;
        updateStats(); filterListings(); updateActivity();
    }, () => { G.allSell = sampleSell; updateStats(); filterListings(); });

    onSnapshot(query(collection(db,"buy"),    orderBy("createdAt","desc")), snap => {
        const d = snap.docs.map(x=>({id:x.id,...x.data()}));
        G.allBuy = d.length ? d : sampleBuy;
        updateStats(); filterListings();
    }, () => { G.allBuy = sampleBuy; });

    onSnapshot(query(collection(db,"shop"),   orderBy("createdAt","desc")), snap => {
        const d = snap.docs.map(x=>({id:x.id,...x.data()}));
        G.allShop = d.length ? d : sampleShop;
        updateStats(); filterListings();
    }, () => { G.allShop = sampleShop; });

    onSnapshot(query(collection(db,"suchna"), orderBy("createdAt","desc")), snap => {
        const d = snap.docs.map(x=>({id:x.id,...x.data()}));
        G.allSuchna = d.length ? d : sampleSuchna;
        updateStats(); filterListings(); updateActivity();
        DOM.loadingScreen().classList.add("hide");
        DOM.fbStatus().className   = "fb-status fb-online";
        DOM.fbStatus().textContent = "● Live";
    }, () => {
        G.allSuchna = sampleSuchna;
        DOM.fbStatus().className   = "fb-status fb-offline";
        DOM.fbStatus().textContent = "● Offline";
        DOM.loadingScreen().classList.add("hide");
    });

    setTimeout(() => DOM.loadingScreen().classList.add("hide"), 2000);
    startShopListener();
}


// ── Tab Settings from Firebase ───────────────────────────
async function loadTabSettings() {
    const formTabSuchna = document.querySelector(".modal-tab[onclick*='suchna-form']");

    function applySettings(shopOn, suchnaOn) {
        const mainTabs = document.querySelectorAll(".main-tab");
        if (mainTabs[1]) mainTabs[1].style.display = shopOn   ? "" : "none";
        if (mainTabs[2]) mainTabs[2].style.display = suchnaOn ? "" : "none";
        // Form modal tab bhi hide karo agar suchna off hai
        if (formTabSuchna) formTabSuchna.style.display = suchnaOn ? "" : "none";
        // Agar disabled tab pe hain to anaaj pe wapas lo
        if (!shopOn   && G.mainTab === "shop")   switchMainTab("anaaj", document.querySelector(".main-tab"));
        if (!suchnaOn && G.mainTab === "suchna") switchMainTab("anaaj", document.querySelector(".main-tab"));
    }

    try {
        const snap = await getDoc(doc(db, "settings", "tabs"));
        if (snap.exists()) {
            const d = snap.data();
            applySettings(d.shop === true, d.suchna === true);
        } else {
            applySettings(false, false);
        }
    } catch(e) {
        // Network error ho to tabs default ON rakhein
        applySettings(true, true);
    }
}

// ── Feedback Submit ───────────────────────────────────────
var G_fbRating = 0;

document.addEventListener("DOMContentLoaded", function() {
    var stars = document.querySelectorAll("#fbStars span");
    var labels = ["", "बहुत बुरा 😞", "ठीक नहीं 😕", "ठीक है 😐", "अच्छा 😊", "बहुत बढ़िया 🤩"];
    stars.forEach(function(star) {
        star.addEventListener("click", function() {
            G_fbRating = parseInt(this.dataset.s);
            stars.forEach(function(s) {
                s.classList.toggle("active", parseInt(s.dataset.s) <= G_fbRating);
            });
            var lbl = document.getElementById("fbLabel");
            if (lbl) lbl.textContent = labels[G_fbRating] || "";
        });
    });
});

window.submitFeedback = async function() {
    var text = document.getElementById("fbText").value.trim();
    var name = document.getElementById("fbName").value.trim();
    var loc  = document.getElementById("fbLoc").value.trim();
    if (!text) { alert("कृपया सुझाव लिखें!"); return; }
    try {
        await addDoc(collection(db, "feedback"), {
            text:      text,
            name:      name || "Anonymous",
            loc:       loc  || "—",
            createdAt: serverTimestamp()
        });
        document.getElementById("fbFormBox").style.display = "none";
        document.getElementById("fbDone").style.display = "block";
    } catch(e) {
        alert("Error: " + e.message);
    }
};








// ── Window Exports ───────────────────────────────────────
window._G   = G;
window._DOM = DOM;

// gramoo.js core
window.switchMainTab         = switchMainTab;
window.switchSubTab          = switchSubTab;
window.updateSubtypeDropdown = updateSubtypeDropdown;
window.submitFeedback        = submitFeedback;

// render.js
window.filterListings        = filterListings;
window.updateStats           = updateStats;

// shop-search.js
window.runShopSearch         = runShopSearch;
window.filterShops           = runShopSearch;

// forms.js
window.openForm              = openForm;
window.closeForm             = closeForm;
window.closeFormOutside      = (e) => { if(e.target===document.getElementById('modalOverlay')) closeForm(); };
window.switchFormTab         = switchFormTab;
window.addAnaajListing       = addAnaajListing;
window.addShopListing        = addShopListing;
window.addSuchnaListing      = addSuchnaListing;
window.openLocationPopup     = openLocationPopup;
window.closeLocationPopup    = closeLocationPopup;
window.autoLocation          = autoLocation;
window.setManualLocation     = setManualLocation;
window.openMissedCall        = openMissedCall;
window.closeMissedCall       = closeMissedCall;
window.validatePhone         = validatePhone;

// auth.js
window.googleLogin           = googleLogin;
window.openMyListings        = openMyListings;
window.closeMyListings       = closeMyListings;


// ── 20. Init ─────────────────────────────────────────────
function init() {
    loadTabSettings();
    startAuthListener();
    bindEvents();
    updateStats();
    filterListings();
    updateActivity();
    startListeners();

    // Auto GPS
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            p  => { G.userLat=p.coords.latitude; G.userLng=p.coords.longitude; G.userLocName="आपके पास"; updateLocBar(); filterListings(); },
            () => {}
        );
    }
}

init();