// Standalone Locale Dictionary for Paisa Saathi
// Supports English, Hindi, Marathi, Bengali, Tamil, and Telugu with Devanagari/native script representation.

export interface LocaleStrings {
  appName: string;
  slogan: string;
  loginTitle: string;
  loginSubtitle: string;
  phoneLabel: string;
  phonePlaceholder: string;
  otpButton: string;
  otpLabel: string;
  otpPlaceholder: string;
  otpVerify: string;
  optSentMessage: string;
  changeNumber: string;
  langTitle: string;
  langSubtitle: string;
  continueBtn: string;
  onboardingStep: string;
  onboardingTitle: string;
  onboardingSubtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  incomeLabel: string;
  incomePlaceholder: string;
  goalLabel: string;
  goalOptions: string[];
  completeProfile: string;
  navHome: string;
  navChat: string;
  navGoals: string;
  navLearn: string;
  navProfile: string;
  incomeHeading: string;
  expenseHeading: string;
  savingsHeading: string;
  smartAdvice: string;
  safeMessage: string;
  emergencyFundCard: string;
  emergencyFundDesc: string;
  addGoalBtn: string;
  dailyExpenseHead: string;
  totalKharch: string;
  addExpenseBtn: string;
  kirana: string;
  travel: string;
  rent: string;
  medicine: string;
  entertainment: string;
  personalDetails: string;
  languageLabel: string;
  financialScore: string;
  supportHelp: string;
  logoutBtn: string;
  chatWelcome: string;
  chatPlaceholder: string;
  goalSetupHead: string;
  goalTitleLabel: string;
  goalTitlePlaceholder: string;
  targetAmountLabel: string;
  categoryLabel: string;
  saveGoalBtn: string;
  cancelBtn: string;
  currentSavings: string;
  targetAmt: string;
  streakText: string;
  scoreText: string;
  shuruKaren: string;
  voiceSecured: string;
  // Dynamic bilingual support additions
  thisMonth: string;
  finScoreHead: string;
  scoreDetailsHead: string;
  myGoalsHead: string;
  mySavingsOptionsHead: string;
  expertTipsHead: string;
  dailyLogsHead: string;
  quickActionHead: string;
}

