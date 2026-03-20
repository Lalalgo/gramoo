// ════════════════════════════════════════
// GRAMOO — report.js
// Listing Report overlay (legal.js se called)
// NOTE: यह plain script है (module नहीं) — gramoo.js se pehle load hota hai
// Actual Firestore save gramoo.js ke G aur db ke through hota hai
// ════════════════════════════════════════

// submitReport() को gramoo.js ke db object ki zaroorat hai.
// Isliye hum ek pending queue use karte hain — agar db ready nahi
// hua to report queue mein save ho jata hai aur db milte hi bhej deta hai.

window._reportQueue = [];

window.openReport = function() {
    var overlay = document.getElementById('reportOverlay');
    if (overlay) overlay.classList.add('active');
};

window.closeReport = function() {
    var overlay = document.getElementById('reportOverlay');
    if (overlay) overlay.classList.remove('active');
};

window.closeReportOutside = function(e) {
    if (e.target === document.getElementById('reportOverlay')) window.closeReport();
};

window.submitReport = async function() {
    var reason = (document.getElementById('reportReason')?.value || '').trim();
    if (!reason) { alert('कृपया कारण चुनें'); return; }

    var submitBtn = document.querySelector('.btn-report-submit');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '⏳ भेज रहे हैं...'; }

    var data = {
        reason:    reason,
        listingId: (document.getElementById('reportListingId')?.value || '').trim() || '—',
        phone:     (document.getElementById('reportPhone')?.value    || '').trim() || '—',
        desc:      (document.getElementById('reportDesc')?.value     || '').trim() || '—',
        page:      window.location.href,
        createdAt: null, // gramoo.js serverTimestamp se replace hoga
        type:      'listing_report'
    };

    // gramoo.js ka db aur serverTimestamp accessible hai window._gramooDb se
    var db  = window._gramooDb;
    var sTs = window._gramooServerTimestamp;
    var col = window._gramooCollection;
    var add = window._gramooAddDoc;

    if (db && sTs && col && add) {
        try {
            data.createdAt = sTs();
            await add(col(db, 'reports'), data);
            alert('✅ Report मिल गई! 24 घंटे में कार्रवाई होगी।\nकारण: ' + reason);
        } catch(err) {
            console.error('Report save error:', err);
            alert('✅ Report दर्ज हो गई।\nकारण: ' + reason);
        }
    } else {
        // db ready nahi — queue mein save karo
        window._reportQueue.push(data);
        alert('✅ Report दर्ज हो गई! 24 घंटे में कार्रवाई होगी।\nकारण: ' + reason);
    }

    window.closeReport();
    ['reportReason','reportListingId','reportPhone','reportDesc'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
    });
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = '🚨 Report भेजें'; }
};

// gramoo.js se call hoga jab db ready ho — queue flush karta hai
window._flushReportQueue = async function() {
    if (!window._reportQueue.length) return;
    var db  = window._gramooDb;
    var sTs = window._gramooServerTimestamp;
    var col = window._gramooCollection;
    var add = window._gramooAddDoc;
    if (!db || !sTs || !col || !add) return;
    while (window._reportQueue.length) {
        var item = window._reportQueue.shift();
        item.createdAt = sTs();
        try { await add(col(db, 'reports'), item); } catch(e) { console.error('Queue flush error:', e); }
    }
};

// legal.js ke submitReport() ke liye alias
window._submitReportImpl = window.submitReport;
