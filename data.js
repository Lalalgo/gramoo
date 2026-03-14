// ════════════════════════════════════════
// GRAMOO — data.js
// Sara static data ek jagah
// gramoo.js aur shop.js dono import karte hain
// Kuch add/edit karna ho to sirf yahi file kholni hai
// ════════════════════════════════════════

// ── Category Icons (shared) ───────────────────────────────
export const catIcons = {
    'खाद'      : '🌿',
    'बीज'      : '🌱',
    'कीटनाशक'  : '💊',
    'यंत्र'    : '🚜',
    'पशु आहार' : '🐄',
    'अन्य'     : '🧪',
};

// ── Grain Meta (icon + bg color per grain type) ───────────
export const grainMeta = {
    "गेहूं": {icon:"🌾", bg:"#fff8e1"},
    "चावल":  {icon:"🍚", bg:"#e8f5e9"},
    "दाल":   {icon:"🫘", bg:"#fce4ec"},
    "सरसों": {icon:"🟡", bg:"#fff3e0"},
    "मक्का": {icon:"🌽", bg:"#e0f7fa"},
    "बाजरा": {icon:"🌿", bg:"#e8eaf6"},
    "अन्य":  {icon:"🌱", bg:"#f3e5f5"},
};

// ── Shop Category Meta ────────────────────────────────────
export const shopMeta = {
    "खाद":          {icon:"🌿", bg:"#e8f5e9"},
    "बीज":          {icon:"🌱", bg:"#f1f8e9"},
    "कीटनाशक":      {icon:"💊", bg:"#fff3e0"},
    "कृषि यंत्र":   {icon:"🚜", bg:"#e3f2fd"},
    "सिंचाई उपकरण": {icon:"💧", bg:"#e0f7fa"},
    "पशु आहार":     {icon:"🐄", bg:"#fce4ec"},
    "अन्य":         {icon:"🌾", bg:"#f5f5f5"},
};

// ── Suchna Type Meta ──────────────────────────────────────
export const suchnaMeta = {
    "खाद उपलब्धता":     {icon:"🌿", bg:"#e8f5e9"},
    "बीज वितरण":        {icon:"🌱", bg:"#f1f8e9"},
    "कीटनाशक उपलब्धता": {icon:"💊", bg:"#fff3e0"},
    "सरकारी योजना":     {icon:"🏛️", bg:"#e3f2fd"},
    "PM किसान सूची":    {icon:"💰", bg:"#fff8e1"},
    "फसल बीमा":         {icon:"📋", bg:"#f3e5f5"},
    "यंत्र किराया":      {icon:"🚜", bg:"#e3f2fd"},
    "अन्य सूचना":       {icon:"📣", bg:"#fce4ec"},
};

// ── Grain Subtypes / Varieties ────────────────────────────
// Kisan listing mein variety dropdown ke liye
export const GRAIN_SUBTYPES = {
    "गेहूं":  ["DBW-187","DBW-303","HD-2967","HD-3086","PBW-343","GW-496","K-307","Sharbati","Lokwan","अन्य"],
    "चावल":  ["बासमती (Pusa 1121)","बासमती (1509)","बासमती (1718)","सरबती","HMT","PR-106","Swarna","MTU-7029","Parmal","अन्य"],
    "दाल":   ["अरहर (तुअर)","मूंग","उड़द","मसूर","चना","राजमा","मटर","लोबिया","अन्य"],
    "सरसों": ["पीली सरसों","काली सरसों","Pusa Bold","Laxmi","RH-749","RH-30","Vardan","अन्य"],
    "मक्का": ["पीला मक्का","सफेद मक्का","Pioneer P3396","DKC-9144","Bio-9681","Navjot","अन्य"],
    "बाजरा": ["HHB-67","HHB-197","Raj-171","MPMH-17","Kaveri Gold","अन्य"],
    "ज्वार": ["CSH-16","SPH-1634","Maldandi","अन्य"],
    "गन्ना": ["Co-0238","Co-0118","CoJ-64","Up-05125","अन्य"],
    "कपास":  ["BT Cotton","Hybrid","देसी","अन्य"],
    "अन्य":  ["अन्य"],
};

