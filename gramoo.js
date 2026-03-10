// ════════════════════════════════════════════════════════
// GRAMOO — gramoo.js  (ES Module)
// v8 — Google Login + My Listings + Verified Badge
// ════════════════════════════════════════════════════════
// SECTIONS:
//  1.  Firebase Init + Auth
//  2.  Meta (icons/colors)
//  3.  Sample Data
//  4.  Global State (G)
//  5.  DOM Cache
//  6.  Helpers
//  7.  Phone Encrypt/Decrypt
//  8.  Spam Control
//  9.  Render Functions
//  10. Filter & Display
//  11. Stats & Activity
//  12. UI Tab Switching
//  13. Form Open/Close
//  14. Location
//  15. Phone Validation
//  16. Missed Call (disabled)
//  17. Form Submit
//  18. Auth UI (login/logout/profile)
//  19. My Listings Panel
//  20. bindEvents
//  21. Firebase Listeners
//  22. Init
// ════════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy,
         serverTimestamp, doc, updateDoc, deleteDoc, where, getDocs }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── 1. Firebase Init ─────────────────────────────────────
const firebaseConfig = {
    apiKey:            "AIzaSyAeeN9ijnSuA3IyV43QQsiEshTrRdEjL0A",
    authDomain:        "gramoo.in",
    projectId:         "gramoo-44d83",
    storageBucket:     "gramoo-44d83.firebasestorage.app",
    messagingSenderId: "527489942630",
    appId:             "1:527489942630:web:08bc4f70cb17185ee199a7"
};
const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

// ── 2. Meta ──────────────────────────────────────────────
const grainMeta = {
    "गेहूं": {icon:"🌾",bg:"#fff8e1"}, "चावल":  {icon:"🍚",bg:"#e8f5e9"},
    "दाल":   {icon:"🫘",bg:"#fce4ec"}, "सरसों": {icon:"🟡",bg:"#fff3e0"},
    "मक्का": {icon:"🌽",bg:"#e0f7fa"}, "बाजरा": {icon:"🌿",bg:"#e8eaf6"},
    "अन्य":  {icon:"🌱",bg:"#f3e5f5"}
};
const shopMeta = {
    "खाद":          {icon:"🌿",bg:"#e8f5e9"}, "बीज":          {icon:"🌱",bg:"#f1f8e9"},
    "कीटनाशक":      {icon:"💊",bg:"#fff3e0"}, "कृषि यंत्र":  {icon:"🚜",bg:"#e3f2fd"},
    "सिंचाई उपकरण": {icon:"💧",bg:"#e0f7fa"}, "पशु आहार":    {icon:"🐄",bg:"#fce4ec"},
    "अन्य":         {icon:"🌾",bg:"#f5f5f5"}
};
const suchnaMeta = {
    "खाद उपलब्धता":     {icon:"🌿",bg:"#e8f5e9"}, "बीज वितरण":       {icon:"🌱",bg:"#f1f8e9"},
    "कीटनाशक उपलब्धता": {icon:"💊",bg:"#fff3e0"}, "सरकारी योजना":    {icon:"🏛️",bg:"#e3f2fd"},
    "PM किसान सूची":    {icon:"💰",bg:"#fff8e1"}, "फसल बीमा":        {icon:"📋",bg:"#f3e5f5"},
    "यंत्र किराया":     {icon:"🚜",bg:"#e3f2fd"}, "अन्य सूचना":      {icon:"📣",bg:"#fce4ec"}
};

