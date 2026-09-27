/**
 * HospitalityHub B2B Resource Exchange - Central Data & Localization Layer
 * 
 * Strict MMR (Mumbai Metropolitan Region) Inventory Dataset
 * Includes:
 * - Complete English & Hindi (EN/HI) UI Dictionary
 * - Enterprise Hospitality Categories (Excludes Audio/Whole Chain/Free Booking from Explore)
 * - 100% MMR verified inventory with authentic 3–4 photo galleries
 * - Seed demo users and initial bookings
 */

// 1. Translations Dictionary (English & Hindi)
const TRANSLATIONS = {
  en: {
    // Brand & Header
    brandName: "HospitalityHub",
    brandTagline: "MMR B2B Resource Exchange",
    explore: "Explore",
    spaces: "Spaces",
    resources: "Resources",
    providers: "Providers",
    howItWorks: "How It Works",
    negotiations: "Negotiations",
    seekerMode: "Seeker",
    providerMode: "Provider",
    listResource: "+ List Resource",
    notifications: "Notifications",
    noNotifications: "No new notifications",
    markAllRead: "Mark all as read",
    signIn: "Sign In",
    signUp: "Sign Up",
    logout: "Log Out",
    profileSettings: "Profile & Settings",
    seekerDashboard: "Seeker Dashboard",
    providerDashboard: "Provider Fleet Hub",
    switchAccount: "Switch Account",
    
    // Hero Section
    heroEyebrow: "Mumbai Metropolitan Region (MMR) B2B Hospitality Exchange",
    heroHeading: "Share, Negotiate & Rent Verified Hospitality Assets Across MMR",
    heroSubtext: "Discover verified banquet spaces, industrial kitchen appliances, refrigerated logistics, and power utilities with UPI QR payment reporting and browser-local pending bookings.",
    exploreResources: "Explore MMR Marketplace",
    listYourResource: "List Your Resource",
    verifiedPartnersBadge: "100% KYC & GSTIN Verified",
    instantDispatchBadge: "Rapid Emergency Dispatch",
    calendarLockBadge: "Automated Date Lock & Escrow",

    // Search Panel
    whatDoYouNeed: "What asset do you need?",
    searchPlaceholder: "e.g. 500-Seater Banquet, Rational Combi Oven, Reefer Van, Pagoda Canopy...",
    location: "MMR Location",
    allLocations: "All Locations (MMR)",
    requiredFrom: "Required From",
    requiredUntil: "Required Until",
    quantity: "Quantity",
    bookingType: "Booking Type",
    allBookingTypes: "All Booking Types",
    plannedBooking: "Planned Booking",
    emergencyBooking: "Emergency Dispatch",
    searchBtn: "Search MMR Resources",
    activeFilters: "Active Filters",
    clearFilters: "Reset / Clear All",
    showingResults: "Showing",
    verifiedResourcesFound: "verified MMR resources found",

    // Categories (Removed Audio, Whole Chain, Free Booking)
    allCategories: "All Categories",
    catSpaces: "Spaces & Venues",
    catKitchen: "Kitchen & Catering",
    catVehicles: "Hospitality Fleet",
    catFurniture: "Banquet Furniture",
    catEquipment: "Staging & Event Rigging",
    catColdChain: "Cold Chain & Freezers",
    catLogistics: "Heavy Logistics",
    catUtilities: "Power & Generators",
    catOther: "Fine Dining & Cutlery",

    // Resource Card
    verifiedBusiness: "Verified Business",
    matchScore: "Smart Match",
    available: "Available",
    negotiating: "Negotiating",
    preBooked: "Locked / Booked",
    unavailable: "Unavailable",
    completed: "Completed",
    perDay: "/ day",
    perHour: "/ hr",
    availableUnits: "Available Units",
    requestRental: "Request Rental",
    bookNow: "Book / Reserve",
    viewDetails: "View Details",
    refundableDeposit: "Refundable Deposit",
    reviews: "reviews",
    rentalsCompleted: "rentals completed",
    away: "from BKC Depot",

    // Match Score Breakdown
    matchScoreTitle: "Smart Match Compatibility Breakdown",
    matchScoreSubtitle: "Real-time AI matching based on 5 operational factors in MMR:",
    factorPrice: "Price & Deposit Optimization",
    factorDistance: "MMR Proximity & Transport Feasibility",
    factorAvailability: "Calendar Availability & Date Conflict Check",
    factorSuitability: "Technical Specifications & Capacity Match",
    factorUrgency: "Rapid Dispatch Readiness",
    closeModal: "Close",

    // Resource Detail UI
    photoGallery: "Verified Resource Gallery",
    photoCounter: "Photo",
    of: "of",
    specifications: "Technical Specifications",
    description: "Asset Description",
    termsConditions: "Commercial Rental Terms & NOC",
    providerProfile: "Provider Organization",
    responseRate: "Avg Response Time",
    lessThan15Min: "< 15 minutes",
    memberSince: "Member Since",
    verifiedLicense: "FSSAI / GSTIN / Municipal Trade License Verified",
    calendarAvailability: "Live Calendar & Locked Dates",
    calendarNotice: "Dates marked with 🔒 are locked by active confirmed bookings.",
    logisticsSelector: "Fulfillment & Transport",
    siteDelivery: "Dedicated Site Delivery",
    selfPickup: "Depot Self Pickup",
    estimatedDeliveryTime: "Est. Transit Time",
    logisticsFee: "Logistics Fee",
    free: "Free",
    calculateTotal: "Commercial Cost Breakdown",
    rentalDuration: "Rental Duration",
    days: "days",
    baseSubtotal: "Base Rental Subtotal",
    securityDeposit: "Refundable Security Deposit",
    tokenAmount: "Escrow Advance Token (20%)",
    totalEstimate: "Total Estimated Booking Value",
    proceedCheckout: "Proceed to Reserve & Lock Calendar",
    initiateNegotiation: "Initiate B2B Counter-Offer",

    // Authentication & Modal
    signInTitle: "Sign In to HospitalityHub",
    signUpTitle: "Register B2B Enterprise Account",
    loginSubtitle: "Access verified MMR hospitality resources, bookings, and fleet controls.",
    signupSubtitle: "Join over 250+ verified hotels, caterers, and venues across the Mumbai Metropolitan Region.",
    workEmail: "Corporate Work Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    fullName: "Authorized Representative Name",
    businessName: "Legal Business / Company Name",
    businessType: "Business Classification",
    accountTypeLabel: "Account Mode",
    seekerType: "Seeker (Rent & Procure)",
    providerType: "Provider (List & Monetize Fleet)",
    phone: "Direct Phone / WhatsApp",
    rememberMe: "Remember session on this workstation",
    forgotPassword: "Forgot password?",
    resetPassword: "Reset Password",
    loginBtn: "Sign In",
    registerBtn: "Create Enterprise Account",
    noAccount: "Don't have an enterprise account?",
    alreadyHaveAccount: "Already registered?",

    // Verification Center
    verificationHeading: "Provider Business Verification",
    verificationSubheading: "HospitalityHub enforces 100% verified enterprise suppliers across MMR. Submit your credentials to unlock verified provider status.",
    statusNotSubmitted: "Not Submitted",
    statusPending: "Pending Verification",
    statusVerified: "Verified Supplier",
    statusRejected: "Verification Rejected",
    gstinLabel: "GSTIN Number",
    fssaiLabel: "FSSAI Food Safety / Trade License Number",
    tradeLicenseLabel: "Municipal Trade License / Registration Reference",
    uploadPhotosGuidance: "Upload 3 to 4 authentic photos of your commercial kitchen, fleet, or equipment (Max 5MB each).",
    submitVerificationBtn: "Submit Dossier for Verification",

    // Reviews & Ratings
    reviewsTitle: "Verified Enterprise Reviews",
    writeReviewBtn: "Write a Review",
    ratingSummary: "Overall Rating",
    verifiedBookingBadge: "Verified Completed Booking",
    noReviewsYet: "No reviews yet. Be the first verified enterprise to review this asset.",

    // Footer
    footerAbout: "HospitalityHub is MMR's premier B2B hospitality resource marketplace, enabling hotels, caterers, banquet venues, and event production enterprises to monetize idle assets and procure verified capacity on demand.",
    copyright: "© 2026 HospitalityHub Technologies Pvt Ltd. Exclusively for Mumbai Metropolitan Region (MMR)."
  },

  hi: {
    // Brand & Header
    brandName: "HospitalityHub",
    brandTagline: "एमएमआर बी2बी रिसोर्स एक्सचेंज",
    explore: "एक्सप्लोर करें",
    spaces: "स्थान एवं स्थल",
    resources: "संसाधन",
    providers: "प्रदाता",
    howItWorks: "कार्यप्रणाली",
    negotiations: "मोलभाव",
    seekerMode: "मांगकर्ता",
    providerMode: "प्रदाता",
    listResource: "+ संसाधन जोड़ें",
    notifications: "सूचनाएं",
    noNotifications: "कोई नई सूचना नहीं",
    markAllRead: "सभी पढ़ी गईं",
    signIn: "लॉग इन",
    signUp: "साइन अप",
    logout: "लॉग आउट",
    profileSettings: "प्रोफ़ाइल एवं सेटिंग्स",
    seekerDashboard: "मांगकर्ता डैशबोर्ड",
    providerDashboard: "प्रदाता फ्लीट हब",
    switchAccount: "खाता बदलें",
    
    // Hero Section
    heroEyebrow: "मुंबई महानगर क्षेत्र (MMR) बी2बी हॉस्पिटैलिटी एक्सचेंज",
    heroHeading: "एमएमआर में सत्यापित हॉस्पिटैलिटी संपत्तियों को साझा करें और बुक करें",
    heroSubtext: "बैंक्वेट हॉल, वाणिज्यिक रसोई उपकरण, प्रशीतित परिवहन और जनरेटर खोजें। UPI QR भुगतान रिपोर्ट करें; बुकिंग इसी ब्राउज़र में लंबित रहेगी।",
    exploreResources: "एमएमआर मार्केटप्लेस देखें",
    listYourResource: "अपना संसाधन सूचीबद्ध करें",
    verifiedPartnersBadge: "100% जीएसटी एवं केवाईसी सत्यापित",
    instantDispatchBadge: "त्वरित आपातकालीन डिस्पैच",
    calendarLockBadge: "स्वचालित कैलेंडर लॉक एवं एस्क्रो",

    // Search Panel
    whatDoYouNeed: "आपको क्या संसाधन चाहिए?",
    searchPlaceholder: "उदा. 500-सीटर बैंक्वेट, रैशनल कॉम्बी ओवन, रीफर वैन, जर्मन टेंट...",
    location: "एमएमआर स्थान",
    allLocations: "सभी स्थान (MMR)",
    requiredFrom: "प्रारंभ तिथि",
    requiredUntil: "समाप्ति तिथि",
    quantity: "मात्रा",
    bookingType: "बुकिंग प्रकार",
    allBookingTypes: "सभी प्रकार",
    plannedBooking: "नियोजित बुकिंग",
    emergencyBooking: "आपातकालीन डिस्पैच",
    searchBtn: "संसाधन खोजें",
    activeFilters: "सक्रिय फ़िल्टर",
    clearFilters: "रीसेट / सभी साफ़ करें",
    showingResults: "प्रदर्शित",
    verifiedResourcesFound: "सत्यापित संसाधन मिले",

    // Categories
    allCategories: "सभी श्रेणियां",
    catSpaces: "स्थान एवं बैंक्वेट",
    catKitchen: "रसोई एवं खानपान",
    catVehicles: "हॉस्पिटैलिटी वाहन",
    catFurniture: "बैंक्वेट फर्नीचर",
    catEquipment: "स्टेज एवं इवेंट उपकरण",
    catColdChain: "कोल्ड चेन एवं फ्रीजर",
    catLogistics: "लॉजिस्टिक्स वैन",
    catUtilities: "पावर एवं जनरेटर",
    catOther: "डाइनिंग एवं कटलरी",

    // Resource Card
    verifiedBusiness: "सत्यापित व्यवसाय",
    matchScore: "स्मार्ट मैच",
    available: "उपलब्ध",
    negotiating: "बातचीत जारी",
    preBooked: "लॉक / बुक किया गया",
    unavailable: "अनुपलब्ध",
    completed: "पूर्ण",
    perDay: "/ दिन",
    perHour: "/ घंटा",
    availableUnits: "उपलब्ध इकाइयां",
    requestRental: "किराया अनुरोध",
    bookNow: "बुक / रिज़र्व करें",
    viewDetails: "विवरण देखें",
    refundableDeposit: "वापसी योग्य सुरक्षा जमा",
    reviews: "समीक्षाएं",
    rentalsCompleted: "किराये पूरे किए",
    away: "बीकेसी डिपो से",

    // Match Score Breakdown
    matchScoreTitle: "स्मार्ट मैच अनुकूलता विश्लेषण",
    matchScoreSubtitle: "एमएमआर में 5 परिचालन कारकों के आधार पर वास्तविक समय का मिलान:",
    factorPrice: "मूल्य एवं जमा उपयुक्तता",
    factorDistance: "दूरी एवं लॉजिस्टिक्स",
    factorAvailability: "कैलेंडर उपलब्धता एवं टकराव जांच",
    factorSuitability: "तकनीकी विशिष्टता उपयुक्तता",
    factorUrgency: "आपातकालीन तत्परता",
    closeModal: "बंद करें",

    // Resource Detail UI
    photoGallery: "सत्यापित फोटो गैलरी",
    photoCounter: "फोटो",
    of: "का",
    specifications: "तकनीकी विनिर्देश",
    description: "संसाधन विवरण",
    termsConditions: "व्यावसायिक नियम एवं शर्तें",
    providerProfile: "प्रदाता व्यवसाय प्रोफ़ाइल",
    responseRate: "औसत प्रतिक्रिया समय",
    lessThan15Min: "< 15 मिनट",
    memberSince: "सदस्यता वर्ष",
    verifiedLicense: "सत्यापित एफएसएसएआई / जीएसटी / व्यापार लाइसेंस",
    calendarAvailability: "लाइव कैलेंडर और लॉक की गई तिथियां",
    calendarNotice: "🔒 से चिन्हित तिथियां अन्य बुकिंग द्वारा लॉक हैं।",
    logisticsSelector: "वितरण एवं लॉजिस्टिक्स",
    siteDelivery: "स्थल पर डिलीवरी",
    selfPickup: "डिपो से स्वयं पिकअप",
    estimatedDeliveryTime: "अनुमानित डिलीवरी समय",
    logisticsFee: "लॉजिस्टिक्स शुल्क",
    free: "निःशुल्क",
    calculateTotal: "अनुमानित लागत विवरण",
    rentalDuration: "किराया अवधि",
    days: "दिन",
    baseSubtotal: "मूल किराया उप-योग",
    securityDeposit: "वापसी योग्य सुरक्षा जमा",
    tokenAmount: "अग्रिम टोकन राशि (20%)",
    totalEstimate: "कुल अनुमानित बुकिंग मूल्य",
    proceedCheckout: "किराया अनुरोध के लिए आगे बढ़ें",
    initiateNegotiation: "मूल्य बातचीत शुरू करें",

    // Authentication & Modal
    signInTitle: "HospitalityHub में लॉग इन करें",
    signUpTitle: "बी2बी एंटरप्राइज खाता बनाएं",
    loginSubtitle: "सत्यापित एमएमआर संसाधनों, बुकिंग और फ्लीट तक पहुंचें।",
    signupSubtitle: "मुंबई महानगर क्षेत्र के 250+ सत्यापित होटलों, कैटरर्स और बैंक्वेट स्थलों से जुड़ें।",
    workEmail: "कॉर्पोरेट ईमेल",
    password: "पासवर्ड",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    fullName: "अधिकृत प्रतिनिधि का नाम",
    businessName: "कंपनी / व्यवसाय का नाम",
    businessType: "व्यवसाय का प्रकार",
    accountTypeLabel: "खाते का प्रकार",
    seekerType: "मांगकर्ता (किराये पर लें)",
    providerType: "प्रदाता (संसाधन सूचीबद्ध करें)",
    phone: "फ़ोन नंबर / व्हाट्सएप",
    rememberMe: "सत्र याद रखें",
    forgotPassword: "पासवर्ड भूल गए?",
    resetPassword: "पासवर्ड रीसेट करें",
    loginBtn: "लॉग इन करें",
    registerBtn: "खाता बनाएं",
    noAccount: "खाता नहीं है?",
    alreadyHaveAccount: "पहले से पंजीकृत हैं?",

    // Verification Center
    verificationHeading: "प्रदाता व्यवसाय सत्यापन",
    verificationSubheading: "HospitalityHub एमएमआर में केवल 100% सत्यापित प्रदाताओं को अनुमति देता है। सत्यापित दर्जा पाने के लिए विवरण जमा करें।",
    statusNotSubmitted: "जमा नहीं किया गया",
    statusPending: "सत्यापन लंबित",
    statusVerified: "सत्यापित प्रदाता",
    statusRejected: "अस्वीकृत",
    gstinLabel: "जीएसटीआईएन नंबर",
    fssaiLabel: "एफएसएसएआई खाद्य सुरक्षा / लाइसेंस नंबर",
    tradeLicenseLabel: "व्यापार लाइसेंस संदर्भ",
    uploadPhotosGuidance: "अपनी रसोई, वाहन या उपकरण की 3 से 4 वास्तविक तस्वीरें अपलोड करें।",
    submitVerificationBtn: "सत्यापन के लिए जमा करें",

    // Reviews & Ratings
    reviewsTitle: "सत्यापित एंटरप्राइज समीक्षाएं",
    writeReviewBtn: "समीक्षा लिखें",
    ratingSummary: "समग्र रेटिंग",
    verifiedBookingBadge: "सत्यापित पूर्ण बुकिंग",
    noReviewsYet: "अभी तक कोई समीक्षा नहीं है।",

    // Footer
    footerAbout: "HospitalityHub मुंबई महानगर क्षेत्र का प्रमुख बी2बी हॉस्पिटैलिटी रिसोर्स एक्सचेंज है।",
    copyright: "© 2026 HospitalityHub Technologies Pvt Ltd. केवल मुंबई महानगर क्षेत्र (MMR) के लिए।"
  }
};

