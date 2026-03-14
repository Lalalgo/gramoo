// ════════════════════════════════════════
// GRAMOO — shop.js
// Dukandaar Portal Logic
// shop.html ka sara JavaScript
// ════════════════════════════════════════

// ── Firebase Imports ──────────────────────────────────────
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, collectionGroup, doc, getDoc, getDocs, setDoc, addDoc, updateDoc,
         deleteDoc, onSnapshot, query, where, orderBy, serverTimestamp }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Local Module Imports ──────────────────────────────────
import { db as _db, auth as _auth } from "./firebase-config.js";
import { getDist, timeAgo, encPhone, decPhone, validatePhone, getDeviceType, getBrowserName } from "./utils.js";
import { sendApprovalEmail } from "./email.js";
import { MASTER, catIcons } from "./data.js";

// Firebase — firebase-config.js se db aur auth import ho rahe hain (_db, _auth)
// window globals reportProblem ke liye

const db   = _db;
const auth = _auth;
window._db              = db;
window._addDoc          = addDoc;
window._collection      = collection;
window._serverTimestamp = serverTimestamp;

// MASTER, catIcons — data.js se import ho rahe hain

// ── State ──
let currentUser = null;
let shopData    = null;
let inventory   = [];
let requests    = [];
let selectedItem = null;
let editingItemId = null;
let editingStock  = true;

// ── Auth ──
document.getElementById('btnLogin').addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, new GoogleAuthProvider());
    } catch(e) {
        if (e.code !== 'auth/popup-closed-by-user') alert('Login failed: ' + e.message);
    }
});
document.getElementById('btnLogout').addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, async user => {
    // Loader hide karo
    const loader = document.getElementById('pageLoader');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.3s';
        setTimeout(() => { if(loader) loader.style.display = 'none'; }, 350);
    }

    if (user) {
        // Same user baar baar handle mat karo — login loop fix
        if (currentUser && currentUser.uid === user.uid) return;
        currentUser = user;
        window._currentUser = user;

        try {
            const [regSnap, shopSnap] = await Promise.all([
                getDoc(doc(db, 'shopRequests', user.uid)),
                getDoc(doc(db, 'shops', user.uid))
            ]);

            if (shopSnap.exists() && shopSnap.data().status === 'approved') {
                const regData = regSnap.exists() ? regSnap.data() : {};
                if (regData.welcomeSeen) {
                    showMainApp(user);
                } else {
                    showApprovedScreen(user, regData);
                }
            } else if (shopSnap.exists() && !shopSnap.data().status) {
                showMainApp(user); // purana shop
            } else if (regSnap.exists() && regSnap.data().status === 'pending') {
                showPendingScreen(regSnap.data().shopName);
            } else if (regSnap.exists() && regSnap.data().status === 'rejected') {
                showRegisterScreen();
                showToast('⚠️ पिछली request reject हुई थी। फिर से apply करें।');
            } else {
                showRegisterScreen();
            }
        } catch(e) {
            console.error('Auth error:', e);
            showRegisterScreen();
        }
    } else {
        currentUser = null;
        window._currentUser = null;
        hideAll();
        const ls = document.getElementById('loginScreen');
        if (ls) ls.style.display = 'flex';
    }
});