// ── 3. Sample Data ───────────────────────────────────────
const sampleSell = [
    {id:"s1",name:"रमेश कुमार",  grain:"गेहूं", qty:200,price:28,loc:"अनूपशहर, बुलंदशहर",wa:"SAMPLE",tag:"naya",   desc:"नया माल, घर से ले सकते हैं",createdAt:null,lat:28.40,lng:77.85},
    {id:"s2",name:"सुनीता देवी", grain:"चावल",  qty:50, price:45,loc:"सियाना, बुलंदशहर",  wa:"SAMPLE",tag:"organic",desc:"घर का उगाया जैविक चावल",     createdAt:null,lat:28.35,lng:77.90},
    {id:"s3",name:"मो. सलीम",   grain:"सरसों", qty:100,price:60,loc:"खुर्जा, बुलंदशहर",  wa:"SAMPLE",tag:"",      desc:"तेल निकालने के लिए बढ़िया",  createdAt:null,lat:28.25,lng:77.85},
    {id:"s4",name:"सुरेश सिंह", grain:"मक्का",  qty:500,price:22,loc:"दिबाई, बुलंदशहर",  wa:"SAMPLE",tag:"naya",   desc:"सीधे खेत से ताज़ा माल",      createdAt:null,lat:28.20,lng:78.00}
];
const sampleBuy = [
    {id:"b1",name:"दिल्ली आटा मिल",grain:"गेहूं",qty:5000,price:27,loc:"डिलीवरी — बुलंदशहर",wa:"SAMPLE",tag:"",desc:"नियमित सप्लायर चाहिए",       createdAt:null,lat:28.40,lng:77.85},
    {id:"b2",name:"राकेश किराना", grain:"चावल", qty:200, price:43,loc:"बुलंदशहर शहर",      wa:"SAMPLE",tag:"",desc:"दुकान के लिए अच्छी क्वालिटी",createdAt:null,lat:28.40,lng:77.85}
];
const sampleShop = [
    {id:"sh1",name:"रामलाल एग्रो सेंटर",cat:"खाद",     product:"DAP खाद",          price:"₹1350/बोरी",loc:"अनूपशहर",wa:"SAMPLE",desc:"होम डिलीवरी उपलब्ध", createdAt:null,lat:28.40,lng:77.85},
    {id:"sh2",name:"किसान बीज भंडार",   cat:"बीज",     product:"HD-2967 गेहूं बीज",price:"₹60/KG",    loc:"खुर्जा",  wa:"SAMPLE",desc:"सरकार प्रमाणित बीज",createdAt:null,lat:28.25,lng:77.85},
    {id:"sh3",name:"श्याम कृषि केंद्र", cat:"कीटनाशक",product:"कीट नाशक स्प्रे",  price:"₹450/लीटर", loc:"सियाना",  wa:"SAMPLE",desc:"सभी फसलों के लिए",   createdAt:null,lat:28.35,lng:77.90}
];
const sampleSuchna = [
    {id:"n1",name:"IFFCO सहकारी समिति",  type:"खाद उपलब्धता", title:"DAP और यूरिया खाद आ गई है",            desc:"अनूपशहर गोदाम में DAP उपलब्ध है। ₹1350/बोरी सरकारी दर।",    loc:"अनूपशहर",      phone:"SAMPLE",valid:"30 नवंबर",  urgent:true, createdAt:null,lat:28.40,lng:77.85},
    {id:"n2",name:"ग्राम पंचायत",        type:"PM किसान सूची",title:"PM किसान 18वीं किस्त — सूची देखें",   desc:"18वीं किस्त जारी हो गई है। पंचायत कार्यालय में नाम जांचें।",loc:"बुलंदशहर",     phone:"SAMPLE",valid:"15 दिसंबर", urgent:false,createdAt:null,lat:28.40,lng:77.85},
    {id:"n3",name:"कृषि विभाग बुलंदशहर",type:"फसल बीमा",     title:"रबी फसल बीमा — अंतिम तारीख 31 दिसंबर",desc:"PMFBY के तहत रबी फसल का बीमा करवाएं।",                       loc:"बुलंदशहर जिला",phone:"SAMPLE",valid:"31 दिसंबर", urgent:true, createdAt:null,lat:28.40,lng:77.85}
];

// ── 4. Global State ──────────────────────────────────────
const G = {
    mainTab:"anaaj", subTab:"becho",
    userLat:null, userLng:null, userLocName:"सभी क्षेत्र",
    allSell:[...sampleSell], allBuy:[...sampleBuy],
    allShop:[...sampleShop], allSuchna:[...sampleSuchna],
    currentUser: null   // logged in user
};
window._G = G;

// ── 5. DOM Cache ─────────────────────────────────────────
const DOM = {};
function initDOM() {
    DOM.loadingScreen     = document.getElementById("loadingScreen");
    DOM.fbStatus          = document.getElementById("fbStatus");
    DOM.locationName      = document.getElementById("locationName");
    DOM.locationSub       = document.getElementById("locationSub");
    DOM.distanceSelect    = document.getElementById("distanceSelect");
    DOM.searchInput       = document.getElementById("searchInput");
    DOM.grainFilter       = document.getElementById("grainFilter");
    DOM.totalListings     = document.getElementById("totalListings");
    DOM.noticeCount       = document.getElementById("noticeCount");
    DOM.sideDeals         = document.getElementById("sideDeals");
    DOM.listingsContainer = document.getElementById("listingsContainer");
    DOM.activityFeed      = document.getElementById("activityFeed");
    DOM.subTabsRow        = document.getElementById("subTabsRow");
    DOM.postBarText       = document.getElementById("postBarText");
    DOM.postBtn           = document.getElementById("postBtn");
    DOM.modalOverlay      = document.getElementById("modalOverlay");
    DOM.successMsg        = document.getElementById("successMsg");
    DOM.savingIndicator   = document.getElementById("savingIndicator");
    DOM.locationPopup     = document.getElementById("locationPopup");
    DOM.stateSelect       = document.getElementById("stateSelect");
    DOM.missedOverlay     = document.getElementById("missedOverlay");
    DOM.mainTabsRow       = document.querySelector(".main-tabs");
    DOM.headerBtn         = document.querySelector(".header-btn");
    DOM.btnLocation       = document.querySelector(".btn-location");
    DOM.btnGps            = document.querySelector(".btn-gps");
    DOM.btnManual         = document.querySelector(".btn-manual");
    DOM.btnClose          = document.querySelector(".btn-close");
    DOM.modalTabsRow      = document.querySelector(".modal-tabs");
    DOM.btnMissedDone     = document.querySelector(".btn-missed-done");
    DOM.btnMissedSkip     = document.querySelector(".btn-missed-skip");
    // Auth UI
    DOM.authBtn           = document.getElementById("authBtn");
    DOM.userInfo          = document.getElementById("userInfo");
    DOM.userPhoto         = document.getElementById("userPhoto");
    DOM.userName          = document.getElementById("userName");
    DOM.btnLogout         = document.getElementById("btnLogout");
    DOM.btnMyListings     = document.getElementById("btnMyListings");
    DOM.myListingsPanel   = document.getElementById("myListingsPanel");
    DOM.myListingsBody    = document.getElementById("myListingsBody");
    DOM.btnCloseMyListings= document.getElementById("btnCloseMyListings");
    // Forms
    DOM.fName    = document.getElementById("fName");
    DOM.fGrain   = document.getElementById("fGrain");
    DOM.fQty     = document.getElementById("fQty");
    DOM.fPrice   = document.getElementById("fPrice");
    DOM.fLoc     = document.getElementById("fLoc");
    DOM.fWA      = document.getElementById("fWA");
    DOM.fDesc    = document.getElementById("fDesc");
    DOM.sName     = document.getElementById("sName");
    DOM.sCategory = document.getElementById("sCategory");
    DOM.sProduct  = document.getElementById("sProduct");
    DOM.sPrice    = document.getElementById("sPrice");
    DOM.sLoc      = document.getElementById("sLoc");
    DOM.sWA       = document.getElementById("sWA");
    DOM.sDesc     = document.getElementById("sDesc");
    DOM.nName   = document.getElementById("nName");
    DOM.nType   = document.getElementById("nType");
    DOM.nLoc    = document.getElementById("nLoc");
    DOM.nTitle  = document.getElementById("nTitle");
    DOM.nDesc   = document.getElementById("nDesc");
    DOM.nPhone  = document.getElementById("nPhone");
    DOM.nValid  = document.getElementById("nValid");
    DOM.nUrgent = document.getElementById("nUrgent");
}

