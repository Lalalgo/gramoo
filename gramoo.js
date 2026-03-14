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

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDoc, doc, setDoc }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── 1. Firebase Init ─────────────────────────────────────
// ── EmailJS Config ────────────────────────────────────────
const EJS_SERVICE     = 'service_un25x5y';
const EJS_TPL_LISTING = 'template_g721f9g';
const EJS_PUBKEY      = 'OAlzCN74cs01xSoZH';

function sendListingEmail(user, data) {
    if (!user || !user.email) return;
    try {
        emailjs.init(EJS_PUBKEY);
        const isBuy = data.type === 'खरीदना है';
        emailjs.send(EJS_SERVICE, EJS_TPL_LISTING, {
            to_email:         user.email,
            to_name:          user.displayName || data.name || 'किसान',
            listing_type:     isBuy ? '🛒 खरीदना है' : '🌾 बेचना है',
            grain_name:       data.grain || '',
            qty:              data.qty   || '',
            price:            data.price || '',
            location:         data.loc   || '',
            buyer_seller_msg: isBuy
                ? 'जल्द ही नज़दीकी विक्रेता आपसे WhatsApp पर संपर्क करेंगे। 🌾'
                : 'जल्द ही नज़दीकी खरीददार आपसे WhatsApp पर संपर्क करेंगे। 🛒',
        }).then(() => console.log('✅ Listing email sent'))
          .catch(e => console.log('Listing email error:', e));
    } catch(e) { console.log('EmailJS error:', e); }
}


const firebaseConfig = {
    apiKey:            "AIzaSyAeeN9ijnSuA3IyV43QQsiEshTrRdEjL0A",
    authDomain:        "gramoo-44d83.firebaseapp.com",
    projectId:         "gramoo-44d83",
    storageBucket:     "gramoo-44d83.firebasestorage.app",
    messagingSenderId: "527489942630",
    appId:             "1:527489942630:web:08bc4f70cb17185ee199a7"
};
const app = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });


// ── 2b. Grain Subtypes Master ─────────────────────────────
const GRAIN_SUBTYPES = {
    "गेहूं":   ["DBW-187","DBW-303","HD-2967","HD-3086","PBW-343","GW-496","K-307","Sharbati","Lokwan","अन्य"],
    "चावल":   ["बासमती (Pusa 1121)","बासमती (1509)","बासमती (1718)","सरबती","HMT","PR-106","Swarna","MTU-7029","Parmal","अन्य"],
    "दाल":    ["अरहर (तुअर)","मूंग","उड़द","मसूर","चना","राजमा","मटर","लोबिया","अन्य"],
    "सरसों":  ["पीली सरसों","काली सरसों","Pusa Bold","Laxmi","RH-749","RH-30","Vardan","अन्य"],
    "मक्का":  ["पीला मक्का","सफेद मक्का","Pioneer P3396","DKC-9144","Bio-9681","Navjot","अन्य"],
    "बाजरा":  ["HHB-67","HHB-197","Raj-171","MPMH-17","Kaveri Gold","अन्य"],
    "ज्वार":  ["CSH-16","SPH-1634","Maldandi","अन्य"],
    "गन्ना":  ["Co-0238","Co-0118","CoJ-64","Up-05125","अन्य"],
    "कपास":   ["BT Cotton","Hybrid","देसी","अन्य"],
    "अन्य":   ["अन्य"],
};

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