export const LOCALES: Record<string, LocaleStrings> = {
  English: {
    appName: "Paisa Saathi",
    slogan: "Your Money, Your Friend",
    loginTitle: "Paisa Saathi Login",
    loginSubtitle: "SMS-OTP Secured Login",
    phoneLabel: "Enter your Mobile Number (10 Digits)",
    phonePlaceholder: "9876543210",
    otpButton: "Send OTP (Request OTP)",
    otpLabel: "4-Digit Verification Code",
    otpPlaceholder: "Enter 4 digits",
    otpVerify: "Verify OTP & Login ✓",
    optSentMessage: "Verification code sent to",
    changeNumber: "Change phone number",
    langTitle: "Select Your Language",
    langSubtitle: "Choose the language you are comfortable speaking and reading.",
    continueBtn: "Continue",
    onboardingStep: "Step 1 of 1 (Final)",
    onboardingTitle: "Tell us about yourself",
    onboardingSubtitle: "So we can customize your smart savings guidance.",
    nameLabel: "YOUR FULL NAME",
    namePlaceholder: "Ramesh Kumar (like)",
    incomeLabel: "MONTHLY INCOME (₹)",
    incomePlaceholder: "25000 (like)",
    goalLabel: "PRIMARY SAVINGS GOAL",
    goalOptions: [
      "Emergency Fund / Aapat nidhi",
      "Child education / Bachi ki padhai",
      "Home purchase / Ghar kharidna",
      "Marriage / Shaadi",
      "Retirement / Sevanivrutti"
    ],
    completeProfile: "Complete Profile ✓",
    navHome: "Home",
    navChat: "Ask Saathi",
    navGoals: "My Goals",
    navLearn: "Learn",
    navProfile: "Profile",
    incomeHeading: "Income",
    expenseHeading: "Expense",
    savingsHeading: "Savings",
    smartAdvice: "Smart Financial Advice",
    safeMessage: "We do not touch your money. No hidden fees. Only secure guidance.",
    emergencyFundCard: "Emergency Fund",
    emergencyFundDesc: "Safe reserve for sudden hospital bills or job loss.",
    addGoalBtn: "New Saving Goal +",
    dailyExpenseHead: "Daily Expense Tracker",
    totalKharch: "Total Kharch",
    addExpenseBtn: "Add Expense",
    kirana: "Kirana / Ration 🛒",
    travel: "Auto / Petrol ⛽",
    rent: "Room Rent 🏠",
    medicine: "Medicine / Hospital 💊",
    entertainment: "Mobile & Misc 📱",
    personalDetails: "Personal Details / Settings",
    languageLabel: "Change App Language",
    financialScore: "Financial Health Score & Badges",
    supportHelp: "Help & WhatsApp Support Support",
    logoutBtn: "Sign Out / Close App",
    chatWelcome: "Hello! I am Paisa Saathi. Speak or type to ask me anything about savings, SIP, or managing your expenses.",
    chatPlaceholder: "Ask something or tap mic...",
    goalSetupHead: "Create a New Goal",
    goalTitleLabel: "GOAL NAME",
    goalTitlePlaceholder: "Buy Taxi, Daughter's study etc.",
    targetAmountLabel: "TARGET SAVINGS AMOUNT (₹)",
    categoryLabel: "SAVINGS CATEGORY",
    saveGoalBtn: "Save Savings Goal ✓",
    cancelBtn: "Cancel",
    currentSavings: "Current Savings",
    targetAmt: "Target Amount",
    streakText: "SAVINGS STREAK",
    scoreText: "HEALTH SCORE",
    shuruKaren: "Shuru Karen / Get Started",
    voiceSecured: "🔒 Voice-Assisted Secured Portal",
    thisMonth: "This Month",
    finScoreHead: "Financial Health Score",
    scoreDetailsHead: "Score Details Breakdown",
    myGoalsHead: "My Consolidated Goals",
    mySavingsOptionsHead: "My Savings & Investment Options",
    expertTipsHead: "Expert Saving Tips",
    dailyLogsHead: "Daily Tracker Logs",
    quickActionHead: "Quick Action Companions"
  },
  Hindi: {
    appName: "पैसा साथी",
    slogan: "“आपका पैसा, आपका साथी”",
    loginTitle: "पैसा साथी लॉगिन",
    loginSubtitle: "SMS-OTP सुरक्षित लॉगिन प्रवेश",
    phoneLabel: "अपना मोबाइल नंबर दर्ज करें (10 अंकों का)",
    phonePlaceholder: "9876543210",
    otpButton: "OTP भेजें (Request OTP)",
    otpLabel: "४-अंकों का वेरिफिकेशन कोड",
    otpPlaceholder: "1234 (जैसे)",
    otpVerify: "वेरिफिकेशन कोड और लॉगिन ✓",
    optSentMessage: "SMS कोड आपके मोबाइल नंबर पर भेज दिया गया है:",
    changeNumber: "मोबाइल नंबर बदलें",
    langTitle: "अपनी भाषा चुनें",
    langSubtitle: "वह भाषा चुनें जिसे आप बोलने और बढ़ने में सहज महसूस करते हैं।",
    continueBtn: "आगे बढ़ें",
    onboardingStep: "चरण १ (अंतिम चरण)",
    onboardingTitle: "अपने बारे में जानकारी दें",
    onboardingSubtitle: "ताकि हम आपके लिए सही और स्मार्ट बचत मार्गदर्शन तैयार कर सकें।",
    nameLabel: "आपका पूरा नाम",
    namePlaceholder: "रमेश कुमार (जैसे)",
    incomeLabel: "मासिक आय / कमाई (₹)",
    incomePlaceholder: "25000 (जैसे)",
    goalLabel: "मुख्य लक्ष्य",
    goalOptions: [
      "आपातकालीन निधि / Emergency Fund",
      "बच्ची की पढ़ाई / Child Education",
      "घर खरीदना / Home Purchase",
      "शादी-विवाह / Marriage Savings",
      "रिटायरमेंट बचत / Retirement Plan"
    ],
    completeProfile: "प्रोफाइल पूरी करें ✓",
    navHome: "घर",
    navChat: "साथी चैट",
    navGoals: "लक्ष्य",
    navLearn: "सीखें",
    navProfile: "प्रोफाइल",
    incomeHeading: "कमाई",
    expenseHeading: "खर्च",
    savingsHeading: "बचत",
    smartAdvice: "स्मार्ट सलाह और विश्लेषण",
    safeMessage: "हम आपके पैसे को कभी नहीं छूते। कोई छुपा हुआ शुल्क नहीं, सिर्फ सुरक्षित सलाह।",
    emergencyFundCard: "इमरजेंसी गुल्लक",
    emergencyFundDesc: "अचानक अस्पताल खर्च या नौकरी जाने की स्थिति के लिए सुरक्षित निधि।",
    addGoalBtn: "नया बचत लक्ष्य जोड़ें +",
    dailyExpenseHead: "दैनिक खर्च ट्रैकर",
    totalKharch: "कुल मासिक खर्च",
    addExpenseBtn: "खर्च जोड़ें",
    kirana: "किराना / राशन 🛒",
    travel: "ऑटो / पेट्रोल / यात्रा ⛽",
    rent: "कमरा किराया / रूम 🏠",
    medicine: "दवाई / डॉक्टर 💊",
    entertainment: "मोबाइल व अन्य 📱",
    personalDetails: "व्यक्तिगत विवरण और बदलाव",
    languageLabel: "ऐप की भाषा बदलें",
    financialScore: "फाइनेंशियल हेल्थ स्कोर और बैज",
    supportHelp: "सहायता और व्हाट्सएप सपोर्ट",
    logoutBtn: "लॉगआउट / ऐप बंद करें",
    chatWelcome: "नमस्ते! मैं पैसा साथी हूँ। आप मुझसे बचत योजना, म्यूचुअल फंड, एसआईपी या खर्चों को नियंत्रित करने के बारे में कुछ भी पूछ सकते हैं।",
    chatPlaceholder: "कुछ पूछें या माइक दबाकर बोलें...",
    goalSetupHead: "नया लक्ष्य निर्धारित करें",
    goalTitleLabel: "लक्ष्य का नाम",
    goalTitlePlaceholder: "नई टैक्सी, दुकान बनाना, आदि।",
    targetAmountLabel: "कुल बचत राशि का लक्ष्य (₹)",
    categoryLabel: "लक्ष्य की श्रेणी",
    saveGoalBtn: "लक्ष्य सुरक्षित करें ✓",
    cancelBtn: "रद्द करें",
    currentSavings: "अब तक की बचत",
    targetAmt: "लक्ष्य राशि",
    streakText: "बचत की निरन्तरता",
    scoreText: "स्वास्थ्य स्कोर",
    shuruKaren: "शुरू करें",
    voiceSecured: "🔒 आवाज़ साथी द्वारा सुरक्षित पोर्टल",
    thisMonth: "इस महीने",
    finScoreHead: "फाइनेंशियल हेल्थ स्कोर",
    scoreDetailsHead: "स्कोर विवरण विश्लेषण",
    myGoalsHead: "मेरे संग्रहित लक्ष्य",
    mySavingsOptionsHead: "बचत और निवेश विकल्प",
    expertTipsHead: "विशेषज्ञ बचत युक्तियाँ",
    dailyLogsHead: "आज का हिसाब",
    quickActionHead: "त्वरित साथी सहायता"
  },
  Marathi: {
    appName: "पैसा साथी",
    slogan: "“तुमचा पैसा, तुमचा मित्र”",
    loginTitle: "पैसा साथी लॉगिन",
    loginSubtitle: "SMS-OTP सुरक्षित लॉगिन",
    phoneLabel: "तुमचा १० अंकी मोबाईल नंबर प्रविष्ट करा",
    phonePlaceholder: "9876543210",
    otpButton: "OTP पाठवा (Request OTP)",
    otpLabel: "४-अंकी ओ टी पी कोड",
    otpPlaceholder: "1234 (उदा.)",
    otpVerify: "ओ टी पी सत्यापित करा ✓",
    optSentMessage: "ओ टी पी कोड या नंबरवर पाठवला गेला आहे:",
    changeNumber: "मोबाईल नंबर बदला",
    langTitle: "तुमची भाषा निवडा",
    langSubtitle: "तुम्हाला वाचण्यास आणि बोलण्यास सोपी वाटणारी भाषा निवडा.",
    continueBtn: "पुढे जा",
    onboardingStep: "पायरी १ (अंतिम टप्पा)",
    onboardingTitle: "तुमच्याबद्दल थोडी माहिती द्या",
    onboardingSubtitle: "जेणेकरून आम्ही तुमच्यासाठी योग्य बचत नियोजन करू शकू.",
    nameLabel: "तुमचे पूर्ण नाव",
    namePlaceholder: "रमेश कुमार (उदा.)",
    incomeLabel: "महिन्याची कमाई / उत्पन्न (₹)",
    incomePlaceholder: "25000 (उदा.)",
    goalLabel: "मुख्य ध्येय",
    goalOptions: [
      "आणीबाणी निधी / Emergency Fund",
      "मुलांचे शिक्षण / Child Education",
      "नवीन घर खरेदी / Home Purchase",
      "लग्नकार्य खर्च / Marriage",
      "निवृत्ती नियोजन / Retirement"
    ],
    completeProfile: "प्रोफाइल पूर्ण करा ✓",
    navHome: "घर",
    navChat: "साथी चर्चा",
    navGoals: "ध्येय",
    navLearn: "शिका",
    navProfile: "प्रोफाइल",
    incomeHeading: "कमाई",
    expenseHeading: "खर्च",
    savingsHeading: "बचत",
    smartAdvice: "स्मार्ट सल्ला आणि मार्गदर्शन",
    safeMessage: "आम्ही तुमच्या पैशाला कधीही स्पर्श करत नाही. कोणतीही छुपा फी नाही, फक्त सुरक्षित आर्थिक सल्ला.",
    emergencyFundCard: "इमर्जन्सी गुल्लक",
    emergencyFundDesc: "अचानक उद्भवणारे दवाखाना खर्च किंवा कठीण प्रसंगांसाठी सुरक्षित रक्कम.",
    addGoalBtn: "नवीन बचत ध्येय जोडा +",
    dailyExpenseHead: "दैनिक खर्च नोंदणी",
    totalKharch: "एकूण मासिक खर्च",
    addExpenseBtn: "खर्च जोडा",
    kirana: "किराणा व रेशन 🛒",
    travel: "प्रवास / पेट्रोल / ऑटो ⛽",
    rent: "घर भाडे / रूम 🏠",
    medicine: "औषधोपचार / दवाखाना 💊",
    entertainment: "मोबाईल रीचार्ज आणि इतर 📱",
    personalDetails: "वैयक्तिक माहिती आणि बदल",
    languageLabel: "अ‍ॅपची भाषा बदला",
    financialScore: "आर्थिक आरोग्य स्कोर आणि यश",
    supportHelp: "मदत आणि व्हॉट्सअ‍ॅप सपोर्ट",
    logoutBtn: "लॉगआउट / अ‍ॅप बंद करा",
    chatWelcome: "नमस्कार! मी पैसा साथी आहे. तुम्ही मला गुंतवणूक, एसआयपी, किंवा रोजचे खर्च कमी करण्याबद्दल बोलून किंवा टाईप करून काहीही विचारू शकता.",
    chatPlaceholder: "काहीतरी विचारा किंवा बोलण्यासाठी माइक दाबा...",
    goalSetupHead: "नवीन ध्येय निश्चित करा",
    goalTitleLabel: "ध्येयाचे नाव",
    goalTitlePlaceholder: "नवीन टॅक्सी, दुकान, किंवा घरासाठी",
    targetAmountLabel: "एकूण बचत ध्येय रक्कम (₹)",
    categoryLabel: "ध्येयाच्या श्रेणी",
    saveGoalBtn: "ध्येय सुरक्षित करा ✓",
    cancelBtn: "रद्द करा",
    currentSavings: "आत्तापर्यंतची बचत",
    targetAmt: "ध्येय रक्कम",
    streakText: "बचतीच्या सातत्य",
    scoreText: "आरोग्य स्कोर",
    shuruKaren: "सुरू करा",
    voiceSecured: "🔒 आवाज़ साथी सुरक्षित पोर्टल",
    thisMonth: "या महिन्यात",
    finScoreHead: "आर्थिक आरोग्य स्कोर",
    scoreDetailsHead: "गुण माहिती विश्लेषण",
    myGoalsHead: "माझे एकत्रित उद्दिष्टे",
    mySavingsOptionsHead: "बचत आणि गुंतवणूक पर्याय",
    expertTipsHead: "तज्ज्ञ बचत टिप्स",
    dailyLogsHead: "आजचा हिशोब",
    quickActionHead: "जलद मदतनीस"
  },
  Bengali: {
    appName: "পয়সা সাথী",
    slogan: "“আপনার টাকা, আপনার সাথী”",
    loginTitle: "পয়সা সাথী লগইন",
    loginSubtitle: "SMS-OTP সুরক্ষিত লগইন",
    phoneLabel: "আপনার ১০ অঙ্কের মোবাইল নম্বর লিখুন",
    phonePlaceholder: "9876543210",
    otpButton: "OTP পাঠান (Request OTP)",
    otpLabel: "৪-অঙ্কের ওটিপি কোড",
    otpPlaceholder: "1234 (যেমন)",
    otpVerify: "ওটিপি যাচাই করুন ✓",
    optSentMessage: "কোড এই মোবাইল নম্বরে পাঠানো হয়েছে:",
    changeNumber: "মোবাইল নম্বর পরিবর্তন করুন",
    langTitle: "ভাষা চয়ন করুন",
    langSubtitle: "আপনার পছন্দের ভাষাটি বেছে নিন যা বলতে এবং পড়তে সহজ।",
    continueBtn: "এগিয়ে যান",
    onboardingStep: "ধাপ ১ (চূড়ান্ত ধাপ)",
    onboardingTitle: "আপনার সম্পর্কে কিছু তথ্য দিন",
    onboardingSubtitle: "যাতে আমরা আপনার জন্য সেরা সঞ্চয় গাইডলাইন তৈরি করতে পারি।",
    nameLabel: "আপনার পুরো নাম",
    namePlaceholder: "রমেশ কুমার (যেমন)",
    incomeLabel: "মাসিক আয় / উপার্জন (₹)",
    incomePlaceholder: "25000 (যেমন)",
    goalLabel: "সঞ্চয় লক্ষ্য",
    goalOptions: [
      "জরুরি তহবিল / Emergency Fund",
      "বাচ্চার পড়াশোনা / Child Education",
      "নতুন বাড়ি কেনা / Home Purchase",
      "বিবাহ সঞ্চয় / Marriage Savings",
      "অবসর পরিকল্পনা / Retirement Plan"
    ],
    completeProfile: "প্রোফাইল সম্পন্ন করুন ✓",
    navHome: "সংসার",
    navChat: "সাথী চ্যাট",
    navGoals: "লক্ষ্য",
    navLearn: "শিখুন",
    navProfile: "প্রোফাইল",
    incomeHeading: "উপার্জন",
    expenseHeading: "খরচ",
    savingsHeading: "সঞ্চয়",
    smartAdvice: "স্মার্ট ফাইনান্সিয়াল উপদেশ",
    safeMessage: "আমরা আপনার টাকা স্পর্শ করি না। কোনো গোপন চার্জ নেই, শুধুমাত্র সম্পূর্ণ নিরাপদ গাইডলাইন।",
    emergencyFundCard: "জরুরি গুচ্ছ",
    emergencyFundDesc: "হঠাৎ আসা চিকিৎসার খরচ বা বিপদের দিনের জন্য নিরাপদ টাকা।",
    addGoalBtn: "নতুন লক্ষ্য যোগ করুন +",
    dailyExpenseHead: "প্রতিদিনের খরচের ট্র্যাকার",
    totalKharch: "মোট মাসিক খরচ",
    addExpenseBtn: "খরচ যোগ করুন",
    kirana: "মুদিখানা ও রেশন 🛒",
    travel: "অটো ও যাতায়াত খরচ ⛽",
    rent: "ঘর ভাড়া / রুম 🏠",
    medicine: "ওষুধ ও চিকিৎসা 💊",
    entertainment: "মোবাইল ও অন্যান্য 📱",
    personalDetails: "ব্যক্তিগত তথ্য ও পরিবর্তন",
    languageLabel: "অ্যাপের ভাষা পরিবর্তন করুন",
    financialScore: "আর্থিক স্বাস্থ্য স্কোর",
    supportHelp: "সাহায্য ও হোয়াটসঅ্যাপ সাপোর্ট",
    logoutBtn: "লগআউট করুন",
    chatWelcome: "নমস্কার! আমি পয়সা সাথী। আপনি আমাকে সঞ্চয়, এসআইপি বা প্রতিদিনের খরচ কমানোর বিষয়ে যেকোনো পরামর্শ চাইতে পারেন।",
    chatPlaceholder: "জিজ্ঞাসা করুন বা মাইক আইকন ক্লিক করে বলুন...",
    goalSetupHead: "নতুন সঞ্চয় লক্ষ্য তৈরি করুন",
    goalTitleLabel: "লক্ষ্যের নাম",
    goalTitlePlaceholder: "নতুন ট্যাক্সি কেনা, বাড়ি তৈরি ইত্যাদি",
    targetAmountLabel: "মোট লক্ষ্যের সঞ্চয় পরিমাণ (₹)",
    categoryLabel: "লক্ষ্যের বিভাগ",
    saveGoalBtn: "লক্ষ্য সংরক্ষণ করুন ✓",
    cancelBtn: "বাতিল করুন",
    currentSavings: "বর্তমান সঞ্চয়",
    targetAmt: "লক্ষ্য পরিমাণ",
    streakText: "সঞ্চয়ের ধারাবাহিকতা",
    scoreText: "স্বাস্থ্য স্কোর",
    shuruKaren: "শुरू করুন",
    voiceSecured: "🔒 আওয়াজ সাথী সুরক্ষিত পোর্টাল",
    thisMonth: "এই মাসে",
    finScoreHead: "আর্থিক স্বাস্থ্য স্কোর",
    scoreDetailsHead: "স্কোর বিবরণ বিশ্লেষণ",
    myGoalsHead: "আমার সঞ্চয় লক্ষ্যসমূহ",
    mySavingsOptionsHead: "সঞ্চয় ও বিনিয়োগ বিকল্প",
    expertTipsHead: "विशेषज्ञ बचत युक्तियाँ",
    dailyLogsHead: "আজকের হিসাব",
    quickActionHead: "দ্রুত ক্রিয়াকলাপ সহায়ক"
  },
  Tamil: {
    appName: "பைசா சாதி",
    slogan: "“உங்கள் பணம், உங்கள் நன்பன்”",
    loginTitle: "பைசா சாதி உள்நுழைவு",
    loginSubtitle: "SMS-OTP பாதுகாப்பான லாகின்",
    phoneLabel: "பத்து இலக்க மொபைல் எண்ணை உள்ளிடவும்",
    phonePlaceholder: "9876543210",
    otpButton: "OTP பெறவும்",
    otpLabel: "நான்கு இலக்க ஒடிபி குறியீடு",
    otpPlaceholder: "1234 (உதாரணம்)",
    otpVerify: "ஒடிபியை சரிபார்க்கவும் ✓",
    optSentMessage: "குறியீடு இந்த மொபைல் எண்ணுக்கு அனுப்பப்பட்டது:",
    changeNumber: "மொபைல் எண் மாற்று",
    langTitle: "மொழியைத் தேர்ந்தெடுக்கவும்",
    langSubtitle: "உங்களுக்குப் பேசவும் படிக்கவும் வசதியான மொழியைத் தேர்வுசெய்யவும்.",
    continueBtn: "தொடரவும்",
    onboardingStep: "படி 1 (இறுதி படி)",
    onboardingTitle: "உங்களைப் பற்றி கூறுங்கள்",
    onboardingSubtitle: "உங்களுக்குத் தகுந்த பாதுகாப்பான சேமிப்பு திட்டங்களை நாங்கள் பரிந்துரைக்க முடியும்.",
    nameLabel: "உங்கள் முழு பெயர்",
    namePlaceholder: "ரமேஷ் குமார் (உதாரணம்)",
    incomeLabel: "மாதாந்திர வருமானம் (₹)",
    incomePlaceholder: "25000 (உதாரணம்)",
    goalLabel: "சேமிப்பு இலக்கு",
    goalOptions: [
      "நெருக்கடி கால நிதி / Emergency Fund",
      "குழந்தைகளின் கல்வி / Child Education",
      "வீடு வாங்குதல் / Home Purchase",
      "திருமணச் சேமிப்பு / Marriage",
      "ஓய்வூதியத் திட்டம் / Retirement"
    ],
    completeProfile: "விவரங்களை சேமிக்கவும் ✓",
    navHome: "முகப்பு",
    navChat: "சாதி உரையாடல்",
    navGoals: "இலக்குகள்",
    navLearn: "கற்க",
    navProfile: "சுயவிவரம்",
    incomeHeading: "வருமானம்",
    expenseHeading: "செலவு",
    savingsHeading: "சேமிப்பு",
    smartAdvice: "புத்திசாலித்தனமான நிதி ஆலோசனைகள்",
    safeMessage: "நாங்கள் உங்கள் பணத்தை தொடுவதில்லை. எந்த மறைமுகக் கட்டணங்களும் இல்லை, பாதுகாப்பான வழிகாட்டுதல் மட்டுமே.",
    emergencyFundCard: "அவசரகால சேமிப்பு",
    emergencyFundDesc: "திடீர் மருத்துவ செலவுகள் அல்லது அவசர தேவைகளுக்கான பாதுகாப்பான நிதி.",
    addGoalBtn: "புதிய இலக்கினைச் சேர்க்க +",
    dailyExpenseHead: "தினசரி செலவு கணக்கு",
    totalKharch: "மொத்த மாதாந்திர செலவு",
    addExpenseBtn: "செலவைச் சேர்க்கவும்",
    kirana: "களஞ்சியம் / மளிகை 🛒",
    travel: "வாகனம் / பெరిత్రோல் ⛽",
    rent: "வீட்டு வாடகை 🏠",
    medicine: "மருத்துவம் / மருந்து 💊",
    entertainment: "மொபைல் & இதர செலவுகள் 📱",
    personalDetails: "சுயவிவர அமைப்புகள்",
    languageLabel: "செயலி மொழியை மாற்றவும்",
    financialScore: "நிதி ஆரோக்கிய மதிப்பெண்",
    supportHelp: "உதவி & வாட்ஸ்அப் ஆதரவு",
    logoutBtn: "வெளியேறவும் / செயலியை மூடவும்",
    chatWelcome: "வணக்கம்! நான் பைசா சாதி பேசுகிறேன். சேமிப்பு, மியூச்சுவல் ஃபண்ட், எஸ்ஐபி அல்லது செலவுகளைக் கட்டுப்படுத்துவது பற்றி ஏதேனும் கேட்கலாம்.",
    chatPlaceholder: "கேளுங்கள் அல்லது மைக்கை அழுத்தவும்...",
    goalSetupHead: "புதிய சேமிப்பு இலக்கை உருவாக்குங்கள்",
    goalTitleLabel: "இலக்கின் பெயர்",
    goalTitlePlaceholder: "புதிய கார் வாங்க, கடை அமைக்க, போன்றவை",
    targetAmountLabel: "இலக்கு சேమిப்புத் தொகை (₹)",
    categoryLabel: "இலக்கு வகை",
    saveGoalBtn: "இலக்கைச் சேமிக்கவும் ✓",
    cancelBtn: "ரத்து செய்",
    currentSavings: "இப்போதைய சேமிப்பு",
    targetAmt: "இலக்கு தொகை",
    streakText: "சேமிப்புத் தொடர்ச்சி",
    scoreText: "ஆரோக்கிய மதிப்பெண்",
    shuruKaren: "தொடங்கவும்",
    voiceSecured: "🔒 குரல்வழி பாதுகாக்கப்பட்ட போர்டல்",
    thisMonth: "இந்த மாதம்",
    finScoreHead: "நிதி ஆரோக்கிய மதிப்பெண்",
    scoreDetailsHead: "மதிப்பெண் விவரங்கள் பகுப்பாய்வு",
    myGoalsHead: "எனது சேமிப்பு இலக்குகள்",
    mySavingsOptionsHead: "சேமிப்பு மற்றும் முதலீட்டு விருப்பங்கள்",
    expertTipsHead: "நிபுணர் சேமிப்பு குறிப்புகள்",
    dailyLogsHead: "இன்றைய கணக்கு",
    quickActionHead: "விரைவான செயல் துணைகள்"
  },
  Telugu: {
    appName: "పైసా సాథి",
    slogan: "“మీ డబ్బు, మీ స్నేహితుడు”",
    loginTitle: "పైసా సాథి లాగిన్",
    loginSubtitle: "SMS-OTP సురక్షిత లాగిన్",
    phoneLabel: "మీ 10 అంకెల మొబైల్ నంబరును నమోదు చేయండి",
    phonePlaceholder: "9876543210",
    otpButton: "OTP పంపండి (Request OTP)",
    otpLabel: "4-అంకెల వెరిఫికేషన్ కోడ్",
    otpPlaceholder: "1234 (ఉదాహరణ)",
    otpVerify: "ఓటిపిని నిర్ధారించండి ✓",
    optSentMessage: "వెరిఫికేషన్ కోడ్ ఈ మొబైల్ నంబరుకు పంపబడింది:",
    changeNumber: "మొబైల్ నంబరు మార్చండి",
    langTitle: "భాషను ఎంచుకోండి",
    langSubtitle: "మీరు చదవడానికి మరియు మాట్లాడటానికి ఉపయోగపడే భాషను ఎంచుకోండి.",
    continueBtn: "ముందుకు సాగండి",
    onboardingStep: "దశ 1 (చివరి దశ)",
    onboardingTitle: "మీ గురించి సమాచారం చెప్పండి",
    onboardingSubtitle: "దీని వలన మేము మీ కోసం సరైన పొదుపు ప్రణాళికను సిద్ధం చేయగలం.",
    nameLabel: "మీ పూర్తి పేరు",
    namePlaceholder: "రమేష్ కుమార్ (ఉదాహరణ)",
    incomeLabel: "నెలసరి ఆదాయం / సంపాదన (₹)",
    incomePlaceholder: "25000 (ఉదాహరణ)",
    goalLabel: "పొదుపు లక్ష్యం",
    goalOptions: [
      "అత్యవసర నిధి / Emergency Fund",
      "పిల్లల చదువు / Child Education",
      "కొత్త ఇల్లు కొనడం / Home Purchase",
      "పెళ్లి ఖర్చులు / Marriage Savings",
      "రిటైర్మెంట్ ప్లాన్ / Retirement Plan"
    ],
    completeProfile: "ప్రొఫైల్ పూర్తి చేయండి ✓",
    navHome: "హోమ్",
    navChat: "సాథి చర్చ",
    navGoals: "లక్ష్యాలు",
    navLearn: "నేర్చుకోండి",
    navProfile: "ప్రొఫైల్",
    incomeHeading: "ఆదాయం",
    expenseHeading: "ఖర్చు",
    savingsHeading: "పొదుపు",
    smartAdvice: "స్మార్ట్ ఆర్థిక సలహా",
    safeMessage: "మేము మీ డబ్బును ఎప్పుడూ తాకము. ఎటువంటి దాచిన రుసుములు లేవు, సురక్షిత సలహా మాత్రమే.",
    emergencyFundCard: "ఎమర్జెన్సీ గుల్లాక్",
    emergencyFundDesc: "ఆకస్మిక వైద్య ఖర్చులు లేదా కష్ట సమయాల కోసం సురక్షితమైన సొమ్ము.",
    addGoalBtn: "కొత్త లక్ష్యం చేర్చండి +",
    dailyExpenseHead: "రోజువారీ ఖర్చుల నమోదు",
    totalKharch: "మొత్తం నెలసరి ఖర్చు",
    addExpenseBtn: "ఖర్చును చేర్చండి",
    kirana: "కిరాణా మరియు రేషన్ 🛒",
    travel: "ప్రయాణం / పెట్రోల్ ⛽",
    rent: "ఇంటి అద్దె / రూమ్ 🏠",
    medicine: "వైద్యం / మందులు 💊",
    entertainment: "మొబైల్ మరియు ఇతరాలు 📱",
    personalDetails: "వ్యక్తిగత మార్పులు",
    languageLabel: "యాప్ భాషను మార్చండి",
    financialScore: "ఆర్థిక ఆరోగ్య స్కోరు",
    supportHelp: "సహాయం మరియు వాట్సాప్ సపోర్ట్",
    logoutBtn: "లాగౌట్ సాగించండి",
    chatWelcome: "నమస్కారం! నేను పైసా సాథి మాట్లాడితున్నాను. మీరు పొదుపులు, మ్యూచువల్ ఫండ్స్, ఎస్ఐపి లేదా ఖర్చులు తగ్గించడం గురించి ఏదైనా అడగవచ్చు.",
    chatPlaceholder: "ఏదైనా అడగండి లేదా మైక్ నొక్కండి...",
    goalSetupHead: "కొత్త లక్ష్యం ఏర్పాటు చేయండి",
    goalTitleLabel: "లక్ష్యం పేరు",
    goalTitlePlaceholder: "కొత్త టాక్సీ కొనడానికి, ఇల్లు, మొదలైనవి",
    targetAmountLabel: "మొత్తం పొదుపు లక్ష్యం (₹)",
    categoryLabel: "లక్ష్యం వర్గం",
    saveGoalBtn: "లక్ష్యాన్ని సేవ్ చేయండి ✓",
    cancelBtn: "రద్దు చేయి",
    currentSavings: "ప్రస్తుత పొదుపు",
    targetAmt: "లక్ష్యం మొత్తం",
    streakText: "పొదుపు నిలకడ",
    scoreText: "ఆరోగ్య స్కోరు",
    shuruKaren: "ప్రారంభించండి",
    voiceSecured: "🔒 వాయిస్ సహాయక సురక్షిత పోర్టల్",
    thisMonth: "ఈ నెల",
    finScoreHead: "ఆర్థిక ఆరోగ్య స్కోరు",
    scoreDetailsHead: "స్కోరు వివరాల విశ్లేషణ",
    myGoalsHead: "నా పొదుపు లక్ష్యాలు",
    mySavingsOptionsHead: "పొదుపు మరియు పెట్టుబడి విధానాలు",
    expertTipsHead: "నిపుణుల పొదుపు చిట్కాలు",
    dailyLogsHead: "ఈనాటి లెక్క",
    quickActionHead: "త్వరిత చర్య సహాయకులు"
  }
};