// ── 6. Helpers ───────────────────────────────────────────
function getDist(a,b,c,d) {
    const R=6371, dL=(c-a)*Math.PI/180, dG=(d-b)*Math.PI/180;
    const x=Math.sin(dL/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dG/2)**2;
    return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}
function timeAgo(ts) {
    if (!ts) return "अभी";
    const sec = Math.floor((Date.now()-ts.toMillis())/1000);
    if (sec < 60)    return "अभी";
    if (sec < 3600)  return Math.floor(sec/60)  + " मिनट पहले";
    if (sec < 86400) return Math.floor(sec/3600) + " घंटे पहले";
    return Math.floor(sec/86400) + " दिन पहले";
}

// ── 7. Phone Encrypt / Decrypt ───────────────────────────
function encPhone(p) {
    const k="GRAMOO26"; let e="";
    for(let i=0;i<p.length;i++) e+=String.fromCharCode(p.charCodeAt(i)^k.charCodeAt(i%k.length));
    return btoa(e);
}
function decPhone(e) {
    if (!e || e==="SAMPLE") return "";
    try {
        const d=atob(e), k="GRAMOO26"; let p="";
        for(let i=0;i<d.length;i++) p+=String.fromCharCode(d.charCodeAt(i)^k.charCodeAt(i%k.length));
        return p;
    } catch(x) { return e; }
}

// ── 8. Spam Control ──────────────────────────────────────
function checkSpam(phone) {
    const key="gramoo_sp_"+phone, LIM=3, WIN=300000;
    let arr=[];
    try { arr=JSON.parse(localStorage.getItem(key)||"[]"); } catch(x) {}
    const now=Date.now();
    arr=arr.filter(t=>now-t<WIN);
    if (arr.length>=LIM) {
        alert("⚠️ 5 मिनट में 3 से ज़्यादा listing नहीं। "+Math.ceil((WIN-(now-arr[0]))/60000)+" मिनट बाद try करें।");
        return false;
    }
    arr.push(now);
    localStorage.setItem(key,JSON.stringify(arr));
    return true;
}