function hideAll() {
    ['loginScreen','pendingScreen','registerScreen','approvedScreen','mainApp'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function showPendingScreen(naam) {
    hideAll();
    const ps = document.getElementById('pendingScreen');
    ps.style.display = 'flex';
    document.getElementById('pendingShopName').textContent = '🏪 ' + (naam || 'आपकी दुकान');
}

function showRegisterScreen() {
    hideAll();
    document.getElementById('registerScreen').style.display = 'flex';
}

// EmailJS keys — email.js mein hain

async function showApprovedScreen(user, regData) {
    hideAll();
    document.getElementById('approvedScreen').style.display = 'flex';
    const naam = regData.shopName || 'आपकी दुकान';
    document.getElementById('approvedShopName').textContent = '🏪 ' + naam;
    const timeEl = document.getElementById('approvedTime');
    if (regData.approvedAt) {
        try {
            const d = regData.approvedAt.toDate();
            timeEl.textContent = '✅ Approved: ' +
                d.toLocaleDateString('hi-IN', {day:'numeric',month:'long',year:'numeric'}) +
                ' — ' + d.toLocaleTimeString('hi-IN', {hour:'2-digit',minute:'2-digit'});
        } catch(e) {}
    }
    sendApprovalEmail(user, regData);
    try {
        await updateDoc(doc(db,'shopRequests',user.uid), { welcomeSeen: true });
    } catch(e) { console.log('welcomeSeen error:', e); }
}

window.goToPortal  = function() { showMainApp(currentUser); };
window.doSignOut   = function() { signOut(auth); };

// sendApprovalEmail — email.js se import ho rahi hai

function showMainApp(user) {
    hideAll();
    document.getElementById('mainApp').style.display = 'block';
    const photo = document.getElementById('userPhoto');
    photo.src = user.photoURL || '';
    photo.style.display = user.photoURL ? 'block' : 'none';
    document.getElementById('userName').textContent = user.displayName ? user.displayName.split(' ')[0] : 'User';
    loadShopData();
    loadInventory();
    loadRequests();
    loadMandiDemands();
    populatePriceCompareDropdown();
}

// ── Registration Submit ──
window.submitRegistration = async function() {
    const naam  = document.getElementById('regShopName').value.trim();
    const dist  = document.getElementById('regDistrict').value.trim();
    const area  = document.getElementById('regArea').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const lat   = parseFloat(document.getElementById('regLat').value);
    const lng   = parseFloat(document.getElementById('regLng').value);
    const addr  = document.getElementById('regAddress').value.trim();
    const cat   = document.getElementById('regCategory').value;
    if (!naam||!dist||!area||!phone) { showToast('❌ सभी * fields भरें!'); return; }
    if (phone.length!==10||!['6','7','8','9'].includes(phone[0])) { showToast('❌ सही नंबर डालें!'); return; }
    if (!lat||!lng) { showToast('⚠️ GPS Location जरूरी है!'); return; }
    try {
        await setDoc(doc(db,'shopRequests',currentUser.uid), {
            uid: currentUser.uid, shopName: naam, district: dist, area,
            phone, lat, lng, address: addr, category: cat,
            userEmail: currentUser.email, userName: currentUser.displayName,
            status: 'pending', createdAt: serverTimestamp()
        });
        showPendingScreen(naam);
    } catch(e) { showToast('❌ Error: ' + e.message); }
};

window.getGpsForReg = function() {
    const btn = document.getElementById('btnRegGps');
    const status = document.getElementById('regGpsStatus');
    btn.textContent = '📡 Location मिल रही है...'; btn.disabled = true;
    navigator.geolocation.getCurrentPosition(p => {
        document.getElementById('regLat').value = p.coords.latitude;
        document.getElementById('regLng').value = p.coords.longitude;
        status.style.display = 'block';
        status.textContent = `✅ Location मिल गई! (${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)})`;
        btn.textContent = '✅ Location मिल गई'; btn.style.background = '#2e7d32'; btn.disabled = false;
    }, () => {
        showToast('❌ GPS नहीं मिला। Browser में Location allow करें।');
        btn.textContent = '📡 फिर से Try करें'; btn.disabled = false;
    });
};

// ── Load Shop ──
async function loadShopData() {
    const snap = await getDoc(doc(db, 'shops', currentUser.uid));
    shopData = snap.exists() ? snap.data() : null;
    renderDashboardTop();
}

function renderDashboardTop() {
    const bannerEl  = document.getElementById('setupBannerWrap');
    const profileEl = document.getElementById('shopProfileWrap');

    if (!shopData) {
        bannerEl.innerHTML = `
            <div class="setup-banner">
                <div class="icon">🏪</div>
                <div>
                    <h3>पहले अपनी दुकान Setup करें!</h3>
                    <p>नाम, पता और नंबर भरें — फिर items add करें</p>
                </div>
                <button class="btn-setup" onclick="openSetupModal()">Setup करें →</button>
            </div>`;
        profileEl.innerHTML = '';
    } else {
        bannerEl.innerHTML = '';
        profileEl.innerHTML = `
            <div class="shop-profile-card">
                <div class="shop-avatar">🏪</div>
                <div class="shop-info">
                    <h2>${shopData.naam}</h2>
                    <p>📍 ${shopData.area}, ${shopData.district} &nbsp;•&nbsp; 📱 +91 ${shopData.phone}</p>
                </div>
                <div class="shop-status">
                    <div class="status-badge status-live">● Live है</div>
                </div>
            </div>`;
        fillProfileForm();
    }
}

// ── Inventory ──
function loadInventory() {
    if (!currentUser) return;
    onSnapshot(
        query(collection(db, 'shops', currentUser.uid, 'inventory'), orderBy('addedAt','desc')),
        snap => {
            inventory = snap.docs.map(d => ({id:d.id,...d.data()}));
            renderInventory();
            renderQuickUpdate();
            updateDashboardStats();
            renderMasterGrid();
        }
    );
}

function renderInventory() {
    const el = document.getElementById('inventoryGrid');
    if (!inventory.length) {
        el.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
            <div class="e-icon">📦</div>
            <h3>अभी कोई item नहीं</h3>
            <p>"Items जोड़ें" tab से Master List में से items चुनें</p>
        </div>`;
        return;
    }
    el.innerHTML = inventory.map(item => renderInvCard(item)).join('');
}

function renderInvCard(item) {
    const master = MASTER.find(m => m.id === item.masterId) || {};
    const qtyText = item.qty ? `<span class="inv-tag">🏷️ ${item.qty} ${item.packSize} उपलब्ध</span>` : '';
    return `<div class="inv-card ${!item.stock?'out-of-stock':''}">
        <div class="inv-top">
            <div>
                <div class="inv-name">${catIcons[master.cat]||'📦'} ${item.nameHi||item.nameEn}</div>
                <div class="inv-cat">${item.nameEn} • ${master.cat||''}</div>
            </div>
            <button class="btn-remove-item" onclick="removeItem('${item.id}')">✕</button>
        </div>
        <div class="inv-details">
            <span class="inv-brand">${item.brand}</span>
            <span class="inv-tag">📦 ${item.packSize}</span>
            ${qtyText}
        </div>
        <div class="inv-price-row">
            <div class="inv-price">₹${item.price}<span> / ${item.packSize}</span></div>
            <div class="inv-actions">
                <button class="btn-edit-price" onclick="openPriceModal('${item.id}','${item.nameHi||item.nameEn}',${item.price},${item.stock},${item.qty||0})">✏️ Edit</button>
                <button class="btn-toggle-stock ${item.stock?'in':'out'}" onclick="toggleStock('${item.id}',${item.stock})">
                    ${item.stock?'✅ है':'❌ नहीं'}
                </button>
            </div>
        </div>
    </div>`;
}

function renderQuickUpdate() {
    const el = document.getElementById('quickUpdateGrid');
    if (!inventory.length) { el.innerHTML = '<p style="color:var(--muted);font-size:13px">अभी कोई item नहीं है।</p>'; return; }
    el.innerHTML = inventory.slice(0,6).map(item => renderInvCard(item)).join('');
}

function updateDashboardStats() {
    document.getElementById('dTotalItems').textContent = inventory.length;
    document.getElementById('dInStock').textContent    = inventory.filter(i=>i.stock).length;
    document.getElementById('dOutStock').textContent   = inventory.filter(i=>!i.stock).length;
}

// ── Master Grid ──
function renderMasterGrid() {
    const cat    = document.getElementById('catFilter').value;
    const search = document.getElementById('itemSearch').value.toLowerCase();
    const addedIds = inventory.map(i => i.masterId);

    const filtered = MASTER.filter(m =>
        (!cat || m.cat === cat) &&
        (!search || m.hi.includes(search) || m.en.toLowerCase().includes(search))
    );

    const el = document.getElementById('masterGrid');
    if (!filtered.length) { el.innerHTML = '<p style="color:var(--muted);font-size:13px;padding:12px">कोई item नहीं मिला</p>'; return; }

    el.innerHTML = filtered.map(m => {
        const added = addedIds.includes(m.id);
        return `<div class="master-item ${added?'already-added':''} ${selectedItem===m.id?'selected':''}"
            onclick="${added?'':'selectMasterItem(\''+m.id+'\')'}">
            <div class="mi-name">${catIcons[m.cat]||'📦'} ${m.hi}</div>
            <div class="mi-name-en">${m.en}</div>
            <span class="mi-cat">${m.cat}</span>
            ${added?'<span style="font-size:10px;color:var(--green-mid);display:block;margin-top:4px">✅ Already added</span>':''}
        </div>`;
    }).join('');
}

window.selectMasterItem = function(id) {
    selectedItem = id;
    const master = MASTER.find(m => m.id === id);
    if (!master) return;

    document.getElementById('configTitle').textContent = `${master.hi} (${master.en}) — Configure करें`;

    const brandSel = document.getElementById('cfgBrand');
    brandSel.innerHTML = master.brands.map(b => `<option>${b}</option>`).join('');

    const packSel = document.getElementById('cfgPack');
    packSel.innerHTML = master.packs.map(p => `<option>${p}</option>`).join('');

    document.getElementById('cfgPrice').value = '';
    document.getElementById('itemConfig').classList.add('show');
    renderMasterGrid();
    document.getElementById('itemConfig').scrollIntoView({behavior:'smooth', block:'nearest'});
};

window.addItemToInventory = async function() {
    if (!selectedItem) return;
    if (!shopData) { showToast('⚠️ पहले दुकान setup करें!'); openSetupModal(); return; }
    const master = MASTER.find(m => m.id === selectedItem);
    const price  = parseInt(document.getElementById('cfgPrice').value);
    if (!price || price < 1) { showToast('❌ कीमत डालें!'); return; }

    try {
        await addDoc(collection(db, 'shops', currentUser.uid, 'inventory'), {
            masterId: master.id,
            nameHi:   master.hi,
            nameEn:   master.en,
            cat:      master.cat,
            brand:    document.getElementById('cfgBrand').value,
            packSize: document.getElementById('cfgPack').value,
            price,
            qty:      parseInt(document.getElementById('cfgQty').value) || 0,
            stock:    document.getElementById('cfgStock').value === 'true',
            addedAt:  serverTimestamp()
        });
        selectedItem = null;
        document.getElementById('itemConfig').classList.remove('show');
        showToast('✅ Item inventory में जुड़ गया!');
    } catch(e) { showToast('❌ Error: ' + e.message); }
};

// ── Price Modal ──
window.openPriceModal = function(itemId, name, price, stock, qty) {
    editingItemId = itemId;
    editingStock  = stock;
    document.getElementById('priceModalTitle').textContent = name + ' — Update करें';
    document.getElementById('priceInput').value = price;
    document.getElementById('qtyInput').value   = qty || 0;
    const btn = document.getElementById('priceStockBtn');
    btn.textContent = stock ? '✅ In Stock' : '❌ Out of Stock';
    btn.className   = 'btn-toggle-stock ' + (stock ? 'in' : 'out');
    document.getElementById('priceModal').classList.add('active');
};

window.togglePriceStock = function() {
    editingStock = !editingStock;
    const btn = document.getElementById('priceStockBtn');
    btn.textContent = editingStock ? '✅ In Stock' : '❌ Out of Stock';
    btn.className   = 'btn-toggle-stock ' + (editingStock ? 'in' : 'out');
};

window.closePriceModal = function() {
    document.getElementById('priceModal').classList.remove('active');
    editingItemId = null;
};

window.savePriceUpdate = async function() {
    const price = parseInt(document.getElementById('priceInput').value);
    const qty   = parseInt(document.getElementById('qtyInput').value) || 0;
    if (!price || price < 1) { showToast('❌ कीमत डालें!'); return; }
    try {
        await updateDoc(doc(db,'shops',currentUser.uid,'inventory',editingItemId), {
            price, qty, stock: editingStock, updatedAt: serverTimestamp()
        });
        closePriceModal();
        showToast('✅ Update हो गई!');
    } catch(e) { showToast('❌ Error: ' + e.message); }
};

// ── Toggle Stock ──
window.toggleStock = async function(itemId, current) {
    try {
        await updateDoc(doc(db,'shops',currentUser.uid,'inventory',itemId), {
            stock: !current, updatedAt: serverTimestamp()
        });
        showToast(!current ? '✅ In Stock mark किया!' : '❌ Out of Stock mark किया!');
    } catch(e) { showToast('❌ Error: ' + e.message); }
};

// ── Remove Item ──
window.removeItem = async function(itemId) {
    if (!confirm('यह item inventory से हटाना चाहते हो?')) return;
    try {
        await deleteDoc(doc(db,'shops',currentUser.uid,'inventory',itemId));
        showToast('🗑️ Item हटा दिया!');
    } catch(e) { showToast('❌ Error: ' + e.message); }
};

// ── Item Requests ──
function loadRequests() {
    if (!currentUser) return;
    onSnapshot(
        query(collection(db,'shopRequests'), where('uid','==',currentUser.uid), orderBy('createdAt','desc')),
        snap => {
            requests = snap.docs.map(d=>({id:d.id,...d.data()}));
            renderRequests();
            document.getElementById('dPendingReq').textContent = requests.filter(r=>r.status==='pending').length;
        }
    );
}

function renderRequests() {
    const el = document.getElementById('requestsList');
    if (!requests.length) {
        el.innerHTML = `<div class="empty-state"><div class="e-icon">📋</div><h3>कोई request नहीं</h3><p>"Items जोड़ें" tab से नया item request करें</p></div>`;
        return;
    }
    const statusLabel = {pending:'⏳ Pending', approved:'✅ Approved', rejected:'❌ Rejected'};
    el.innerHTML = requests.map(r => `
        <div class="req-item">
            <div class="req-icon">🙋</div>
            <div class="req-info">
                <h4>${r.itemName} ${r.brand?'— '+r.brand:''}</h4>
                <p>${r.reason||''}</p>
            </div>
            <span class="req-status ${r.status||'pending'}">${statusLabel[r.status]||'⏳ Pending'}</span>
        </div>`).join('');
}

window.sendItemRequest = async function() {
    const itemName = document.getElementById('reqItemName').value.trim();
    if (!itemName) { showToast('❌ Item का नाम लिखें!'); return; }
    if (!shopData) { showToast('⚠️ पहले दुकान setup करें!'); return; }
    try {
        await addDoc(collection(db,'shopRequests'), {
            uid:      currentUser.uid,
            shopName: shopData.naam,
            itemName,
            brand:    document.getElementById('reqBrand').value.trim(),
            reason:   document.getElementById('reqReason').value.trim(),
            status:   'pending',
            createdAt: serverTimestamp()
        });
        document.getElementById('reqItemName').value  = '';
        document.getElementById('reqBrand').value     = '';
        document.getElementById('reqReason').value    = '';
        document.getElementById('reqDone').style.display = 'block';
        setTimeout(() => document.getElementById('reqDone').style.display='none', 3000);
    } catch(e) { showToast('❌ Error: ' + e.message); }
};

// ── Mandi Buyer Demand ───────────────────────────────────
function loadMandiDemands() {
    const el = document.getElementById('mandiDemandList');
    if (!el || !shopData) return;
    // Listen to buy listings from same district
    onSnapshot(
        query(collection(db,'buy'), where('district','==', shopData.district||''), orderBy('createdAt','desc')),
        snap => {
            const demands = snap.docs.map(d => ({id:d.id,...d.data()})).slice(0,20);
            if (!demands.length) {
                el.innerHTML = `<div style="text-align:center;padding:40px;color:#aaa;">
                    <div style="font-size:40px;">📭</div>
                    <p style="margin-top:8px;">अभी आपके जिले में कोई demand नहीं है</p></div>`;
                return;
            }
            el.innerHTML = demands.map(d => `
                <div style="background:white;border-radius:12px;padding:14px;margin-bottom:10px;border:1px solid #e8f5e9;border-left:4px solid #1a6b3c;">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
                        <div>
                            <div style="font-weight:700;font-size:14px;">🛒 ${d.grain||d.item||'अनाज'}</div>
                            <div style="font-size:12px;color:#777;margin-top:3px;">
                                📍 ${d.area||''}, ${d.district||''} &nbsp;•&nbsp; 📦 ${d.qty||'?'} KG चाहिए
                                ${d.price ? `&nbsp;•&nbsp; ₹${d.price}/KG` : ''}
                            </div>
                        </div>
                        ${d.phone && d.phone!=='SAMPLE' ? `
                        <a href="https://wa.me/91${d.phone}?text=${encodeURIComponent(`नमस्ते! Gramoo पर आपकी ${d.grain||'item'} की demand देखी। हमारे पास उपलब्ध है।`)}"
                            target="_blank"
                            style="background:#25d366;color:white;padding:7px 14px;border-radius:18px;font-size:12px;font-weight:700;text-decoration:none;white-space:nowrap;">
                            💬 Reply करें
                        </a>` : ''}
                    </div>
                </div>`).join('');
        }, () => {
            el.innerHTML = `<div style="text-align:center;padding:30px;color:#aaa;font-size:13px;">Demands load नहीं हो सकीं।</div>`;
        }
    );
}

// ── Price Comparison ─────────────────────────────────────
function populatePriceCompareDropdown() {
    const sel = document.getElementById('priceCompareItem');
    if (!sel) return;
    const opts = MASTER.map(m => `<option value="${m.id}">${m.hi} (${m.en})</option>`).join('');
    sel.innerHTML = '<option value="">— Item चुनें —</option>' + opts;
}

window.loadPriceComparison = async function() {
    const masterId = document.getElementById('priceCompareItem').value;
    const el = document.getElementById('priceCompareResult');
    if (!masterId) { el.innerHTML = ''; return; }
    el.innerHTML = `<div style="text-align:center;padding:20px;color:#aaa;">⏳ Load हो रहा है...</div>`;

    const master = MASTER.find(m => m.id === masterId);
    // Get all shops' inventory for this item
    try {
        // We query each shop's subcollection - simplified: query shopItems collection
        const snap = await getDocs(query(
            collectionGroup(db, 'inventory'),
            where('masterId','==', masterId),
            where('stock','==', true),
            orderBy('price','asc')
        ));
        const results = snap.docs.map(d => ({...d.data(), shopId: d.ref.parent.parent.id}));

        if (!results.length) {
            el.innerHTML = `<div style="text-align:center;padding:30px;color:#aaa;">
                <div style="font-size:36px;">📊</div>
                <p style="margin-top:8px;">अभी कोई दूसरी दुकान यह item नहीं बेच रही</p></div>`;
            return;
        }

        const myPrice = results.find(r => r.shopId === currentUser.uid)?.price;

        el.innerHTML = `
            <div style="font-size:14px;font-weight:700;color:#1a6b3c;margin-bottom:10px;">
                🌿 ${master.hi} — ${results.length} दुकानों पर उपलब्ध
            </div>
            ${results.map((r, i) => {
                const isMe = r.shopId === currentUser.uid;
                const isCheapest = i === 0;
                return `
                <div style="background:${isMe?'#e8f5e9':'white'};border-radius:10px;padding:12px 14px;
                    margin-bottom:8px;border:2px solid ${isMe?'#1a6b3c':isCheapest?'#ffd54f':'#e0e0e0'};
                    display:flex;align-items:center;justify-content:space-between;gap:8px;">
                    <div>
                        <span style="font-size:12px;font-weight:600;color:#555;">${r.brand||''} • ${r.packSize||''}</span>
                        ${isMe ? '<span style="font-size:11px;background:#1a6b3c;color:white;padding:2px 8px;border-radius:6px;margin-left:6px;">आपकी दुकान</span>' : ''}
                        ${isCheapest && !isMe ? '<span style="font-size:11px;background:#f9a825;color:white;padding:2px 8px;border-radius:6px;margin-left:6px;">सबसे सस्ता</span>' : ''}
                    </div>
                    <div style="font-size:20px;font-weight:800;color:${isCheapest?'#2e7d32':'#333'};">₹${r.price}</div>
                </div>`;
            }).join('')}
            ${myPrice ? `
            <div style="background:#fff3e0;border-radius:10px;padding:12px;margin-top:8px;font-size:13px;color:#e65100;">
                💡 आपका भाव ₹${myPrice} है — सबसे सस्ता ₹${results[0].price}
                ${myPrice > results[0].price ? ` (₹${myPrice-results[0].price} ज़्यादा)` : ' ✅ आप सबसे सस्ते हैं!'}
            </div>` : ''}`;
    } catch(e) {
        el.innerHTML = `<div style="text-align:center;padding:20px;color:#aaa;font-size:12px;">
            Price comparison के लिए Firestore indexing चाहिए।<br>
            Admin से collectionGroup index setup करवाएं।</div>`;
    }
};
window.getGpsSetup = function() {
    const btn = document.getElementById('btnGetGpsSetup');
    const status = document.getElementById('gpsStatusSetup');
    btn.textContent = '📡 Location मिल रही है...';
    btn.disabled = true;
    navigator.geolocation.getCurrentPosition(
        p => {
            document.getElementById('mLat').value = p.coords.latitude;
            document.getElementById('mLng').value = p.coords.longitude;
            status.style.display = 'block';
            status.textContent = `✅ Location मिल गई! (${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)})`;
            btn.textContent = '✅ Location मिल गई — फिर से लें';
            btn.style.background = '#2e7d32';
            btn.disabled = false;
        },
        () => {
            showToast('❌ GPS नहीं मिला। Browser में Location allow करें।');
            btn.textContent = '📡 फिर से Try करें';
            btn.disabled = false;
        }
    );
};

window.getGpsProfile = function() {
    const status = document.getElementById('gpsStatusProfile');
    status.style.display = 'block';
    status.textContent = '📡 Location मिल रही है...';
    navigator.geolocation.getCurrentPosition(
        p => {
            document.getElementById('pLat').value = p.coords.latitude;
            document.getElementById('pLng').value = p.coords.longitude;
            status.textContent = `✅ Location मिल गई! (${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)})`;
        },
        () => {
            status.textContent = '❌ GPS नहीं मिला।';
            showToast('Browser में Location allow करें।');
        }
    );
};

// ── Shop Setup Modal ──
window.openSetupModal = function() {
    document.getElementById('setupModal').classList.add('active');
};
window.closeSetupModal = function() {
    document.getElementById('setupModal').classList.remove('active');
};
window.saveShopSetup = async function() {
    const naam  = document.getElementById('mShopName').value.trim();
    const dist  = document.getElementById('mDistrict').value.trim();
    const area  = document.getElementById('mArea').value.trim();
    const phone = document.getElementById('mPhone').value.trim();
    const lat   = parseFloat(document.getElementById('mLat').value);
    const lng   = parseFloat(document.getElementById('mLng').value);
    if (!naam||!dist||!area||!phone) { showToast('❌ सभी * fields भरें!'); return; }
    if (phone.length!==10||!['6','7','8','9'].includes(phone[0])) { showToast('❌ सही नंबर डालें!'); return; }
    if (!lat || !lng) { showToast('⚠️ पहले GPS से Location लें!'); return; }
    try {
        await setDoc(doc(db,'shops',currentUser.uid), {
            naam, district:dist, area, phone,
            category: document.getElementById('mCategory').value,
            lat, lng,
            uid: currentUser.uid,
            createdAt: serverTimestamp()
        });
        shopData = { naam, district:dist, area, phone, lat, lng };
        closeSetupModal();
        renderDashboardTop();
        showToast('✅ दुकान setup हो गई!');
    } catch(e) { showToast('❌ Error: ' + e.message); }
};

// ── Profile Save ──
window.saveShopProfile = async function() {
    const naam  = document.getElementById('pShopName').value.trim();
    const dist  = document.getElementById('pDistrict').value.trim();
    const area  = document.getElementById('pArea').value.trim();
    const phone = document.getElementById('pPhone').value.trim();
    if (!naam||!dist||!area||!phone) { showToast('❌ सभी * fields भरें!'); return; }
    if (phone.length!==10||!['6','7','8','9'].includes(phone[0])) { showToast('❌ सही नंबर डालें!'); return; }
    const updateData = {
        naam, district:dist, area, phone,
        category:  document.getElementById('pCategory').value,
        address:   document.getElementById('pAddress').value.trim(),
        uid: currentUser.uid,
        updatedAt: serverTimestamp()
    };
    const pLat = parseFloat(document.getElementById('pLat').value);
    const pLng = parseFloat(document.getElementById('pLng').value);
    if (pLat && pLng) { updateData.lat = pLat; updateData.lng = pLng; }
    try {
        await setDoc(doc(db,'shops',currentUser.uid), updateData, {merge:true});
        shopData = {...shopData, naam, district:dist, area, phone};
        renderDashboardTop();
        showToast('✅ Profile save हो गई!');
    } catch(e) { showToast('❌ Error: ' + e.message); }
};

function fillProfileForm() {
    if (!shopData) return;
    document.getElementById('pShopName').value  = shopData.naam    || '';
    document.getElementById('pDistrict').value  = shopData.district|| '';
    document.getElementById('pArea').value      = shopData.area    || '';
    document.getElementById('pPhone').value     = shopData.phone   || '';
    document.getElementById('pAddress').value   = shopData.address || '';
    if (shopData.category) document.getElementById('pCategory').value = shopData.category;
}

// ── Nav Tabs ──
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
        document.querySelectorAll('.tab-sec').forEach(s=>s.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-'+tab.dataset.tab).classList.add('active');
    });
});

window.switchTab = function(name) {
    document.querySelectorAll('.nav-tab').forEach(t => {
        if (t.dataset.tab===name) t.classList.add('active');
        else t.classList.remove('active');
    });
    document.querySelectorAll('.tab-sec').forEach(s => {
        if (s.id==='tab-'+name) s.classList.add('active');
        else s.classList.remove('active');
    });
};

// ── Filters ──
document.getElementById('catFilter').addEventListener('change', renderMasterGrid);
document.getElementById('itemSearch').addEventListener('input', renderMasterGrid);

// ── Toast ──
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
}

// Init master grid
renderMasterGrid();


// ── Report Problem ────────────────────────────────────────
// ── Report Problem (shop.html) ────────────────────────
function getDeviceType() {
    const ua = navigator.userAgent;
    if (/tablet|ipad/i.test(ua)) return 'Tablet';
    if (/mobile|android|iphone/i.test(ua)) return 'Mobile';
    return 'Laptop/Desktop';
}
function getBrowserName() {
    const ua = navigator.userAgent;
    if (ua.includes('Edg/'))  return 'Edge';
    if (ua.includes('OPR/'))  return 'Opera';
    if (ua.includes('Chrome/')) return 'Chrome';
    if (ua.includes('Firefox/')) return 'Firefox';
    if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari';
    return 'Unknown';
}
function openReportProblem() {
    const overlay = document.getElementById('rpOverlay');
    if (!overlay) return;
    overlay.classList.add('active');
    document.getElementById('rpForm').style.display    = 'block';
    document.getElementById('rpSuccess').style.display = 'none';
    document.getElementById('rpSubmitBtn').disabled    = false;
    document.getElementById('rpCategory').value = '';
    document.getElementById('rpDesc').value     = '';
    document.getElementById('rpPhone').value    = '';
    // Auto-fill info
    const set = (id,v) => { const e=document.getElementById(id); if(e) e.textContent=v; };
    set('rp_page',    'shop.html');
    set('rp_device',  getDeviceType());
    set('rp_browser', getBrowserName());
    set('rp_screen',  window.screen.width + '×' + window.screen.height);
    const u = typeof currentUser !== 'undefined' ? currentUser : null;
    set('rp_login', u ? ('✅ ' + (u.email||'Logged in')) : '❌ Nahi');
}
function closeReportProblem() {
    const overlay = document.getElementById('rpOverlay');
    if (overlay) overlay.classList.remove('active');
}
async function submitReportProblem() {
    const category = document.getElementById('rpCategory').value.trim();
    if (!category) { alert('कृपया problem चुनें'); return; }
    const btn = document.getElementById('rpSubmitBtn');
    btn.disabled    = true;
    btn.textContent = '⏳ भेज रहे हैं...';
    const u = typeof currentUser !== 'undefined' ? currentUser : null;
    // window globals use karo — module scope se bahar hain
    const _db  = window._db;
    const _add = window._addDoc;
    const _col = window._collection;
    const _ts  = window._serverTimestamp;
    if (!_db || !_add || !_col || !_ts) {
        btn.disabled = false; btn.textContent = '🚨 Report भेजें';
        alert('Page abhi load ho raha hai, thodi der baad try karein।'); return;
    }
    try {
        await _add(_col(_db, 'problemReports'), {
            category,
            desc:        document.getElementById('rpDesc').value.trim() || '—',
            phone:       document.getElementById('rpPhone').value.trim() || '—',
            page:        'shop.html',
            url:         window.location.href,
            activeTab:   typeof currentTab !== 'undefined' ? currentTab : '—',
            device:      getDeviceType(),
            browser:     getBrowserName(),
            browserFull: navigator.userAgent.substring(0,120),
            screen:      window.screen.width + '×' + window.screen.height,
            loginStatus: u ? 'logged_in'  : 'logged_out',
            userEmail:   u ? (u.email||'—') : '—',
            userUID:     u ? (u.uid||'—')   : '—',
            createdAt:   _ts(),
            type:        'problem_report'
        });
        document.getElementById('rpForm').style.display    = 'none';
        document.getElementById('rpSuccess').style.display = 'block';
        setTimeout(() => closeReportProblem(), 3000);
    } catch(err) {
        btn.disabled    = false;
        btn.textContent = '🚨 Report भेजें';
        alert('Error: ' + err.message);
    }
}
document.getElementById('rpOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('rpOverlay')) closeReportProblem();
});
