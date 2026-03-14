// ════════════════════════════════════════
// GRAMOO — forms.js
// Form open/close, listing submit, location, missed call
// ════════════════════════════════════════

import { collection, addDoc, serverTimestamp }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db, auth, provider } from "./firebase-config.js";
import { getDist, timeAgo, encPhone, decPhone, checkSpam, validatePhone, getDeviceType, getBrowserName } from "./utils.js";
import { sendListingEmail } from "./email.js";
import { catIcons, grainMeta, shopMeta, suchnaMeta, GRAIN_SUBTYPES, MASTER_ITEMS, DEMO_SHOPS, DEMO_SHOP, sampleSell, sampleBuy, sampleShop, sampleSuchna } from "./data.js";
import { googleLogin } from "./auth.js";

// ── Shared State Access ───────────────────────────────────
// G aur DOM gramoo.js se milte hain — window par shared hain
const G   = window._G   || {};
const DOM = window._DOM || {};


// G aur DOM — gramoo.js core se share hota hai
// Direct window._G / window._DOM use karo ya gramoo.js G/DOM import karo

// ── 13. Form Open / Close ────────────────────────────────
function openForm(defaultTab) {
    // Shop tab active hai to shop.html par redirect
    if (G.mainTab === "shop") {
        window.location.href = "shop.html";
        return;
    }

    // "फसल खरीदें" — form kholo with type=खरीदना है
    if (defaultTab === "kharido") {
        DOM.modalOverlay().classList.add("active");
        DOM.successMsg().style.display      = "none";
        DOM.savingIndicator().style.display = "none";
        const tabs = document.querySelectorAll(".modal-tab");
        switchFormTab("anaaj-form", tabs[0]);
        const typeSel = document.getElementById("fType");
        if (typeSel) { typeSel.value = "खरीदना है"; if (window.updateSubtypeDropdown) window.updateSubtypeDropdown(); }
        return;
    }

    DOM.modalOverlay().classList.add("active");
    DOM.successMsg().style.display      = "none";
    DOM.savingIndicator().style.display = "none";
    const tabs = document.querySelectorAll(".modal-tab");
    if (G.mainTab === "suchna") switchFormTab("suchna-form", tabs[2]);
    else                        switchFormTab("anaaj-form",  tabs[0]);

    // Default type = becho
    const typeSel = document.getElementById("fType");
    if (typeSel) typeSel.value = "बेचना है";
}
function closeForm() { DOM.modalOverlay().classList.remove("active"); }

// Login required popup — contact/submit ke waqt
function requireLogin(msg) {
    const box = document.createElement("div");
    box.id = "loginRequiredBox";
    box.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;";
    box.innerHTML = `
        <div style="background:white;border-radius:20px;padding:28px 22px;max-width:340px;width:100%;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.2);">
            <div style="font-size:40px;margin-bottom:10px;">🔐</div>
            <div style="font-size:17px;font-weight:800;color:#1b5e20;margin-bottom:8px;">${msg || "Login करें"}</div>
            <div style="font-size:13px;color:#888;margin-bottom:20px;">Google account से एक क्लिक में Login</div>
            <button id="loginRequiredBtn" style="width:100%;padding:13px;background:#1b5e20;color:white;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;margin-bottom:10px;">
                🔐 Google से Login करें
            </button>
            <button id="loginRequiredClose" style="width:100%;padding:10px;background:#f5f5f5;color:#666;border:none;border-radius:12px;font-size:14px;cursor:pointer;">
                अभी नहीं
            </button>
        </div>`;
    document.body.appendChild(box);
    document.getElementById("loginRequiredBtn").onclick   = () => { box.remove(); googleLogin(); };
    document.getElementById("loginRequiredClose").onclick = () => box.remove();
    box.addEventListener("click", e => { if (e.target === box) box.remove(); });
}

// ── 14. Location ─────────────────────────────────────────
function openLocationPopup()  { DOM.locationPopup().classList.add("active"); }
function closeLocationPopup() { DOM.locationPopup().classList.remove("active"); }

function autoLocation() {
    const btn = document.querySelector(".btn-gps");
    btn.textContent = "📡 लोकेशन मिल रही है..."; btn.disabled = true;
    navigator.geolocation.getCurrentPosition(
        p  => { G.userLat=p.coords.latitude; G.userLng=p.coords.longitude; G.userLocName="आपके पास"; updateLocBar(); closeLocationPopup(); filterListings(); },
        () => { alert("GPS नहीं मिला।"); btn.textContent="📡 GPS से लोकेशन लें"; btn.disabled=false; }
    );
}
function setManualLocation() {
    const s=DOM.stateSelect(), o=s.options[s.selectedIndex];
    if (!o.value) { alert("राज्य चुनें"); return; }
    G.userLat=parseFloat(o.dataset.lat); G.userLng=parseFloat(o.dataset.lng); G.userLocName=o.text;
    updateLocBar(); closeLocationPopup(); filterListings();
}
function updateLocBar() {
    DOM.locationName().textContent = "📍 " + G.userLocName;
    DOM.locationSub().textContent  = DOM.distanceSelect().value + " किमी के अंदर";
}

// ── 15. Phone Validation ─────────────────────────────────
function validatePhone(input, errId, okId) {
    const v = input.value.trim();
    const valid = /^[6-9]\d{9}$/.test(v);
    const err = document.getElementById(errId), ok = document.getElementById(okId);
    if (!v)    { err.style.display="none"; ok.style.display="none"; input.classList.remove("input-error","input-ok"); return false; }
    if (valid) { err.style.display="none"; ok.style.display="block"; input.classList.remove("input-error"); input.classList.add("input-ok"); return true; }
    err.style.display="block"; ok.style.display="none"; input.classList.remove("input-ok"); input.classList.add("input-error"); return false;
}