// ── 9. Render Functions ──────────────────────────────────
function renderGrain(item) {
    const m  = grainMeta[item.grain] || {icon:"🌾",bg:"#f5f5f5"};
    const db = (G.userLat&&item.lat) ? `<span class="dist-badge">${Math.round(getDist(G.userLat,G.userLng,item.lat,item.lng))} किमी</span>` : "";
    const t  = timeAgo(item.createdAt);
    const isOwner = G.currentUser && item.uid === G.currentUser.uid;
    const waBtn = item.wa==="SAMPLE"
        ? `<span style="font-size:11px;color:#aaa">नमूना</span>`
        : `<button class="btn-wa" data-action="wa-grain" data-wa="${item.wa}" data-grain="${item.grain}" data-qty="${item.qty}" data-price="${item.price}">💬 WhatsApp</button>`;
    const ownerBtns = isOwner ? `
        <button class="btn-edit-listing" data-action="edit-listing" data-col="sell" data-id="${item.id}">✏️ Edit</button>
        <button class="btn-del-listing"  data-action="del-listing"  data-col="sell" data-id="${item.id}" data-name="${item.grain}">🗑️</button>` : "";
    return `
    <div class="listing-card">
        <div class="grain-icon" style="background:${m.bg}">${m.icon}</div>
        <div class="card-body">
            ${item.tag==="naya"    ? '<span class="tag tag-naya">🔥 नया माल</span>'   : ""}
            ${item.tag==="organic" ? '<span class="tag tag-organic">🌿 जैविक</span>' : ""}
            ${item.verified        ? '<span class="tag tag-verified">✅ वेरीफाइड</span>' : ""}
            ${isOwner              ? '<span class="tag tag-owner">👤 आपकी listing</span>' : ""}
            <div class="card-top">
                <div class="grain-name">${item.grain}</div>
                <div class="price-tag">₹${item.price}/KG</div>
            </div>
            <div class="card-meta"><span>📦 ${item.qty} KG</span><span>📍 ${item.loc}${db}</span></div>
            ${item.desc ? `<div class="card-desc">"${item.desc}"</div>` : ""}
            <div class="card-bottom">
                <div><div class="sname">👤 ${item.name}</div><div class="stime">🕐 ${t}</div></div>
                <div style="display:flex;gap:6px;align-items:center">${waBtn}${ownerBtns}</div>
            </div>
        </div>
    </div>`;
}

function renderShop(item) {
    const catKey = Object.keys(shopMeta).find(k=>item.cat&&item.cat.includes(k)) || "अन्य";
    const m  = shopMeta[catKey];
    const db = (G.userLat&&item.lat) ? `<span class="dist-badge">${Math.round(getDist(G.userLat,G.userLng,item.lat,item.lng))} किमी</span>` : "";
    const t  = timeAgo(item.createdAt);
    const isOwner = G.currentUser && item.uid === G.currentUser.uid;
    const waBtn = item.wa==="SAMPLE"
        ? `<span style="font-size:11px;color:#aaa">नमूना</span>`
        : `<button class="btn-wa" data-action="wa-shop" data-wa="${item.wa}" data-prod="${item.product}">💬 WhatsApp</button>`;
    const ownerBtns = isOwner ? `
        <button class="btn-edit-listing" data-action="edit-listing" data-col="shop" data-id="${item.id}">✏️ Edit</button>
        <button class="btn-del-listing"  data-action="del-listing"  data-col="shop" data-id="${item.id}" data-name="${item.product}">🗑️</button>` : "";
    return `
    <div class="listing-card shop-card">
        <div class="grain-icon" style="background:${m.bg}">${m.icon}</div>
        <div class="card-body">
            <span class="tag tag-shop">🏪 ${item.cat}</span>
            ${isOwner ? '<span class="tag tag-owner">👤 आपकी listing</span>' : ""}
            <div class="card-top">
                <div class="grain-name shop">${item.product}</div>
                <div class="price-tag shop">${item.price}</div>
            </div>
            <div class="card-meta"><span>📍 ${item.loc}${db}</span></div>
            ${item.desc ? `<div class="card-desc">"${item.desc}"</div>` : ""}
            <div class="card-bottom">
                <div><div class="sname">🏪 ${item.name}</div><div class="stime">🕐 ${t}</div></div>
                <div style="display:flex;gap:6px;align-items:center">${waBtn}${ownerBtns}</div>
            </div>
        </div>
    </div>`;
}

function renderSuchna(item) {
    const typeKey = Object.keys(suchnaMeta).find(k=>item.type&&item.type.includes(k)) || "अन्य सूचना";
    const m  = suchnaMeta[typeKey] || {icon:"📢",bg:"#e3f2fd"};
    const db = (G.userLat&&item.lat) ? `<span class="dist-badge">${Math.round(getDist(G.userLat,G.userLng,item.lat,item.lng))} किमी</span>` : "";
    const t  = timeAgo(item.createdAt);
    const cardCls = item.urgent ? "listing-card sarkari-card" : "listing-card notice-card";
    const nmCls   = item.urgent ? "grain-name sarkari" : "grain-name notice";
    const isOwner = G.currentUser && item.uid === G.currentUser.uid;
    const waBtn = item.phone==="SAMPLE"
        ? `<span style="font-size:11px;color:#aaa">नमूना</span>`
        : `<button class="btn-wa"   data-action="wa-suchna" data-ph="${item.phone}" data-title="${item.title}">💬 WhatsApp</button>
           <button class="btn-call" data-action="call"      data-ph="${item.phone}">📞 कॉल</button>`;
    const ownerBtns = isOwner ? `
        <button class="btn-del-listing" data-action="del-listing" data-col="suchna" data-id="${item.id}" data-name="${item.title}">🗑️ हटाएं</button>` : "";
    return `
    <div class="${cardCls}">
        <div class="grain-icon" style="background:${m.bg}">${m.icon}</div>
        <div class="card-body">
            <span class="tag ${item.urgent ? "tag-urgent" : "tag-notice"}">${item.urgent ? "🚨 अत्यावश्यक" : "📢 सरकारी"}</span>
            <span class="tag tag-notice" style="margin-left:4px">${item.type}</span>
            ${isOwner ? '<span class="tag tag-owner">👤 आपकी listing</span>' : ""}
            <div class="card-top"><div class="${nmCls}">${item.title}</div></div>
            <div class="card-meta">
                <span>📍 ${item.loc}${db}</span>
                ${item.valid ? `<span class="valid-till">⏰ ${item.valid} तक</span>` : ""}
            </div>
            <div class="card-desc">${item.desc}</div>
            <div class="card-bottom">
                <div><div class="sname">🏛️ ${item.name}</div><div class="stime">🕐 ${t}</div></div>
                <div style="display:flex;gap:6px;align-items:center">${waBtn}${ownerBtns}</div>
            </div>
        </div>
    </div>`;
}

