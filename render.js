// ════════════════════════════════════════
// GRAMOO — render.js
// Listing render functions — grain, shop, suchna cards
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


export { renderGrain, renderShop, renderSuchna, filterListings, updateStats, updateActivity };