export function normalizeLanguageName(lang: string | null | undefined): string {
  if (!lang) return 'Hindi';
  const l = lang.trim().toLowerCase();
  if (l === 'english' || l === 'अंग्रेज़ी' || l === 'अंग्रेजी' || l === 'en' || l === 'eng') {
    return 'English';
  }
  if (l === 'hindi' || l === 'हिंदी' || l === 'हिन्दी' || l === 'hi') {
    return 'Hindi';
  }
  if (l === 'marathi' || l === 'मराठी' || l === 'mr') {
    return 'Marathi';
  }
  if (l === 'bengali' || l === 'বাংলা' || l === 'bn') {
    return 'Bengali';
  }
  if (l === 'tamil' || l === 'தமிழ்' || l === 'ta') {
    return 'Tamil';
  }
  if (l === 'telugu' || l === 'తెలుగు' || l === 'te') {
    return 'Telugu';
  }
  const capitalized = lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
  if (['Hindi', 'English', 'Marathi', 'Bengali', 'Tamil', 'Telugu'].includes(capitalized)) {
    return capitalized;
  }
  return 'Hindi';
}

export function getLocale(lang: string | null | undefined): LocaleStrings {
  const normalized = normalizeLanguageName(lang);
  return LOCALES[normalized] || LOCALES['Hindi'];
}