// ── 10. Filter & Display ─────────────────────────────────
function filterListings() {
    const search   = DOM.searchInput.value.toLowerCase();
    const dist     = parseInt(DOM.distanceSelect.value);
    const grainVal = DOM.grainFilter ? DOM.grainFilter.value : "";
    const list = G.mainTab==="suchna" ? G.allSuchna
               : G.mainTab==="shop"   ? G.allShop
               : G.subTab==="becho"   ? G.allSell : G.allBuy;

    const filtered = list.filter(item => {
        const hay = JSON.stringify(item).toLowerCase();
        const mS  = !search || hay.includes(search);
        const mG  = !grainVal || (G.mainTab==="anaaj" && item.grain===grainVal);
        let   mD  = true;
        if (G.userLat && item.lat) mD = getDist(G.userLat,G.userLng,item.lat,item.lng) <= dist;
        return mS && mG && mD;
    });

    const c = DOM.listingsContainer;
    if (!filtered.length) {
        c.innerHTML = `<div class="no-results"><div>${G.mainTab==="suchna"?"📢":"🌾"}</div><p>कोई लिस्टिंग नहीं मिली</p><p style="font-size:12px;margin-top:6px;">दूरी बढ़ाएं या "सभी जगह" चुनें</p></div>`;
        return;
    }
    c.innerHTML = filtered.map(item =>
        G.mainTab==="suchna" ? renderSuchna(item) :
        G.mainTab==="shop"   ? renderShop(item)   : renderGrain(item)
    ).join("");
}

// ── 11. Stats & Activity ─────────────────────────────────
function updateStats() {
    DOM.totalListings.textContent = G.allSell.length + G.allBuy.length + G.allShop.length;
    DOM.noticeCount.textContent   = G.allSuchna.length;
}
function updateActivity() {
    const items = [];
    G.allSell.slice(0,3).forEach(i   => items.push({blue:false, text:`<b>${i.grain||"अनाज"}</b> बेचने की listing — ${i.loc||""}`, time:timeAgo(i.createdAt)}));
    G.allSuchna.slice(0,3).forEach(i => items.push({blue:true,  text:`📢 ${i.title||""}`,                                           time:timeAgo(i.createdAt)}));
    items.sort(()=>Math.random()-0.5);
    DOM.activityFeed.innerHTML = items.slice(0,6).map(i =>
        `<div class="activity-item"><div class="dot${i.blue?" blue":""}"></div><div><span>${i.text}</span><span class="atime">${i.time}</span></div></div>`
    ).join("") || `<div class="activity-item"><div class="dot"></div><div><span>अभी कोई गतिविधि नहीं</span></div></div>`;
}

// ── 12. UI Tab Switching ─────────────────────────────────
function switchMainTab(tab, el) {
    G.mainTab = tab;
    document.querySelectorAll(".main-tab").forEach(t => t.classList.remove("active"));
    el.classList.add("active");
    DOM.subTabsRow.style.display = tab==="anaaj" ? "flex" : "none";
    const pb = DOM.postBarText, btn = DOM.postBtn;
    if      (tab==="suchna") { pb.innerHTML='सरकारी सूचना देनी है? <b>मुफ्त में प्रकाशित करें!</b>'; btn.className="btn-post blue"; }
    else if (tab==="shop")   { pb.innerHTML='कृषि उत्पाद बेचते हैं? <b>मुफ्त में दुकान लिस्ट करें!</b>'; btn.className="btn-post"; }
    else                     { pb.innerHTML='आपके पास अनाज है? <b>मुफ्त में लिस्टिंग दें!</b>';           btn.className="btn-post"; }
    filterListings();
}
function switchSubTab(tab, el) {
    G.subTab = tab;
    document.querySelectorAll(".sub-tab").forEach(t => t.classList.remove("active"));
    el.classList.add("active");
    filterListings();
}
function switchFormTab(sec, el) {
    document.querySelectorAll(".modal-tab").forEach(t  => t.classList.remove("active"));
    document.querySelectorAll(".form-section").forEach(s => s.classList.remove("active"));
    el.classList.add("active");
    document.getElementById(sec).classList.add("active");
}