// 2. Central 9 Categories Definition (Removed "Audio", "Whole Chain", "Free Booking")
const CATEGORIES = [
  { id: "all", key: "allCategories", icon: "layout-grid", emoji: "🏢" },
  { id: "Spaces", key: "catSpaces", icon: "building-2", emoji: "🏨" },
  { id: "Kitchen", key: "catKitchen", icon: "utensils-crossed", emoji: "🍽️" },
  { id: "Vehicle", key: "catVehicles", icon: "truck", emoji: "🚐" },
  { id: "Furniture", key: "catFurniture", icon: "armchair", emoji: "🪑" },
  { id: "Equipment", key: "catEquipment", icon: "tent", emoji: "🎪" },
  { id: "ColdChain", key: "catColdChain", icon: "snowflake", emoji: "❄️" },
  { id: "Logistics", key: "catLogistics", icon: "package-check", emoji: "🚚" },
  { id: "Utilities", key: "catUtilities", icon: "zap", emoji: "⚡" },
  { id: "Other", key: "catOther", icon: "box", emoji: "📦" }
];

const MMR_CLIENT_ORIGIN = {
  name: "Bandra Kurla Complex (BKC) Central Logistics Depot",
  coordinates: { lat: 19.0674, lng: 72.8687 }
};

const BUSINESS_TYPES = [
  "Hotel & Resort",
  "Catering Enterprise",
  "Banquet Venue",
  "Event Planner & Production",
  "Cloud Kitchen Network",
  "Logistics & Cold Storage",
  "Institutional Hospitality"
];

