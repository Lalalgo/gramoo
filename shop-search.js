// ════════════════════════════════════════
// GRAMOO — shop-search.js
// Shop search, filters, cards — index.html dukaan tab
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
                if (data.status === "approved") {
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


export { initShopSearch, runShopSearch, renderShopSection, startShopListener };