// ── 13. Form Open / Close ────────────────────────────────
function openForm() {
    // Login check
    if (!G.currentUser) {
        if (confirm("लिस्टिंग डालने के लिए Login करना होगा।\nGoogle से Login करें?")) {
            googleLogin();
        }
        return;
    }
    DOM.modalOverlay.classList.add("active");
    DOM.successMsg.style.display      = "none";
    DOM.savingIndicator.style.display = "none";
    const tabs = document.querySelectorAll(".modal-tab");
    if      (G.mainTab==="suchna") switchFormTab("suchna-form", tabs[2]);
    else if (G.mainTab==="shop")   switchFormTab("shop-form",   tabs[1]);
    else                           switchFormTab("anaaj-form",  tabs[0]);
}
function closeForm() { DOM.modalOverlay.classList.remove("active"); }

// ── 14. Location ─────────────────────────────────────────
function openLocationPopup()  { DOM.locationPopup.classList.add("active"); }
function closeLocationPopup() { DOM.locationPopup.classList.remove("active"); }

function autoLocation() {
    DOM.btnGps.textContent = "📡 लोकेशन मिल रही है..."; DOM.btnGps.disabled = true;
    navigator.geolocation.getCurrentPosition(
        p  => { G.userLat=p.coords.latitude; G.userLng=p.coords.longitude; G.userLocName="आपके पास"; updateLocBar(); closeLocationPopup(); filterListings(); },
        () => { alert("GPS नहीं मिला।"); DOM.btnGps.textContent="📡 GPS से लोकेशन लें"; DOM.btnGps.disabled=false; }
    );
}
function setManualLocation() {
    const s=DOM.stateSelect, o=s.options[s.selectedIndex];
    if (!o.value) { alert("राज्य चुनें"); return; }
    G.userLat=parseFloat(o.dataset.lat); G.userLng=parseFloat(o.dataset.lng); G.userLocName=o.text;
    updateLocBar(); closeLocationPopup(); filterListings();
}
function updateLocBar() {
    DOM.locationName.textContent = "📍 " + G.userLocName;
    DOM.locationSub.textContent  = DOM.distanceSelect.value + " किमी के अंदर";
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

// ── 16. Missed Call — Disabled ───────────────────────────
function openMissedCall()  { /* Baad mein add karenge */ }
function closeMissedCall() { DOM.missedOverlay.classList.remove("active"); }

// ── 17. Form Submit ──────────────────────────────────────
function setLoading(btnId, on) {
    const btn = document.getElementById(btnId);
    if (btn) btn.disabled = on;
    DOM.savingIndicator.style.display = on ? "block" : "none";
}

async function addAnaajListing(e) {
    e.preventDefault();
    if (!validatePhone(DOM.fWA,"fWAErr","fWAOk")) { alert("कृपया सही WhatsApp नंबर डालें"); return; }
    const wa = DOM.fWA.value.trim();
    if (!checkSpam(wa)) return;
    setLoading("fSubmitBtn", true);
    try {
        await addDoc(collection(db,"sell"), {
            name:  DOM.fName.value,  grain: DOM.fGrain.value,
            qty:   parseInt(DOM.fQty.value), price: parseInt(DOM.fPrice.value),
            loc:   DOM.fLoc.value,   wa:    encPhone(wa), desc: DOM.fDesc.value,
            tag:"naya", verified: true,   // Google login = verified
            uid:      G.currentUser.uid,
            userName: G.currentUser.displayName,
            lat: G.userLat||28.40, lng: G.userLng||77.85,
            createdAt: serverTimestamp()
        });
        DOM.successMsg.style.display = "block";
        e.target.reset();
        setTimeout(() => { closeForm(); }, 1500);
    } catch(err) { alert("❌ Error: " + err.message); }
    setLoading("fSubmitBtn", false);
}

async function addShopListing(e) {
    e.preventDefault();
    if (!validatePhone(DOM.sWA,"sWAErr","sWAOk")) { alert("कृपया सही WhatsApp नंबर डालें"); return; }
    const wa = DOM.sWA.value.trim();
    if (!checkSpam(wa)) return;
    setLoading("sSubmitBtn", true);
    try {
        await addDoc(collection(db,"shop"), {
            name: DOM.sName.value, cat: DOM.sCategory.value,
            product: DOM.sProduct.value, price: DOM.sPrice.value,
            loc: DOM.sLoc.value, wa: encPhone(wa), desc: DOM.sDesc.value,
            verified: true,
            uid:      G.currentUser.uid,
            userName: G.currentUser.displayName,
            lat: G.userLat||28.40, lng: G.userLng||77.85,
            createdAt: serverTimestamp()
        });
        DOM.successMsg.style.display = "block";
        e.target.reset();
        setTimeout(() => { closeForm(); switchMainTab("shop", document.querySelectorAll(".main-tab")[1]); }, 1500);
    } catch(err) { alert("❌ Error: " + err.message); }
    setLoading("sSubmitBtn", false);
}

async function addSuchnaListing(e) {
    e.preventDefault();
    if (!validatePhone(DOM.nPhone,"nPhErr","nPhOk")) { alert("कृपया सही संपर्क नंबर डालें"); return; }
    const ph = DOM.nPhone.value.trim();
    if (!checkSpam(ph)) return;
    setLoading("nSubmitBtn", true);
    try {
        await addDoc(collection(db,"suchna"), {
            name: DOM.nName.value, type: DOM.nType.value,
            title: DOM.nTitle.value, desc: DOM.nDesc.value,
            loc: DOM.nLoc.value, phone: encPhone(ph),
            valid: DOM.nValid.value||"", urgent: DOM.nUrgent.value==="yes",
            verified: true,
            uid:      G.currentUser.uid,
            userName: G.currentUser.displayName,
            lat: G.userLat||28.40, lng: G.userLng||77.85,
            createdAt: serverTimestamp()
        });
        DOM.successMsg.style.display = "block";
        e.target.reset();
        setTimeout(() => { closeForm(); switchMainTab("suchna", document.querySelectorAll(".main-tab")[2]); }, 2000);
    } catch(err) { alert("❌ Error: " + err.message); }
    setLoading("nSubmitBtn", false);
}

// ── 18. Auth UI ───────────────────────────────────────────
async function googleLogin() {
    try {
        await signInWithPopup(auth, new GoogleAuthProvider());
    } catch(e) {
        if (e.code !== "auth/popup-closed-by-user") alert("Login failed: " + e.message);
    }
}

function updateAuthUI(user) {
    G.currentUser = user;
    if (user) {
        // Logged in
        DOM.authBtn.style.display    = "none";
        DOM.userInfo.style.display   = "flex";
        DOM.userPhoto.src            = user.photoURL || "";
        DOM.userPhoto.style.display  = user.photoURL ? "block" : "none";
        DOM.userName.textContent     = user.displayName || user.email;
    } else {
        // Logged out
        DOM.authBtn.style.display    = "flex";
        DOM.userInfo.style.display   = "none";
    }
    filterListings(); // re-render to show/hide owner buttons
}

// ── 19. My Listings Panel ────────────────────────────────
async function openMyListings() {
    if (!G.currentUser) return;
    DOM.myListingsPanel.classList.add("active");
    DOM.myListingsBody.innerHTML = "<p style='padding:16px;color:#888'>लोड हो रहा है...</p>";

    const uid = G.currentUser.uid;
    const results = [];

    for (const col of ["sell","buy","shop","suchna"]) {
        const q = query(collection(db, col), where("uid","==",uid));
        const snap = await getDocs(q);
        snap.docs.forEach(d => results.push({id:d.id, col, ...d.data()}));
    }

    if (!results.length) {
        DOM.myListingsBody.innerHTML = "<p style='padding:16px;color:#888'>अभी कोई listing नहीं है।</p>";
        return;
    }

    DOM.myListingsBody.innerHTML = results.map(item => `
        <div class="my-listing-item">
            <div class="my-listing-info">
                <div class="my-listing-title">${item.grain||item.product||item.title||"—"}</div>
                <div class="my-listing-meta">${item.loc||""} • ${item.col}</div>
            </div>
            <div class="my-listing-btns">
                <button class="btn-del-listing" data-action="del-listing"
                    data-col="${item.col}" data-id="${item.id}"
                    data-name="${item.grain||item.product||item.title||'listing'}">🗑️ हटाएं</button>
            </div>
        </div>
    `).join("");
}

function closeMyListings() { DOM.myListingsPanel.classList.remove("active"); }

// ── 20. bindEvents ───────────────────────────────────────
function bindEvents() {

    // Auth buttons
    DOM.authBtn.addEventListener("click", googleLogin);
    DOM.btnLogout.addEventListener("click", () => signOut(auth));
    DOM.btnMyListings.addEventListener("click", openMyListings);
    DOM.btnCloseMyListings.addEventListener("click", closeMyListings);

    // Header + Post bar
    DOM.headerBtn.addEventListener("click", openForm);
    DOM.postBtn.addEventListener("click", openForm);

    // Main tabs
    DOM.mainTabsRow.addEventListener("click", e => {
        const tab = e.target.closest(".main-tab");
        if (tab) switchMainTab(tab.dataset.tab || tab.getAttribute("onclick")?.match(/'(\w+)'/)?.[1], tab);
    });

    // Sub tabs
    DOM.subTabsRow.addEventListener("click", e => {
        const tab = e.target.closest(".sub-tab");
        if (tab) switchSubTab(tab.dataset.tab || tab.getAttribute("onclick")?.match(/'(\w+)'/)?.[1], tab);
    });

    // Search, filters
    DOM.searchInput.addEventListener("input", filterListings);
    DOM.distanceSelect.addEventListener("change", filterListings);
    if (DOM.grainFilter) DOM.grainFilter.addEventListener("change", filterListings);

    // Location
    DOM.btnLocation.addEventListener("click", openLocationPopup);
    DOM.btnGps.addEventListener("click", autoLocation);
    DOM.btnManual.addEventListener("click", setManualLocation);
    DOM.locationPopup.addEventListener("click", e => { if(e.target===DOM.locationPopup) closeLocationPopup(); });

    // Form modal
    DOM.modalOverlay.addEventListener("click", e => { if(e.target===DOM.modalOverlay) closeForm(); });
    DOM.btnClose.addEventListener("click", closeForm);

    // Form tabs
    DOM.modalTabsRow.addEventListener("click", e => {
        const tab = e.target.closest(".modal-tab");
        if (tab) switchFormTab(tab.dataset.form || tab.getAttribute("onclick")?.match(/'([^']+)'/)?.[1], tab);
    });

    // Form submits
    document.getElementById("anaaj-form").querySelector("form").addEventListener("submit", addAnaajListing);
    document.getElementById("shop-form").querySelector("form").addEventListener("submit", addShopListing);
    document.getElementById("suchna-form").querySelector("form").addEventListener("submit", addSuchnaListing);

    // Phone validation
    DOM.modalOverlay.addEventListener("input", e => {
        const inp = e.target;
        if      (inp.id==="fWA")    validatePhone(inp,"fWAErr","fWAOk");
        else if (inp.id==="sWA")    validatePhone(inp,"sWAErr","sWAOk");
        else if (inp.id==="nPhone") validatePhone(inp,"nPhErr","nPhOk");
    });
    DOM.modalOverlay.addEventListener("keypress", e => {
        if (["fWA","sWA","nPhone"].includes(e.target.id)) {
            if (e.charCode < 48 || e.charCode > 57) e.preventDefault();
        }
    });

    // Card buttons — edit/delete + WhatsApp/Call
    DOM.listingsContainer.addEventListener("click", async e => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;
        const action = btn.dataset.action;

        if (action==="wa-grain") {
            const {wa, grain, qty, price} = btn.dataset;
            if (wa==="SAMPLE") { alert("यह नमूना डेटा है।"); return; }
            window.open(`https://wa.me/91${decPhone(wa)}?text=${encodeURIComponent(`नमस्ते! Gramoo पर आपकी ${grain} (${qty} KG @ ₹${price}/KG) देखी। उपलब्ध है?`)}`, "_blank");
        }
        else if (action==="wa-shop") {
            const {wa, prod} = btn.dataset;
            if (wa==="SAMPLE") { alert("यह नमूना डेटा है।"); return; }
            window.open(`https://wa.me/91${decPhone(wa)}?text=${encodeURIComponent(`नमस्ते! Gramoo पर आपका ${prod} देखा। अधिक जानकारी दें।`)}`, "_blank");
        }
        else if (action==="wa-suchna") {
            const {ph, title} = btn.dataset;
            if (ph==="SAMPLE") { alert("यह नमूना डेटा है।"); return; }
            window.open(`https://wa.me/91${decPhone(ph)}?text=${encodeURIComponent(`नमस्ते! Gramoo पर "${title}" देखी। जानकारी दें।`)}`, "_blank");
        }
        else if (action==="call") {
            const {ph} = btn.dataset;
            if (ph==="SAMPLE") return;
            window.open("tel:"+decPhone(ph));
        }
        else if (action==="del-listing") {
            const {col, id, name} = btn.dataset;
            if (!confirm(`"${name}" delete karna chahte hain?\nYeh wapas nahi aayegi!`)) return;
            try {
                await deleteDoc(doc(db, col, id));
                closeMyListings();
            } catch(err) { alert("Error: " + err.message); }
        }
    });

    // My listings panel ke andar bhi delete kaam kare
    DOM.myListingsPanel && DOM.myListingsPanel.addEventListener("click", async e => {
        const btn = e.target.closest("button[data-action='del-listing']");
        if (!btn) return;
        const {col, id, name} = btn.dataset;
        if (!confirm(`"${name}" delete karna chahte hain?`)) return;
        try {
            await deleteDoc(doc(db, col, id));
            openMyListings(); // refresh
        } catch(err) { alert("Error: " + err.message); }
    });

    // Missed call buttons
    DOM.btnMissedDone.addEventListener("click", closeMissedCall);
    DOM.btnMissedSkip.addEventListener("click", closeMissedCall);
}

// ── 21. Firebase Listeners ───────────────────────────────
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
        DOM.loadingScreen.classList.add("hide");
        DOM.fbStatus.className   = "fb-status fb-online";
        DOM.fbStatus.textContent = "● Live";
    }, () => {
        G.allSuchna = sampleSuchna;
        DOM.fbStatus.className   = "fb-status fb-offline";
        DOM.fbStatus.textContent = "● Offline";
        DOM.loadingScreen.classList.add("hide");
    });

    setTimeout(() => DOM.loadingScreen.classList.add("hide"), 2000);
}

// ── 22. Auth Listener ────────────────────────────────────
function startAuthListener() {
    onAuthStateChanged(auth, user => updateAuthUI(user));
}

// ── 23. Init ─────────────────────────────────────────────
function init() {
    initDOM();
    bindEvents();
    updateStats();
    filterListings();
    updateActivity();
    startListeners();
    startAuthListener();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            p  => { G.userLat=p.coords.latitude; G.userLng=p.coords.longitude; G.userLocName="आपके पास"; updateLocBar(); filterListings(); },
            () => {}
        );
    }
}

init();