// ── MASTER_ITEMS — Shop Search ke liye (simple list) ─────
// gramoo.js shop search mein use hota hai
export const MASTER_ITEMS = {
    'खाद':      ['डीएपी (DAP)','यूरिया','एनपीके (NPK)','एसएसपी','पोटाश (MOP)','जिंक सल्फेट','वर्मी कम्पोस्ट','ह्यूमिक एसिड','बोरोन'],
    'बीज':      ['गेहूं बीज','धान बीज','सरसों बीज','मक्का बीज','बाजरा बीज','टमाटर बीज','प्याज बीज','मिर्च बीज','मूंग/उड़द बीज'],
    'कीटनाशक':  ['क्लोरपाइरीफॉस','इमिडाक्लोप्रिड','साइपरमेथ्रिन','मैंकोज़ेब','कार्बेन्डाजिम','ग्लाइफोसेट','ट्राइकोडर्मा'],
    'यंत्र':    ['नैपसैक स्प्रेयर','पावर स्प्रेयर','ड्रिप सिस्टम','तिरपाल','पाइप सेट','खुरपी/दरांती'],
    'पशु आहार': ['कैटल फीड','पोल्ट्री फीड','मिनरल मिक्सचर','सरसों खल','बाईपास प्रोटीन'],
};

// ── MASTER — Shop Inventory ke liye (full detail) ─────────
// shop.js dukandaar portal mein use karta hai
export const MASTER = [
    // खाद / Fertilizers
    { id:'dap',     hi:'डीएपी',          en:'DAP',               cat:'खाद',      brands:['IFFCO','KRIBHCO','Zuari','NFL','Coromandel'],          packs:['50kg'] },
    { id:'urea',    hi:'यूरिया',          en:'Urea',              cat:'खाद',      brands:['IFFCO','KRIBHCO','NFL','Chambal'],                     packs:['45kg'] },
    { id:'npk',     hi:'एनपीके',          en:'NPK',               cat:'खाद',      brands:['IFFCO','Coromandel','Zuari','Khaitan'],                packs:['50kg'] },
    { id:'ssp',     hi:'एसएसपी',          en:'SSP',               cat:'खाद',      brands:['IFFCO','Zuari','Khaitan','Local'],                     packs:['50kg'] },
    { id:'mop',     hi:'पोटाश (MOP)',      en:'MOP/Potash',        cat:'खाद',      brands:['IFFCO','SQM','Local'],                                packs:['50kg'] },
    { id:'zinc',    hi:'जिंक सल्फेट',      en:'Zinc Sulphate',     cat:'खाद',      brands:['Aries','IFFCO','Swal'],                               packs:['1kg','25kg'] },
    { id:'vermi',   hi:'वर्मी कम्पोस्ट',   en:'Vermi Compost',     cat:'खाद',      brands:['Local','Organic India'],                              packs:['5kg','10kg','50kg'] },
    { id:'humic',   hi:'ह्यूमिक एसिड',     en:'Humic Acid',        cat:'खाद',      brands:['Multiplex','Aries','Anand'],                          packs:['500g','1kg','5kg'] },
    { id:'boron',   hi:'बोरोन',            en:'Boron',             cat:'खाद',      brands:['Aries','Swal','Multiplex'],                           packs:['500g','1kg'] },
    // बीज / Seeds
    { id:'wheat',   hi:'गेहूं बीज',        en:'Wheat Seed',        cat:'बीज',      brands:['HD-2967','DBW-187','PBW-725','UP-2338'],               packs:['5kg','10kg','40kg'] },
    { id:'paddy',   hi:'धान बीज',          en:'Paddy Seed',        cat:'बीज',      brands:['Pusa Basmati','Swarna','MTU-7029','Syngenta'],         packs:['5kg','10kg'] },
    { id:'mustard', hi:'सरसों बीज',         en:'Mustard Seed',      cat:'बीज',      brands:['Pusa Bold','NPJ-93','Pioneer','Advanta'],              packs:['1kg','5kg'] },
    { id:'maize',   hi:'मक्का बीज',         en:'Maize Seed',        cat:'बीज',      brands:['Pioneer','Syngenta','DKC'],                           packs:['1kg','5kg'] },
    { id:'bajra',   hi:'बाजरा बीज',         en:'Bajra Seed',        cat:'बीज',      brands:['HHB-67','Pioneer','Nuziveedu'],                        packs:['1kg','5kg'] },
    { id:'tomato',  hi:'टमाटर बीज',         en:'Tomato Seed',       cat:'बीज',      brands:['Syngenta','Mahyco','Nunhems','Namdhari'],              packs:['10g','50g'] },
    { id:'onion',   hi:'प्याज बीज',         en:'Onion Seed',        cat:'बीज',      brands:['Nasik Red','Agrifound','Mahyco'],                      packs:['500g','1kg'] },
    { id:'chilli',  hi:'मिर्च बीज',          en:'Chilli Seed',       cat:'बीज',      brands:['Syngenta','Indo-American','Mahyco'],                   packs:['10g','50g'] },
    { id:'moong',   hi:'मूंग/उड़द बीज',      en:'Moong/Urad Seed',   cat:'बीज',      brands:['PDM-139','SML-668','Local'],                          packs:['5kg','10kg'] },
    // कीटनाशक / Pesticides
    { id:'chlor',   hi:'क्लोरपाइरीफॉस',     en:'Chlorpyrifos',      cat:'कीटनाशक',  brands:['Dursban','Coroban','Dorsan'],                         packs:['500ml','1L'] },
    { id:'imida',   hi:'इमिडाक्लोप्रिड',     en:'Imidacloprid',      cat:'कीटनाशक',  brands:['Confidor','Tatamida','Admire'],                        packs:['100ml','250ml'] },
    { id:'cyper',   hi:'साइपरमेथ्रिन',       en:'Cypermethrin',      cat:'कीटनाशक',  brands:['Cyper','Ripcord','Demon'],                            packs:['500ml','1L'] },
    { id:'manco',   hi:'मैंकोज़ेब',           en:'Mancozeb',          cat:'कीटनाशक',  brands:['Dithane M-45','Indofil','Kavach'],                    packs:['250g','500g','1kg'] },
    { id:'carb',    hi:'कार्बेन्डाजिम',       en:'Carbendazim',       cat:'कीटनाशक',  brands:['Bavistin','Derosal','Roko'],                          packs:['100g','500g'] },
    { id:'glyph',   hi:'ग्लाइफोसेट',          en:'Glyphosate',        cat:'कीटनाशक',  brands:['Roundup','Glycel','Spark'],                           packs:['500ml','1L'] },
    { id:'tricho',  hi:'ट्राइकोडर्मा',         en:'Trichoderma (Bio)', cat:'कीटनाशक',  brands:['Biofit','Ecosom','Multiplex'],                        packs:['250g','1kg'] },
    // यंत्र / Equipment
    { id:'knap',    hi:'नैपसैक स्प्रेयर',    en:'Knapsack Sprayer',  cat:'यंत्र',    brands:['Neptune','Swan','Aspee'],                             packs:['16L','20L'] },
    { id:'power',   hi:'पावर स्प्रेयर',       en:'Power Sprayer',     cat:'यंत्र',    brands:['Neptune','Kisankraft','Aspee'],                        packs:['16L','20L'] },
    { id:'drip',    hi:'ड्रिप सिस्टम',         en:'Drip System',       cat:'यंत्र',    brands:['Netafim','Jain','Finolex'],                           packs:['Per Acre Kit'] },
    { id:'tarp',    hi:'तिरपाल',              en:'Tarpaulin',         cat:'यंत्र',    brands:['Garware','SRF','Local'],                              packs:['12x9ft','18x12ft','24x18ft'] },
    { id:'pipe',    hi:'पाइप सेट',             en:'Pipe Set',          cat:'यंत्र',    brands:['Supreme','Finolex','Prince'],                         packs:['Per Meter','Per Set'] },
    { id:'tools',   hi:'खुरपी/दरांती',          en:'Hand Tools',        cat:'यंत्र',    brands:['Local','Nimbkar'],                                    packs:['Per Piece'] },
    // पशु आहार / Animal Feed
    { id:'cattle',  hi:'कैटल फीड',            en:'Cattle Feed',       cat:'पशु आहार', brands:['Godrej Agrovet','Amul','Purina','Khanna'],             packs:['25kg','50kg'] },
    { id:'poultry', hi:'पोल्ट्री फीड',          en:'Poultry Feed',      cat:'पशु आहार', brands:["Venky's",'Godrej','Suguna'],                          packs:['25kg','50kg'] },
    { id:'mineral', hi:'मिनरल मिक्सचर',         en:'Mineral Mixture',   cat:'पशु आहार', brands:['Godrej','Tata Rallis','Provimi'],                      packs:['1kg','5kg'] },
    { id:'mustcake',hi:'सरसों खल',             en:'Mustard Cake',      cat:'पशु आहार', brands:['Local','Patanjali'],                                   packs:['25kg','50kg'] },
    { id:'bypass',  hi:'बाईपास प्रोटीन',        en:'Bypass Protein',    cat:'पशु आहार', brands:['Godrej','Kemin','Provimi'],                            packs:['25kg'] },
    // अन्य / Other
    { id:'mulch',   hi:'मल्चिंग फिल्म',         en:'Mulching Film',     cat:'अन्य',     brands:['Garware','SRF'],                                      packs:['25 micron','30 micron'] },
    { id:'soil',    hi:'मिट्टी जांच किट',         en:'Soil Testing Kit',  cat:'अन्य',     brands:['IFFCO','Local'],                                      packs:['Per Kit'] },
    { id:'coco',    hi:'कोको पीट',              en:'Coco Peat',         cat:'अन्य',     brands:['Classimax','Local'],                                   packs:['5kg','50L'] },
    { id:'pherom',  hi:'फेरोमोन ट्रैप',           en:'Pheromone Trap',    cat:'अन्य',     brands:['Pheromon','Local'],                                   packs:['Per Set'] },
];