// ── Demo Shops (hamesha dikhenge) ────────────────────────
const DEMO_SHOPS = [
    {
        id:"demo1", naam:"रामलाल एग्रो सेंटर", area:"अनूपशहर", district:"बुलंदशहर",
        phone:"SAMPLE", isDemo:true, lat:28.40, lng:77.85,
        inventory:[
            {masterId:"dap",    nameHi:"डीएपी (DAP)",       cat:"खाद",       brand:"IFFCO",    packSize:"50kg",  price:1350, qty:45, stock:true},
            {masterId:"urea",   nameHi:"यूरिया",             cat:"खाद",       brand:"KRIBHCO",  packSize:"45kg",  price:270,  qty:80, stock:true},
            {masterId:"npk",    nameHi:"एनपीके",             cat:"खाद",       brand:"Coromandel",packSize:"50kg", price:1600, qty:20, stock:true},
            {masterId:"wheat",  nameHi:"गेहूं बीज",           cat:"बीज",       brand:"HD-2967",  packSize:"40kg",  price:2400, qty:15, stock:true},
            {masterId:"mustard",nameHi:"सरसों बीज",           cat:"बीज",       brand:"Pusa Bold",packSize:"1kg",   price:450,  qty:30, stock:true},
            {masterId:"chlor",  nameHi:"क्लोरपाइरीफॉस",       cat:"कीटनाशक",  brand:"Dursban",  packSize:"1L",    price:380,  qty:0,  stock:false},
            {masterId:"knap",   nameHi:"नैपसैक स्प्रेयर",     cat:"यंत्र",    brand:"Neptune",  packSize:"16L",   price:1800, qty:8,  stock:true},
            {masterId:"cattle", nameHi:"कैटल फीड",            cat:"पशु आहार", brand:"Godrej",   packSize:"50kg",  price:1450, qty:25, stock:true},
        ]
    },
    {
        id:"demo2", naam:"किसान बीज भण्डार", area:"खुर्जा", district:"बुलंदशहर",
        phone:"SAMPLE", isDemo:true, lat:28.25, lng:77.85,
        inventory:[
            {masterId:"wheat",  nameHi:"गेहूं बीज",           cat:"बीज",       brand:"DBW-187",  packSize:"40kg",  price:2200, qty:30, stock:true},
            {masterId:"paddy",  nameHi:"धान बीज",             cat:"बीज",       brand:"Pusa Basmati",packSize:"5kg",price:320,  qty:50, stock:true},
            {masterId:"mustard",nameHi:"सरसों बीज",           cat:"बीज",       brand:"NPJ-93",   packSize:"1kg",   price:420,  qty:40, stock:true},
            {masterId:"maize",  nameHi:"मक्का बीज",            cat:"बीज",       brand:"Pioneer",  packSize:"5kg",   price:850,  qty:20, stock:true},
            {masterId:"moong",  nameHi:"मूंग बीज",             cat:"बीज",       brand:"PDM-139",  packSize:"5kg",   price:260,  qty:0,  stock:false},
            {masterId:"dap",    nameHi:"डीएपी (DAP)",         cat:"खाद",       brand:"IFFCO",    packSize:"50kg",  price:1380, qty:10, stock:true},
            {masterId:"zinc",   nameHi:"जिंक सल्फेट",          cat:"खाद",       brand:"Aries",    packSize:"1kg",   price:95,   qty:60, stock:true},
        ]
    },
    {
        id:"demo3", naam:"श्याम कृषि सेवा केंद्र", area:"सियाना", district:"बुलंदशहर",
        phone:"SAMPLE", isDemo:true, lat:28.35, lng:77.90,
        inventory:[
            {masterId:"chlor",  nameHi:"क्लोरपाइरीफॉस",       cat:"कीटनाशक",  brand:"Coroban",  packSize:"1L",    price:360,  qty:25, stock:true},
            {masterId:"imida",  nameHi:"इमिडाक्लोप्रिड",       cat:"कीटनाशक",  brand:"Confidor", packSize:"250ml", price:480,  qty:15, stock:true},
            {masterId:"manco",  nameHi:"मैंकोज़ेब",             cat:"कीटनाशक",  brand:"Dithane",  packSize:"1kg",   price:195,  qty:35, stock:true},
            {masterId:"glyph",  nameHi:"ग्लाइफोसेट",            cat:"कीटनाशक",  brand:"Roundup",  packSize:"1L",    price:320,  qty:20, stock:true},
            {masterId:"knap",   nameHi:"नैपसैक स्प्रेयर",      cat:"यंत्र",    brand:"Aspee",    packSize:"16L",   price:1650, qty:5,  stock:true},
            {masterId:"power",  nameHi:"पावर स्प्रेयर",         cat:"यंत्र",    brand:"Kisankraft",packSize:"20L",  price:8500, qty:2,  stock:true},
            {masterId:"dap",    nameHi:"डीएपी (DAP)",          cat:"खाद",      brand:"Zuari",    packSize:"50kg",  price:1340, qty:30, stock:true},
            {masterId:"urea",   nameHi:"यूरिया",                cat:"खाद",      brand:"NFL",      packSize:"45kg",  price:265,  qty:50, stock:true},
        ]
    }
];
const DEMO_SHOP = DEMO_SHOPS[0]; // backward compat

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
    const waBtn = item.wa==="SAMPLE"
        ? `<span style="font-size:11px;color:#aaa">नमूना</span>`
        : `<button class="btn-wa" data-action="wa-grain" data-wa="${item.wa}" data-grain="${item.grain}" data-qty="${item.qty}" data-price="${item.price}">💬 WhatsApp</button>`;
    return `
    <div class="listing-card">
        <div class="grain-icon" style="background:${m.bg}">${m.icon}</div>
        <div class="card-body">
            ${item.tag==="naya"    ? '<span class="tag tag-naya">🔥 नया माल</span>'   : ""}
            ${item.tag==="organic" ? '<span class="tag tag-organic">🌿 जैविक</span>' : ""}
            ${item.verified        ? '<span class="tag tag-verified">✅ वेरीफाइड</span>' : ""}
            <div class="card-top">
                <div class="grain-name">${item.grain}</div>
                <div class="price-tag">₹${item.price}/KG</div>
            </div>
            <div class="card-meta"><span>📦 ${item.qty} KG</span><span>📍 ${item.loc}${db}</span></div>
            ${item.desc ? `<div class="card-desc">"${item.desc}"</div>` : ""}
            <div class="card-bottom">
                <div><div class="sname">👤 ${item.name}</div><div class="stime">🕐 ${t}</div></div>
                ${waBtn}
            </div>
        </div>
    </div>`;
}

