// ════════════════════════════════════════
// GRAMOO — email.js
// EmailJS config + email functions
// Keys update karni ho to sirf yahi file kholni hai
// ════════════════════════════════════════

// ── EmailJS Keys ─────────────────────────────────────────
// EmailJS Dashboard → Account → General → Public Key
const EJS_SERVICE      = 'service_un25x5y';   // Email Services → Service ID
const EJS_TPL_LISTING  = 'template_g721f9g';  // Listing confirm email
const EJS_TPL_APPROVAL = 'template_pubasuc';  // Dukaan approval email
const EJS_PUBKEY       = 'OAlzCN74cs01xSoZH'; // Account → Public Key

// ── Listing Confirm Email ─────────────────────────────────
// Kisan listing save karne ke baad jaati hai
export function sendListingEmail(user, data) {
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

// ── Dukaan Approval Email ─────────────────────────────────
// Admin approve karne ke baad dukandaar ko jaati hai
export function sendApprovalEmail(user, regData) {
    try {
        emailjs.init(EJS_PUBKEY);
        emailjs.send(EJS_SERVICE, EJS_TPL_APPROVAL, {
            to_email:      user.email,
            to_name:       user.displayName || 'Dukandaar',
            shop_name:     regData.shopName  || 'Aapki Dukaan',
            shop_area:     (regData.area || '') + ', ' + (regData.district || ''),
            portal_url:    'https://gramoo.in/shop.html',
            approved_time: regData.approvedAt
                ? regData.approvedAt.toDate().toLocaleDateString('hi-IN',
                    { day: 'numeric', month: 'long', year: 'numeric' })
                : 'Aaj',
        }).then(() => console.log('✅ Approval email sent'))
          .catch(e => console.log('Approval email error:', e));
    } catch(e) { console.log('EmailJS error:', e); }
}