// ── Demo Shops (index.html par hamesha dikhenge) ──────────
export const DEMO_SHOPS = [
    {
        id:"demo1", naam:"रामलाल एग्रो सेंटर", area:"अनूपशहर", district:"बुलंदशहर",
        phone:"SAMPLE", isDemo:true, lat:28.40, lng:77.85,
        inventory:[
            {masterId:"dap",    nameHi:"डीएपी (DAP)",      cat:"खाद",      brand:"IFFCO",     packSize:"50kg", price:1350, qty:45, stock:true},
            {masterId:"urea",   nameHi:"यूरिया",            cat:"खाद",      brand:"KRIBHCO",   packSize:"45kg", price:270,  qty:80, stock:true},
            {masterId:"npk",    nameHi:"एनपीके",            cat:"खाद",      brand:"Coromandel",packSize:"50kg", price:1600, qty:20, stock:true},
            {masterId:"wheat",  nameHi:"गेहूं बीज",          cat:"बीज",      brand:"HD-2967",   packSize:"40kg", price:2400, qty:15, stock:true},
            {masterId:"mustard",nameHi:"सरसों बीज",          cat:"बीज",      brand:"Pusa Bold", packSize:"1kg",  price:450,  qty:30, stock:true},
            {masterId:"chlor",  nameHi:"क्लोरपाइरीफॉस",      cat:"कीटनाशक",  brand:"Dursban",   packSize:"1L",   price:380,  qty:0,  stock:false},
            {masterId:"knap",   nameHi:"नैपसैक स्प्रेयर",    cat:"यंत्र",    brand:"Neptune",   packSize:"16L",  price:1800, qty:8,  stock:true},
            {masterId:"cattle", nameHi:"कैटल फीड",           cat:"पशु आहार", brand:"Godrej",    packSize:"50kg", price:1450, qty:25, stock:true},
        ]
    },
    {
        id:"demo2", naam:"किसान बीज भण्डार", area:"खुर्जा", district:"बुलंदशहर",
        phone:"SAMPLE", isDemo:true, lat:28.25, lng:77.85,
        inventory:[
            {masterId:"wheat",  nameHi:"गेहूं बीज",          cat:"बीज",      brand:"DBW-187",      packSize:"40kg", price:2200, qty:30, stock:true},
            {masterId:"paddy",  nameHi:"धान बीज",            cat:"बीज",      brand:"Pusa Basmati", packSize:"5kg",  price:320,  qty:50, stock:true},
            {masterId:"mustard",nameHi:"सरसों बीज",          cat:"बीज",      brand:"NPJ-93",       packSize:"1kg",  price:420,  qty:40, stock:true},
            {masterId:"maize",  nameHi:"मक्का बीज",           cat:"बीज",      brand:"Pioneer",      packSize:"5kg",  price:850,  qty:20, stock:true},
            {masterId:"moong",  nameHi:"मूंग बीज",            cat:"बीज",      brand:"PDM-139",      packSize:"5kg",  price:260,  qty:0,  stock:false},
            {masterId:"dap",    nameHi:"डीएपी (DAP)",        cat:"खाद",      brand:"IFFCO",        packSize:"50kg", price:1380, qty:10, stock:true},
            {masterId:"zinc",   nameHi:"जिंक सल्फेट",         cat:"खाद",      brand:"Aries",        packSize:"1kg",  price:95,   qty:60, stock:true},
        ]
    },
    {
        id:"demo3", naam:"श्याम कृषि सेवा केंद्र", area:"सियाना", district:"बुलंदशहर",
        phone:"SAMPLE", isDemo:true, lat:28.35, lng:77.90,
        inventory:[
            {masterId:"chlor",  nameHi:"क्लोरपाइरीफॉस",      cat:"कीटनाशक",  brand:"Coroban",   packSize:"1L",   price:360,  qty:25, stock:true},
            {masterId:"imida",  nameHi:"इमिडाक्लोप्रिड",      cat:"कीटनाशक",  brand:"Confidor",  packSize:"250ml",price:480,  qty:15, stock:true},
            {masterId:"manco",  nameHi:"मैंकोज़ेब",            cat:"कीटनाशक",  brand:"Dithane",   packSize:"1kg",  price:195,  qty:35, stock:true},
            {masterId:"glyph",  nameHi:"ग्लाइफोसेट",           cat:"कीटनाशक",  brand:"Roundup",   packSize:"1L",   price:320,  qty:20, stock:true},
            {masterId:"knap",   nameHi:"नैपसैक स्प्रेयर",     cat:"यंत्र",    brand:"Aspee",     packSize:"16L",  price:1650, qty:5,  stock:true},
            {masterId:"power",  nameHi:"पावर स्प्रेयर",        cat:"यंत्र",    brand:"Kisankraft",packSize:"20L",  price:8500, qty:2,  stock:true},
            {masterId:"dap",    nameHi:"डीएपी (DAP)",         cat:"खाद",      brand:"Zuari",     packSize:"50kg", price:1340, qty:30, stock:true},
            {masterId:"urea",   nameHi:"यूरिया",               cat:"खाद",      brand:"NFL",       packSize:"45kg", price:265,  qty:50, stock:true},
        ]
    }
];
export const DEMO_SHOP = DEMO_SHOPS[0]; // backward compat