// 3. Comprehensive Curated B2B Hospitality Inventory (All Strictly Within MMR)
// Every single item has 3–4 high-resolution commercial images, specifications, and locked dates
let inventoryData = [
  // 1. SPACES (Venues & Banquets)
  {
    id: "hub-01",
    title: "500-Seater Grand Luxury Ballroom & Manicured Lawn",
    category: "Spaces",
    shopName: "Imperial Banquets & Hospitality Ltd",
    ownerEmail: "procurement@imperialbanquets.in",
    vendorType: "Hotel & Banquet Venue",
    location: "Lower Parel, Mumbai",
    fulfillmentType: "Depot Self Pickup",
    pricePerDay: 28000,
    securityDeposit: 12000,
    quantityAvailable: 1,
    availabilityStatus: "Available",
    bookingType: "Planned",
    verified: true,
    rating: 4.9,
    reviewsCount: 42,
    completedRentals: 56,
    description: "Centrally air-conditioned grand luxury ballroom with an attached 8,000 sq.ft private landscaped lawn. Features dedicated VIP dressing suites, high-voltage 3-phase power line for concert audio/lighting, and valet parking for 120+ vehicles.",
    specifications: [
      "500 Seated / 850 Floating Guest Capacity",
      "Central HVAC Climate Controlled Ceiling (18ft clear height)",
      "Dedicated Bridal & VIP Green Rooms with en-suite baths",
      "125 kVA Silent Generator Backup Included",
      "Valet Parking Bay for 120+ Executive Vehicles"
    ],
    photos: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80"
    ],
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
    coordinates: { lat: 18.9986, lng: 72.8311 },
    instantDispatchAvailable: false,
    bookedDates: ["2026-10-10", "2026-10-11", "2026-10-12", "2026-10-13", "2026-10-14"],
    timeSlots: ["Morning (8 AM – 2 PM)", "Evening (5 PM – 12 AM)", "Full Day (24 Hrs)"]
  },
  {
    id: "hub-02",
    title: "Pillarless Corporate Ballroom & Conference Center",
    category: "Spaces",
    shopName: "The Westside Grand Hotel & Suites",
    ownerEmail: "events@westsidegrand.in",
    vendorType: "Hotel & Resort",
    location: "Bandra West, Mumbai",
    fulfillmentType: "Depot Self Pickup",
    pricePerDay: 35000,
    securityDeposit: 15000,
    quantityAvailable: 1,
    availabilityStatus: "Available",
    bookingType: "Planned",
    verified: true,
    rating: 4.8,
    reviewsCount: 36,
    completedRentals: 48,
    description: "Architectural masterpiece pillarless hall equipped with motorized acoustic partition screens, crystal chandeliers, built-in dual 4K laser projection screens, and high-speed dedicated gigabit fiber connection for hybrid summits.",
    specifications: [
      "Pillarless 6,500 sq.ft Hall with 20ft Clear Height",
      "Dual 4K Laser Projectors & Drop-Down Screens",
      "Commercial Warming Kitchen & Service Alley",
      "Dedicated Service Elevator for Heavy Rigging",
      "FSSAI Certified In-House Food Preparation Area"
    ],
    photos: [
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80"
    ],
    image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
    coordinates: { lat: 19.0596, lng: 72.8295 },
    instantDispatchAvailable: false,
    bookedDates: [],
    timeSlots: ["Full Day (8 AM – 10 PM)", "Evening Gala (5 PM – 1 AM)"]
  },

  // 2. KITCHEN & CATERING
  {
    id: "hub-03",
    title: "10-Tray Commercial Rational Combi Oven & Steamer",
    category: "Kitchen",
    shopName: "Royal Kitchens & Equipment Depot",
    ownerEmail: "mahesh@royalkitchens.in",
    vendorType: "Catering Enterprise",
    location: "Ghatkopar West, Mumbai",
    fulfillmentType: "Dedicated Site Delivery",
    pricePerDay: 9500,
    securityDeposit: 4500,
    quantityAvailable: 3,
    availabilityStatus: "Available",
    bookingType: "Emergency",
    verified: true,
    rating: 4.9,
    reviewsCount: 38,
    completedRentals: 62,
    description: "Heavy-duty 10-grid programmable Rational Combi Oven with steam injection, core temperature probe, and self-cleaning cycle. Perfect for high-volume banquet production, baking, and precision finishing.",
    specifications: [
      "10 x 1/1 GN Pan Capacity",
      "3-Phase 415V Electric Power with Industrial Plug",
      "Integrated Automatic Wash System with CareControl",
      "Digital Touchscreen with 1,200 Recipe Presets",
      "Supplied with Stainless Trolley Stand & Water Softener"
    ],
    photos: [
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1590725140246-20acdee442be?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
    ],
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80",
    coordinates: { lat: 19.0860, lng: 72.9090 },
    instantDispatchAvailable: true,
    bookedDates: [],
    timeSlots: ["24-Hour Production Block", "Multi-Day Event Rental"]
  },
  {
    id: "hub-04",
    title: "Industrial 4-Burner High-Pressure Gas Bank & Deep Fryers",
    category: "Kitchen",
    shopName: "Metro Catering Logistics Network",
    ownerEmail: "operations@metrocatering.in",
    vendorType: "Catering Enterprise",
    location: "Kalyan West, Thane",
    fulfillmentType: "Dedicated Site Delivery",
    pricePerDay: 4200,
    securityDeposit: 2000,
    quantityAvailable: 4,
    availabilityStatus: "Available",
    bookingType: "Emergency",
    verified: true,
    rating: 4.8,
    reviewsCount: 29,
    completedRentals: 44,
    description: "Modular mobile commercial cooking bank. 4 heavy cast-iron burners with pilot ignition, twin 15L commercial deep fryers, and integrated drip trays. Sanitized and safety-certified prior to every dispatch.",
    specifications: [
      "4-Burner High BTU Commercial Gas Range",
      "Twin 15L Double Basket Fryer Units",
      "Heavy Duty 304 Food-Grade Stainless Steel Body",
      "High-Pressure LPG Manifold & Regulator Included",
      "Castor Wheels with Safety Floor Foot Brakes"
    ],
    photos: [
      "https://images.unsplash.com/photo-1590725140246-20acdee442be?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
    ],
    image: "https://images.unsplash.com/photo-1590725140246-20acdee442be?auto=format&fit=crop&w=1200&q=80",
    coordinates: { lat: 19.2437, lng: 73.1355 },
    instantDispatchAvailable: true,
    bookedDates: [],
    timeSlots: ["Single Day Rental", "Multi-Day Event Pack"]
  },

  // 3. VEHICLES (Hospitality Fleet)
  {
    id: "hub-05",
    title: "7-Seater Executive Hospitality MPV (VIP Chauffeur)",
    category: "Vehicle",
    shopName: "TransMMR Hospitality Fleet",
    ownerEmail: "fleet@transmmr.in",
    vendorType: "Logistics Partner",
    location: "Panvel, Navi Mumbai",
    fulfillmentType: "Dedicated Site Delivery",
    pricePerDay: 4800,
    securityDeposit: 2500,
    quantityAvailable: 2,
    availabilityStatus: "Available",
    bookingType: "Emergency",
    verified: true,
    rating: 4.9,
    reviewsCount: 45,
    completedRentals: 68,
    description: "Executive 7-seater MPV with plush reclining captain seats, dual-zone air conditioning, ambient interior LED lighting, and large rear luggage space for VIP guest airport transfers and executive summit delegations.",
    specifications: [
      "7-Seater (Reclining Captain Chairs with Armrests)",
      "Dual-Zone Independent Climate Control AC",
      "Commercial Yellow Plate All-Maharashtra Permit",
      "Uniformed Chauffeur with Verified KYC Background",
      "Sanitized Interior, Complimentary Bottled Water & Wi-Fi"
    ],
    photos: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
    ],
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
    coordinates: { lat: 18.9894, lng: 73.1175 },
    instantDispatchAvailable: true,
    bookedDates: [],
    timeSlots: ["8 Hours / 80 Km", "12 Hours / 120 Km", "Outstation 24-Hr"]
  },
  {
    id: "hub-06",
    title: "Refrigerated Catering Transport Van (3 Ton Thermo-King)",
    category: "Vehicle",
    shopName: "Apex Catering Logistics",
    ownerEmail: "fleet@transmmr.in",
    vendorType: "Logistics Partner",
    location: "Bhiwandi Industrial Hub",
    fulfillmentType: "Dedicated Site Delivery",
    pricePerDay: 5200,
    securityDeposit: 2500,
    quantityAvailable: 3,
    availabilityStatus: "Available",
    bookingType: "Emergency",
    verified: true,
    rating: 4.8,
    reviewsCount: 51,
    completedRentals: 74,
    description: "Insulated thermo-king reefer truck specifically equipped for perishable catering transportation, gourmet dairy, prepared banquet courses, and iced dessert buffets across Mumbai and surrounding regions.",
    specifications: [
      "3-Ton Payload Insulated Container Body",
      "Thermo-King Chiller Unit (-5°C to +4°C)",
      "Real-Time GPS & Digital Temperature Telematics",
      "Driver + Heavy Loading Helper Included",
      "24/7 Roadside Assistance & Fleet NOC"
    ],
    photos: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
    ],
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    coordinates: { lat: 19.2967, lng: 73.0631 },
    instantDispatchAvailable: true,
    bookedDates: [],
    timeSlots: ["Morning Shift (6 AM – 2 PM)", "Evening Shift (3 PM – 11 PM)", "Full Day (24 Hrs)"]
  },

  // 4. FURNITURE
  {
    id: "hub-07",
    title: "Gold Chiavari Banquet Chairs & Velvet Cushions (Set of 200)",
    category: "Furniture",
    shopName: "Elite Furniture Depot",
    ownerEmail: "procurement@imperialbanquets.in",
    vendorType: "Rental Depot",
    location: "Dadar West, Mumbai",
    fulfillmentType: "Dedicated Site Delivery",
    pricePerDay: 7500,
    securityDeposit: 3000,
    quantityAvailable: 6,
    availabilityStatus: "Available",
    bookingType: "Planned",
    verified: true,
    rating: 4.8,
    reviewsCount: 33,
    completedRentals: 52,
    description: "Classic high-density resin gold Chiavari chairs paired with stain-resistant ivory velvet padded cushions. Stacked and shrink-wrapped in protective canvas covers for zero-scratch transportation.",
    specifications: [
      "200 Heavy Resin Gold Chiavari Chairs",
      "High-Density Sponge Ivory Velvet Tie-on Cushions",
      "Load Bearing Tested to 250 kg per Chair",
      "Protective Waterproof Transit Covers Included",
      "Setup & Stacking Team Available on Request"
    ],
    photos: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80"
    ],
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    coordinates: { lat: 19.0178, lng: 72.8478 },
    instantDispatchAvailable: true,
    bookedDates: [],
    timeSlots: ["12-Hour Event Duration", "24-Hour Rental Block"]
  },
  {
    id: "hub-08",
    title: "Round Solid Banquet Dining Tables (60-inch, Set of 25)",
    category: "Furniture",
    shopName: "Elite Furniture Depot",
    ownerEmail: "procurement@imperialbanquets.in",
    vendorType: "Rental Depot",
    location: "Dadar West, Mumbai",
    fulfillmentType: "Dedicated Site Delivery",
    pricePerDay: 5500,
    securityDeposit: 2500,
    quantityAvailable: 4,
    availabilityStatus: "Available",
    bookingType: "Planned",
    verified: true,
    rating: 4.7,
    reviewsCount: 25,
    completedRentals: 39,
    description: "Commercial 5ft (60-inch) heavy wooden round banquet tables with self-locking steel folding legs. Accommodates 8-10 dinner guests comfortably. Includes champagne table skirts and linen.",
    specifications: [
      "25 Solid Marine-Plywood Round Tables (60-inch)",
      "Heavy-Gauge Powder-Coated Steel Folding Legs",
      "Vinyl Edge Bumper Guarding for Impact Protection",
      "Complete with 25 Champagne Satin Tablecloths",
      "Collapsible Trolley Racks for Rapid Unloading"
    ],
    photos: [
      "https://images.unsplash.com/photo-1768851142332-75f3d1b47452?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524824267900-2fa9cbf7a506?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1581524632480-42b044581d0e?auto=format&fit=crop&w=1200&q=80"
    ],
    image: "https://images.unsplash.com/photo-1768851142332-75f3d1b47452?auto=format&fit=crop&w=1200&q=80",
    coordinates: { lat: 19.0178, lng: 72.8478 },
    instantDispatchAvailable: false,
    bookedDates: [],
    timeSlots: ["Full Day (24 Hrs)"]
  },

  // 5. EVENT EQUIPMENT & RIGGING
  {
    id: "hub-09",
    title: "Outdoor Waterproof German Pagoda Canopy Tents (50x30ft)",
    category: "Equipment",
    shopName: "Suburban Tent & Staging House",
    ownerEmail: "kunal@grandpower.in",
    vendorType: "Event Planner & Production",
    location: "Dombivli East, Thane",
    fulfillmentType: "Dedicated Site Delivery",
    pricePerDay: 12000,
    securityDeposit: 5000,
    quantityAvailable: 2,
    availabilityStatus: "Available",
    bookingType: "Planned",
    verified: true,
    rating: 4.8,
    reviewsCount: 31,
    completedRentals: 46,
    description: "Heavy-duty aluminum-framed German pagoda marquee structure. 100% waterproof, flame retardant 650 GSM PVC fabric, and engineered to withstand heavy monsoon gusts up to 80 km/h.",
    specifications: [
      "50 x 30 Feet High-Grade Extruded Aluminium Frame",
      "650 GSM Fire-Retardant & UV-Shielded PVC Fabric",
      "Side Flaps with Clear French Window Sightlines",
      "Complete Heavy Steel Base Ground Anchor Pins",
      "3-Hour Assembly Crew Dispatched with Unit"
    ],
    photos: [
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
    ],
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80",
    coordinates: { lat: 19.2184, lng: 73.0867 },
    instantDispatchAvailable: false,
    bookedDates: [],
    timeSlots: ["Multi-Day Event Setup"]
  },
  {
    id: "hub-10",
    title: "Concert Stage Aluminium Truss Rigging & 16 DMX Spotlights",
    category: "Equipment",
    shopName: "Grand Event Supplies & Staging",
    ownerEmail: "production@grandevents.in",
    vendorType: "Event Planner & Production",
    location: "Andheri East, Mumbai",
    fulfillmentType: "Dedicated Site Delivery",
    pricePerDay: 16500,
    securityDeposit: 8000,
    quantityAvailable: 2,
    availabilityStatus: "Available",
    bookingType: "Emergency",
    verified: true,
    rating: 4.9,
    reviewsCount: 58,
    completedRentals: 82,
    description: "Modular 40x24ft heavy box aluminium concert truss system paired with 16 DMX motorized moving heads, follow spots, and digital lighting controller with certified rigging technicians.",
    specifications: [
      "40 x 24 Feet Heavy Box Aluminium Truss (Load capacity 4 tons)",
      "16 Moving Head Beam/Spot Lights + DMX Controller",
      "Dual Electric Chain Hoists (1 Ton capacity each)",
      "Safety Cable Grips, Clamps & Rigging Baseplates Included",
      "Certified On-Site Rigging Engineer Included"
    ],
    photos: [
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80"
    ],
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    coordinates: { lat: 19.1136, lng: 72.8697 },
    instantDispatchAvailable: true,
    bookedDates: [],
    timeSlots: ["Concert / Event Night", "Full 24-Hr Rig Rental"]
  },

  // 6. COLD CHAIN
  {
    id: "hub-12",
    title: "Trailer-Mounted Mobile Blast Freezer & Chiller Unit",
    category: "ColdChain",
    shopName: "ColdChain Express Depot",
    ownerEmail: "sameer@coldchainexpress.in",
    vendorType: "Logistics & Cold Storage",
    location: "Bhiwandi Industrial Hub",
    fulfillmentType: "Dedicated Site Delivery",
    pricePerDay: 7800,
    securityDeposit: 3500,
    quantityAvailable: 2,
    availabilityStatus: "Available",
    bookingType: "Emergency",
    verified: true,
    rating: 4.8,
    reviewsCount: 27,
    completedRentals: 43,
    description: "Mobile containerized blast chiller and deep freezer capable of pulling down hot banquet dishes from 70°C to -18°C in under 90 minutes. Equipped with digital HACCP continuous temperature datalogging.",
    specifications: [
      "-22°C Deep Freeze / -40°C Blast Chilling Mode",
      "Trailer Mounted with Towing Hitch & Stabilizer Jacks",
      "Digital HACCP Compliance Cloud Datalogger",
      "Backup Dual-Fuel Power Connector Ready",
      "Internal Panic Safety Release Lock"
    ],
    photos: [
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
    ],
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
    coordinates: { lat: 19.2814, lng: 73.0489 },
    instantDispatchAvailable: true,
    bookedDates: [],
    timeSlots: ["24-Hour Continuous Cooling Block"]
  },

  // 7. LOGISTICS
  {
    id: "hub-13",
    title: "Heavy Cargo Transport Truck with Hydraulic Tail-Lift (5 Ton)",
    category: "Logistics",
    shopName: "TransMMR Hospitality Fleet",
    ownerEmail: "fleet@transmmr.in",
    vendorType: "Logistics Partner",
    location: "Panvel, Navi Mumbai",
    fulfillmentType: "Dedicated Site Delivery",
    pricePerDay: 6000,
    securityDeposit: 3000,
    quantityAvailable: 3,
    availabilityStatus: "Available",
    bookingType: "Emergency",
    verified: true,
    rating: 4.9,
    reviewsCount: 47,
    completedRentals: 71,
    description: "5-ton containerized closed-body logistics vehicle equipped with a 1,500 kg capacity hydraulic rear tail-lift. Ideal for safe, roll-on transport of expensive flight cases and ovens without ramp damage.",
    specifications: [
      "5-Ton Enclosed Container with E-Track Cargo Straps",
      "1,500 kg Hydraulic Cantilever Tail-Lift Platform",
      "Equipped with 2 Hydraulic Pallet Jacks & Heavy Straps",
      "Commercial Heavy Permit with All-MMR Toll Pass",
      "Driver and 2 Certified Handlers Included"
    ],
    photos: [
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80"
    ],
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80",
    coordinates: { lat: 18.9894, lng: 73.1175 },
    instantDispatchAvailable: true,
    bookedDates: [],
    timeSlots: ["8 Hours Shift", "24-Hour Event Haulage"]
  },

  // 8. UTILITIES
  {
    id: "hub-14",
    title: "125 kVA Ultra-Silent Acoustic Canopy Diesel Generator",
    category: "Utilities",
    shopName: "Grand Staging & Event Power",
    ownerEmail: "kunal@grandpower.in",
    vendorType: "Power & Equipment Depot",
    location: "Vasai East, Extended MMR",
    fulfillmentType: "Dedicated Site Delivery",
    pricePerDay: 5800,
    securityDeposit: 2500,
    quantityAvailable: 3,
    availabilityStatus: "Available",
    bookingType: "Emergency",
    verified: true,
    rating: 4.9,
    reviewsCount: 53,
    completedRentals: 77,
    description: "Acoustic canopy enclosed 125 kVA Cummins-powered diesel generator. Operates at whisper-quiet <65 dBA noise level, with automatic mains failure (AMF) changeover panel and continuous 12-hour fuel tank.",
    specifications: [
      "125 kVA / 100 kW 3-Phase Continuous Output",
      "Ultra-Silent Acoustic Canopy (<65 dBA at 1 Meter)",
      "Automatic Mains Failure (AMF) Smart Panel",
      "12-Hour Continuous Run Internal Fuel Reservoir",
      "Delivered with Licensed Electrical Technician"
    ],
    photos: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
    ],
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    coordinates: { lat: 19.3919, lng: 72.8397 },
    instantDispatchAvailable: true,
    bookedDates: [],
    timeSlots: ["12-Hour Event Duty", "24-Hour Emergency Standby"]
  },

  // 9. OTHER (Fine Dining & Cutlery)
  {
    id: "hub-15",
    title: "Fine Bone China Banquet Crockery & Gold Cutlery Set (500 Covers)",
    category: "Other",
    shopName: "Imperial Banquets & Hospitality Ltd",
    ownerEmail: "procurement@imperialbanquets.in",
    vendorType: "Catering Enterprise",
    location: "Lower Parel, Mumbai",
    fulfillmentType: "Dedicated Site Delivery",
    pricePerDay: 9000,
    securityDeposit: 4000,
    quantityAvailable: 3,
    availabilityStatus: "Available",
    bookingType: "Planned",
    verified: true,
    rating: 4.8,
    reviewsCount: 37,
    completedRentals: 50,
    description: "Premium fine bone china gold-rim dinner plates, side plates, dessert bowls, soup tureens, and heavy 24k electroplated gold cutlery for high-end luxury galas and VVIP banquets.",
    specifications: [
      "500-Cover Full Course Table Setting (5-Piece per Cover)",
      "Premium Bone China with Scratch-Proof Gold Rim",
      "24k Electroplated Stainless Steel Cutlery (Fork, Spoon, Knife)",
      "Sanitized & Shrink-Wrapped in Impact-Proof Dish Crates",
      "Includes Pre-Sorted Breakage Insurance Buffer (+5%)"
    ],
    photos: [
      "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80"
    ],
    image: "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&w=1200&q=80",
    coordinates: { lat: 18.9986, lng: 72.8311 },
    instantDispatchAvailable: false,
    bookedDates: [],
    timeSlots: ["Full Day Event Usage"]
  }
];

if (typeof window !== 'undefined') {
  window.TRANSLATIONS = TRANSLATIONS;
  window.CATEGORIES = CATEGORIES;
  window.MMR_CLIENT_ORIGIN = MMR_CLIENT_ORIGIN;
  window.BUSINESS_TYPES = BUSINESS_TYPES;
  window.inventoryData = inventoryData;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TRANSLATIONS,
    CATEGORIES,
    MMR_CLIENT_ORIGIN,
    BUSINESS_TYPES,
    inventoryData
  };
}