function renderShop(item) {
    const catKey = Object.keys(shopMeta).find(k=>item.cat&&item.cat.includes(k)) || "अन्य";
    const m  = shopMeta[catKey];
    const db = (G.userLat&&item.lat) ? `<span class="dist-badge">${Math.round(getDist(G.userLat,G.userLng,item.lat,item.lng))} किमी</span>` : "";
    const t  = timeAgo(item.createdAt);
    const waBtn = item.wa==="SAMPLE"
        ? `<span style="font-size:11px;color:#aaa">नमूना</span>`
        : `<button class="btn-wa" data-action="wa-shop" data-wa="${item.wa}" data-prod="${item.product}">💬 WhatsApp</button>`;
    return `
    <div class="listing-card shop-card">
        <div class="grain-icon" style="background:${m.bg}">${m.icon}</div>
        <div class="card-body">
            <span class="tag tag-shop">🏪 ${item.cat}</span>
            <div class="card-top">
                <div class="grain-name shop">${item.product}</div>
                <div class="price-tag shop">${item.price}</div>
            </div>
            <div class="card-meta"><span>📍 ${item.loc}${db}</span></div>
            ${item.desc ? `<div class="card-desc">"${item.desc}"</div>` : ""}
            <div class="card-bottom">
                <div><div class="sname">🏪 ${item.name}</div><div class="stime">🕐 ${t}</div></div>
                ${waBtn}
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
    const waBtn = item.phone==="SAMPLE"
        ? `<span style="font-size:11px;color:#aaa">नमूना</span>`
        : `<button class="btn-wa"   data-action="wa-suchna" data-ph="${item.phone}" data-title="${item.title}">💬 WhatsApp</button>
           <button class="btn-call" data-action="call"      data-ph="${item.phone}">📞 कॉल</button>`;
    return `
    <div class="${cardCls}">
        <div class="grain-icon" style="background:${m.bg}">${m.icon}</div>
        <div class="card-body">
            <span class="tag ${item.urgent ? "tag-urgent" : "tag-notice"}">${item.urgent ? "🚨 अत्यावश्यक" : "📢 सरकारी"}</span>
            <span class="tag tag-notice" style="margin-left:4px">${item.type}</span>
            <div class="card-top"><div class="${nmCls}">${item.title}</div></div>
            <div class="card-meta">
                <span>📍 ${item.loc}${db}</span>
                ${item.valid ? `<span class="valid-till">⏰ ${item.valid} तक</span>` : ""}
            </div>
            <div class="card-desc">${item.desc}</div>
            <div class="card-bottom">
                <div><div class="sname">🏛️ ${item.name}</div><div class="stime">🕐 ${t}</div></div>
                <div>${waBtn}</div>
            </div>
        </div>
    </div>`;
}

// ── 10. Filter & Display ─────────────────────────────────
function filterListings() {
    const search = DOM.searchInput().value.toLowerCase();
    const dist   = parseInt(DOM.distanceSelect().value);
    const list   = G.mainTab==="suchna" ? G.allSuchna
                 : G.mainTab==="shop"   ? G.allShop
                 : G.subTab==="becho"   ? G.allSell : G.allBuy;

    const filtered = list.filter(item => {
        const hay = JSON.stringify(item).toLowerCase();
        const mS  = !search || hay.includes(search);
        let   mD  = true;
        if (G.userLat && item.lat) mD = getDist(G.userLat,G.userLng,item.lat,item.lng) <= dist;
        return mS && mD;
    });

    const c = DOM.listingsContainer();
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
    DOM.totalListings().textContent = G.allSell.length + G.allBuy.length + G.allShop.length;
    DOM.noticeCount().textContent   = G.allSuchna.length;
    // Sub-tab counts
    const sc = document.getElementById("sellCount");
    const bc = document.getElementById("buyCount");
    const ls = document.getElementById("liveSellCount");
    const lb = document.getElementById("liveBuyCount");
    if (sc) sc.textContent = G.allSell.length;
    if (bc) bc.textContent = G.allBuy.length;
    if (ls) ls.textContent = G.allSell.length;
    if (lb) lb.textContent = G.allBuy.length;
}
function updateActivity() {
    const items = [];
    // Sirf sell aur buy — time ke hisaab se sort
    G.allSell.slice(0,4).forEach(i => items.push({
        blue: false,
        text: `🌾 <b>${i.name||"किसान"}</b> — <b>${i.grain||"अनाज"}</b> बेचना है — ${i.loc||""}`,
        ms: i.createdAt ? i.createdAt.toMillis() : 0,
        time: timeAgo(i.createdAt)
    }));
    G.allBuy.slice(0,4).forEach(i => items.push({
        blue: true,
        text: `🛒 <b>${i.name||"खरीदार"}</b> — <b>${i.grain||"अनाज"}</b> खरीदना है — ${i.loc||""}`,
        ms: i.createdAt ? i.createdAt.toMillis() : 0,
        time: timeAgo(i.createdAt)
    }));
    items.sort((a,b) => b.ms - a.ms);
    const feed = DOM.activityFeed();
    if (!feed) return;
    feed.innerHTML = items.slice(0,6).map(i =>
        `<div class="activity-item"><div class="dot${i.blue?" blue":""}"></div><div><span>${i.text}</span><span class="atime">${i.time}</span></div></div>`
    ).join("") || `<div class="activity-item"><div class="dot"></div><div><span>अभी कोई गतिविधि नहीं</span></div></div>`;
}

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
// ── Master Item List (same as shop.html) ─────────────────
const MASTER_ITEMS = {
    'खाद':     ['डीएपी (DAP)','यूरिया','एनपीके (NPK)','एसएसपी','पोटाश (MOP)','जिंक सल्फेट','वर्मी कम्पोस्ट','ह्यूमिक एसिड','बोरोन'],
    'बीज':     ['गेहूं बीज','धान बीज','सरसों बीज','मक्का बीज','बाजरा बीज','टमाटर बीज','प्याज बीज','मिर्च बीज','मूंग/उड़द बीज'],
    'कीटनाशक': ['क्लोरपाइरीफॉस','इमिडाक्लोप्रिड','साइपरमेथ्रिन','मैंकोज़ेब','कार्बेन्डाजिम','ग्लाइफोसेट','ट्राइकोडर्मा'],
    'यंत्र':   ['नैपसैक स्प्रेयर','पावर स्प्रेयर','ड्रिप सिस्टम','तिरपाल','पाइप सेट','खुरपी/दरांती'],
    'पशु आहार':['कैटल फीड','पोल्ट्री फीड','मिनरल मिक्सचर','सरसों खल','बाईपास प्रोटीन'],
};

// Search state
const SEARCH = { cat: '', item: '', text: '' };

function initShopSearch() {
    // Category buttons
    document.getElementById('catBtnRow').addEventListener('click', e => {
        const btn = e.target.closest('.cat-btn');
        if (!btn) return;
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        SEARCH.cat  = btn.dataset.cat;
        SEARCH.item = '';
        renderItemButtons();
    });
    // Item buttons — delegation
    document.getElementById('itemBtnRow').addEventListener('click', e => {
        const btn = e.target.closest('.item-btn');
        if (!btn) return;
        document.querySelectorAll('.item-btn').forEach(b => b.classList.remove('active'));
        if (SEARCH.item === btn.dataset.item) {
            SEARCH.item = '';             // toggle off
        } else {
            btn.classList.add('active');
            SEARCH.item = btn.dataset.item;
        }
    });
}

function renderItemButtons() {
    const row = document.getElementById('itemListRow');
    const btnRow = document.getElementById('itemBtnRow');
    if (!SEARCH.cat) { row.style.display = 'none'; btnRow.innerHTML = ''; return; }
    const items = MASTER_ITEMS[SEARCH.cat] || [];
    row.style.display = 'block';
    btnRow.innerHTML = items.map(i =>
        `<button class="item-btn ${SEARCH.item===i?'active':''}" data-item="${i}">${i}</button>`
    ).join('');
}

// ── Shop Section Render ───────────────────────────────────
const catIcons = {'खाद':'🌿','बीज':'🌱','कीटनाशक':'💊','यंत्र':'🚜','पशु आहार':'🐄','अन्य':'🧪'};

function renderShopCard(shop, matchedItems) {
    const dist = (G.userLat && shop.lat)
        ? `<span class="dist-badge">${Math.round(getDist(G.userLat,G.userLng,shop.lat,shop.lng))} किमी</span>` : "";

    // Jo items match karein unhe pehle dikhao, baaki baad mein
    const allInv  = shop.inventory || [];
    const showInv = matchedItems && matchedItems.length ? matchedItems : allInv.filter(i => i.stock).slice(0, 6);

    const invHtml = showInv.map(item => `
        <div style="display:flex;align-items:center;justify-content:space-between;
            padding:7px 10px;border-radius:8px;
            background:${item.stock ? '#f9f9f9' : '#fafafa'};
            border:1px solid ${item.stock ? '#e0e0e0' : '#f0f0f0'};
            opacity:${item.stock ? 1 : 0.6};">
            <div style="flex:1;min-width:0;">
                <span style="font-size:13px;">${catIcons[item.cat]||'🌾'}</span>
                <span style="font-size:13px;font-weight:600;margin-left:4px;">${item.nameHi||item.name||''}</span>
                <span style="font-size:11px;color:#888;margin-left:4px;">${item.brand||''} • ${item.packSize||item.pack||''}</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                ${item.qty ? `<span style="font-size:11px;color:#555;">${item.qty} उपलब्ध</span>` : ''}
                <span style="font-size:13px;font-weight:700;color:#1a6b3c;">₹${item.price}</span>
                <span style="font-size:10px;padding:2px 7px;border-radius:8px;font-weight:600;
                    background:${item.stock ? '#e8f5e9' : '#ffebee'};
                    color:${item.stock ? '#2e7d32' : '#c62828'};">
                    ${item.stock ? '✅ है' : '❌ नहीं'}
                </span>
            </div>
        </div>`).join('');

    const demoTag = shop.isDemo
        ? `<span style="background:#fff3e0;color:#e65100;font-size:10px;padding:2px 8px;border-radius:6px;font-weight:700;margin-left:6px;">DEMO</span>` : '';

    const waBtn = shop.isDemo
        ? `<span style="font-size:11px;color:#aaa">नमूना दुकान</span>`
        : `<button class="btn-wa" data-action="wa-fullshop" data-phone="${shop.phone}" data-naam="${shop.naam}"
               style="font-size:12px;">💬 WhatsApp</button>`;

    return `
    <div style="background:white;border-radius:14px;padding:16px;margin-bottom:12px;
        box-shadow:0 2px 8px rgba(0,0,0,0.07);border-left:4px solid #1a6b3c;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
            <div>
                <div style="font-size:16px;font-weight:800;color:#1a6b3c;">
                    🏪 ${shop.naam}${demoTag}
                </div>
                <div style="font-size:12px;color:#777;margin-top:3px;">
                    📍 ${shop.area||''}, ${shop.district||''} ${dist}
                </div>
            </div>
            <span style="background:#e8f5e9;color:#2e7d32;font-size:11px;padding:3px 10px;
                border-radius:10px;font-weight:700;flex-shrink:0;">● Live</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:5px;margin-bottom:10px;">
            ${invHtml || '<p style="text-align:center;color:#aaa;font-size:12px;padding:10px;">इस category में कोई item नहीं</p>'}
        </div>
        <div style="display:flex;justify-content:flex-end;">
            ${waBtn}
        </div>
    </div>`;
}

function runShopSearch() {
    const text = (document.getElementById('shopSearchText').value || '').toLowerCase().trim();
    const cat  = SEARCH.cat;
    const item = SEARCH.item;
    const dist = parseInt(DOM.distanceSelect().value);

    let shops = [...DEMO_SHOPS, ...G.allShopsFull];

    // Distance filter
    if (G.userLat) {
        shops = shops.filter(s => !s.lat || getDist(G.userLat, G.userLng, s.lat, s.lng) <= dist);
    }

    const container = document.getElementById('shopCardsContainer');
    if (!shops.length) {
        container.innerHTML = `<div class="no-results"><div>🏪</div><p>नज़दीक कोई दुकान नहीं मिली</p><p style="font-size:12px;margin-top:6px;">दूरी बढ़ाएं या लोकेशन सेट करें</p></div>`;
        return;
    }

    const results = [];

    shops.forEach(shop => {
        const inv = shop.inventory || [];
        let matched = inv;

        // Category filter
        if (cat) matched = matched.filter(i => i.cat === cat);

        // Item filter — agar item chuna to sirf wahi, warna poori category
        if (item) matched = matched.filter(i =>
            (i.nameHi||i.name||'').includes(item) || (i.nameEn||'').toLowerCase().includes(item.toLowerCase())
        );

        // Text filter
        if (text) {
            const shopStr = `${shop.naam} ${shop.area} ${shop.district}`.toLowerCase();
            const itemMatch = matched.some(i =>
                JSON.stringify(i).toLowerCase().includes(text)
            );
            if (!shopStr.includes(text) && !itemMatch) return;
            matched = matched.filter(i => JSON.stringify(i).toLowerCase().includes(text));
            if (!matched.length && !shopStr.includes(text)) return;
        }

        // Agar koi filter nahi aur koi item nahi to skip (sirf demo dikhao)
        if (!cat && !item && !text && !shop.isDemo && !matched.length) return;

        results.push({ shop, matched: matched.slice(0, 8) });
    });

    if (!results.length) {
        container.innerHTML = `<div class="no-results"><div>🔍</div><p>कोई दुकान नहीं मिली</p><p style="font-size:12px;margin-top:6px;">अलग item या श्रेणी चुनें</p></div>`;
        return;
    }

    // Sort by distance
    if (G.userLat) {
        results.sort((a, b) => {
            const dA = a.shop.lat ? getDist(G.userLat, G.userLng, a.shop.lat, a.shop.lng) : 9999;
            const dB = b.shop.lat ? getDist(G.userLat, G.userLng, b.shop.lat, b.shop.lng) : 9999;
            return dA - dB;
        });
    }

    container.innerHTML = results.map(r => renderShopCard(r.shop, r.matched)).join('');
}

window.filterShops    = runShopSearch;
window.runShopSearch  = runShopSearch;

let _shopSearchInited = false;
function renderShopSection() {
    if (!_shopSearchInited) { initShopSearch(); _shopSearchInited = true; }
    runShopSearch();
}

// ── Load Approved Shops from Firebase ───────────────────
function startShopListener() {
    onSnapshot(
        query(collection(db, "shops"), orderBy("createdAt", "desc")),
        snap => {
            const arr = [];
            snap.forEach(d => {
                const data = d.data();
                // Only approved shops show on main page
                if (data.status === "approved" || data.naam) {
                    arr.push({ id: d.id, ...data });
                }
            });
            G.allShopsFull = arr;
            if (G.mainTab === "shop") renderShopSection();
        },
        () => { G.allShopsFull = []; }
    );
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
        if (typeSel) { typeSel.value = "खरीदना है"; updateSubtypeDropdown(); }
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
        e.target.reset();
        updateSubtypeDropdown();
        sendListingEmail(G.currentUser, {
            type:  listingType,
            grain: DOM.fGrain().value,
            qty:   document.getElementById('fQty')?.value  || '',
            price: document.getElementById('fPrice')?.value || '',
            loc:   DOM.fLoc().value,
            name:  DOM.fName().value,
        });
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
        applySettings(false, false);
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


// ── Google Auth ───────────────────────────────────────────
async function googleLogin() {
    try {
        await signInWithPopup(auth, provider);
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
    onAuthStateChanged(auth, user => updateAuthUI(user));
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


// ── 21. Report Problem ───────────────────────────────────
function getDeviceType() {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return "Tablet";
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "Mobile";
    return "Laptop/Desktop";
}
function getBrowserName() {
    const ua = navigator.userAgent;
    if (ua.includes("Edg/")) return "Edge";
    if (ua.includes("OPR/") || ua.includes("Opera")) return "Opera";
    if (ua.includes("Chrome/")) return "Chrome";
    if (ua.includes("Firefox/")) return "Firefox";
    if (ua.includes("Safari/") && !ua.includes("Chrome")) return "Safari";
    return "Unknown";
}

function openReportProblem() {
    const overlay = document.getElementById("rpOverlay");
    if (!overlay) return;
    overlay.classList.add("active");

    // Reset state
    document.getElementById("rpForm").style.display = "block";
    document.getElementById("rpSuccess").style.display = "none";
    document.getElementById("rpSubmitBtn").disabled = false;
    document.getElementById("rpCategory").value = "";
    document.getElementById("rpDesc").value = "";
    document.getElementById("rpPhone").value = "";

    // Auto-fill captured info
    const tabName = G.mainTab === "anaaj"
        ? (G.subTab === "becho" ? "अनाज — बेचना" : "अनाज — खरीदना")
        : G.mainTab === "shop" ? "दुकान" : "सूचना";
    const loginStatus = G.currentUser
        ? (G.currentUser.displayName || G.currentUser.email || "Logged in")
        : "Login नहीं";

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("rp_page",    window.location.pathname.split("/").pop() || "index.html");
    set("rp_tab",     tabName);
    set("rp_device",  getDeviceType());
    set("rp_browser", getBrowserName() + " " + (navigator.userAgent.match(/(?:Chrome|Firefox|Safari|Edge|OPR)\/([\d.]+)/)?.[1] || ""));
    set("rp_screen",  window.screen.width + "×" + window.screen.height);
    set("rp_login",   loginStatus);
}

function closeReportProblem() {
    const overlay = document.getElementById("rpOverlay");
    if (overlay) overlay.classList.remove("active");
}

async function submitReportProblem() {
    const category = document.getElementById("rpCategory").value.trim();
    const desc     = document.getElementById("rpDesc").value.trim();
    if (!category) { alert("कृपया problem चुनें"); return; }

    const btn = document.getElementById("rpSubmitBtn");
    btn.disabled = true;
    btn.textContent = "⏳ भेज रहे हैं...";

    // Collect all info
    const tabName = G.mainTab === "anaaj"
        ? (G.subTab === "becho" ? "अनाज — बेचना" : "अनाज — खरीदना")
        : G.mainTab === "shop" ? "दुकान" : "सूचना";

    const reportData = {
        // Problem info
        category,
        desc:        desc || "—",
        phone:       document.getElementById("rpPhone").value.trim() || "—",
        // Auto-captured page info
        page:        window.location.pathname.split("/").pop() || "index.html",
        url:         window.location.href,
        activeTab:   tabName,
        // Device info
        device:      getDeviceType(),
        browser:     getBrowserName(),
        browserFull: navigator.userAgent.substring(0, 120),
        screen:      window.screen.width + "×" + window.screen.height,
        // User info
        loginStatus: G.currentUser ? "logged_in" : "logged_out",
        userEmail:   G.currentUser ? G.currentUser.email : "—",
        userUID:     G.currentUser ? G.currentUser.uid   : "—",
        // App state
        totalSell:   G.allSell?.length || 0,
        totalBuy:    G.allBuy?.length  || 0,
        userLat:     G.userLat || null,
        userLng:     G.userLng || null,
        // Timestamp
        createdAt:   serverTimestamp(),
        type:        "problem_report"
    };

    try {
        await addDoc(collection(db, "problemReports"), reportData);
        document.getElementById("rpForm").style.display = "none";
        document.getElementById("rpSuccess").style.display = "block";
        setTimeout(() => closeReportProblem(), 3000);
    } catch (err) {
        btn.disabled = false;
        btn.textContent = "🚨 Report भेजें";
        alert("Error: " + err.message);
    }
}

window.openReportProblem  = openReportProblem;
window.closeReportProblem = closeReportProblem;
window.submitReportProblem= submitReportProblem;

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