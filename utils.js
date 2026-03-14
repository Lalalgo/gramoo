// ════════════════════════════════════════
// GRAMOO — utils.js
// Pure helper functions — koi Firebase dependency nahi
// gramoo.js aur shop.js dono import karte hain
// ════════════════════════════════════════

// ── Distance (Haversine formula) ─────────────────────────
// getDist(lat1, lng1, lat2, lng2) → km mein distance
export function getDist(a, b, c, d) {
    const R = 6371, dL = (c-a)*Math.PI/180, dG = (d-b)*Math.PI/180;
    const x = Math.sin(dL/2)**2 + Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dG/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}

// ── Time Ago (Hindi) ─────────────────────────────────────
export function timeAgo(ts) {
    if (!ts) return "अभी";
    const sec = Math.floor((Date.now() - ts.toMillis()) / 1000);
    if (sec < 60)    return "अभी";
    if (sec < 3600)  return Math.floor(sec / 60)   + " मिनट पहले";
    if (sec < 86400) return Math.floor(sec / 3600)  + " घंटे पहले";
    return Math.floor(sec / 86400) + " दिन पहले";
}

// ── Phone Encrypt / Decrypt (XOR + Base64) ───────────────
const PHONE_KEY = "GRAMOO26";

export function encPhone(p) {
    let e = "";
    for (let i = 0; i < p.length; i++)
        e += String.fromCharCode(p.charCodeAt(i) ^ PHONE_KEY.charCodeAt(i % PHONE_KEY.length));
    return btoa(e);
}

export function decPhone(e) {
    if (!e || e === "SAMPLE") return "";
    try {
        const d = atob(e); let p = "";
        for (let i = 0; i < d.length; i++)
            p += String.fromCharCode(d.charCodeAt(i) ^ PHONE_KEY.charCodeAt(i % PHONE_KEY.length));
        return p;
    } catch(x) { return e; }
}

// ── Spam Control (localStorage based) ────────────────────
// Max 3 listings per 5 min per phone number
export function checkSpam(phone) {
    const key = "gramoo_sp_" + phone, LIM = 3, WIN = 300000;
    let arr = [];
    try { arr = JSON.parse(localStorage.getItem(key) || "[]"); } catch(x) {}
    const now = Date.now();
    arr = arr.filter(t => now - t < WIN);
    if (arr.length >= LIM) {
        alert("⚠️ 5 मिनट में 3 से ज़्यादा listing नहीं। " + Math.ceil((WIN-(now-arr[0]))/60000) + " मिनट बाद try करें।");
        return false;
    }
    arr.push(now);
    localStorage.setItem(key, JSON.stringify(arr));
    return true;
}

// ── Phone Validation (UI) ─────────────────────────────────
export function validatePhone(input, errId, okId) {
    const v = input.value.trim();
    const valid = /^[6-9]\d{9}$/.test(v);
    const err = document.getElementById(errId), ok = document.getElementById(okId);
    if (!v)    { err.style.display="none"; ok.style.display="none"; input.classList.remove("input-error","input-ok"); return false; }
    if (valid) { err.style.display="none"; ok.style.display="block"; input.classList.remove("input-error"); input.classList.add("input-ok"); return true; }
    err.style.display="block"; ok.style.display="none"; input.classList.remove("input-ok"); input.classList.add("input-error"); return false;
}

// ── Device / Browser Detection ───────────────────────────
export function getDeviceType() {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return "Tablet";
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "Mobile";
    return "Laptop/Desktop";
}

export function getBrowserName() {
    const ua = navigator.userAgent;
    if (ua.includes("Edg/"))    return "Edge";
    if (ua.includes("OPR/") || ua.includes("Opera")) return "Opera";
    if (ua.includes("Chrome/")) return "Chrome";
    if (ua.includes("Firefox/")) return "Firefox";
    if (ua.includes("Safari/") && !ua.includes("Chrome")) return "Safari";
    return "Unknown";
}