// ── 16. Missed Call ──────────────────────────────────────
function openMissedCall()  { DOM.missedOverlay().classList.add("active"); }
function closeMissedCall() { DOM.missedOverlay().classList.remove("active"); }

// ── 17. Form Submit ──────────────────────────────────────
function setLoading(btnId, on) {
    const btn = document.getElementById(btnId);
    if (btn) btn.disabled = on;
    DOM.savingIndicator().style.display = on ? "block" : "none";
}

async function addAnaajListing(e) {
    e.preventDefault();
    // Login check — sirf submit par
    if (!G.currentUser) {
        requireLogin("लिस्टिंग डालने के लिए Login करें");
        return;
    }
    const inp = DOM.fWA();
    if (!validatePhone(inp,"fWAErr","fWAOk")) { alert("कृपया सही WhatsApp नंबर डालें"); return; }
    const wa = inp.value.trim();
    if (!checkSpam(wa)) return;
    setLoading("fSubmitBtn", true);

    const listingType = document.getElementById("fType")?.value || "बेचना है";
    const subtype     = document.getElementById("fSubtype")?.value || "";
    const collection_name = listingType === "खरीदना है" ? "buy" : "sell";

    try {
        await addDoc(collection(db, collection_name), {
            name:  DOM.fName().value,
            grain: DOM.fGrain().value,
            subtype: subtype,
            type:  listingType,
            qty:   parseInt(DOM.fQty().value),
            price: parseInt(DOM.fPrice().value),
            loc:   DOM.fLoc().value,
            wa:    encPhone(wa),
            desc:  DOM.fDesc().value,
            tag:   "naya", verified: false,
            uid:   G.currentUser.uid,
            lat:   G.userLat||28.40, lng: G.userLng||77.85,
            createdAt: serverTimestamp()
        });
        DOM.successMsg().style.display = "block";
        // email ke liye values reset se PEHLE save karo
        const emailData = {
            type:  listingType,
            grain: DOM.fGrain().value,
            qty:   DOM.fQty().value   || '',
            price: DOM.fPrice().value || '',
            loc:   DOM.fLoc().value,
            name:  DOM.fName().value,
        };
        e.target.reset();
        if (window.updateSubtypeDropdown) window.updateSubtypeDropdown();
        sendListingEmail(G.currentUser, emailData);
        setTimeout(() => { closeForm(); openMissedCall(); }, 1500);
    } catch(err) { alert("❌ Error: " + err.message); }
    setLoading("fSubmitBtn", false);
}

async function addShopListing(e) {
    e.preventDefault();
    if (!G.currentUser) {
        requireLogin("दुकान लिस्टिंग के लिए Login करें");
        return;
    }
    const inp = DOM.sWA();
    if (!validatePhone(inp,"sWAErr","sWAOk")) { alert("कृपया सही WhatsApp नंबर डालें"); return; }
    const wa = inp.value.trim();
    if (!checkSpam(wa)) return;
    setLoading("sSubmitBtn", true);
    try {
        await addDoc(collection(db,"shop"), {
            name: DOM.sName().value, cat: DOM.sCategory().value,
            product: DOM.sProduct().value, price: DOM.sPrice().value,
            loc: DOM.sLoc().value, wa: encPhone(wa), desc: DOM.sDesc().value,
            uid: G.currentUser.uid,
            lat: G.userLat||28.40, lng: G.userLng||77.85,
            createdAt: serverTimestamp()
        });
        DOM.successMsg().style.display = "block";
        e.target.reset();
        setTimeout(() => { closeForm(); switchMainTab("shop", document.querySelectorAll(".main-tab")[1]); openMissedCall(); }, 1500);
    } catch(err) { alert("❌ Error: " + err.message); }
    setLoading("sSubmitBtn", false);
}

async function addSuchnaListing(e) {
    e.preventDefault();
    if (!G.currentUser) {
        requireLogin("सूचना प्रकाशित करने के लिए Login करें");
        return;
    }
    const inp = DOM.nPhone();
    if (!validatePhone(inp,"nPhErr","nPhOk")) { alert("कृपया सही संपर्क नंबर डालें"); return; }
    const ph = inp.value.trim();
    if (!checkSpam(ph)) return;
    setLoading("nSubmitBtn", true);
    try {
        await addDoc(collection(db,"suchna"), {
            name: DOM.nName().value, type: DOM.nType().value,
            title: DOM.nTitle().value, desc: DOM.nDesc().value,
            loc: DOM.nLoc().value, phone: encPhone(ph),
            valid: DOM.nValid().value||"", urgent: DOM.nUrgent().value==="yes",
            lat: G.userLat||28.40, lng: G.userLng||77.85,
            createdAt: serverTimestamp()
        });
        DOM.successMsg().style.display = "block";
        e.target.reset();
        setTimeout(() => { closeForm(); switchMainTab("suchna", document.querySelectorAll(".main-tab")[2]); }, 2000);
    } catch(err) { alert("❌ Error: " + err.message); }
    setLoading("nSubmitBtn", false);
}


// switchFormTab — modal tabs switch karta hai
function switchFormTab(sec, el) {
    document.querySelectorAll(".modal-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".form-section").forEach(s => s.classList.remove("active"));
    if (el) el.classList.add("active");
    const secEl = document.getElementById(sec);
    if (secEl) secEl.classList.add("active");
}

export { openForm, closeForm, switchFormTab, addAnaajListing, addShopListing, addSuchnaListing, openLocationPopup, closeLocationPopup, autoLocation, setManualLocation, openMissedCall, closeMissedCall };
