// ════════════════════════════════════════
// GRAMOO — legal.js
// Terms, Privacy, Disclaimer, Report
// Plain script — gramoo.js se pehle load hota hai
// ════════════════════════════════════════

var _legalContent = {
    terms: {
        title: '📄 Terms & Conditions (उपयोग की शर्तें)',
        html: '<span class="legal-badge">Last Updated: 2026</span>'
            + '<h4>1. प्लेटफॉर्म की प्रकृति</h4>'
            + '<p>Gramoo एक ऑनलाइन प्लेटफॉर्म है जो खरीदार और विक्रेता को जोड़ता है। Gramoo स्वयं किसी भी खरीद-फरोख्त में शामिल नहीं है।</p>'
            + '<h4>2. उपयोगकर्ता की जिम्मेदारी</h4>'
            + '<ul><li>लिस्टिंग की जिम्मेदारी आपकी होगी।</li><li>जानकारी सही होनी चाहिए।</li><li>फर्जी जानकारी मना है।</li></ul>'
            + '<h4>3. प्रतिबंधित वस्तुएँ</h4>'
            + '<ul><li>जंगली या संरक्षित जानवर</li><li>अवैध वस्तुएँ, हथियार, नशीले पदार्थ</li></ul>'
            + '<h4>4. लेन-देन की जिम्मेदारी</h4>'
            + '<p>खरीद-बिक्री सीधे खरीदार-विक्रेता के बीच। Gramoo किसी नुकसान के लिए जिम्मेदार नहीं।</p>'
            + '<h4>5. लिस्टिंग हटाने का अधिकार</h4>'
            + '<p>Gramoo नियमों के खिलाफ listing हटा सकता है।</p>'
            + '<h4>6. नियमों में बदलाव</h4>'
            + '<p>Gramoo समय-समय पर शर्तें बदल सकता है।</p>'
    },
    privacy: {
        title: '🔒 Privacy Policy (गोपनीयता नीति)',
        html: '<span class="legal-badge">Last Updated: 2026</span>'
            + '<h4>1. हम कौन-सा डेटा लेते हैं</h4>'
            + '<ul><li>नाम</li><li>मोबाइल नंबर</li><li>लोकेशन</li><li>उत्पाद की जानकारी</li></ul>'
            + '<h4>2. डेटा का उपयोग</h4>'
            + '<ul><li>खरीदार-विक्रेता को जोड़ने के लिए</li><li>प्लेटफॉर्म सुधारने के लिए</li></ul>'
            + '<h4>3. हम क्या नहीं करते</h4>'
            + '<ul><li>डेटा किसी को नहीं बेचते।</li><li>बिना अनुमति नंबर शेयर नहीं करते।</li></ul>'
            + '<h4>4. डेटा सुरक्षा</h4>'
            + '<p>उचित तकनीकी उपाय करते हैं। 100% गारंटी संभव नहीं।</p>'
            + '<h4>5. डेटा हटाने का अनुरोध</h4>'
            + '<p>हमसे संपर्क करें।</p>'
    },
    disclaimer: {
        title: '⚠️ Disclaimer (अस्वीकरण)',
        html: '<span class="legal-badge warn-badge">महत्वपूर्ण सूचना</span>'
            + '<p>Gramoo केवल एक ऑनलाइन प्लेटफॉर्म है।</p>'
            + '<ul>'
            + '<li>सभी लेन-देन उपयोगकर्ताओं की जिम्मेदारी।</li>'
            + '<li>धोखाधड़ी के लिए Gramoo जिम्मेदार नहीं।</li>'
            + '<li>अवैध गतिविधि पर listing हटाई जाएगी।</li>'
            + '<li>सरकारी सूचनाओं की पुष्टि विभाग से करें।</li>'
            + '<li>किसी listing की सत्यता की गारंटी नहीं।</li>'
            + '</ul>'
            + '<p style="margin-top:10px;padding:10px;background:#fff3e0;border-radius:8px;color:#e65100;font-weight:bold;">'
            + '⚠️ सावधान: एडवांस पैसे देने से पहले मिलें और माल देखें।'
            + '</p>'
    }
};

function openLegal(type) {
    var d = _legalContent[type];
    if (!d) return;
    document.getElementById('legalTitle').textContent = d.title;
    document.getElementById('legalBody').innerHTML    = d.html;
    document.getElementById('legalOverlay').classList.add('active');
}
function closeLegal() {
    document.getElementById('legalOverlay').classList.remove('active');
}
function closeLegalOutside(e) {
    if (e.target === document.getElementById('legalOverlay')) closeLegal();
}
function openReport() {
    document.getElementById('reportOverlay').classList.add('active');
}
function closeReport() {
    document.getElementById('reportOverlay').classList.remove('active');
}
function closeReportOutside(e) {
    if (e.target === document.getElementById('reportOverlay')) closeReport();
}
function submitReport() {
    var reason = document.getElementById('reportReason').value;
    if (!reason) { alert('कृपया कारण चुनें'); return; }
    alert('✅ Report मिल गई! 24 घंटे में कार्रवाई होगी।\nकारण: ' + reason);
    closeReport();
    ['reportReason','reportListingId','reportPhone','reportDesc'].forEach(function(id) {
        document.getElementById(id).value = '';
    });
}
```

---