// ── Sample Data (jab Firebase mein kuch nahi) ─────────────
export const sampleSell = [
    {id:"s1",name:"रमेश कुमार",  grain:"गेहूं",qty:200,price:28,loc:"अनूपशहर, बुलंदशहर",wa:"SAMPLE",tag:"naya",   desc:"नया माल, घर से ले सकते हैं",createdAt:null,lat:28.40,lng:77.85},
    {id:"s2",name:"सुनीता देवी", grain:"चावल", qty:50, price:45,loc:"सियाना, बुलंदशहर",  wa:"SAMPLE",tag:"organic",desc:"घर का उगाया जैविक चावल",     createdAt:null,lat:28.35,lng:77.90},
    {id:"s3",name:"मो. सलीम",   grain:"सरसों",qty:100,price:60,loc:"खुर्जा, बुलंदशहर",  wa:"SAMPLE",tag:"",      desc:"तेल निकालने के लिए बढ़िया",  createdAt:null,lat:28.25,lng:77.85},
    {id:"s4",name:"सुरेश सिंह", grain:"मक्का", qty:500,price:22,loc:"दिबाई, बुलंदशहर",  wa:"SAMPLE",tag:"naya",   desc:"सीधे खेत से ताज़ा माल",      createdAt:null,lat:28.20,lng:78.00},
];
export const sampleBuy = [
    {id:"b1",name:"दिल्ली आटा मिल",grain:"गेहूं",qty:5000,price:27,loc:"डिलीवरी — बुलंदशहर",wa:"SAMPLE",tag:"",desc:"नियमित सप्लायर चाहिए",        createdAt:null,lat:28.40,lng:77.85},
    {id:"b2",name:"राकेश किराना", grain:"चावल", qty:200, price:43,loc:"बुलंदशहर शहर",      wa:"SAMPLE",tag:"",desc:"दुकान के लिए अच्छी क्वालिटी", createdAt:null,lat:28.40,lng:77.85},
];
export const sampleShop = [
    {id:"sh1",name:"रामलाल एग्रो सेंटर",cat:"खाद",     product:"DAP खाद",          price:"₹1350/बोरी",loc:"अनूपशहर",wa:"SAMPLE",desc:"होम डिलीवरी उपलब्ध", createdAt:null,lat:28.40,lng:77.85},
    {id:"sh2",name:"किसान बीज भंडार",   cat:"बीज",     product:"HD-2967 गेहूं बीज",price:"₹60/KG",    loc:"खुर्जा",  wa:"SAMPLE",desc:"सरकार प्रमाणित बीज", createdAt:null,lat:28.25,lng:77.85},
    {id:"sh3",name:"श्याम कृषि केंद्र", cat:"कीटनाशक",product:"कीट नाशक स्प्रे",  price:"₹450/लीटर", loc:"सियाना",  wa:"SAMPLE",desc:"सभी फसलों के लिए",   createdAt:null,lat:28.35,lng:77.90},
];
export const sampleSuchna = [
    {id:"n1",name:"IFFCO सहकारी समिति",  type:"खाद उपलब्धता", title:"DAP और यूरिया खाद आ गई है",             desc:"अनूपशहर गोदाम में DAP उपलब्ध है। ₹1350/बोरी सरकारी दर।",     loc:"अनूपशहर",      phone:"SAMPLE",valid:"30 नवंबर",   urgent:true, createdAt:null,lat:28.40,lng:77.85},
    {id:"n2",name:"ग्राम पंचायत",        type:"PM किसान सूची",title:"PM किसान 18वीं किस्त — सूची देखें",    desc:"18वीं किस्त जारी हो गई है। पंचायत कार्यालय में नाम जांचें।", loc:"बुलंदशहर",     phone:"SAMPLE",valid:"15 दिसंबर",  urgent:false,createdAt:null,lat:28.40,lng:77.85},
    {id:"n3",name:"कृषि विभाग बुलंदशहर",type:"फसल बीमा",     title:"रबी फसल बीमा — अंतिम तारीख 31 दिसंबर", desc:"PMFBY के तहत रबी फसल का बीमा करवाएं।",                        loc:"बुलंदशहर जिला",phone:"SAMPLE",valid:"31 दिसंबर",  urgent:true, createdAt:null,lat:28.40,lng:77.85},
];
