import React, { useState, useEffect, useRef } from 'react';
import { VoiceService } from './VoiceService';
import { getLocale, normalizeLanguageName, LocaleStrings, LOCALES } from './locales';
import ChannelOptInPanel from './components/ChannelOptInPanel';
import ProductDemoPlayer from './components/ProductDemoPlayer';
import { 
  Mic, MicOff, MessageSquare, ShieldCheck, User, ArrowRight, 
  HelpCircle, LogOut, Check, Phone, Lock, AlertTriangle, 
  TrendingUp, Wallet, Shield, Award, Calendar, Volume2, 
  ChevronRight, ArrowLeft, RefreshCw, Landmark, Coins, Plus, Trash2, PieChart,
  Download, FileText, Video
} from 'lucide-react';

// Speech recognition utility types
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export default function App() {
  // Navigation & User State
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'login' | 'language' | 'trust' | 'onboarding' | 'main'>('login');
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'lakshya' | 'sikhein' | 'profile'>('home');
  const [showDemoPlayer, setShowDemoPlayer] = useState<boolean>(false);
  
  // Simulated WhatsApp Experience states
  const [interactionMode, setInteractionMode] = useState<'app' | 'whatsapp'>('app');
  const [whatsappMessages, setWhatsappMessages] = useState<Array<{
    id: string;
    sender: 'user' | 'sathi';
    text: string;
    timestamp: string;
    actionType?: 'income' | 'expense' | 'goal' | 'schemes' | 'save' | 'custom';
  }>>([]);
  const [isWaTyping, setIsWaTyping] = useState<boolean>(false);
  
  // Voice engine & interactive status
  const voice = useRef(new VoiceService());
  // Get active localization strings based on selectedLang
  const [selectedLang, setSelectedLang] = useState<string>('Hindi');
  const txt = getLocale(selectedLang);
  
  // Dynamic unified bilingual text helper: returns purely native text, or English text if English selected
  const b = (key: keyof LocaleStrings): string => {
    const val = txt[key];
    if (selectedLang === 'English') {
      return Array.isArray(val) ? val.join(', ') : (val as string);
    }
    if (Array.isArray(val)) {
      return val.join(', ');
    }
    return (val as string);
  };
  
  // New States for Screen Guidance, Greetings, and "Paisa Saathi Didi" assistant
  const [visitedTabs, setVisitedTabs] = useState<Record<string, boolean>>({});
  const [hasGreetedSession, setHasGreetedSession] = useState<boolean>(false);
  const [didiOpen, setDidiOpen] = useState<boolean>(false);
  const [didiMessage, setDidiMessage] = useState<string>('');
  const [addingIncomeHome, setAddingIncomeHome] = useState<boolean>(false);
  const [addingExpenseHome, setAddingExpenseHome] = useState<boolean>(false);
  const [homeAmount, setHomeAmount] = useState<string>('');
  const [homeCategory, setHomeCategory] = useState<string>('Kamai');
  const [homeTitle, setHomeTitle] = useState<string>('');
  
  const [voiceStatusText, setVoiceStatusText] = useState<string>("Namaste! Main aapka Paisa Saathi voice assistant hoon.");
  const [micCheckStatus, setMicCheckStatus] = useState<'idle' | 'testing' | 'authorized' | 'blocked'>('idle');
  const [soundCheckActive, setSoundCheckActive] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null);

  // User profile
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const getDynamicStoryTitle = () => {
    if (user && user.name) {
      const trimmed = user.name.trim();
      if (trimmed) {
        const first = trimmed.split(/[\s,]+/)[0];
        const formattedFirst = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
        return `${formattedFirst} Ka Ek Din – Paisa Saathi Ke Saath`;
      }
    }
    return "Mera Ek Din – Paisa Saathi Ke Saath";
  };

  // Login Form States
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [primaryGoal, setPrimaryGoal] = useState<string>('Bachi ki padhai / Child education');
  const [chatSecondsLeft, setChatSecondsLeft] = useState<number>(300); // 5 minutes free trial
  const [isChatLocked, setIsChatLocked] = useState<boolean>(false);
  const [aggregatorProtocolActive, setAggregatorProtocolActive] = useState<boolean>(true);
  
  // OTP States
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [simulatedSMS, setSimulatedSMS] = useState<string>('');
  
  // Navigation History Tracking for "Back" button
  const [historyStack, setHistoryStack] = useState<Array<{ screen: 'splash' | 'login' | 'language' | 'trust' | 'onboarding' | 'main'; tab: 'home' | 'chat' | 'lakshya' | 'sikhein' | 'profile'; step: number; otpSent: boolean }>>([]);
  const [isNavigatingBack, setIsNavigatingBack] = useState<boolean>(false);

  useEffect(() => {
    if (isNavigatingBack) {
      setIsNavigatingBack(false);
      return;
    }
    // Record current state in navigation history
    setHistoryStack((prev) => {
      const last = prev[prev.length - 1];
      if (
        last &&
        last.screen === currentScreen &&
        last.tab === activeTab &&
        last.step === onboardingStep &&
        last.otpSent === otpSent
      ) {
        return prev;
      }
      const updated = [...prev, { screen: currentScreen, tab: activeTab, step: onboardingStep, otpSent: otpSent }];
      if (updated.length > 50) updated.shift();
      return updated;
    });
  }, [currentScreen, activeTab, onboardingStep, otpSent]);

  const handleGoBack = () => {
    if (historyStack.length <= 1) {
      // Basic manual fallback
      if (currentScreen === 'main' && activeTab !== 'home') {
        setActiveTab('home');
      } else if (currentScreen === 'onboarding' && onboardingStep > 1) {
        setOnboardingStep(prev => prev - 1);
      } else if (currentScreen === 'onboarding') {
        setCurrentScreen('trust');
      } else if (currentScreen === 'trust') {
        setCurrentScreen('language');
      } else if (currentScreen === 'language') {
        setCurrentScreen('login');
      } else if (currentScreen === 'login' && otpSent) {
        setOtpSent(false);
      }
      return;
    }

    const popped = [...historyStack];
    popped.pop(); // Pop current state
    const target = popped[popped.length - 1];
    
    if (target) {
      setIsNavigatingBack(true);
      setHistoryStack(popped);
      setCurrentScreen(target.screen);
      setActiveTab(target.tab);
      setOnboardingStep(target.step);
      setOtpSent(target.otpSent);
    }
  };

  // Chat States
  const [messages, setMessages] = useState<any[]>([]);
  const [revertedIds, setRevertedIds] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string>('');
  
  // Database tables / items synced from server
  const [alerts, setAlerts] = useState<any[]>([]);
  const [savingsTips, setSavingsTips] = useState<any[]>([]);
  const [investmentGuidance, setInvestmentGuidance] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  
  // Voice Expense Tracker States
  const [isVoiceTracking, setIsVoiceTracking] = useState<boolean>(false);
  const [voiceTrackingText, setVoiceTrackingText] = useState<string>('');
  
  // Bank Account upload statement & consent states
  const [trackerTab, setTrackerTab] = useState<'journal' | 'statement'>('journal');
  const [bankConsentEnabled, setBankConsentEnabled] = useState<boolean>(true);
  const [uploadedStatementFile, setUploadedStatementFile] = useState<string>('');
  const [savingTipsTab, setSavingTipsTab] = useState<'day' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'>('weekly');
  const [ledgerSubTab, setLedgerSubTab] = useState<'ledger' | 'voice' | 'files' | 'autodeduct'>('ledger');
  const [isAddingExpense, setIsAddingExpense] = useState<boolean>(false);
  
  // Expense Form States
  const [newExpAmount, setNewExpAmount] = useState<string>('');
  const [newExpCategory, setNewExpCategory] = useState<string>('Kirana');
  const [newExpTitle, setNewExpTitle] = useState<string>('');

  // Goal Form States
  const [newGoalTitle, setNewGoalTitle] = useState<string>('');
  const [newGoalTarget, setNewGoalTarget] = useState<string>('');
  const [newGoalCategory, setNewGoalCategory] = useState<string>('Education');
  const [isAddingGoal, setIsAddingGoal] = useState<boolean>(false);

  // Dynamically calculate actual tracker total and budget attributes derived directly from expenses details
  const trackerTotal = expenses
    .filter(exp => !exp.type || exp.type === 'expense')
    .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const currentIncome = user ? (user.current_month_aay || user.monthly_income || 0) : 0;
  const trackerBachat = Math.max(0, currentIncome - trackerTotal);

  // AI Voice Calling Agent state
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended' | 'ringing'>('ended');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [callTranscript, setCallTranscript] = useState<string>('');
  const [callResponseText, setCallResponseText] = useState<string>('');
  const [isCallAgentListening, setIsCallAgentListening] = useState<boolean>(false);
  const [isCallAgentSpeaking, setIsCallAgentSpeaking] = useState<boolean>(false);
  const [highlightedTab, setHighlightedTab] = useState<string | null>(null);

  // Calling Agent Duration Timer
  useEffect(() => {
    let timer: any;
    if (isCallActive && callStatus === 'connected') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isCallActive, callStatus]);

  const formatCallDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startVoiceCall = () => {
    setIsCallActive(true);
    setCallStatus('connecting');
    setCallDuration(0);
    setCallTranscript('Connecting...');
    setCallResponseText('');
    
    // Stop any other active narration
    voice.current.cancelSpeaking();
    voice.current.stopListening();
    
    setTimeout(() => {
      setCallStatus('connected');
      
      const currentLang = selectedLang || 'Hindi';
      let welcomeStr = "";
      if (currentLang === 'English') {
        welcomeStr = "Hello! I am your Paisa Saathi voice calling helper. Speak to me anytime to navigate or get app assistance!";
      } else if (currentLang === 'Marathi') {
        welcomeStr = "नमस्कार! मी पैसा साथी कॉलिंग सहाय्यक आहे. ॲपमध्ये कोणत्याही मदतीसाठी मला सांगा किंवा खालील पर्याय सिलेक्ट करा!";
      } else if (currentLang === 'Bengali') {
        welcomeStr = "নমস্কার! আমি পয়সা সাথী কলিং অংশীদার। কীভাবে আপনাকে সাহায্য করতে পারি তা দয়া করে বলুন বা নিচের বিকল্পটি বেছে নিন!";
      } else {
        welcomeStr = "नमस्ते! मैं आपका कॉलिंग सहायक साथी हूँ। मैं आपको ऐप चलाने में मदद कर सकता हूँ। कुछ भी बोलें जैसे 'खर्च जोड़ो' या 'बचत लक्ष्य दिखाएं'!";
      }
      
      speakCallAgentResponse(welcomeStr, currentLang);
    }, 1500);
  };

  const endVoiceCall = () => {
    voice.current.cancelSpeaking();
    voice.current.stopListening();
    setIsCallActive(false);
    setCallStatus('ended');
    setIsCallAgentListening(false);
    setIsCallAgentSpeaking(false);
  };

  const speakCallAgentResponse = (text: string, langName: string) => {
    setIsCallAgentSpeaking(true);
    setIsCallAgentListening(false);
    setCallResponseText(text);
    
    voice.current.cancelSpeaking();
    
    voice.current.speak(
      text,
      langName,
      () => {
        setIsCallAgentSpeaking(true);
      },
      () => {
        setIsCallAgentSpeaking(false);
        startListeningInCall(langName);
      },
      (err) => {
        setIsCallAgentSpeaking(false);
        startListeningInCall(langName);
      }
    );
  };

  const startListeningInCall = (langName: string) => {
    setIsCallAgentListening(true);
    setCallTranscript(langName === 'English' ? "Listening... Speak now." : "सुन रहा हूँ... कृपया बोलिए।");
    
    voice.current.listen(
      langName,
      () => {},
      async (transcript) => {
        setCallTranscript(transcript);
        setIsCallAgentListening(false);
        
        try {
          const res = await fetch('/api/call-agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: transcript,
              userId: user?.id,
              activeTab: activeTab
            })
          });
          const data = await res.json();
          await handleCallAgentResponseData(data, langName);
        } catch (err) {
          console.error("Call agent speech error:", err);
          speakCallAgentResponse(
            langName === 'English' ? "Sorry, connection issue. Let's try again." : "माफ़ कीजिए, नेटवर्क में दिक्कत है। फिर से बोलें।",
            langName
          );
        }
      },
      () => {
        setIsCallAgentListening(false);
      },
      (err) => {
        setIsCallAgentListening(false);
        console.warn("Call speech recog error:", err);
      }
    );
  };

  const handleCallAgentResponseData = async (data: any, langName: string) => {
    let cleanText = data.response_text || "";
    let extractedJson: any = null;

    if (cleanText.includes('{') && cleanText.includes('}')) {
      try {
        const startIndex = cleanText.indexOf('{');
        const endIndex = cleanText.lastIndexOf('}') + 1;
        const jsonStr = cleanText.substring(startIndex, endIndex);
        extractedJson = JSON.parse(jsonStr);
        cleanText = cleanText.substring(0, startIndex).trim();
      } catch (e) {
        console.error("Failed to parse inner JSON from call-agent response_text", e);
      }
    }

    if (extractedJson) {
      if (extractedJson.action === 'ADD_EXPENSE' || extractedJson.action === 'ADD_DEPOSIT') {
        const { amount, category, note } = extractedJson;
        if (user?.id) {
          try {
            await fetch('/api/expenses', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: user.id,
                category: category || "Khana / Food",
                amount: Number(amount) || 0,
                title: note || "Via Call Helper",
                type: extractedJson.action === 'ADD_EXPENSE' ? 'expense' : 'deposit'
              })
            });
            await fetchUserDashboardData(user.id);
          } catch (apiErr) {
            console.error("Failed to submit stateful Call Helper transaction to server", apiErr);
          }
        }
      }
    }

    if (data.action && data.action !== 'none') {
      setActiveTab(data.action);
      setHighlightedTab(data.action);
      setTimeout(() => setHighlightedTab(null), 3000);
      
      if (data.action_element === 'open_goal_modal') {
        setIsAddingGoal(true);
      }
    }

    speakCallAgentResponse(cleanText, data.detected_language || langName);
  };

  const simulateValueCallSpeech = async (phrase: string) => {
    setCallTranscript(phrase);
    setIsCallAgentListening(false);
    const langName = selectedLang || 'Hindi';
    
    try {
      const res = await fetch('/api/call-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: phrase,
          userId: user?.id,
          activeTab: activeTab
        })
      });
      const data = await res.json();
      await handleCallAgentResponseData(data, langName);
    } catch (e) {
      speakCallAgentResponse("माफ़ कीजिए, नेटवर्क में दिक्कत है। फिर से बोलें।", langName);
    }
  };

  // Speech Recognition reference
  const recognitionRef = useRef<any>(null);
  const audioEndTimeoutRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initial configuration check and state sync
  useEffect(() => {
    const savedUserMobile = localStorage.getItem('ps_user_mobile');
    const savedLang = localStorage.getItem('ps_user_lang');
    
    if (savedLang) {
      const normalized = normalizeLanguageName(savedLang);
      setSelectedLang(normalized);
      localStorage.setItem('ps_user_lang', normalized);
    }

    if (savedUserMobile) {
      fetchUserDetails(savedUserMobile);
    } else {
      // Do not auto-login to Ramesh. Show the splash screen so the user can give their own mobile details first.
      setLoading(false);
      setCurrentScreen('splash');
    }
    
    // Fetch generic reference content
    fetchReferenceData();

    // Auto-unlock Web SpeechSynthesis engine on first click/touch interaction - crucial for sandboxed browser iframes
    const unlockAudioEngine = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          const silentUtterance = new SpeechSynthesisUtterance(' ');
          silentUtterance.volume = 0;
          window.speechSynthesis.speak(silentUtterance);
          console.log("SpeechSynthesis audio engine unlocked successfully.");
        } catch (err) {
          console.warn("Could not auto-unlock SpeechSynthesis:", err);
        }
      }
      window.removeEventListener('click', unlockAudioEngine);
      window.removeEventListener('touchstart', unlockAudioEngine);
    };

    window.addEventListener('click', unlockAudioEngine);
    window.addEventListener('touchstart', unlockAudioEngine);

    return () => {
      window.removeEventListener('click', unlockAudioEngine);
      window.removeEventListener('touchstart', unlockAudioEngine);
    };
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Sync static values (tips, guidance) from backend API
  const fetchReferenceData = async () => {
    try {
      const tipsRes = await fetch('/api/savings-tips');
      if (tipsRes.ok) setSavingsTips(await tipsRes.json());

      const guidanceRes = await fetch('/api/investment-guidance');
      if (guidanceRes.ok) setInvestmentGuidance(await guidanceRes.json());
    } catch (e) {
      console.error("Error fetching reference info:", e);
    }
  };

  // Fetch full user details from the backend
  const fetchUserDetails = async (mobile: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${mobile}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        if (data.name) setName(data.name);
        if (data.monthly_income) setMonthlyIncome(data.monthly_income.toString());
        if (data.primary_goal) setPrimaryGoal(data.primary_goal);
        if (data.language) {
          const normalized = normalizeLanguageName(data.language);
          setSelectedLang(normalized);
          localStorage.setItem('ps_user_lang', normalized);
        }
        
        // Ensure uncompleted profiles can complete onboarding on reload
        const canPickFromDatabase = data.name && data.name.trim() !== "" && data.monthly_income !== undefined && data.monthly_income !== null && Number(data.monthly_income) > 0;
        if (!data.is_onboarded && !canPickFromDatabase) {
          setOnboardingStep(1);
          setCurrentScreen('onboarding');
        } else {
          // If we had name/income in DB but is_onboarded wasn't set, let's sync it to true
          if (!data.is_onboarded) {
            data.is_onboarded = true;
            handleProfileUpdate({
              name: data.name,
              monthly_income: data.monthly_income,
              primary_goal: data.primary_goal,
              language: data.language || selectedLang
            });
          }
          setCurrentScreen('main');
          // Fetch personalized dashboard details
          fetchUserDashboardData(data.id);
        }
      } else {
        localStorage.removeItem('ps_user_mobile');
      }
    } catch (e) {
      console.error("Error fetching user detail:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDashboardData = async (userId: string) => {
    try {
      let uData: any = null;
      const userRes = await fetch(`/api/users/by-id/${userId}`);
      if (userRes.ok) {
        uData = await userRes.json();
        setUser(uData);
        if (uData.name) setName(uData.name);
        if (uData.monthly_income) setMonthlyIncome(uData.monthly_income.toString());
        if (uData.primary_goal) setPrimaryGoal(uData.primary_goal);
      }

      const alertsRes = await fetch(`/api/alerts/${userId}`);
      if (alertsRes.ok) setAlerts(await alertsRes.json());

      const expensesRes = await fetch(`/api/expenses/${userId}`);
      if (expensesRes.ok) setExpenses(await expensesRes.json());

      const goalsRes = await fetch(`/api/goals/${userId}`);
      if (goalsRes.ok) setGoals(await goalsRes.json());

      const chatRes = await fetch(`/api/chat/history/${userId}`);
      if (chatRes.ok) {
        const history = await chatRes.json();
        if (history.length > 0) {
          setMessages(history);
        } else {
          // Initialize chat
          setMessages([
            {
              id: "chat_init",
              user_message: "Hello",
              ai_response: `Namaste ${uData?.name || 'Ramesh'} ji! 🙏 Main Paisa Saathi hoon. Aapka paisa samajhne aur badhane ka dost. Main aapko bachat, kharch aur naye nivesh (jaise safe SIP) ko saral bhasha mein samajhne mein madad karunga. Aaj kya poochhna chahenge?`,
              timestamp: new Date().toISOString()
            }
          ]);
        }
      }
    } catch (e) {
      console.error("Error retrieving user specific tables:", e);
    }
  };

  // 2. Authentication Processes
  const handleRequestOTP = async (e?: React.FormEvent, overrideMobile?: string) => {
    if (e) e.preventDefault();
    const activeMobile = overrideMobile || mobileNumber;
    if (!activeMobile || activeMobile.length < 10) {
      setErrorMsg('Kripya 10-digit ka sahi mobile number darj karein.');
      return;
    }
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/otp-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_number: activeMobile })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setSimulatedSMS(data.message);
        // Auto-dismiss SMS simulation notification in 8 seconds
        setTimeout(() => setSimulatedSMS(''), 10000);
      } else {
        setErrorMsg(data.error || 'Server error. Pratham prayas karein.');
      }
    } catch (err) {
      setErrorMsg('Network error. Check server connectivity.');
    }
  };

  const handleVerifyOTP = async (e?: React.FormEvent, overrideOTP?: string) => {
    if (e) e.preventDefault();
    const activeOTP = overrideOTP || otpCode;
    if (!activeOTP) {
      setErrorMsg('Kripya 4-digit code darj karein.');
      return;
    }
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile_number: mobileNumber,
          otp: activeOTP,
          language: selectedLang,
          name: name || ''
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        if (data.user.name) setName(data.user.name);
        if (data.user.monthly_income) setMonthlyIncome(data.user.monthly_income.toString());
        if (data.user.primary_goal) setPrimaryGoal(data.user.primary_goal);
        // Persist exact backend phone number record
        localStorage.setItem('ps_user_mobile', data.user.mobile_number);
        fetchUserDashboardData(data.user.id);
        
        // Sync language immediately on user match
        const rawLanguage = data.user.language || selectedLang || 'Hindi';
        const userLanguage = normalizeLanguageName(rawLanguage);
        setSelectedLang(userLanguage);
        localStorage.setItem('ps_user_lang', userLanguage);

        const canPickFromDatabase = data.user.name && data.user.name.trim() !== "" && data.user.monthly_income !== undefined && data.user.monthly_income !== null && Number(data.user.monthly_income) > 0;
        if (data.is_new_user && !canPickFromDatabase) {
          // New User profile setup sequence starts
          setCurrentScreen('language');
          speakResponse("नमस्ते! पैसा साथी में आपका स्वागत है। कृपया अपनी पसंदीदा भाषा चुनें।", userLanguage);
        } else {
          // If they had name/income in DB but is_onboarded wasn't set, let's sync it to true
          if (!data.user.is_onboarded) {
            handleProfileUpdate({
              name: data.user.name,
              monthly_income: data.user.monthly_income,
              primary_goal: data.user.primary_goal,
              language: rawLanguage
            });
          }
          // Redirect existing user to home page instead of profile
          setCurrentScreen('main');
          setActiveTab('home');
          const nameToUse = data.user.name || 'पैसा साथी';
          const welcomeText = userLanguage === 'English'
            ? `Namaste ${nameToUse} Ji. I am your Paisa Saathi. Come, let's manage your money better today.`
            : `नमस्ते ${nameToUse} जी। मैं आपका पैसा साथी हूँ। चलिए आज आपके पैसे को और बेहतर तरीके से मैनेज करते हैं।`;
          setHasGreetedSession(true);
          speakResponse(welcomeText, userLanguage);
        }
      } else {
        setErrorMsg(data.error || 'Galat code. Puraskarat OTP ya 1234 use karein.');
      }
    } catch (err) {
      setErrorMsg('Network error verifying OTP.');
    }
  };

  // Voice engine synthesis speaker proxies
  const speakResponse = (text: string, forceLanguage?: string) => {
    if (!isVoiceEnabled) return;
    const langToUse = forceLanguage || selectedLang;
    
    // Translate the text if the setting language is not Hindi
    const translatedText = translateSpokenMessage(text, langToUse);
    
    setIsSpeaking(true);
    setVoiceStatusText(translatedText);
    
    voice.current.speak(
      translatedText,
      langToUse,
      () => {},
      () => setIsSpeaking(false),
      (err) => {
        setIsSpeaking(false);
        console.error("SpeechSynthesis error:", err);
      }
    );
  };

  // Screen Guidance Playback
  const playScreenHelp = (tab: string) => {
    let msg = "";
    if (selectedLang === 'English') {
      if (tab === 'home') {
        msg = "Yahan aap apna wallet balance, aaj ki kamai, kharcha, aur emergency fund dekh sakte hain.";
      } else if (tab === 'chat') {
        msg = "This is your chat partner. Tap the microphone to talk about savings, investment plans, or security.";
      } else if (tab === 'lakshya') {
        msg = "Here you can manage your expenses and track your active savings goals.";
      } else if (tab === 'sikhein') {
        msg = "Here you can understand Recurring Deposits, gold savings, and government benefit schemes.";
      } else if (tab === 'profile') {
        msg = "Here you can change your name, monthly income target, language, and settings.";
      }
    } else if (selectedLang === 'Marathi') {
      if (tab === 'home') {
        msg = "येथे तुम्ही तुमचे वॉलेट शिल्लक, आजचे उत्पन्न, खर्च आणि आणीबाणी निधीची प्रगती पाहू शकता.";
      } else if (tab === 'chat') {
        msg = "हा तुमचा चॅट मित्र आहे. बचत किंवा सरकारी योजनेबद्दल प्रश्न विचारण्यासाठी माइक दाबा.";
      } else if (tab === 'lakshya') {
        msg = "येथे तुम्ही तुमचे खर्च जोडू शकता आणि तुमच्या बचतीचे ध्येय तपासू शकता.";
      } else if (tab === 'sikhein') {
        msg = "येथे तुम्ही आरडी, सोने खरेदी आणि सरकारी विमा योजनांबद्दल माहिती घेऊ शकता.";
      } else if (tab === 'profile') {
        msg = "येथे तुम्ही तुमचे नाव, उत्पन्न आणि भाषा बदलू शकता.";
      }
    } else {
      // Default to Hindi
      if (tab === 'home') {
        msg = "यहाँ आप अपने वॉलेट का कुल बैलेंस, आज की कमाई, आज के खर्च और अपनी आपातकालीन बचत की प्रगति देख सकते हैं।";
      } else if (tab === 'chat') {
        msg = "यह आपका चैट साथी है। बटन दबाकर मुझसे पैसे की बचत, एसआईपी, या सरकारी योजनाओं के बारे में कोई भी प्रश्न पूछें।";
      } else if (tab === 'lakshya') {
        msg = "यहाँ आप अपने रोज़ाना के खर्च लिखकर या बोलकर जोड़ सकते हैं।";
      } else if (tab === 'sikhein') {
        msg = "यहाँ आप म्यूचुअल फंड सुरक्षित एसआईपी, डिजिटल गोल्ड और प्रधानमंत्री बीमा जैसी सरकारी योजनाओं के बारे में सीख सकते हैं।";
      } else if (tab === 'profile') {
        msg = "यहाँ आप अपना नाम, मासिक आय बदल सकते हैं, ऐप की भाषा बदल सकते हैं।";
      }
    }
    
    if (msg) {
      speakResponse(msg);
    }
  };

  // Run screen-specific audio explanation only ONCE on first visit
  useEffect(() => {
    if (currentScreen !== 'main' || !user) return;
    
    if (!visitedTabs[activeTab]) {
      setVisitedTabs(prev => ({ ...prev, [activeTab]: true }));
      
      const timer = setTimeout(() => {
        // Only run help if onboarding/login welcome finished
        if (hasGreetedSession) {
          playScreenHelp(activeTab);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activeTab, currentScreen, user, hasGreetedSession]);

  // Countdown timer for Chat limit (5 mins free, then 2 rps per 10 mins recharge)
  useEffect(() => {
    if (currentScreen !== 'main' || activeTab !== 'chat') return;
    if (chatSecondsLeft <= 0) {
      setIsChatLocked(true);
      return;
    }

    const interval = setInterval(() => {
      setChatSecondsLeft(prev => {
        if (prev <= 1) {
          setIsChatLocked(true);
          clearInterval(interval);
          speakResponse(selectedLang === 'English' 
            ? "Your free chat session has ended. Please recharge for 2 Rupees to continue talking with Paisa Saathi for 10 more minutes." 
            : "आपकी मुफ़्त चैट सीमा समाप्त हो गई है। चैटिंग जारी रखने के लिए कृपया ₹2 का रिचार्ज करें और १० मिनट पाएं।"
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentScreen, activeTab, chatSecondsLeft, selectedLang]);

  const triggerRecharge = async () => {
    speakResponse(selectedLang === 'English'
      ? "Thank you! Recharge of ₹2 done. 10 minutes session has been activated!"
      : "धन्यवाद! ₹2 का रिचार्ज सफल रहा। अगले १० मिनट की बात-चीत सक्रिय हो गई है!"
    );
    setChatSecondsLeft(prev => prev + 600); // add 600 seconds (10 mins)
    setIsChatLocked(false);

    if (user?.id) {
      try {
        await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            category: 'Manoranjan',
            amount: 2,
            title: selectedLang === 'English' ? 'Sathi Chat 5-min Limit Recharge' : 'पैसा साथी चैट रिचार्ज',
            type: 'expense'
          })
        });
        await fetchUserDashboardData(user.id);
      } catch (err) {
        console.error("Recharge expense save error:", err);
      }
    }
  };

  // --- START UP VOICE ENGINE HOOKS & CONTROLLERS ---
  
  // Dynamic bilingual/trilingual translation utility for spoken feedback
  // Maps common statements to their multilingual equivalents
  const translateSpokenMessage = (text: string, lang: string): string => {
    const l = (normalizeLanguageName(lang) || 'Hindi').toLowerCase();
    
    // Exact mapping for known strings (bypasses Hindi template when English/Marathi preferred)
    const mapping: Array<{ hindi: RegExp | string; english: string; marathi: string }> = [
      {
        hindi: /नमस्ते (.*?)! पैसा साथी पर आपका फिर से स्वागत है।/i,
        english: "Hello $1! Welcome back to Paisa Saathi.",
        marathi: "नमस्कार $1! पैसा साथीमध्ये आपले पुन्हा स्वागत आहे."
      },
      {
        hindi: /बहुत-बहुत धन्यवाद (.*?)! आपकी प्रोफाइल सफलतापूर्वक बन गयी है। आइए अब बचत की शुरुआत करते हैं।/i,
        english: "Thank you so much $1! Your profile has been successfully created. Let's start saving.",
        marathi: "खूप खूप धन्यवाद $1! तुमची प्रोफाइल यशस्वीरित्या बनली आहे. चला आता बचतीला सुरुवात करूया."
      },
      {
        hindi: "कृपया अपना पूरा नाम बोलें।",
        english: "Please say your full name.",
        marathi: "कृपया तुमचे पूर्ण नाव सांगा."
      },
      {
        hindi: "कृपया अपनी मासिक आय बोलकर बताएं।",
        english: "Please state your monthly income.",
        marathi: "कृपया तुमची मासिक कमाई सांगा."
      },
      {
        hindi: "कृपया अपना १० अंकों का मोबाइल नंबर बोलें।",
        english: "Please say your ten digit mobile number.",
        marathi: "कृपया तुमचा १० अंकी मोबाईल नंबर सांगा."
      },
      {
        hindi: "कृपया अपना चार अंकों का वेरिफिकेशन कोड बोलें।",
        english: "Please say the 4 digits verification code.",
        marathi: "कृपया तुमचा ४ अंकी वेरिफिकेशन कोड सांगा."
      },
      {
        hindi: "कृपया अपना १० अंकों का मोबाइल नंबर दर्ज करें या बोलकर बताएं।",
        english: "Welcome to Paisa Saathi! Please enter your 10 digit mobile number or speak it.",
        marathi: "पैसा साथीमध्ये आपले स्वागत आहे! कृपया आपला १० अंकी मोबाईल नंबर प्रविष्ट करा किंवा बोलून सांगा."
      },
      {
        hindi: "आपके मोबाइल नंबर पर चार अंकों का ओ टी पी भेजा गया है। उसे लिखें या बोलें।",
        english: "A 4 digit verification code has been sent to your mobile. Please enter or speak it.",
        marathi: "तुमच्या मोबाईल नंबरवर ४ अंकी ओ टी पी पाठविला आहे. तो सांगा किंवा प्रविष्ट करा."
      },
      {
        hindi: "कृपया अपनी भाषा चुनें। Choose your comfortable language.",
        english: "Please select your preferred language.",
        marathi: "कृपया तुमची आवडती भाषा निवडा."
      },
      {
        hindi: "हमारा ऐप शत प्रतिशत सुरक्षित है। हम आपका पैसा नहीं लेते, सिर्फ समझदार सलाह देते हैं।",
        english: "Our app is 100% secure. We do not take your money, we only provide wise guidelines.",
        marathi: "आमचे अ‍ॅप १०० टक्के सुरक्षित आहे. आम्ही तुमचे पैसे घेत नाही, फक्त योग्य बचत माहिती देतो."
      },
      {
        hindi: "अपना नाम और मासिक आय बताएं ताकि हम उत्तम बचत लक्ष्य तय कर सकें।",
        english: "Please tell us your name and monthly income so we can configure your smart savings goals.",
        marathi: "तुमचे नाव आणि महिन्याची कमाई सांगा जेणेकरून आम्ही योग्य आणि सुरक्षित बचत ध्येय निश्चित करू शकू."
      },
      {
        hindi: "नंबर मिल गया! कृपया ओ टी पी भेजने के लिए बटन दबाएं।",
        english: "Mobile number captured! Please press send OTP button.",
        marathi: "मोबाईल नंबर मिळाला आहे! कृपया ओ टी पी पाठवण्यासाठी क्लिक करा."
      },
      {
        hindi: "मोबाइल नंबर में कम से कम १० अंक होने चाहिए। कृपया दोबारा बोलें।",
        english: "Mobile number must be 10 digits. Please try again.",
        marathi: "मोबाईल नंबर किमान १० अंकाचा असावा. कृपया पुन्हा बोला."
      },
      {
        hindi: "ओ टी पी एक दो तीन चार दर्ज हो गया है। लॉगिन बटन दबाएं।",
        english: "OTP 1 2 3 4 has been entered. Press verify code to login.",
        marathi: "ओ टी पी १ २ ३ ४ प्रविष्ट झाला आहे. लॉगिन करण्यास पुढे जा।"
      }
    ];

    for (const item of mapping) {
      if (item.hindi instanceof RegExp) {
        if (item.hindi.test(text)) {
          if (l === 'english') return text.replace(item.hindi, item.english);
          if (l === 'marathi') return text.replace(item.hindi, item.marathi);
        }
      } else if (typeof item.hindi === 'string' && item.hindi === text) {
        if (l === 'english') return item.english;
        if (l === 'marathi') return item.marathi;
      }
    }
    return text;
  };
  const parseMobileNumberFromSpeech = (transcript: string): string => {
    // Convert native devanagari numerals to standard digits
    const devanagariMap: Record<string, string> = {
      '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
    };
    let cleanTranscript = transcript;
    for (const [key, value] of Object.entries(devanagariMap)) {
      cleanTranscript = cleanTranscript.replaceAll(key, value);
    }

    let text = cleanTranscript.toLowerCase().trim();
    const digitMap: Record<string, string> = {
      'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
      'ek': '1', 'do': '2', 'teen': '3', 'char': '4', 'paanch': '5', 'panch': '5', 'chhah': '6', 'che': '6', 'saat': '7', 'aath': '8', 'nau': '9',
      'शून्य': '0', 'एक': '1', 'दो': '2', 'तीन': '3', 'चार': '4', 'पांच': '5', 'छह': '6', 'छः': '6', 'सात': '7', 'आठ': '8', 'नौ': '9', 'जीरो': '0'
    };

    text = text.replace(/double\s+(\w+)/g, (_, word) => {
      const digit = digitMap[word] || word;
      return digit + digit;
    });
    text = text.replace(/triple\s+(\w+)/g, (_, word) => {
      const digit = digitMap[word] || word;
      return digit + digit + digit;
    });

    const words = text.split(/[\s-]+/);
    let result = "";
    for (const w of words) {
      if (digitMap[w] !== undefined) {
        result += digitMap[w];
      } else {
        const cleaned = w.replace(/\D/g, '');
        result += cleaned;
      }
    }

    const directDigits = cleanTranscript.replace(/\D/g, '');
    if (directDigits.length > result.length) {
      return directDigits;
    }
    return result;
  };

  // Scoped Mic Capture for interactive inputs to repair/complete easily if missed
  const startMicForField = (fieldName: string, textPrompt: string) => {
    voice.current.cancelSpeaking();
    setIsSpeaking(false);
    setActiveVoiceField(fieldName);
    
    // Switch to listening status instantly so that the user does not experience delays or queue blocking
    setVoiceStatusText(selectedLang === 'English' ? "Listening now. Please speak..." : "सुन रहा हूँ... बोलिए");
    
    // Delay speech recognition by 300ms to allow SpeechSynthesis (TTS) to fully release the hardware/audio channel
    setTimeout(() => {
      voice.current.listen(
        selectedLang,
        () => {
          setIsListening(true);
        },
        (transcript) => {
          setIsListening(false);
          setActiveVoiceField(null);

          if (fieldName === 'mobileNumber') {
            const numbers = parseMobileNumberFromSpeech(transcript);
            if (numbers.length >= 10) {
              const cleanedMob = numbers.substring(0, 10);
              setMobileNumber(cleanedMob);
              speakResponse(selectedLang === 'English' ? `Mobile number ${cleanedMob} captured!` : `मोबाइल नंबर मिल गया है: ${cleanedMob}`);
              // Auto-submit mobile number
              setTimeout(() => {
                handleRequestOTP(undefined, cleanedMob);
              }, 1200);
            } else {
              speakResponse(selectedLang === 'English' ? "Please try saying the 10 digits again." : "कृपया दोबारा साफ शब्दों में १० अंकों का नंबर बोलें।");
            }
          } else if (fieldName === 'otpCode') {
            const digits = parseMobileNumberFromSpeech(transcript);
            if (digits.includes("1234") || transcript.includes("ek do teen char") || transcript.includes("1 2 3 4")) {
              setOtpCode("1234");
              speakResponse("Code 1 2 3 4 verified.");
              // Auto submit OTP 1234
              setTimeout(() => {
                handleVerifyOTP(undefined, "1234");
              }, 1205);
            } else if (digits.length === 4) {
              setOtpCode(digits);
              speakResponse(`OTP matches: ${digits}`);
              // Auto submit OTP code
              setTimeout(() => {
                handleVerifyOTP(undefined, digits);
              }, 1200);
            } else {
              speakResponse(selectedLang === 'English' ? "Did not get 4 digits. Please try again." : "वेरिफिकेशन कोड दोबारा साफ से बोलें।");
            }
          } else if (fieldName === 'name') {
            let clearedName = transcript.replace(/(?:mera naam|naam hai|naam|i am|my name is)\s+/gi, '').trim();
            if (!clearedName) {
              clearedName = transcript.trim();
            }
            if (clearedName) {
              setName(clearedName);
              speakResponse(selectedLang === 'English' ? `Name registered as ${clearedName}` : `नाम ${clearedName} रख लिया है।`);
            }
          } else if (fieldName === 'monthlyIncome') {
            const parsed = voice.current.parseVoiceInput(transcript);
            if (parsed.amount) {
              setMonthlyIncome(parsed.amount.toString());
              speakResponse(selectedLang === 'English' ? `Monthly income recorded as ${parsed.amount} rupees.` : `मासिक आय ${parsed.amount} दर्ज कर दी है।`);
            } else {
              const digits = parseMobileNumberFromSpeech(transcript);
              if (digits) {
                setMonthlyIncome(digits);
                speakResponse(selectedLang === 'English' ? `Income set to ${digits}` : `मासिक आय ${digits} दर्ज कर दी है।`);
              } else {
                speakResponse(selectedLang === 'English' ? "Could not extract amount. Please speak it again." : "मासिक आय कृपया दोबारा स्पष्ट बोलें।");
              }
            }
          } else if (fieldName === 'newGoalTitle') {
            let cleared = transcript.replace(/(?:mera lakshya|lakshya hai|lakshya|my goal is|goal is|goal)\s+/gi, '').trim();
            if (!cleared) {
              cleared = transcript.trim();
            }
            if (cleared) {
              setNewGoalTitle(cleared);
              speakResponse(selectedLang === 'English' ? `Goal title set to ${cleared}` : `लक्ष्य का नाम ${cleared} रख दिया है।`);
            }
          } else if (fieldName === 'newGoalTarget') {
            const parsed = voice.current.parseVoiceInput(transcript);
            if (parsed.amount) {
              setNewGoalTarget(parsed.amount.toString());
              speakResponse(selectedLang === 'English' ? `Goal target amount set to ${parsed.amount} rupees.` : `लक्ष्य की राशि ₹${parsed.amount} दर्ज कर दी है।`);
            } else {
              const digits = parseMobileNumberFromSpeech(transcript);
              if (digits) {
                setNewGoalTarget(digits);
                speakResponse(selectedLang === 'English' ? `Amount set to ${digits}` : `लक्ष्य राशि ₹${digits} दर्ज कर दी है।`);
              } else {
                speakResponse(selectedLang === 'English' ? "Could not extract amount. Please speak it again." : "लक्ष्य राशि कृपया दोबारा स्पष्ट बोलें।");
              }
            }
          }
        },
        () => {
          setIsListening(false);
          setActiveVoiceField(null);
        },
        (err) => {
          console.error("Field speech error:", err);
          if (err === 'aborted') return;
          setIsListening(false);
          setActiveVoiceField(null);
          setVoiceStatusText(selectedLang === 'English' ? "Speech timed out. Please try again." : "सिग्नल धीमा था, फिर से प्रयास करें।");
        }
      );
    }, 300);
  };

  // Automated welcome speaking triggers on currentScreen changes
  useEffect(() => {
    if (loading) return;
    
    const triggerWelcomeSpeech = async () => {
      // Small timeout to allow state rendering
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (currentScreen === 'splash') {
        speakResponse("पैसा साथी ऐप शुरू करने के लिए 'Shuru Karen' का बटन दबाएं!");
      } else if (currentScreen === 'login') {
        if (!otpSent) {
          speakResponse("कृपया अपना १० अंकों का मोबाइल नंबर दर्ज करें या बोलकर बताएं।");
        } else {
          speakResponse("आपके मोबाइल नंबर पर चार अंकों का ओ टी पी भेजा गया है। उसे लिखें या बोलें।");
        }
      } else if (currentScreen === 'language') {
        speakResponse("कृपया अपनी भाषा चुनें। Choose your comfortable language.");
      } else if (currentScreen === 'trust') {
        speakResponse("हमारा ऐप शत प्रतिशत सुरक्षित है। हम आपका पैसा नहीं लेते, सिर्फ समझदार सलाह देते हैं।");
      } else if (currentScreen === 'onboarding') {
        speakResponse("अपना नाम और मासिक आय बताएं ताकि हम उत्तम बचत लक्ष्य तय कर सकें।");
      }
    };

    triggerWelcomeSpeech();
    
    return () => {
      voice.current.cancelSpeaking();
    };
  }, [currentScreen, otpSent, loading]);

  // Simulated WhatsApp Handlers
  const initWhatsappChat = (userName: string = 'Rahul') => {
    if (whatsappMessages.length === 0) {
      setWhatsappMessages([
        {
          id: 'wa_init_1',
          sender: 'sathi',
          text: selectedLang === 'English' 
            ? `Namaste ${userName} Ji. Main aapki bachat aur paise se judi madad kar sakti hoon.`
            : `नमस्ते ${userName} जी। मैं आपकी बचत और पैसे से जुड़ी मदद कर सकती हूँ।`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleWaOptionSelect = async (
    optionText: string, 
    action: 'income' | 'expense' | 'goal' | 'schemes' | 'save'
  ) => {
    if (isWaTyping) return;
    
    // Cancel speaking first
    voice.current.cancelSpeaking();
    
    const userMsgId = 'wa_u_' + Math.random().toString(36).substring(2, 9);
    const sathiMsgId = 'wa_s_' + Math.random().toString(36).substring(2, 9);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setWhatsappMessages(prev => [...prev, {
      id: userMsgId,
      sender: 'user',
      text: optionText,
      timestamp: timeStr
    }]);

    setIsWaTyping(true);

    setTimeout(async () => {
      let replyText = "";
      if (action === 'income') {
        replyText = selectedLang === 'English'
          ? "I will assist you in adding your income. Click the button below to open your safe Paisa Saathi ledger."
          : "जरूर! आपकी कमाई (Income) बहीखाते में जोड़ने के लिए, नीचे दिए गए बटन पर क्लिक करके जारी रखें।";
      } else if (action === 'expense') {
        replyText = selectedLang === 'English'
          ? "Sure! Let's track your expense to control budgets. Click below to continue inside Hisab-Kitab tracker."
          : "बिल्कुल! नया खर्च (Expense) दर्ज करने और अपने बजट को नियंत्रित रखने के लिए नीचे 'जारी रखें' बटन दबाएं।";
      } else if (action === 'goal') {
        replyText = selectedLang === 'English'
          ? "Your financial savings score is excellent! Let's check your active Education or Emergency fund goals. Click below."
          : "आपकी वित्तीय सुरक्षा आपातकालीन बचत लक्ष्य की प्रगति ७२% उत्तम है! अपने सक्रीय बचत लक्ष्यों को देखने के लिए नीचे क्लिक करें।";
      } else if (action === 'schemes') {
        replyText = selectedLang === 'English'
          ? "Learn about Government security schemes like Post Office RD, Sukanya Samriddhi Yojana (SSY), and PMSBY. Click below."
          : "पोस्ट ऑफिस आरडी (Post Office RD) सुरक्षित ६.७% ब्याज और सुकन्या समृद्धि बालिका सुरक्षा बचत की पूरी जानकारी के लिए नीचे दबाएं।";
      } else if (action === 'save') {
        replyText = selectedLang === 'English'
          ? "Excellent idea! Every small saving grows safely with Paisa Saathi. Let's chat with our AI guide Sathi on how to save daily. Click below."
          : "बहुत बढ़िया लक्ष्य! 🪙 प्रतिदिन ₹३० बचाकर वर्ष के अंत में ₹११,००० सुरक्षा निधि जोड़ें। बचत गाइड से चैट करने के लिए नीचे जारी रखें।";
      }

      setWhatsappMessages(prev => [...prev, {
        id: sathiMsgId,
        sender: 'sathi',
        text: replyText,
        timestamp: timeStr,
        actionType: action
      }]);

      setIsWaTyping(false);
      speakResponse(replyText);

      // In the background, store this conversation in the existing conversation/chat history for logging & records!
      if (user?.id) {
        try {
          await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              message: `[WhatsApp Quick Action Click] User clicked option: ${optionText}`,
              language: selectedLang
            })
          });
        } catch (e) {
          console.warn("Background-logging failed:", e);
        }
      }
    }, 1000);
  };

  const handleWaCustomSend = async (messageText: string) => {
    if (!messageText.trim() || isWaTyping) return;
    
    // Cancel speaking first
    voice.current.cancelSpeaking();
    
    const userMsgId = 'wa_u_' + Math.random().toString(36).substring(2, 9);
    const sathiMsgId = 'wa_s_' + Math.random().toString(36).substring(2, 9);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setWhatsappMessages(prev => [...prev, {
      id: userMsgId,
      sender: 'user',
      text: messageText,
      timestamp: timeStr
    }]);

    setIsWaTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'demo_user',
          message: messageText,
          language: selectedLang
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiReply = data.ai_response || (selectedLang === 'English' ? "Let's help you manage your wallet budget." : "मैं आपके पैसों को सुरक्षित रूप से बढ़ाने में पूरी मदद करूँगी।");
        
        setWhatsappMessages(prev => [...prev, {
          id: sathiMsgId,
          sender: 'sathi',
          text: aiReply,
          timestamp: timeStr,
          actionType: 'custom'
        }]);

        speakResponse(aiReply);
        if (user?.id) {
          fetchUserDashboardData(user.id);
        }
      } else {
        throw new Error("Chat response failed");
      }
    } catch (exp) {
      const fallbackReply = selectedLang === 'English'
        ? "Got it! Tap 'Continue in Paisa Saathi' to proceed, or let's try another chat question."
        : "जी बिल्कुल! पैसा साथी ऐप में इस विषय पर बात करने के लिए नीचे दिए गए 'जारी रखें' बटन को दबाएं।";

      setWhatsappMessages(prev => [...prev, {
        id: sathiMsgId,
        sender: 'sathi',
        text: fallbackReply,
        timestamp: timeStr,
        actionType: 'custom'
      }]);

      speakResponse(fallbackReply);
    } finally {
      setIsWaTyping(false);
    }
  };

  const handleStartListening = () => {
    voice.current.cancelSpeaking();
    setIsSpeaking(false);
    setVoiceStatusText("सुन रहा हूँ... बोलिए (Listening...)");
    
    // Trigger listen
    voice.current.listen(
      selectedLang,
      () => setIsListening(true),
      (transcript) => {
        handleVoiceTranscript(transcript);
      },
      () => setIsListening(false),
      (error) => {
        console.error("Listening error details:", error);
        if (error === 'aborted') return;
        setIsListening(false);
        
        if (error === 'unsecure_context') {
          setVoiceStatusText("⚠️ HTTPS कनेक्शन की ज़रूरत है। कृपया 'https://' एड्रेस खोलें।");
        } else if (error === 'not-allowed') {
          setVoiceStatusText("⚠️ माइक्रोफ़ोन अनुमति ब्लॉक है! ब्राउज़र सेटिंग्स में अलाउ करें।");
        } else if (error === 'browser_unsupported') {
          setVoiceStatusText("⚠️ ब्राउज़र सपोर्ट नहीं करता (Brave/Firefox में क्रोम खोलें)");
        } else if (error === 'network-error') {
          setVoiceStatusText("⚠️ नेटवर्क या इंटरनेट कनेक्शन की समस्या है।");
        } else {
          setVoiceStatusText("⚠️ सुनने में समस्या हुई। कृपया फिर से बटन दबाकर साफ बोलें।");
        }
      }
    );
  };

  const handleStopListening = () => {
    voice.current.stopListening();
    setIsListening(false);
    setVoiceStatusText("आवाज़ साथी रेडी (Ready)");
  };

  const handleVoiceTranscript = (rawTranscript: string) => {
    setIsListening(false);
    
    // Convert native devanagari numerals to standard digits
    const devanagariMap: Record<string, string> = {
      '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
    };
    let transcript = rawTranscript;
    for (const [key, value] of Object.entries(devanagariMap)) {
      transcript = transcript.replaceAll(key, value);
    }

    setInputVal(transcript); // Reflect transcript in chat input as well

    const parsed = voice.current.parseVoiceInput(transcript);
    
    if (currentScreen === 'login') {
      if (!otpSent) {
        const numbers = transcript.replace(/\D/g, '');
        if (numbers.length >= 10) {
          const cleanedMob = numbers.substring(0, 10);
          setMobileNumber(cleanedMob);
          speakResponse(selectedLang === 'English' ? `Mobile number ${cleanedMob} captured!` : `मोबाइल नंबर मिल गया है: ${cleanedMob}`);
          // Auto-submit mobile number
          setTimeout(() => {
            handleRequestOTP(undefined, cleanedMob);
          }, 1200);
        } else {
          speakResponse(selectedLang === 'English' ? "Please try saying the 10 digits again." : "कृपया दोबारा साफ शब्दों में १० अंकों का नंबर बोलें।");
        }
      } else {
        const otpDigits = transcript.replace(/\D/g, '');
        if (otpDigits.includes("1234") || transcript.includes("ek do teen char") || transcript.includes("1 2 3 4")) {
          setOtpCode("1234");
          speakResponse("Code 1 2 3 4 verified.");
          // Auto-submit OTP
          setTimeout(() => {
            handleVerifyOTP(undefined, "1234");
          }, 1200);
        } else if (otpDigits.length === 4) {
          setOtpCode(otpDigits);
          speakResponse(`OTP matches: ${otpDigits}`);
          // Auto-submit OTP
          setTimeout(() => {
            handleVerifyOTP(undefined, otpDigits);
          }, 1200);
        } else {
          speakResponse(selectedLang === 'English' ? "Did not get 4 digits. Please try again." : "वेरिफिकेशन कोड दोबारा साफ से बोलें।");
        }
      }
    } else if (currentScreen === 'language') {
      const lower = transcript.toLowerCase();
      if (lower.includes("hindi") || lower.includes("हिंदी")) {
        setSelectedLang("Hindi");
        speakResponse("हिंदी भाषा चुन ली गई है। आगे बढ़ने के लिए बटन दबाएं।");
      } else if (lower.includes("english") || lower.includes("अंग्रेज़ी")) {
        setSelectedLang("English");
        speakResponse("English language selected. Click continue.");
      } else if (lower.includes("marathi") || lower.includes("मराठी")) {
        setSelectedLang("Marathi");
        speakResponse("मराठी भाषा निवडली आहे.");
      } else {
        speakResponse("कृपया हिंदी या इंग्लिश कहें।");
      }
    } else if (currentScreen === 'onboarding') {
      // Natural name and income capture
      if (parsed.amount) {
        setMonthlyIncome(parsed.amount.toString());
      }
      
      const nameMatch = transcript.match(/(?:mera naam|naam hai|naam|i am|my name is)\s+([a-zA-Z\u0900-\u097F\s]+)/i);
      if (nameMatch && nameMatch[1]) {
        setName(nameMatch[1].trim());
        speakResponse(`बढ़िया नाम है ${nameMatch[1].trim()}! और आपकी मासिक आय ₹${parsed.amount || monthlyIncome || 'दें'} के साथ आगे चलें?`);
      } else {
        // Fallback: If no explicit match and Name is empty, use the whole sentence
        if (!name) {
          setName(transcript);
          speakResponse(`मैंने आपका नाम ${transcript} रख दिया है। अब मासिक आय बताएं।`);
        } else {
          speakResponse(`आय ₹${parsed.amount || transcript} दर्ज कर दी है।`);
        }
      }
    } else if (currentScreen === 'main') {
      // Smart real-time operations inside the App tabs via voice!
      if (parsed.isExpense && parsed.amount) {
        setNewExpAmount(parsed.amount.toString());
        if (parsed.category) setNewExpCategory(parsed.category);
        if (parsed.title) setNewExpTitle(parsed.title);
        setActiveTab('home');
        handleAddExpenseDirect(parsed.amount, parsed.category || 'Manoranjan', parsed.title || 'वॉइस से जोड़ा');
      } else if (parsed.isSavings && parsed.amount) {
        if (goals.length > 0) {
          handleAddSavingsDirect(goals[0], parsed.amount);
        } else {
          speakResponse("आपका कोई सक्रिय लक्ष्य नहीं है। कृपया पहले नया लक्ष्य बनाएं।");
        }
      } else {
        // Fallback to chat AI response!
        setInputVal(transcript);
        submitChatMessage(transcript);
      }
    }
  };

  const handleAddExpenseDirect = async (amount: number, category: string, title: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          category,
          amount: amount.toString(),
          title: title || `${category} Kharch`
        })
      });
      if (res.ok) {
        fetchUserDashboardData(user.id);
        speakResponse(`बहुत बढ़िया! मैंने आपका ₹${amount} का ${category} खर्च जोड़ दिया है।`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSavingsDirect = async (g: any, amount: number) => {
    if (!user) return;
    try {
      const updatedAccumulated = (g.accumulated_amount || 0) + amount;
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          title: g.title,
          target_amount: g.target_amount,
          accumulated_amount: updatedAccumulated,
          category: g.category
        })
      });
      if (res.ok) {
        await fetch(`/api/goals/${g.id}`, { method: 'DELETE' });
        fetchUserDashboardData(user.id);
        speakResponse(`शाबाश! आपने ${g.title} के लिए ₹${amount} की बचत जमा कर ली है।`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVoiceExpenseTrackerClick = () => {
    voice.current.cancelSpeaking();
    setIsSpeaking(false);
    setIsVoiceTracking(true);
    setVoiceTrackingText(selectedLang === 'English' ? "Listening... Say e.g. 'spent 150 rupees on kirana'" : "सुन रहा हूँ... बोलिए (जैसे: '120 rupaye petrol kharch' या 'किराना 500 रुपये')");

    // Clean, abstract instructional vocal prompt (No numbers or categories, preventing mic echo auto-fill!)
    speakResponse(selectedLang === 'English' ? "Please say your expense now." : "कृपया अपना खर्च बोलिए।");

    // Wait slightly for the vocal prompt to clear before recording to avoid self-mic interference
    setTimeout(() => {
      voice.current.listen(
        selectedLang,
        () => {
          // listening started
        },
        async (transcript) => {
          setIsVoiceTracking(false);
          const parsed = voice.current.parseVoiceInput(transcript);
          const amt = parsed.amount;
          if (amt && amt > 0) {
            const cat = parsed.category || 'Manoranjan';
            const title = parsed.title || transcript || `${cat} Kharch`;
            
            // Add expense to database
            if (user?.id) {
              try {
                const res = await fetch('/api/expenses', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    user_id: user.id,
                    category: cat,
                    amount: amt.toString(),
                    title: title
                  })
                });
                if (res.ok) {
                  fetchUserDashboardData(user.id);
                  const msg = selectedLang === 'English' 
                    ? `Added ${amt} rupees for ${title} under ${cat} category!` 
                    : `₹${amt} का ${title || cat} खर्च जोड़ दिया गया है!`;
                  setVoiceTrackingText(msg);
                  speakResponse(msg);
                } else {
                  setVoiceTrackingText(selectedLang === 'English' ? "Failed to save. Try again." : "बचाने में त्रुटि हुई।");
                }
              } catch (err) {
                console.error("Voice expense save err:", err);
                setVoiceTrackingText("Network error.");
              }
            }
          } else {
            // Fallback parse using pure digits
            const fallbackDigits = parseMobileNumberFromSpeech(transcript);
            const fallbackAmount = Number(fallbackDigits);
            if (fallbackAmount && fallbackAmount > 0) {
              if (user?.id) {
                try {
                  await fetch('/api/expenses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      user_id: user.id,
                      category: 'Manoranjan',
                      amount: fallbackAmount.toString(),
                      title: transcript || 'वॉइस से जोड़ा'
                    })
                  });
                  fetchUserDashboardData(user.id);
                  const msg = selectedLang === 'English' 
                    ? `Added ${fallbackAmount} rupees!` 
                    : `₹${fallbackAmount} का खर्च जोड़ दिया गया है!`;
                  setVoiceTrackingText(msg);
                  speakResponse(msg);
                } catch (e) {
                  setVoiceTrackingText("Error saving expense.");
                }
              }
            } else {
              const errMsg = selectedLang === 'English' 
                ? "Could not hear amount. Please speak clearly like '50 rupees on travel'." 
                : "मुझे पैसे समझ नहीं आये। कृपया स्पष्ट कहें, जैसे: 'किराना 200 रुपये'।";
              setVoiceTrackingText(errMsg);
              speakResponse(errMsg);
            }
          }
        },
        () => {
          setIsVoiceTracking(false);
        },
        (err) => {
          console.error("Voice tracking error:", err);
          setIsVoiceTracking(false);
          setVoiceTrackingText(selectedLang === 'English' ? "Speech capture stopped." : "सुनने का समय समाप्त हुआ।");
        }
      );
    }, 1200);
  };

  const handleVoiceAddExpenseAskClick = () => {
    voice.current.cancelSpeaking();
    setIsSpeaking(false);
    setIsVoiceTracking(true);
    setVoiceTrackingText(selectedLang === 'English' 
      ? "AI asking where you spent... Listening..." 
      : "AI पूछ रहा है कि खर्च कहाँ किया... सुन रहा हूँ..."
    );

    const promptSpeech = selectedLang === 'English' 
      ? "Where did you spend your money?" 
      : "आपने अपना पैसा कहाँ खर्च किया?";
    speakResponse(promptSpeech);

    voice.current.stopListening();

    setTimeout(() => {
      voice.current.listen(
        selectedLang,
        () => {
          // listening started
        },
        async (transcript) => {
          setIsVoiceTracking(false);
          const parsed = voice.current.parseVoiceInput(transcript);
          const amt = parsed.amount;
          if (amt && amt > 0) {
            const cat = parsed.category || 'Manoranjan';
            const title = parsed.title || transcript || `${cat} Kharch`;
            
            if (user?.id) {
              try {
                const res = await fetch('/api/expenses', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    user_id: user.id,
                    category: cat,
                    amount: amt.toString(),
                    title: title
                  })
                });
                if (res.ok) {
                  fetchUserDashboardData(user.id);
                  const msg = selectedLang === 'English' 
                    ? `Added ${amt} rupees for ${title} under ${cat} category!` 
                    : `₹${amt} का ${title || cat} खर्च जोड़ दिया गया है!`;
                  setVoiceTrackingText(msg);
                  speakResponse(msg);
                } else {
                  setVoiceTrackingText(selectedLang === 'English' ? "Failed to save. Try again." : "बचाने में त्रुटि हुई।");
                }
              } catch (err) {
                console.error("Voice expense save err:", err);
                setVoiceTrackingText("Network error.");
              }
            }
          } else {
            const fallbackDigits = parseMobileNumberFromSpeech(transcript);
            const fallbackAmount = Number(fallbackDigits);
            if (fallbackAmount && fallbackAmount > 0) {
              if (user?.id) {
                try {
                  await fetch('/api/expenses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      user_id: user.id,
                      category: 'Manoranjan',
                      amount: fallbackAmount.toString(),
                      title: transcript || 'वॉइस से जोड़ा'
                    })
                  });
                  fetchUserDashboardData(user.id);
                  const msg = selectedLang === 'English' 
                    ? `Added ${fallbackAmount} rupees!` 
                    : `₹${fallbackAmount} का खर्च जोड़ दिया गया है!`;
                  setVoiceTrackingText(msg);
                  speakResponse(msg);
                } catch (e) {
                  setVoiceTrackingText("Error saving expense.");
                }
              }
            } else {
              const errMsg = selectedLang === 'English' 
                ? "Could not hear amount. Please speak clearly like '50 rupees on travel'." 
                : "मुझे पैसे समझ नहीं आये। कृपया स्पष्ट कहें, जैसे: 'किराना 200 रुपये'।";
              setVoiceTrackingText(errMsg);
              speakResponse(errMsg);
            }
          }
        },
        () => {
          setIsVoiceTracking(false);
        },
        (err) => {
          console.error("Voice tracking error during ask:", err);
          setIsVoiceTracking(false);
          setVoiceTrackingText(selectedLang === 'English' ? "Speech capture stopped." : "सुनने का समय समाप्त हुआ।");
        }
      );
    }, 2500); // 2.5s delay to make sure the AI query "Where did you spend..." finished speaking
  };

  const handleVoiceAddGoalAskClick = () => {
    voice.current.cancelSpeaking();
    setIsSpeaking(false);
    setIsVoiceTracking(true);
    setVoiceTrackingText(selectedLang === 'English' 
      ? "AI asking what is your savings goal... Listening..." 
      : "AI पूछ रहा है कि आपका बचत लक्ष्य क्या है... सुन रहा हूँ..."
    );

    const promptSpeech = selectedLang === 'English' 
      ? "What is your savings goal and how much money do you need?" 
      : "आप किस लक्ष्य के लिए पैसा बचाना चाहते हैं और कितने रुपये चाहिए?";
    speakResponse(promptSpeech);

    voice.current.stopListening();

    setTimeout(() => {
      voice.current.listen(
        selectedLang,
        () => {
          // listening started
        },
        async (transcript) => {
          setIsVoiceTracking(false);
          const parsed = voice.current.parseVoiceInput(transcript);
          const title = parsed.goalTitle || parsed.title || transcript || (selectedLang === 'English' ? 'My New Goal' : 'नया लक्ष्य');
          const amt = parsed.goalTarget || parsed.amount || 50000;
          const cat = parsed.category || 'General';

          setNewGoalTitle(title);
          setNewGoalTarget(amt.toString());
          setNewGoalCategory(cat);

          const successMsg = selectedLang === 'English'
            ? `I have filled the goal "${title}" with a target of ${amt} rupees! Click "Save Goal" to save.`
            : `मैंने आपका लक्ष्य "${title}" और ₹${amt} की राशि भर दी है! कृपया "Save Goal" दबाकर इसे सेव करें।`;
          
          setVoiceTrackingText(successMsg);
          speakResponse(successMsg);
        },
        () => {
          setIsVoiceTracking(false);
        },
        (err) => {
          console.error("Voice goal error:", err);
          setIsVoiceTracking(false);
          setVoiceTrackingText(selectedLang === 'English' ? "Speech capture stopped." : "सुनने का समय समाप्त हुआ।");
        }
      );
    }, 2500);
  };
  // --- END OF VOICE ENGINE HOOKS ---

  const handleProfileUpdate = async (updatedFields: any) => {
    if (!user) return false;
    try {
      const res = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          ...updatedFields
        })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user && data.user.name) setName(data.user.name);
        if (data.user && data.user.monthly_income) setMonthlyIncome(data.user.monthly_income.toString());
        if (data.user && data.user.primary_goal) setPrimaryGoal(data.user.primary_goal);
        // Guarantee synchronization of updated profile credentials
        if (data.user && data.user.mobile_number) {
          localStorage.setItem('ps_user_mobile', data.user.mobile_number);
        }
        return true;
      }
    } catch (e) {
      console.error("Error updating profile state:", e);
    }
    return false;
  };

  const handleUpdateChannels = async (updatedConfigs: any[]) => {
    if (!user) return;
    try {
      const res = await fetch('/api/users/update-channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          channels_config: updatedConfigs
        })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (e) {
      console.error("Error updating channels config state:", e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ps_user_mobile');
    setUser(null);
    setMobileNumber('');
    setName('');
    setMonthlyIncome('');
    setOtpSent(false);
    setOtpCode('');
    setOnboardingStep(1);
    setCurrentScreen('splash');
  };

  const downloadUserJourney = () => {
    if (!user) return;
    
    let log = `====================================================\n`;
    log += `📬 PAISA SAATHI - YOUR FINANCIAL SAFAR NAMA (USER JOURNEY REPORT)\n`;
    log += `====================================================\n\n`;
    
    log += `👤 USER PROFILE DETAILS:\n`;
    log += `-----------------------\n`;
    log += `• Name: ${user.name || 'N/A'}\n`;
    log += `• Phone Number: ${user.mobile_number || 'N/A'}\n`;
    log += `• Primary Language: ${selectedLang}\n`;
    log += `• Profession Group: ${user.user_type || 'Gig Worker'}\n`;
    log += `• Registered Income: ₹${user.monthly_income?.toLocaleString('en-IN') || '0'} per month\n`;
    log += `• Financial Health Score: ${user.financial_score || 72}/100\n\n`;
    
    log += `🎯 SAVINGS TARGETS & LAKSHYA:\n`;
    log += `------------------------------\n`;
    if (goals && goals.length > 0) {
      goals.forEach((g, idx) => {
        const pct = g.target_amount ? Math.round((g.accumulated_amount / g.target_amount) * 100) : 0;
        log += `${idx + 1}. [${g.category || 'General'}] ${g.title}\n`;
        log += `   Target Amount: ₹${g.target_amount?.toLocaleString('en-IN') || 0}\n`;
        log += `   Saved Amount:  ₹${g.accumulated_amount?.toLocaleString('en-IN') || 0} (${pct}% complete)\n`;
      });
    } else {
      log += `• No custom goals configured yet.\n`;
    }
    log += `\n`;
    
    log += `💸 KHARCH JOURNAL (TRANSACTIONS ACTIVE):\n`;
    log += `----------------------------------------\n`;
    const userExps = expenses.filter(e => e.user_id === user.id);
    if (userExps.length > 0) {
      userExps.forEach((e, idx) => {
        log += `${idx + 1}. [${e.category || 'Expense'}] ${e.title || ''}\n`;
        log += `   Amount: ₹${e.amount} | Date: ${e.date || 'Today'}\n`;
      });
    } else {
      log += `• No expenses registered yet.\n`;
    }
    log += `\n`;
    
    log += `✨ CHAT INTERACTIVE JOURNEY (PAISA SAATHI COMPANION LOG):\n`;
    log += `--------------------------------------------------------\n`;
    if (messages && messages.length > 0) {
      messages.forEach((m, idx) => {
        log += `[Turn ${idx + 1} - ${m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : 'N/A'}]\n`;
        log += `🗣️ USER: "${m.user_message}"\n`;
        if (m.ai_response) {
          log += `🤖 SAATHI: "${m.ai_response}"\n`;
        } else {
          log += `🤖 SAATHI: [No Text Response or Navigation/Voice Action Triggered]\n`;
        }
        log += `-\n`;
      });
    } else {
      log += `• No conversation logged in this active session yet.\n`;
    }
    
    log += `\n====================================================\n`;
    log += `Generated safely under secure user guidelines\n`;
    log += `Thank you for choosing Paisa Saathi - Aapka Paisa, Aapka Saathi! 🙏\n`;
    log += `====================================================\n`;
    
    const blob = new Blob([log], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Paisa_Saathi_Safar_Nama_${user.name?.replace(/\s+/g, '_') || 'User'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    speakResponse(
      selectedLang === 'English'
        ? "Your safe financial journey has been compiled and downloaded as Safar Nama text file successfully!"
        : "सफ़र नामा फाइल तैयार है। आपकी पूरी बचत यात्रा आपके फ़ोन में सेव कर दी गई है!"
    );
  };

  // 3. Simulated Speech Recognition using native HTML5 Web Speech API!
  const startRecording = () => {
    const customWindow = window as unknown as IWindow;
    const SpeechRecognitionClass = customWindow.SpeechRecognition || customWindow.webkitSpeechRecognition;
    
    if (!SpeechRecognitionClass) {
      setSpeechError("Aapka browser voice recognition support nahi karta. Chrome/Safari use karein.");
      // Simulated voice if browser doesn't support Web Speech API
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        setInputVal("महीने का ₹500 का SIP कैसे शुरू करें?");
      }, 3000);
      return;
    }

    try {
      setSpeechError('');
      const rec = new SpeechRecognitionClass();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = selectedLang === 'Hindi' ? 'hi-IN' : 'en-IN';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onerror = (e: any) => {
        console.error("Voice recognition error: ", e);
        setSpeechError("Sunne mein dikkat hui. Kripya phirse boleya type karein.");
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputVal(transcript);
          // Auto submit after transcription!
          submitChatMessage(transcript);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.error("Voice start fail:", e);
      setIsListening(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleRevertTransaction = async (id: string, amount: number, type: string) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setRevertedIds(prev => [...prev, id]);
        
        const undoMsg = selectedLang === 'English'
          ? `Cleared ledger entry: ₹${amount} has been successfully reverted.`
          : `बहीखाते से ₹${amount} हटा दिया गया है।`;
          
        speakResponse(undoMsg);
        
        if (user) {
          fetchUserDashboardData(user.id);
        }
      } else {
        const errorMsg = selectedLang === 'English' ? "Unable to revert ledger entry." : "बहीखाते से नहीं हटाया जा सका।";
        speakResponse(errorMsg);
      }
    } catch (error) {
      console.error("Error reverting ledger item:", error);
    }
  };

  // 4. AIS Chat integration
  const submitChatMessage = async (overrideMsg?: string) => {
    if (isChatLocked) {
      speakResponse(selectedLang === 'English'
        ? "Your chat timer has ended. Please recharge for 2 Rupees to talk more with Paisa Saathi."
        : "आपकी चैट सीमा समाप्त हो गई है। कृपया बात जारी रखने के लिए ₹2 का रिचार्ज करें।"
      );
      return;
    }

    const textToSend = overrideMsg || inputVal;
    if (!textToSend.trim() || !user) return;

    // Echo user message to interface instantly
    const userMessageObj = {
      id: "chat_user_" + Date.now(),
      user_id: user.id,
      user_message: textToSend,
      ai_response: "",
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessageObj]);
    setInputVal('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          message: textToSend,
          language: selectedLang
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        
        // Speak the advisor's feedback automatically
        if (data && data.ai_response) {
          speakResponse(data.ai_response);
        }

        // Replace last empty model node with actual response
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== userMessageObj.id);
          return [...filtered, data];
        });
        
        // Refresh financial stats just in case the chatbot triggers any action or score change!
        fetchUserDashboardData(user.id);
      } else {
        // Appends error message from bot
        setMessages(prev => [
          ...prev.slice(0, -1),
          { ...userMessageObj, ai_response: "Bhaiya lagta hai server busy hai. Ek bar phirse poochiye! Hum aapke madad ke liye tayaar hain." }
        ]);
      }
    } catch (e) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { ...userMessageObj, ai_response: "Paisa Saathi se sampark nahi ho paa raha hai. Ek baarya internet check karein." }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 5. Add expense transaction
  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpAmount || !user) return;

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          category: newExpCategory,
          amount: newExpAmount,
          title: newExpTitle || `${newExpCategory} Kharch`
        })
      });

      if (res.ok) {
        const data = await res.json();
        setNewExpAmount('');
        setNewExpTitle('');
        // Reload details
        fetchUserDashboardData(user.id);
      }
    } catch (e) {
      console.error("Expense post fail:", e);
    }
  };

  // Home Screen add income & expense handlers
  const handleHomeAddTransaction = async (type: 'income' | 'expense') => {
    if (!homeAmount || !user) return;
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          category: homeCategory,
          amount: homeAmount,
          title: homeTitle || (type === 'income' ? `${homeCategory} Kamai` : `${homeCategory} Kharch`),
          type: type
        })
      });
      if (res.ok) {
        setHomeAmount('');
        setHomeTitle('');
        setAddingIncomeHome(false);
        setAddingExpenseHome(false);
        fetchUserDashboardData(user.id);
        
        const successMsg = type === 'income'
          ? (selectedLang === 'English' ? `Excellent! Successfully added ₹${homeAmount} to income!` : `बहुत बढ़िया! आपकी ₹${homeAmount} की कमाई सफलतापूर्वक जुड़ गयी है। 👍`)
          : (selectedLang === 'English' ? `Success! Successfully loggged ₹${homeAmount} expense!` : `सफल रहा! आपका ₹${homeAmount} का ${homeCategory} खर्च जोड़ दिया गया है।`);
        speakResponse(successMsg);
      }
    } catch (e) {
      console.error("Home direct sum error:", e);
    }
  };

  // Paisa Saathi Didi Voice Companion Logic
  const handleDidiAction = (actionType: 'what_to_do' | 'how_to_save' | 'explain_screen') => {
    voice.current.cancelSpeaking();
    if (actionType === 'what_to_do') {
      const todayIn = expenses
        .filter(exp => exp.type === 'income' && (String(exp.date).toLowerCase().includes('aaj') || String(exp.date).toLowerCase().includes('today') || String(exp.created_at).includes(new Date().toISOString().split('T')[0])))
        .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
      
      let answer = "";
      if (todayIn > 0) {
        answer = selectedLang === 'English'
          ? "You have saved your income today. Spend very carefully and check your savings goal progress!"
          : "आपने आज की कमाई जोड़ ली है। अब सोच-समझकर खर्च करें और लक्ष्य पूरा करने के लिए कुछ पैसे गुल्लक पर डालें!";
      } else {
        answer = selectedLang === 'English'
          ? "You have not added your income today! Let's click the 'Add Income' button first."
          : "आपने आज की कमाई नहीं जोड़ी है। चलिए सबसे पहले होम पेज पर 'कमाई जोड़ें' पर क्लिक करें!";
      }
      setDidiMessage(answer);
      speakResponse(answer);
    } else if (actionType === 'how_to_save') {
      const answer = selectedLang === 'English'
        ? "Your Emergency Fund is 72% complete. Try to save at least ₹50 today and put it in your clay piggy bank."
        : "आपका आपातकालीन गुल्लक लक्ष्य अभी 72% पूरा है। आज कम से कम ₹50 बचाने की कोशिश कीजिये और गुल्लक में डालें!";
      setDidiMessage(answer);
      speakResponse(answer);
    } else if (actionType === 'explain_screen') {
      let answer = "";
      if (activeTab === 'home') {
        answer = selectedLang === 'English'
          ? "This is your Home screen. Here you can see your wallet balance, today's income, expenses, and savings goal progress."
          : "यह आपका होम पेज है। यहाँ आप अपने वॉलेट का कुल बैलेंस, आज की कमाई, आज के खर्च और अपनी आपातकालीन बचत की प्रगति देख सकते हैं।";
      } else if (activeTab === 'chat') {
        answer = selectedLang === 'English'
          ? "This is your Chat assistant. Here you can ask any question about savings, safe investing, or fraud protection."
          : "यह आपका चैट साथी है। यहाँ आप बटन दबाकर मुझसे पैसे की बचत, एसआईपी, या सरकारी योजनाओं के बारे में कोई भी प्रश्न पूछ सकते हैं।";
      } else if (activeTab === 'lakshya') {
        answer = selectedLang === 'English'
          ? "This is your Budget and Expenses page. Here you can track your daily transactions and progress towards savings goals."
          : "यह आपका बजट और खर्च पेज है। यहाँ आप अपने दर्ज किए हुए सभी खर्च देख सकते हैं, और बचत के लक्ष्यों को पूरा होते देख सकते हैं।";
      } else if (activeTab === 'sikhein') {
        answer = selectedLang === 'English'
          ? "This is your Learn page. Here you can learn about Post Office RDs, Digital Gold, and government security schemes."
          : "यह आपका सीखें पेज है। यहाँ आप म्यूचुअल फंड सुरक्षित एसआईपी, डिजिटल गोल्ड और प्रधानमंत्री बीमा जैसी सरकारी योजनाओं के बारे में सीख सकते हैं।";
      } else {
        answer = selectedLang === 'English'
          ? "This is your Profile settings page where you can edit your name, monthly target, language, or log out."
          : "यह आपकी प्रोफाइल सेटिंग्स है। यहाँ आप अपना नाम, मासिक आय बदल सकते हैं, ऐप की भाषा बदल सकते हैं या सुरक्षित रूप से लॉगआउट कर सकते हैं।";
      }
      setDidiMessage(answer);
      speakResponse(answer);
    }
  };

  const handleDidiVoiceInput = async (transcript: string) => {
    setDidiMessage(selectedLang === 'English' ? `You said: "${transcript}"... Thinking...` : `आपने कहा: "${transcript}"... सोच रही हूँ...`);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || "user_ramesh",
          message: transcript,
          language: selectedLang
        })
      });
      if (res.ok) {
        const data = await res.json();
        // Force the response to be 1-3 sentences and answer first
        setDidiMessage(data.ai_response);
        speakResponse(data.ai_response);
        if (user?.id) {
          fetchUserDashboardData(user.id);
        }
      } else {
        const fallback = selectedLang === 'English'
          ? "Let's work together to track your wallet and secure a healthy savings target!"
          : "चलिए मिलकर आपकी रोज़ की कमाई और खर्चों का हिसाब रखें, ताकि भविष्य सुरक्षित रहे!";
        setDidiMessage(fallback);
        speakResponse(fallback);
      }
    } catch (e) {
      console.error(e);
      const fallback = selectedLang === 'English'
        ? "Let's work together to track your wallet and secure a healthy savings target!"
        : "चलिए मिलकर आपकी रोज़ की कमाई और खर्चों का हिसाब रखें, ताकि भविष्य सुरक्षित रहे!";
      setDidiMessage(fallback);
      speakResponse(fallback);
    }
  };

  const toggleDidiListening = () => {
    if (isListening) {
      voice.current.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      voice.current.startListening(
        selectedLang,
        (transcript) => {
          setIsListening(false);
          handleDidiVoiceInput(transcript);
        },
        (err) => {
          setIsListening(false);
          console.error("Didi speech error:", err);
          const retryMsg = selectedLang === 'English' 
            ? "I couldn't hear clearly. Please tap 'Speak to Didi' and try again." 
            : "मुझे ठीक से सुनाई नहीं दिया। कृपया दोबारा बोलें!";
          setDidiMessage(retryMsg);
          speakResponse(retryMsg);
        }
      );
    }
  };

  // Delete an expense
  const handleDeleteExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchUserDashboardData(user!.id);
      }
    } catch (e) {
      console.error("Delete expense fail:", e);
    }
  }

  // Add a new Goal
  const handleAddGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle || !newGoalTarget || !user) return;

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          title: newGoalTitle,
          target_amount: Number(newGoalTarget),
          accumulated_amount: 0,
          category: newGoalCategory
        })
      });

      if (res.ok) {
        setNewGoalTitle('');
        setNewGoalTarget('');
        setNewGoalCategory('Education');
        setIsAddingGoal(false);
        fetchUserDashboardData(user.id);
      }
    } catch (e) {
      console.error("Goal creation error:", e);
    }
  };

  // Delete a Goal
  const handleDeleteGoal = async (id: string) => {
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchUserDashboardData(user!.id);
      }
    } catch (e) {
      console.error("Delete goal error:", e);
    }
  };

  // Quick Action / prompt click
  const handlePromptChipClick = (promptText: string) => {
    setActiveTab('chat');
    submitChatMessage(promptText);
  };

  // Localized title translator
  const translate = (enText: string, hiText: string) => {
    return selectedLang === 'Hindi' ? hiText : enText;
  };

  // Render screens
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 lg:p-8 gap-6 text-slate-800 font-sans">
      
      {/* simulated SMS gateway UI at top */}
      {simulatedSMS && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-11/12 max-w-sm bg-amber-50 border-l-4 border-amber-500 rounded-lg shadow-2xl p-3 z-50 animate-bounce">
          <div className="flex gap-2">
            <Phone className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <div className="text-xs font-bold text-amber-900 tracking-wide">MOCK SMS GATEWAY</div>
              <p className="text-sm text-amber-800 mt-1 font-medium">{simulatedSMS}</p>
              <div className="text-[10px] text-amber-600 font-bold mt-1">Hint: Copy "1234" to login!</div>
            </div>
          </div>
        </div>
      )}

      {/* Main smartphone frame viewport */}
      <div className="w-full max-w-md bg-[#fafdfa] min-h-[760px] max-h-[880px] rounded-[42px] border-[12px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col h-full shrink-0">
        
        {/* Notch & Status Bar */}
        <div className="absolute top-0 inset-x-0 h-10 bg-emerald-800 text-white text-xs px-6 py-2 flex items-center justify-between z-40 font-semibold pointer-events-none">
          <span>9:41</span>
          <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 -top-1" />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-emerald-700 px-1.5 py-0.5 rounded text-emerald-200">5G</span>
            <div className="w-5 h-2.5 border border-white/80 rounded-sm p-0.5 flex">
              <div className="h-full w-full bg-white rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Action Header bar inside App */}
        {currentScreen !== 'splash' && currentScreen !== 'language' && currentScreen !== 'trust' && (
          <header id="app-header-sec" className="bg-emerald-800 pt-10 pb-3 px-4 text-white flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-2">
              {/* Universal Back button */}
              {((currentScreen !== 'login' && currentScreen !== 'splash') || (currentScreen === 'login' && otpSent)) && (
                <button
                  id="header-back-btn"
                  onClick={handleGoBack}
                  className="w-8 h-8 rounded-full bg-emerald-700/60 hover:bg-emerald-650 active:scale-95 transition-all flex items-center justify-center border border-white/20 cursor-pointer shadow-md shrink-0"
                  title="Peeche jayein / Go Back"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-100" />
                </button>
              )}
              
              <button 
                id="header-home-btn"
                onClick={() => {
                  voice.current.cancelSpeaking();
                  voice.current.stopListening();
                  localStorage.removeItem('ps_user_mobile');
                  setUser(null);
                  setMobileNumber('');
                  setName('');
                  setMonthlyIncome('');
                  setOtpSent(false);
                  setOtpCode('');
                  setOnboardingStep(1);
                  setCurrentScreen('login');
                }}
                className="w-8 h-8 rounded-full bg-emerald-700/60 hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center border border-white/30 cursor-pointer shadow-md shrink-0"
                title="Paisa Saathi Logo - Go to login"
              >
                <Landmark className="w-4 h-4 text-emerald-200" />
              </button>
              <div>
                <h1 className="font-bold text-base tracking-wide flex items-center gap-1 text-emerald-50">
                  {txt.appName}
                </h1>
                <p className="text-[10px] text-emerald-200/95 font-medium italic">{txt.slogan}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Trust Tag */}
              <div className="bg-emerald-700/60 border border-emerald-500/30 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                <span>100% Safe</span>
              </div>
              
              {user && (
                <button 
                  onClick={() => setActiveTab('profile')}
                  className="w-8 h-8 rounded-full bg-orange-500 border-2 border-emerald-200 font-extrabold text-xs flex items-center justify-center shadow-inner hover:scale-105 transition-transform"
                >
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </button>
              )}
            </div>
          </header>
        )}

        {/* Scrollable Screen Canvas Container Area */}
        <main className="flex-1 overflow-y-auto pt-10 pb-20 relative flex flex-col">
          {loading ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center my-auto">
              <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
              <p className="text-sm font-semibold text-slate-600">Paisa Saathi taiyar ho raha hai...</p>
              <p className="text-xs text-slate-400 mt-1">Surakshit connect kar rahe hain</p>
            </div>
          ) : (
            <>
              {/* -----------------------------------------------
                  1. SPLASH SCREEN (Green ambient launch page)
                  ----------------------------------------------- */}
              {currentScreen === 'splash' && (
                <div id="splash_screen" className="flex-1 bg-emerald-800 text-white flex flex-col justify-between p-8 -mt-10 pt-16">
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    
                    {/* Glowing gold coin icon container */}
                    <div 
                      onClick={() => setCurrentScreen('login')}
                      className="w-24 h-24 rounded-full bg-amber-400/90 flex items-center justify-center shadow-lg border-4 border-amber-200 animate-pulse mb-8 cursor-pointer active:scale-95 transition-all"
                      title="Click to go to login"
                    >
                      <span className="text-5xl font-black text-emerald-950">₹</span>
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-wide text-emerald-50 mb-2">
                      {txt.appName}
                    </h1>
                    <p className="text-lg text-emerald-200 font-semibold mb-6">
                      {txt.slogan}
                    </p>

                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20 mb-4 animate-bounce">
                      <Award className="w-8 h-8 text-amber-300" />
                    </div>

                    <p className="text-sm text-emerald-100/90 leading-relaxed font-medium max-w-xs px-2">
                      "Apka paisa samajhne aur badhane ka sabse sacha aur sabse saral dost."
                    </p>
                  </div>

                  <div className="space-y-4">
                    <button
                      id="btn-splash-continue"
                      onClick={() => setCurrentScreen('login')}
                      className="w-full bg-white text-emerald-800 py-4 px-6 rounded-2xl font-bold text-lg hover:bg-emerald-50 transition-colors shadow-lg flex items-center justify-center gap-3 active:scale-95"
                    >
                      <span>{txt.shuruKaren}</span>
                      <ArrowRight className="w-5 h-5 text-emerald-800" />
                    </button>
                    <p className="text-center text-[10px] text-emerald-300 font-semibold">
                      {txt.voiceSecured}
                    </p>
                  </div>
                </div>
              )}

              {/* -----------------------------------------------
                  1.1 LOGIN SCREEN (OTP Phone login first)
                  ----------------------------------------------- */}
              {currentScreen === 'login' && (
                <div id="login_screen" className="flex-1 flex flex-col p-6 justify-between pt-12">
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                        <Lock className="w-8 h-8 text-emerald-600 animate-pulse" />
                      </div>
                      <h2 className="text-2xl font-black text-emerald-950">{txt.loginTitle}</h2>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{txt.loginSubtitle}</p>
                    </div>

                    {!otpSent ? (
                      <form onSubmit={(e) => handleRequestOTP(e)} className="space-y-4">
                        <div>
                          <label className="block text-xs font-black text-slate-600 mb-1">{txt.phoneLabel}</label>
                          <div className="relative flex items-center">
                            <span className="absolute left-3.5 text-slate-400 font-extrabold text-sm">+91</span>
                            <input
                              type="tel"
                              required
                              placeholder={txt.phonePlaceholder}
                              maxLength={10}
                              value={mobileNumber}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setMobileNumber(val);
                                if (val.length === 10) {
                                  // Auto-submit mobile number when 10 digits entered
                                  handleRequestOTP(undefined, val);
                                }
                              }}
                              className="w-full p-3.5 pl-14 pr-12 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-sm font-bold tracking-widest text-[#222]"
                            />
                            <button
                              type="button"
                              onClick={() => startMicForField('mobileNumber', selectedLang === 'English' ? "Please say your ten digit mobile number" : "कृपया अपना १० अंकों का मोबाइल नंबर बोलें।")}
                              className={`absolute right-2 p-2 rounded-lg transition-all active:scale-90 ${activeVoiceField === 'mobileNumber' ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                              title="Click to speak mobile number"
                            >
                              <Mic className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <button
                          type="submit"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                          <span>{txt.otpButton}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={(e) => handleVerifyOTP(e)} className="space-y-4">
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-150 text-center">
                          <p className="text-xs text-emerald-800 font-bold">
                            {txt.optSentMessage} <b className="text-sm text-emerald-950 font-black">+91 {mobileNumber}</b>
                          </p>
                          <button 
                            type="button" 
                            onClick={() => setOtpSent(false)} 
                            className="text-xs text-emerald-650 hover:underline font-bold mt-1"
                          >
                            {txt.changeNumber}
                          </button>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1 uppercase text-left">{txt.otpLabel}</label>
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              required
                              maxLength={4}
                              placeholder={txt.otpPlaceholder}
                              value={otpCode}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setOtpCode(val);
                                if (val.length === 4) {
                                  // Auto-submit OTP code when 4 digits entered
                                  handleVerifyOTP(undefined, val);
                                }
                              }}
                              className="w-full p-3.5 pr-12 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-center text-lg font-black tracking-widest text-[#222]"
                            />
                            <button
                              type="button"
                              onClick={() => startMicForField('otpCode', selectedLang === 'English' ? "Please say the 4 digits verification code" : "कृपया अपना चार अंकों का वेरिफिकेशन कोड बोलें।")}
                              className={`absolute right-2 p-2 rounded-lg transition-all active:scale-90 ${activeVoiceField === 'otpCode' ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-650 hover:bg-slate-200'}`}
                              title="Click to speak OTP code"
                            >
                              <Mic className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                          <span>{txt.otpVerify}</span>
                        </button>
                      </form>
                    )}

                    {errorMsg && <p className="text-xs text-rose-500 font-bold text-center mt-3">{errorMsg}</p>}

                    {/* Interactive 2-Min Demo Walkthrough Video Button */}
                    <div className="mt-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-250 p-4 rounded-2xl shadow-3xs flex flex-col space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-emerald-600 rounded-lg text-white">
                          <Video className="w-4 h-4 text-white animate-pulse" />
                        </span>
                        <div className="text-left">
                          <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-emerald-800 leading-none">
                            {selectedLang === 'English' ? "Product Walkthrough" : "कैसे इस्तेमाल करें"}
                          </h4>
                          <span className="text-[8px] text-slate-500 font-bold block">
                            {selectedLang === 'English' ? "Watch automated 2-minute journey & walkthrough" : "२-मिनट का आसान लाइव वीडियो गाइड देखें"}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          voice.current.cancelSpeaking();
                          setShowDemoPlayer(true);
                        }}
                        className="w-full bg-slate-900 text-amber-400 font-black py-2.5 px-3 rounded-xl text-[10px] uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5 hover:bg-slate-800 cursor-pointer active:scale-95 transition-all"
                      >
                        <span>{selectedLang === 'English' ? "Play Demo Video 🎥" : "कैसे इस्तेमाल करें 🎥"}</span>
                      </button>
                    </div>

                    {/* Simulation Shortcut Buttons for easy PM pitching */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 text-center">💡 Quick Testing Simulation Tools</div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMobileNumber("9876543210");
                            setOtpSent(true);
                            setOtpCode("1234");
                            speakResponse("Ramesh Kumar user details simulated. Click Verify OTP button to login.");
                          }}
                          className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-[10px] font-bold border border-amber-200 transition-all active:scale-95 text-left"
                        >
                          👤 Ramesh (Existing)
                          <div className="text-[8px] text-amber-700/80 font-semibold mt-0.5">Auto login to Profile Tab</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const randMob = "9" + Math.floor(100000000 + Math.random() * 900000000).toString();
                            setMobileNumber(randMob);
                            setOtpSent(true);
                            setOtpCode("1234");
                            speakResponse("New registration simulated. Click Verify OTP button to begin profile onboarding.");
                          }}
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 rounded-lg text-[10px] font-bold border border-emerald-200 transition-all active:scale-95 text-left"
                        >
                          🆕 New User Login
                          <div className="text-[8px] text-emerald-700/80 font-semibold mt-0.5">Redirects to profile setup</div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* -----------------------------------------------
                  2. LANGUAGE SELECTION SCREEN
                  ----------------------------------------------- */}
              {currentScreen === 'language' && (
                <div id="lang_screen" className="flex-1 flex flex-col p-6 pt-4">
                  <div className="flex items-center justify-between mb-4 w-full">
                    <button
                      onClick={handleGoBack}
                      className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-emerald-800 transition-all flex items-center gap-1.5 font-bold text-xs cursor-pointer active:scale-95 border border-slate-100 bg-white shadow-xs"
                    >
                      <ArrowLeft className="w-4 h-4 text-emerald-700" />
                      <span>Peeche jayein / Back</span>
                    </button>
                  </div>
                  
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-extrabold text-emerald-950">Bhasha Chunein</h2>
                    <p className="text-sm text-slate-500 mt-1 font-semibold">Choose your language / अपनी भाषा चुनें</p>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[360px] pr-1">
                    {[
                      { code: 'hi', label: 'हिंदी', local: 'Hindi', flag: '🇮🇳' },
                      { code: 'en', label: 'English', local: 'English', flag: '🇬🇧' },
                      { code: 'mr', label: 'मराठी', local: 'Marathi', flag: '🇮🇳' },
                      { code: 'bn', label: 'বাংলা', local: 'Bengali', flag: '🇮🇳' },
                      { code: 'ta', label: 'தமிழ்', local: 'Tamil', flag: '🇮🇳' },
                      { code: 'te', label: 'తెలుగు', local: 'Telugu', flag: '🇮🇳' }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLang(lang.local);
                          localStorage.setItem('ps_user_lang', lang.local);
                          if (user && user.id) {
                            handleProfileUpdate({ language: lang.local });
                          }
                          if (lang.local === 'English') {
                            // Cancel speaking any stale Hindi, say confirmation in English instantly
                            voice.current.cancelSpeaking();
                            setTimeout(() => {
                              speakResponse("English language selected. Click continue.");
                            }, 100);
                          } else if (lang.local === 'Hindi') {
                            voice.current.cancelSpeaking();
                            setTimeout(() => {
                              speakResponse("हिंदी भाषा चुन ली गई है। आगे बढ़ने के लिए बटन दबाएं।");
                            }, 100);
                          } else if (lang.local === 'Marathi') {
                            voice.current.cancelSpeaking();
                            setTimeout(() => {
                              speakResponse("मराठी भाषा निवडली आहे.");
                            }, 100);
                          }
                        }}
                        className={`w-full p-4 rounded-xl border flex items-center justify-between text-left transition-all ${
                          selectedLang === lang.local
                            ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold scale-[1.01]'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl shrink-0">{lang.flag}</span>
                          <div>
                            <div className="font-bold text-slate-800">{lang.label}</div>
                            <div className="text-xs text-slate-500">{lang.local}</div>
                          </div>
                        </div>
                        {selectedLang === lang.local && (
                          <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs shrink-0">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 space-y-3 shrink-0">
                    <p className="text-center text-[10px] text-slate-400 font-semibold italic">
                      💡 Aap isse baad mein profile screen se kabhi bhi badal sakte hain.
                    </p>
                    <button
                      onClick={() => setCurrentScreen('trust')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg py-4 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-95"
                    >
                      <span>Aage Badhein</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* -----------------------------------------------
                  3. TRUST SCREEN (Data safety reassurance)
                  ----------------------------------------------- */}
              {currentScreen === 'trust' && (
                <div id="trust_screen" className="flex-1 flex flex-col p-6 pt-4">
                  <div className="flex items-center justify-between mb-4 w-full">
                    <button
                      onClick={handleGoBack}
                      className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-emerald-800 transition-all flex items-center gap-1.5 font-bold text-xs cursor-pointer active:scale-95 border border-slate-100 bg-white shadow-xs"
                    >
                      <ArrowLeft className="w-4 h-4 text-emerald-700" />
                      <span>Peeche jayein / Back</span>
                    </button>
                  </div>

                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-8 h-8 text-emerald-600 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-emerald-950">Aapka Data Surakshit Hai</h2>
                    <p className="text-sm text-slate-500 font-semibold">Your data is completely safe & verified</p>
                  </div>

                  <div className="space-y-3.5 flex-1">
                    {[
                      { title: "Bank details kabhi share nahi", detail: "Bank details are never shared with anyone. Secure credentials.", icon: <Lock className="w-5 h-5 text-emerald-600" /> },
                      { title: "Koi chupi fees nahi (Hidden costs)", detail: "This application is absolutely free. No premium charges.", icon: <AlertTriangle className="w-5 h-5 text-emerald-600" /> },
                      { title: "Encrypted aur bilkul surakshit", detail: "Information is fully encrypted using safety protocols.", icon: <Shield className="w-5 h-5 text-emerald-600" /> },
                      { title: "Aap apna data control karte hain", detail: "Your profile details are owned by you alone.", icon: <User className="w-5 h-5 text-emerald-600" /> }
                    ].map((card, idx) => (
                      <div key={idx} className="p-4 bg-white border border-slate-100 rounded-xl flex gap-3 shadow-xs">
                        <div className="bg-emerald-50 rounded-lg p-2.5 shrink-0 self-start">
                          {card.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{card.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{card.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 mt-auto">
                    <button
                      onClick={() => setCurrentScreen('onboarding')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg py-4 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-95"
                    >
                      <span>Mujhe Vishwas Hai ✓</span>
                    </button>
                    <p className="text-center text-[10px] text-slate-400 font-medium mt-2">
                      “Aapka Paisa, Aapka Saathi” is trusted by 50K+ drivers & gig partners.
                    </p>
                  </div>
                </div>
              )}

              {/* -----------------------------------------------
                  4. ONBOARDING SCREEN (New User Profile Setup)
                  ----------------------------------------------- */}
              {currentScreen === 'onboarding' && (
                <div id="onboarding_screen" className="flex-1 flex flex-col p-6">
                  
                  {/* Step Progress Tracker */}
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-4">
                    <span>PROGRESS</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Step 1 of 1 (Final)</span>
                  </div>
                  
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mb-6">
                    <div 
                      className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300 w-full"
                    />
                  </div>

                  {/* STEP 1: Basic Profile Info */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-xl font-extrabold text-emerald-950 mb-1">Aapke baare mein batayein</h3>
                    <p className="text-xs text-slate-500 mb-5 font-semibold">Taki hum sahi bachat guidance choose kar sakein.</p>

                    <div className="space-y-4 flex-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">AAPKA NAAM / YOUR NAME</label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            placeholder="Ramesh Kumar (जैसे)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3.5 pr-12 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-sm font-semibold text-slate-800"
                          />
                          <button
                            type="button"
                            onClick={() => startMicForField('name', "कृपया अपना पूरा नाम बोलें।")}
                            className={`absolute right-2 p-2 rounded-lg transition-all active:scale-90 ${activeVoiceField === 'name' ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            title="Click to speak your name"
                          >
                            <Mic className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">MAASIK AAY / MONTHLY INCOME (₹)</label>
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            placeholder="25000 (जैसे)"
                            value={monthlyIncome}
                            onChange={(e) => setMonthlyIncome(e.target.value)}
                            className="w-full p-3.5 pr-12 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-sm font-semibold text-slate-800"
                          />
                          <button
                            type="button"
                            onClick={() => startMicForField('monthlyIncome', "कृपया अपनी मासिक आय बोलकर बताएं।")}
                            className={`absolute right-2 p-2 rounded-lg transition-all active:scale-90 ${activeVoiceField === 'monthlyIncome' ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            title="Click to speak monthly income"
                          >
                            <Mic className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2">MUKHYA LAKSHYA / PRIMARY GOAL</label>
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {[
                            { label: 'Emergency Fund / Aapat nidhi', icon: <Wallet className="w-4 h-4" /> },
                            { label: 'Bachi ki padhai / Child education', icon: <Award className="w-4 h-4" /> },
                            { label: 'Ghar kharidna / Home purchase', icon: <Landmark className="w-4 h-4" /> },
                            { label: 'Shaadi / Marriage', icon: <Check className="w-4 h-4" /> },
                            { label: 'Retirement / Sevanivrutti', icon: <Calendar className="w-4 h-4" /> }
                          ].map((goalOption) => (
                            <button
                              key={goalOption.label}
                              type="button"
                              onClick={() => setPrimaryGoal(goalOption.label)}
                              className={`w-full p-3 text-left rounded-xl border text-xs font-bold flex items-center gap-3 transition-all ${
                                primaryGoal === goalOption.label
                                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                                  : 'border-slate-200 bg-white text-slate-600'
                              }`}
                            >
                              <span className={`p-1 rounded-md ${primaryGoal === goalOption.label ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}>
                                {goalOption.icon}
                              </span>
                              <span>{goalOption.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!name) {
                            setErrorMsg('Aapka naam likhna zaroori hai.');
                            return;
                          }
                          if (!monthlyIncome) {
                            setErrorMsg('Kripya apni maasik aay bharhein.');
                            return;
                          }
                          setErrorMsg('');
                          setLoading(true);
                          
                          // Await profile update API before transition to eliminate database write race states
                          const success = await handleProfileUpdate({
                            name,
                            monthly_income: Number(monthlyIncome),
                            primary_goal: primaryGoal,
                            language: selectedLang
                          });
                          
                          setLoading(false);
                          if (success) {
                            if (user?.id) {
                              fetchUserDashboardData(user.id);
                            }
                            setCurrentScreen('main');
                            setActiveTab('home');
                            const welcomeText = selectedLang === 'English'
                              ? `Namaste ${name} Ji. I am your Paisa Saathi. Come, let's manage your money better today.`
                              : `नमस्ते ${name} जी। मैं आपका पैसा साथी हूँ। चलिए आज आपके पैसे को और बेहतर तरीके से मैनेज करते हैं।`;
                            setHasGreetedSession(true);
                            speakResponse(welcomeText, selectedLang);
                          } else {
                            setErrorMsg("Profile save karne mein dikqat hui. Kripya dubaara koshish karein.");
                          }
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform"
                      >
                        <span>Profile Poori Karein ✓</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      {errorMsg && <p className="text-xs text-rose-500 font-bold text-center mt-2">{errorMsg}</p>}
                    </div>
                  </div>

                  {/* Trust Footer message */}
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl mt-4 text-center">
                    <p className="text-[10px] text-slate-400 font-bold mb-1">🔒 SURAKSHA GUARANTEED</p>
                    <p className="text-[9px] text-slate-400 leading-normal">
                      Paisa Saathi kisi bhi rashi ka nirdesh nahi leta aur safe investment guidance pradan karta hai. PMJDY (Jan Dhan) compatible.
                    </p>
                  </div>
                </div>
              )}

              {/* -----------------------------------------------
                  5. MAIN HOMEPAGE / WORKSPACE
                  ----------------------------------------------- */}
              {currentScreen === 'main' && user && (
                <div className="w-full max-w-xl mx-auto px-4 py-3 flex-1 flex flex-col space-y-5">
                  {activeTab === 'home' && (
                    <div className="space-y-5 flex-1 flex flex-col pb-6">
                      
                      {/* PROMINENT STORY DEMO BANNER FOR USER COMPREHENSION */}
                      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-4 shadow-md text-left relative overflow-hidden text-slate-100 animate-fadeIn">
                        <div className="absolute top-0 right-0 p-2 text-2xl animate-spin-slow opacity-15 select-none">🎥</div>
                        <div className="flex gap-3.5 items-start">
                          <span className="p-3 bg-amber-400 rounded-2xl text-slate-950 shrink-0 shadow-lg">
                            <Video className="w-5 h-5 text-slate-950 stroke-[2.5] animate-pulse" />
                          </span>
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-[12px] text-amber-300 uppercase tracking-wider">
                              {selectedLang === 'English' ? `🎥 Play Demo: ${getDynamicStoryTitle()}` : `🎥 कैसे इस्तेमाल करें: ${getDynamicStoryTitle()}`}
                            </h4>
                            <p className="text-[10px] text-slate-300 font-medium leading-relaxed">
                              {selectedLang === 'English' 
                                ? `Experience '${getDynamicStoryTitle()}' showing how simple voice inputs organize savings and unlock welfare coverages.`
                                : `देखें कैसे '${getDynamicStoryTitle()}' के माध्यम से आवाज़ से आसान बहीखाता मैनेज कर बचत और सरकारी बीमा योजनाओं का भरपूर लाभ उठाया जा सकता है।`}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                voice.current.cancelSpeaking();
                                setShowDemoPlayer(true);
                              }}
                              className="mt-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-2 px-4 rounded-xl text-[10px] uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                            >
                              <span>{selectedLang === 'English' ? "How to Use ▶" : "कैसे इस्तेमाल करें ▶"}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* INTERACTION PREFERENCE PICKER (Requirement 1) */}
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-150 rounded-3xl p-4 shadow-3xs text-left relative overflow-hidden">
                        <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-200/20 rounded-full blur-lg"></div>
                        <h4 className="font-extrabold text-[11px] tracking-wider uppercase text-emerald-800 font-sans mb-3 flex items-center gap-1.5">
                          💬 {selectedLang === 'English' ? "How would you like to interact with Paisa Saathi?" : "आप पैसा साथी का उपयोग कैसे करना चाहेंगे?"}
                        </h4>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            id="wa-opt-whatsapp"
                            type="button"
                            onClick={() => {
                              setInteractionMode('whatsapp');
                              initWhatsappChat(user?.name || 'Rahul');
                              speakResponse(
                                selectedLang === 'English'
                                  ? "Welcome to Paisa Saathi simulated WhatsApp chat! Ask standard questions or use quick filters."
                                  : "पैसा साथी व्हाट्सएप्प चैट में आपका स्वागत है! बोलकर या बटन दबाकर बातचीत करें।"
                              );
                            }}
                            className={`py-3 px-2 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition-all text-xs font-bold gap-1 border ${
                              interactionMode === 'whatsapp'
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-md scale-[1.03]'
                                : 'bg-white border-slate-150 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/10'
                            }`}
                          >
                            <span className="text-xl select-none">💚</span>
                            <span className="text-[11px] font-black">WhatsApp</span>
                          </button>

                          <button
                            id="wa-opt-voice"
                            type="button"
                            onClick={() => {
                              startVoiceCall();
                            }}
                            className="py-3 px-2 bg-white border border-slate-150 text-slate-700 hover:border-blue-400 hover:bg-blue-50/10 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition-all text-xs font-bold gap-1 border animate-pulse"
                          >
                            <span className="text-xl select-none">📞</span>
                            <span className="text-[11px] font-black">Voice Call</span>
                          </button>

                          <button
                            id="wa-opt-app"
                            type="button"
                            onClick={() => {
                              setInteractionMode('app');
                              speakResponse(
                                selectedLang === 'English'
                                  ? "Paisa Saathi original application view activated."
                                  : "पैसा साथी आसान मोबाइल बहीखाता सक्रीय है।"
                              );
                            }}
                            className={`py-3 px-2 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition-all text-xs font-bold gap-1 border ${
                              interactionMode === 'app'
                                ? 'bg-amber-600 border-amber-600 text-white shadow-md scale-[1.03]'
                                : 'bg-white border-slate-150 text-slate-700 hover:border-amber-400'
                            }`}
                          >
                            <span className="text-xl select-none">📱</span>
                            <span className="text-[11px] font-black">App Mode</span>
                          </button>
                        </div>
                      </div>

                      {/* CONDITIONALLY RENDER BETWEEN WHATSAPP SIMULATION AND NORMAL APP HOME CONTROLS */}
                      {interactionMode === 'whatsapp' ? (
                        /* SIMULATED WHATSAPP EXPERIENCE SCREEN (Requirement 2, 3, 4, 5, 6, 7, 8, 9) */
                        <div id="simulated-whatsapp-screen" className="border border-slate-300 bg-[#e5ddd5] rounded-3xl overflow-hidden flex flex-col h-[520px] shadow-lg relative font-sans animate-fadeIn">
                          
                          {/* WhatsApp Green Header Banner (Requirement 3) */}
                          <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-sm">
                            <div className="flex items-center gap-2">
                              {/* Round Profile Avatar */}
                              <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-250 flex items-center justify-center text-xl shadow-inner shrink-0 text-slate-800">
                                👩
                              </div>
                              <div className="text-left">
                                <h3 className="font-extrabold text-sm leading-tight flex items-center gap-1">
                                  Paisa Saathi Didi
                                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-ping"></span>
                                </h3>
                                <p className="text-[10px] text-emerald-100 font-medium">Online (सलाहकार ऑनलाइन है)</p>
                              </div>
                            </div>
                            
                            {/* Demo Simulation Badge Top-Right Corner (Requirement 7) */}
                            <div className="flex flex-col items-end gap-1">
                              <span className="bg-amber-50 text-amber-800 border border-amber-450 text-[8px] font-black uppercase px-2 py-0.5 rounded-full select-none">
                                Demo Mode – Simulation
                              </span>
                            </div>
                          </div>

                          {/* WhatsApp Chat Area / Scroll Container */}
                          <div id="whatsapp-chat-body" className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col" style={{ backgroundImage: "radial-gradient(#dfdcd6 1px, transparent 1.5px)", backgroundSize: "16px 16px" }}>
                            
                            {/* Encryption System message */}
                            <div className="bg-amber-100/85 text-slate-700 text-[9px] font-bold py-1.5 px-3 rounded-lg border border-amber-200 text-center max-w-xs mx-auto shadow-3xs leading-relaxed">
                              🔒 Messages are secure. This is a simulated WhatsApp flow mapped to the live AI service.
                            </div>

                            {whatsappMessages.map((msg) => {
                              const isSelf = msg.sender === 'user';
                              return (
                                <div key={msg.id} className={`flex flex-col max-w-[85%] ${isSelf ? 'self-end' : 'self-start'} animate-scaleUp`}>
                                  
                                  {/* Chat bubble body */}
                                  <div className={`p-3 rounded-2xl shadow-3xs relative text-left border ${
                                    isSelf 
                                      ? 'bg-[#dcf8c6] border-[#c1e7a5] text-slate-900 rounded-tr-none' 
                                      : 'bg-white border-slate-150 text-slate-950 rounded-tl-none'
                                  }`}>
                                    <p className="text-xs font-bold leading-relaxed whitespace-pre-line">{msg.text}</p>
                                    
                                    {/* Action redirect block inside Sathi bubble (Requirement 5) */}
                                    {!isSelf && msg.actionType && (
                                      <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                                        <span className="text-[9px] text-[#128C7E] font-extrabold uppercase tracking-wide">
                                          ★ Paisa Saathi App Integration
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            // Handle redirection click
                                            if (msg.actionType === 'income') {
                                              setActiveTab('lakshya');
                                              speakResponse(selectedLang === 'English' ? "Opening Lakshya Ledger page." : "दैनिक बहीखाता पन्ना आपके लिए खुल गया है।");
                                            } else if (msg.actionType === 'expense') {
                                              setActiveTab('lakshya');
                                              setIsAddingExpense(true);
                                              speakResponse(selectedLang === 'English' ? "Opening expense tracking modal." : "नया खर्च दर्ज करने के लिए फॉर्म खोल दिया है।");
                                            } else if (msg.actionType === 'goal') {
                                              setActiveTab('lakshya');
                                              setIsAddingGoal(true);
                                              speakResponse(selectedLang === 'English' ? "Opening savings goal tracker." : "बचत लक्ष्य की ब्यौरा आपके सामने है।");
                                            } else if (msg.actionType === 'schemes') {
                                              setActiveTab('sikhein');
                                              speakResponse(selectedLang === 'English' ? "Opening safe investment learning hub." : "निवेश और सरकारी योजनाओं का सीखें पन्ना खुल गया है।");
                                            } else if (msg.actionType === 'save') {
                                              setActiveTab('chat');
                                              speakResponse(selectedLang === 'English' ? "Opening chat consultation with advisor." : "बचत विशेषज्ञ चैट चालू है।");
                                            } else {
                                              setActiveTab('chat');
                                            }
                                          }}
                                          className="w-full bg-[#128C7E] hover:bg-[#075e54] active:scale-95 text-white font-extrabold py-2 px-3 rounded-xl text-[10px] uppercase tracking-wide shadow-3xs flex items-center justify-center gap-1 transition-transform cursor-pointer"
                                        >
                                          <span>Continue in Paisa Saathi App ➜</span>
                                        </button>
                                      </div>
                                    )}

                                    {/* Simulated chat time badge */}
                                    <span className="text-[8px] text-slate-400 block text-right mt-1 font-semibold">{msg.timestamp}</span>
                                  </div>
                                </div>
                              );
                            })}

                            {/* WhatsApp Simulated Typing Loader indicator */}
                            {isWaTyping && (
                              <div className="bg-white border border-slate-150 py-2.5 px-4 rounded-2xl rounded-tl-none self-start flex items-center gap-1 shadow-3xs animate-pulse">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0s]"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                <span className="text-[10px] text-slate-400 font-bold ml-1.5">Paisa Saathi typing...</span>
                              </div>
                            )}
                          </div>

                          {/* Quick Actions Suggestions overlay inside Chat Screen (Requirement 4) */}
                          <div className="bg-white/95 border-t border-slate-200 p-2 shrink-0 flex flex-col gap-1 z-30">
                            <span className="text-[8px] text-slate-400 font-black uppercase text-left tracking-widest pl-1">
                              💡 {selectedLang === 'English' ? "Quick Actions Menu (Select one)" : "त्वरित विकल्प सूची (एक चुनें)"}
                            </span>
                            <div className="flex gap-1.5 overflow-x-auto pb-1 Scrollbar-hide px-0.5">
                              {[
                                { id: 'income', label: "Income Add Karein" },
                                { id: 'expense', label: "Expense Add" },
                                { id: 'goal', label: "Savings Goal Dekhein" },
                                { id: 'schemes', label: "Sarkari Yojana Dekhein" },
                                { id: 'save', label: "Mujhe Paise Bachane Hain" }
                              ].map((opt) => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => handleWaOptionSelect(opt.label, opt.id as any)}
                                  className="shrink-0 bg-slate-50 hover:bg-[#e2f5e9] border border-slate-200 hover:border-emerald-300 rounded-full py-1.5 px-3 text-[10px] font-black text-slate-700 hover:text-emerald-800 transition-colors cursor-pointer active:scale-95"
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* WhatsApp Input box and Microphone voice trigger (Requirement 6) */}
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const form = e.currentTarget;
                              const input = form.elements.namedItem('wa-text-input') as HTMLInputElement;
                              if (input && input.value.trim()) {
                                handleWaCustomSend(input.value);
                                input.value = '';
                              }
                            }}
                            className="bg-[#f0f0f0] border-t border-slate-200 p-2 flex items-center gap-2 shrink-0 pr-3"
                          >
                            
                            {/* Voice Button using existing speech functionality */}
                            <button
                              type="button"
                              onClick={() => {
                                if (isListening) {
                                  voice.current.stopListening();
                                  setIsListening(false);
                                } else {
                                  voice.current.cancelSpeaking();
                                  voice.current.listen(
                                    selectedLang,
                                    () => setIsListening(true),
                                    (transcript) => {
                                      handleWaCustomSend(transcript);
                                    },
                                    () => setIsListening(false),
                                    () => setIsListening(false)
                                  );
                                }
                              }}
                              className={`w-9 h-9 rounded-full flex items-center justify-center shadow-3xs cursor-pointer active:scale-90 transition-transform ${
                                isListening 
                                  ? 'bg-[#128C7E] text-white animate-pulse ring-4 ring-emerald-300' 
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
                              }`}
                            >
                              {isListening ? "🔴" : "🎤"}
                            </button>

                            <input
                              name="wa-text-input"
                              placeholder={selectedLang === 'English' ? "Type message..." : "यहाँ सन्देश लिखें..."}
                              className="flex-1 bg-white border border-slate-250 py-2 px-3 rounded-full text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 shadow-inner"
                              disabled={isWaTyping}
                            />

                            <button
                              type="submit"
                              className="w-8 h-8 rounded-full bg-[#128C7E] hover:bg-[#075e54] text-white flex items-center justify-center font-bold text-xs shadow-3xs active:scale-90"
                            >
                              ➔
                            </button>
                          </form>
                        </div>
                      ) : (
                        <>
                          {/* SAATHI SAVING TIPS PANEL */}
                      <div className="bg-[#f8fafc] border border-slate-200 rounded-3xl p-5 shadow-3xs text-slate-805 space-y-4">
                        {/* Header Row */}
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-amber-500 text-lg">✨</span>
                              <h4 className="font-extrabold text-xs tracking-wider uppercase text-slate-700 flex items-center gap-1.5 font-sans">
                                {selectedLang === 'English' ? "SAATHI SAVING TIPS" : "साथी बचत सलाह"}
                              </h4>
                            </div>
                            <span className="text-[9px] text-[#16a34a] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold uppercase">
                              {selectedLang === 'English' ? "Expert Guide" : "विशेषज्ञ गाइड"}
                            </span>
                          </div>
                          
                          {/* Tabs Row - Structured in a clean 5-column grid to forbid slider/horizontal scroll discomfort */}
                          <div className="grid grid-cols-5 gap-1 bg-slate-200/50 p-1 rounded-xl border border-slate-200 w-full overflow-hidden shrink-0">
                            {[
                              { id: 'day', labelHi: 'आज', labelEn: 'Today' },
                              { id: 'weekly', labelHi: 'हफ्ता', labelEn: 'Weekly' },
                              { id: 'monthly', labelHi: 'महीना', labelEn: 'Monthly' },
                              { id: 'quarterly', labelHi: 'तिमाही', labelEn: '3-Month' },
                              { id: 'yearly', labelHi: 'सालाना', labelEn: 'Yearly' }
                            ].map((tab) => {
                              const tabLabel = selectedLang === 'English' ? tab.labelEn : tab.labelHi;
                              return (
                                <button
                                  key={tab.id}
                                  type="button"
                                  onClick={() => {
                                    setSavingTipsTab(tab.id as any);
                                    speakResponse(
                                      selectedLang === 'English'
                                        ? `Viewing ${tab.labelEn} savings tip.`
                                        : `${tab.labelHi} बचत सलाह सक्रिय की गयी।`
                                    );
                                  }}
                                  className={`py-2 rounded-lg text-[10px] font-black transition-all text-center cursor-pointer block truncate ${
                                    savingTipsTab === tab.id
                                      ? 'bg-emerald-600 text-white shadow-3xs scale-[1.02]'
                                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                                  }`}
                                >
                                  {tabLabel}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <hr className="border-slate-200/60" />

                        {/* Tip Content */}
                        {(() => {
                          const activeTipList = {
                            English: {
                              day: {
                                category: "Daily Savings & Budget",
                                text: "Save just ₹30 every day. By the end of the year, it becomes a huge sum of over ₹11,000, which will help you in times of crisis! 🪙",
                                budget: "From ₹10,000 earnings: Keep ₹5,000 (50%) for essential needs, ₹3,005 (30%) for wants/lifestyle, and ₹2,000 (20%) for savings. 🏠 🛍️",
                                growth: "Deposit the saved ₹2,000 in your nearest Post Office savings account regularly to grow safely. 🏦 ✨"
                              },
                              weekly: {
                                category: "Weekly Piggy Bank Habit",
                                text: "Put aside just ₹50 every day in your clay piggy bank. This will easily cover your next week's grocery expense. 🪙 🌾",
                                budget: "From ₹10,000 earnings: Keep ₹5,000 (50%) for essential needs, ₹3,000 (30%) for wants, and ₹2,000 (20%) for savings. 🏠 🛍️",
                                growth: "Regularly secure your weekly savings in a verified bank or Post Office account. 🏦 ✨"
                              },
                              monthly: {
                                category: "Monthly Banking Security",
                                text: "As soon as you receive your income, transfer ₹1,000 to your savings account first. Don't save what is left after spending, spend what is left after saving! 💰 🛡️",
                                budget: "From ₹15,000 earnings: Keep ₹7,500 (50%) for essential needs, ₹4,500 (30%) for other expenses, and ₹3,000 (20%) for savings. 🏠 🛍️",
                                growth: "Start a monthly ₹1,000 Recurring Deposit (RD) to earn guaranteed interest. 🏦 📈"
                              },
                              quarterly: {
                                category: "Quarterly Emergency Fund",
                                text: "Review your expenses every 3 months. Ensure you have cash reserves equal to at least 1 month of living expenses stored safely. 📈",
                                budget: "From ₹30,000 quarterly income: Keep ₹15,000 (50%) for needs, ₹9,000 (30%) for emergency fund, and ₹6,000 (20%) for savings. 🏠",
                                growth: "Lock in extra savings in high-interest Bank FD or Post Office Time Deposit. 🏦"
                              },
                              yearly: {
                                category: "Annual Goals & Child Future",
                                text: "Invest annually in Sukanya Samriddhi Yojana or Post Office RD. Small regular steps can make big dreams come true by the end of the year! 🎯 🌸",
                                budget: "From ₹1,20,000 annual earnings: Keep ₹60,000 (50%) for needs, ₹36,000 (30%) for festivals, and ₹24,000 (20%) for long-term investments. 🏠",
                                growth: "Invest in Sukanya Samriddhi Yojana (SSY) or PPF for guaranteed tax-free returns. 🏦 🌟"
                              }
                            },
                            Hindi: {
                              day: {
                                category: "दैनिक बचत और बजट",
                                text: "हर रोज बस ₹30 की बचत करें। साल के अंत में यह ₹11,000 की बड़ी रकम बन जाएगी जो आपके संकट के समय काम आएगी। 🪙",
                                budget: "₹10,000 की कमाई में से: ज़रूरी खर्चे के लिए ₹5,000 (50%), त्योहार/इच्छाओं के लिए ₹3,005 (30%) और बचत के लिए ₹2,000 (20%) रखें। 🏠 🛍️",
                                growth: "बचे हुए ₹2,000 को अपने पास के डाकघर (Post Office) खाते में सुरक्षित जमा करें। 🏦 ✨"
                              },
                              weekly: {
                                category: "साप्ताहिक बचत और गुल्लक",
                                text: "हर दिन बस ₹50 अपनी मिट्टी की गुल्लक में अलग रखें। इससे आपके अगले हफ्ते के राशन का खर्च आसानी से निकल जाएगा। 🪙 🌾",
                                budget: "₹10,000 की कमाई में से: ज़रूरी खर्चे के लिए ₹5,000 (50%), त्योहार/इच्छाओं के लिए ₹3,000 (30%) और बचत के लिए ₹2,000 (20%) रखें। 🏠 🛍️",
                                growth: "बचे हुए ₹2,000 को अपने पास के डाकघर (Post Office) खाते में सुरक्षित जमा करें। 🏦 ✨"
                              },
                              monthly: {
                                category: "मासिक योजना और बैंक सुरक्षा",
                                text: "تنख्वाह तनख्वाह मिलते ही सबसे पहले ₹1,000 अपने बचत खाते में ट्रांसफर करें। खर्चे के बाद जो बचे उसे बचाने की जगह, पहले बचाएं फिर खर्च करें! 💰 🛡️",
                                budget: "₹15,000 की कमाई में से: ज़रूरी खर्चे के लिए ₹7,500 (50%), त्योहार/इच्छाओं के लिए ₹4,500 (30%) और बचत के लिए ₹3,000 (20%) रखें। 🏠 🛍️",
                                growth: "मासिक ₹1,000 की Recurring Deposit (RD) शुरू करें जिससे सुरक्षित ब्याज मिले। 🏦 📈"
                              },
                              quarterly: {
                                category: "त्रैमासिक वित्तीय सुरक्षा",
                                text: "हर ३ महीने में अपने खर्चों का हिसाब करें। यह सुनिश्चित करें कि आपके पास कम से कम १ महीने के खर्च के बराबर की आपातकालीन राशि सुरक्षित हो। 📈",
                                budget: "₹30,000 प्रत्येक तिमाही में से: ज़रूरी खर्चे के लिए ₹15,000 (50%), आपातकालीन निधि के लिए ₹9,000 (30%) और बचत के लिए ₹6,000 (20%)। 🏠",
                                growth: "तिमाही के अंत में बची रकम को बैंक फिक्स्ड डिपॉजिट (FD) या डाकघर बचत में डालकर सुरक्षित करें। 🏦"
                              },
                              yearly: {
                                category: "सालाना लक्ष्य और संतान का भविष्य",
                                text: "सुकन्या समृद्धि योजना या डाकघर की आर.डी. में सालाना निवेश करें। छोटे-छोटे बदलाव साल के अंत में बड़े सपने सच कर सकते हैं! 🎯 🌸",
                                budget: "₹1,20,000 की सालाना कमाई में से: ₹60,000 (50%) ज़रूरी काम, ₹36,000 (30%) पर्व/इच्छा, ₹24,000 (20%) दीर्घकालिक निवेश। 🏠",
                                growth: "सुकन्या समृद्धि योजना (SSY) या PPF में सालाना निवेश करें जहाँ सरकारी गारंटी और टैक्स छूट मिलती है। 🏦 🌟"
                              }
                            }
                          };

                          const activeLang = selectedLang === 'English' ? 'English' : 'Hindi';
                          const activeTip = activeTipList[activeLang][savingTipsTab as 'day' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'] || activeTipList[activeLang]['day'];
                          return (
                            <div className="space-y-4 animate-fadeIn">
                              <div>
                                <span className="text-[10px] bg-emerald-50 text-[#16a34a] font-extrabold px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-wider inline-block">
                                  {activeTip.category}
                                </span>
                                <p className="text-sm font-bold text-slate-800 leading-relaxed mt-3 text-left">
                                  {activeTip.text}
                                </p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3.5 border-t border-slate-200 text-left font-sans">
                                {/* Build Budget Plan */}
                                <div className="space-y-1.5">
                                  <span className="text-[9px] text-[#2563eb] font-extrabold tracking-wider uppercase flex items-center gap-1">
                                    🔥 {selectedLang === 'English' ? "BUILD BUDGET PLAN" : "बजट फार्मूला"}
                                  </span>
                                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                                    {activeTip.budget}
                                  </p>
                                </div>

                                {/* Strategic Growth */}
                                <div className="space-y-1.5">
                                  <span className="text-[9px] text-emerald-700 font-extrabold tracking-wider uppercase flex items-center gap-1">
                                    📈 {selectedLang === 'English' ? "STRATEGIC GROWTH" : "पैसा बढ़ाएं सीख"}
                                  </span>
                                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                                    {activeTip.growth}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* SUGGESTED NEXT STEP CARD (Actionable task) */}
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-3 text-amber-900">
                        <TrendingUp className="w-5 h-5 text-amber-600 shrink-0 self-start mt-0.5" />
                        <div>
                          <span className="text-[10px] font-extrabold tracking-wider text-amber-700 uppercase">SUGGESTED NEXT STEP</span>
                          <p className="text-xs font-bold mt-1 text-amber-800">
                            {selectedLang === 'English' 
                              ? "Start a SIP — save just ₹500/month for your child's education goal! 🧡" 
                              : "Ek SIP shuru karein — bachi ki padhai ke lakshya ke liye sirf ₹500/mahine bachaayein! 🧡"}
                          </p>
                        </div>
                      </div>

                      {/* IN-APP MULTI-CHANNEL UPDATE OPT-IN PANEL */}
                      <ChannelOptInPanel
                        user={user}
                        selectedLang={selectedLang}
                        b={b}
                        speakResponse={speakResponse}
                        onUpdateChannels={handleUpdateChannels}
                        expenses={expenses}
                        goals={goals}
                      />

                      {/* QUICK ACTIONS ROW LIST */}
                      <div className="space-y-2">
                        <h4 className="font-extrabold text-[11px] text-slate-400 uppercase tracking-wider pl-1 font-sans">
                          {b('quickActionHead')}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => handlePromptChipClick(
                              selectedLang === 'English' 
                                ? "How can we start a cheap or safe Mutual Fund SIP?" 
                                : "सस्ता या सुरक्षित SIP कैसे चालू कर सकते हैं?"
                            )}
                            className="bg-white border border-slate-100 hover:border-emerald-500 hover:shadow-xs p-2.5 rounded-xl flex items-center gap-2 text-left cursor-pointer active:scale-95 transition-all text-xs"
                          >
                            <span className="text-base shrink-0">📈</span>
                            <div className="truncate">
                              <div className="font-extrabold text-slate-800 text-[11px] leading-tight">
                                {selectedLang === 'English' ? "SIP Investment" : "SIP शुरू करें"}
                              </div>
                              <span className="text-[9px] text-slate-400 block truncate font-medium mt-0.5">
                                {selectedLang === 'English' ? "Learn safe investing" : "सुरक्षित बचत गाइड"}
                              </span>
                            </div>
                          </button>

                          <button 
                            onClick={() => setActiveTab('lakshya')}
                            className="bg-white border border-slate-100 hover:border-emerald-500 hover:shadow-xs p-2.5 rounded-xl flex items-center gap-2 text-left cursor-pointer active:scale-95 transition-all text-xs"
                          >
                            <span className="text-base shrink-0">🛒</span>
                            <div className="truncate">
                              <div className="font-extrabold text-slate-800 text-[11px] leading-tight">
                                {selectedLang === 'English' ? "Expense Tracker" : "खर्च लिमिट"}
                              </div>
                              <span className="text-[9px] text-slate-400 block truncate font-medium mt-0.5">
                                {selectedLang === 'English' ? "Set safe targets" : "दैनिक खर्च जोड़ें"}
                              </span>
                            </div>
                          </button>

                          <button 
                            onClick={() => handlePromptChipClick(
                              selectedLang === 'English' 
                                ? "How is my personal data secured in this app?" 
                                : "हमारा डाटा कैसे सुरक्षित रहता है?"
                            )}
                            className="bg-white border border-slate-150 hover:border-emerald-500 hover:shadow-xs p-2.5 rounded-xl flex items-center gap-2 text-left cursor-pointer active:scale-95 transition-all text-xs"
                          >
                            <span className="text-base shrink-0">🛡️</span>
                            <div className="truncate">
                              <div className="font-extrabold text-slate-800 text-[11px] leading-tight">
                                {selectedLang === 'English' ? "Cyber Security" : "धोखाधड़ी से सुरक्षा"}
                              </div>
                              <span className="text-[9px] text-slate-400 block truncate font-medium mt-0.5">
                                {selectedLang === 'English' ? "100% verified safety" : "सुरक्षा नियम सीखें"}
                              </span>
                            </div>
                          </button>

                          <button 
                            onClick={() => setActiveTab('sikhein')}
                            className="bg-white border border-slate-100 hover:border-emerald-500 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-2.5 rounded-xl flex items-center gap-2 text-left cursor-pointer active:scale-95 transition-all text-xs"
                          >
                            <span className="text-base shrink-0">💡</span>
                            <div className="truncate">
                              <div className="font-extrabold text-slate-800 text-[11px] leading-tight">
                                {selectedLang === 'English' ? "Expert Tips" : "बचत टिप्स"}
                              </div>
                              <span className="text-[9px] text-slate-400 block truncate font-medium mt-0.5">
                                {selectedLang === 'English' ? "Advisor feedback" : "विशेषज्ञों की सलाह"}
                              </span>
                            </div>
                          </button>
                        </div>
                      </div>
                        </>
                      )}

                    </div>
                  )}

                  {/* TAB 2: CHAT (AI Guided Assistant chatbot - Screen 8 & 9) */}
                  {activeTab === 'chat' && (
                    <div id="ai_chat_tab" className="flex-1 flex flex-col min-h-[480px]">
                      
                      {/* Live Session Timer with Recharge Actions */}
                      <div className={`mb-3 border rounded-2xl p-3 flex items-center justify-between transition-all duration-200 shadow-3xs ${
                        isChatLocked 
                          ? 'bg-rose-50 border-rose-300 text-rose-950 animate-pulse' 
                          : chatSecondsLeft <= 60
                            ? 'bg-amber-50 border-amber-300 text-amber-950'
                            : 'bg-emerald-50 border-emerald-150 text-emerald-950'
                      }`}>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${
                            isChatLocked 
                              ? 'bg-rose-100 text-rose-600' 
                              : chatSecondsLeft <= 60 
                                ? 'bg-amber-100 text-amber-600 animate-bounce' 
                                : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            {isChatLocked ? "🔒" : "⏳"}
                          </div>
                          <div>
                            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                              {selectedLang === 'English' ? "Chat Session Limit (5m free)" : "चैट सीमा विवरण (5m फ्री)"}
                            </div>
                            <div className="text-xs font-black flex items-center gap-1.5 mt-0.5">
                              <span>{selectedLang === 'English' ? "Timer remaining:" : "बचा हुआ समय:"}</span>
                              <span className={`px-2 py-0.5 rounded font-mono font-black text-xs ${
                                isChatLocked 
                                  ? 'bg-rose-600 text-white' 
                                  : chatSecondsLeft <= 60 
                                    ? 'bg-amber-500 text-white animate-pulse' 
                                    : 'bg-emerald-700 text-white'
                              }`}>
                                {chatSecondsLeft > 0 ? (
                                  `${Math.floor(chatSecondsLeft / 60)}:${(chatSecondsLeft % 60).toString().padStart(2, '0')}`
                                ) : (
                                  "0:00 (Locked)"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button 
                          type="button" 
                          onClick={triggerRecharge}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-3.5 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-1 cursor-pointer shadow-3xs hover:scale-105"
                        >
                          <span>🔋 Recharge</span> 
                          <span className="font-mono bg-emerald-805 px-1 py-0.5 text-[9px] rounded font-black text-white">₹2</span>
                        </button>
                      </div>
                      
                      {/* Sub-header inside Chat container */}
                      <div className="bg-white border border-slate-150 rounded-xl p-3 shadow-3xs flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-xs font-bold text-slate-700">Paisa Saathi Companion Online</span>
                        </div>
                        <button 
                          onClick={() => {
                            setMessages([
                              {
                                id: "chat_init",
                                user_message: "Hello",
                                ai_response: `Namaste ${user?.name || name || 'Ramesh'} ji! Main Paisa Saathi hoon. Kuch pareshani ya bachat aur nivesh ka rasta dhoondh rahe hain? Bejhijhak poochiye!`,
                                timestamp: new Date().toISOString()
                              }
                            ]);
                          }}
                          className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-500 py-1 px-2.5 rounded-lg font-bold"
                        >
                          Clear Chat
                        </button>
                      </div>

                      {/* Chat Bubbles Scroll View Area */}
                      <div className="flex-1 overflow-y-auto space-y-3 my-4 pr-1 max-h-[380px] min-h-[220px]">
                        {messages.map((m, idx) => (
                          <div key={idx} className="space-y-2">
                            {/* User Bubble */}
                            {m.user_message !== "Hello" && (
                              <div className="flex justify-end">
                                <div className="bg-emerald-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 text-xs font-bold max-w-[85%] shadow-xs">
                                  {m.user_message}
                                </div>
                              </div>
                            )}

                            {/* Assistant Bubble */}
                            <div className="flex gap-2">
                              <div className="w-7 h-7 rounded-full bg-amber-400 text-emerald-950 font-black text-[10px] flex items-center justify-center shrink-0 self-start mt-1">
                                S
                              </div>
                              <div className="bg-white border border-slate-150 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs text-slate-800 leading-relaxed max-w-[85%] shadow-2xs font-semibold animate-fadeIn">
                                <div className="whitespace-pre-line">
                                  {m.ai_response || (isChatLoading && idx === messages.length - 1 ? (
                                    <div className="flex items-center gap-1.5 py-1">
                                      <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" />
                                      <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                                      <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                  ) : "Sacha Saathi soch raha hai...")}
                                </div>

                                {m.added_transaction_id && (
                                  <div id={`tx-wrap-${m.added_transaction_id}`} className="mt-3 p-2 bg-emerald-50 rounded-xl border border-emerald-200/60 flex flex-col gap-1.5 animate-fadeIn">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                      <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                                        📊 Ledger Updated: +₹{m.transaction_amount} ({m.transaction_type === 'expense' ? 'Kharch' : 'Kamai'})
                                      </span>
                                      {revertedIds.includes(m.added_transaction_id) ? (
                                        <span className="text-[9px] text-red-600 font-bold bg-red-50 py-0.5 px-2 rounded-md border border-red-150">Reverted ↩</span>
                                      ) : (
                                        <button
                                          id={`btn-undo-${m.added_transaction_id}`}
                                          onClick={() => handleRevertTransaction(m.added_transaction_id, m.transaction_amount || 0, m.transaction_type || '')}
                                          className="text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-2.5 rounded-md flex items-center gap-0.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                                        >
                                          ↩ Undo
                                        </button>
                                      )}
                                    </div>
                                    <span className="text-[9px] text-slate-500 italic font-semibold">
                                      {selectedLang === 'English' 
                                        ? `Logged: "${m.transaction_title}"`
                                        : `विवरण: "${m.transaction_title}" दर्ज किया गया`
                                      }
                                    </span>
                                  </div>
                                )}

                                {m.search_sources && m.search_sources.length > 0 && (
                                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                                      🔍 Mili jankari ke strot (Sources):
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {m.search_sources.map((src: any, sIdx: number) => (
                                        <a
                                          key={sIdx}
                                          href={src.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-1 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-[10px] py-1 px-2.5 rounded-lg font-bold transition-all border border-slate-200 text-slate-600 shrink-0 select-none active:scale-95"
                                        >
                                          <span className="truncate max-w-[120px]">{src.title}</span>
                                          <span className="text-[8px] text-emerald-500 font-normal">↗</span>
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Speech Listening Live overlay helper */}
                      {isListening && (
                        <div className="p-3 bg-emerald-800 text-white rounded-xl mb-3 flex items-center justify-between text-xs animate-pulse">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            <span className="font-bold">Aap boles... Sunn raha hoon! (Listening...)</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={stopRecording} 
                            className="bg-amber-400 text-emerald-950 px-2 py-0.5 rounded font-black text-[10px]"
                          >
                            Hisaab Band
                          </button>
                        </div>
                      )}

                      {speechError ? (
                        <div className="space-y-1.5 mb-2 text-center">
                          <div className="text-[10px] text-rose-500 font-bold">{speechError}</div>
                          <button
                            type="button"
                            onClick={() => {
                              setSpeechError('');
                              setInputVal("महीने का ₹500 का SIP कैसे शुरू करें?");
                            }}
                            className="inline-flex items-center gap-1 text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-md font-bold transition-all active:scale-95"
                          >
                            <span>📢 Test Demo: Click to simulate voice ("₹500 SIP kaise karein?")</span>
                          </button>
                        </div>
                      ) : null}

                      {/* QUICK HELP CHIPS & Chat Inputs with Lock Check */}
                      {isChatLocked ? (
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center space-y-4 my-3 shrink-0 shadow-3xs">
                          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
                            <AlertTriangle className="w-5 h-5 animate-pulse" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide flex items-center justify-center gap-1.5">
                              <span>🔒 Chat Limits Reached</span>
                            </h4>
                            <p className="text-[11px] text-slate-500 font-bold max-w-sm mx-auto leading-relaxed mt-1.5">
                              {selectedLang === 'English' 
                                ? "Your free 5 minutes are over. Recharge for just ₹2 to activate another 10 minutes of smart AI-guided financial companion assistance."
                                : "आपकी मुफ़्त ५ मिनट की चैट सीमा समाप्त हो गई है। अगले १० मिनट वित्तीय साथी से सलाह लेने के लिए सिर्फ ₹2 का सुरक्षित रिचार्ज करें।"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={triggerRecharge}
                            className="w-full bg-emerald-600 hover:bg-emerald-705 text-white font-black py-3 rounded-xl transition-all active:scale-95 shadow-md text-xs cursor-pointer tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02]"
                          >
                            🔋 {selectedLang === 'English' ? "RECHARGE NOW FOR ₹2 (SIMULATED UPI)" : "रिचार्ज करें (₹2 मात्र - UPI सिम्युलेटर)"}
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* QUICK HELP CHIPS Prompts */}
                          <div className="shrink-0 mb-3">
                            <span className="text-[10px] font-extrabold text-[#94a3b8] block mb-1">SUGGESTED PROMPTS — TAP TO ASK</span>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                "Maine ₹200 kirane par kharch kiye 🛒",
                                "Mujhe 5 saal mein ₹5 lakh bachane hain 🎯",
                                "Mutual fund kya hota hai? 📈",
                                "Kya ye fraud ho sakta hai? ⚠️"
                              ].map((chip, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => handlePromptChipClick(chip)}
                                  className="text-[11px] bg-sky-50 text-sky-900 border border-sky-150 px-2.5 py-1.5 rounded-full font-bold hover:bg-sky-100/80 active:scale-95 transition-all text-left"
                                >
                                  {chip}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Typing bar & Action Buttons */}
                          <div className="flex gap-2 shrink-0">
                            <div className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1 flex items-center shadow-3xs focus-within:border-emerald-500">
                              <input
                                type="text"
                                placeholder="Type message here / यहाँ लिखें..."
                                value={inputVal}
                                onChange={(e) => setInputVal(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') submitChatMessage();
                                }}
                                className="flex-1 bg-transparent py-2.5 focus:outline-none text-xs font-bold text-slate-800"
                              />
                              
                              {/* Inside message voice icon shortcut button */}
                              <button
                                type="button"
                                onClick={isListening ? stopRecording : startRecording}
                                title={isListening ? "Stop listening" : "Speak message using your voice"}
                                className={`p-1.5 px-2 rounded-lg transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}`}
                              >
                                <Mic className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => submitChatMessage()}
                              className="bg-emerald-600 hover:bg-[#059669] text-white p-3 rounded-xl shadow-md font-bold text-xs cursor-pointer active:scale-95 transition-colors"
                            >
                              Send
                            </button>
                          </div>
                        </>
                      )}

                      {/* Trust banner reassurance */}
                      <p className="text-[9px] text-center text-slate-400 mt-2 font-medium bg-slate-50 py-1 select-none">
                        🛡️ Sacha Saathi: “हम आपका पैसा नहीं छूते, सिर्फ सुरक्षित मार्गदर्शन देते हैं।”
                      </p>

                    </div>
                  )}

                  {/* TAB 3: LAKSHYA (Goals, Expenses & Financial score screens - Screen 10, 12 & 14) */}
                  {activeTab === 'lakshya' && (
                    <div id="lakshya_dashboard_tab" className="space-y-4">
                      
                      {/* Screen 10 / Hisab-Kitab Ledger Card */}
                      <div className="bg-white text-slate-850 border border-slate-150 rounded-3xl p-5 shadow-lg font-sans space-y-4">
                        
                        {/* Ledger Title / Header Row */}
                        <div className="flex items-center gap-3.5 mb-1 bg-slate-50 border border-slate-100 p-1 rounded-2xl">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('home');
                              speakResponse("Ghar vaapas.");
                            }}
                            title="Go Back"
                            className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-650 transition-all cursor-pointer active:scale-95 shrink-0"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <div className="text-left">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none">Hisab-Kitab Ledger</h3>
                            <p className="text-[9px] font-black tracking-widest uppercase text-emerald-600 mt-1">TRACK, ANALYZE, ADVISE</p>
                          </div>
                        </div>

                        {/* Two Salary & Balance Cards Row */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Current Salary Card */}
                          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 relative overflow-hidden text-left">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">CURRENT SALARY</span>
                            <div className="text-xl font-bold text-slate-800 mt-1.5">₹{currentIncome.toLocaleString('en-IN')}</div>
                            <span className="text-[9px] text-slate-500 font-bold block mt-1">Monthly Active Base</span>
                            <div className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                              <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                          </div>

                          {/* Current Balance Card */}
                          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 relative overflow-hidden text-left">
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider block">CURRENT BALANCE</span>
                            <div className="text-xl font-bold text-emerald-700 mt-1.5">₹{trackerBachat.toLocaleString('en-IN')}</div>
                            <span className="text-[9px] text-emerald-800/70 font-semibold block mt-1">Salary Less Expenses</span>
                            <div className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-emerald-100/80 border border-emerald-200 flex items-center justify-center shrink-0">
                              <Coins className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                          </div>
                        </div>

                        {/* Mini Horizontal Navigation Bar */}
                        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-50 rounded-xl border border-slate-150">
                          {[
                            { id: 'ledger', label: 'LEDGER', icon: <span className="text-xs">📊</span> },
                            { id: 'voice', label: 'VOICE', icon: <Mic className="w-3 h-3" /> },
                            { id: 'files', label: 'FILES', icon: <span className="text-xs">📂</span> },
                            { id: 'autodeduct', label: 'AUTO DEDUCT', icon: <Calendar className="w-3 h-3" /> }
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setLedgerSubTab(item.id as any);
                                speakResponse(`Selected ${item.label} view.`);
                              }}
                              className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                                ledgerSubTab === item.id
                                  ? 'bg-[#10b981] text-[#042f2e] font-black shadow-3xs border border-[#10b981]/20'
                                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/85'
                              }`}
                            >
                              {item.icon}
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>

                        {/* Sub content based on selected Mini Tab */}
                        <div className="pt-2 animate-fadeIn">
                          
                          {/* SUB-TAB 1: LEDGER */}
                          {ledgerSubTab === 'ledger' && (
                            <div className="space-y-4 animate-fadeIn">
                              {/* Total Inflow and Total Outflow Grid per the attachment */}
                              <div className="grid grid-cols-2 gap-3">
                                {/* Total Inflow Card: green arrow up */}
                                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-left">
                                  <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-[9px] tracking-wider uppercase mb-1">
                                    <span className="text-xs">↗</span>
                                    <span>TOTAL INFLOW (SALARY+)</span>
                                  </div>
                                  <div className="text-lg font-bold text-slate-800 font-mono">₹{(currentIncome + 110).toLocaleString('en-IN')}</div>
                                </div>

                                {/* Total Outflow Card: red arrow down */}
                                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-left">
                                  <div className="flex items-center gap-1.5 text-rose-500 font-extrabold text-[9px] tracking-wider uppercase mb-1">
                                    <span className="text-xs">↙</span>
                                    <span>TOTAL OUTFLOW</span>
                                  </div>
                                  <div className="text-lg font-bold text-slate-800 font-mono">₹{trackerTotal.toLocaleString('en-IN')}</div>
                                </div>
                              </div>

                              {/* Ledger Balance Footer & Interactive Add Button per attachment */}
                              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex justify-between items-center gap-3">
                                <div className="text-left">
                                  <span className="text-[9px] font-black text-slate-455 uppercase tracking-wider block">LEDGER BALANCE</span>
                                  <div className="text-xl font-bold text-emerald-600 mt-1">₹{trackerBachat.toLocaleString('en-IN')}</div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {/* Dual-language Ask Mic button */}
                                  <button
                                    type="button"
                                    onClick={handleVoiceAddExpenseAskClick}
                                    title={selectedLang === 'English' ? "Click to let AI ask where you spent" : "क्लिक करें ताकि AI पूछे आपने कहाँ खर्च किया"}
                                    className={`relative p-3 rounded-xl border flex items-center justify-center transition-all cursor-pointer active:scale-95 text-sm ${
                                      isVoiceTracking
                                        ? 'bg-rose-600 text-white border-rose-600 animate-pulse shadow-xs'
                                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-150 shadow-2xs'
                                    }`}
                                  >
                                    <Mic className="w-4 h-4" />
                                    {isVoiceTracking && (
                                      <span className="absolute -top-1 -right-0.5 flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                                      </span>
                                    )}
                                  </button>

                                  {/* Solid bright green '+ Close Form' or '+ Add Expense' button as requested */}
                                  <button
                                    type="button"
                                    onClick={() => setIsAddingExpense(!isAddingExpense)}
                                    className="bg-[#10b981] hover:bg-[#059669] active:scale-95 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center gap-1 cursor-pointer border border-[#10b981]/10"
                                  >
                                    <span>{isAddingExpense ? '✕ Close Form' : '＋ Add Expense'}</span>
                                  </button>
                                </div>
                              </div>

                              {/* Add Expense Form (Rendered inline inside LEDGER tab if isAddingExpense) */}
                              {isAddingExpense && (
                                <form onSubmit={(e) => {
                                  handleAddExpenseSubmit(e);
                                  setIsAddingExpense(false); // Close form after submission
                                }} className="bg-slate-50 border border-slate-150 rounded-2xl p-4.5 space-y-3.5 text-left animate-fadeIn">
                                  <div className="flex justify-between items-center">
                                    <div className="text-xs font-black text-slate-700 uppercase tracking-wider">Naya Kharch / New Expense Tracker</div>
                                    <button
                                      type="button"
                                      onClick={handleVoiceAddExpenseAskClick}
                                      className={`inline-flex items-center gap-1 text-[10px] uppercase font-black px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                        isVoiceTracking
                                          ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                                          : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                      }`}
                                      title="Ask & Add with Voice"
                                    >
                                      <Mic className="w-3 h-3" />
                                      <span>Speak / बोलें 🎙️</span>
                                    </button>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[8px] font-black text-slate-500 mb-1">RS / VALUE (₹)</label>
                                      <input
                                        type="number"
                                        required
                                        placeholder="e.g. 500"
                                        value={newExpAmount}
                                        onChange={(e) => setNewExpAmount(e.target.value)}
                                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[8px] font-black text-slate-500 mb-1">CATEGORY / श्रेणी</label>
                                      <select
                                        value={newExpCategory}
                                        onChange={(e) => setNewExpCategory(e.target.value)}
                                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 font-semibold"
                                      >
                                        <option value="Kirana">Kirana 🛒</option>
                                        <option value="Travel">Auto/Fuel ⛽</option>
                                        <option value="Kiraya">Rent/Kothri 🏠</option>
                                        <option value="Dawai">Medicine 💊</option>
                                        <option value="Manoranjan">Mobile & Misc 📱</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-[8px] font-black text-slate-500 mb-1">PARTICULAR / SPECIFICS</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. Milk, Petrol, Room Rent"
                                      value={newExpTitle}
                                      onChange={(e) => setNewExpTitle(e.target.value)}
                                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                                    />
                                  </div>

                                  <button
                                    type="submit"
                                    className="w-full bg-[#10b981] hover:bg-[#059669] text-slate-950 font-black py-2.5 rounded-xl text-xs transition-transform active:scale-95 shadow-sm uppercase tracking-wide cursor-pointer"
                                  >
                                    Kharch Jodein (Save)
                                  </button>
                                </form>
                              )}

                              {/* Live Voice Status Indicator inside Daily Tracker */}
                              {isVoiceTracking && voiceTrackingText && (
                                <div className="p-4 bg-rose-50 border border-rose-150 rounded-2xl flex items-center gap-3.5 text-left animate-pulse shadow-sm">
                                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                                    <Mic className="w-5 h-5 text-rose-600 animate-bounce" />
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="text-[9px] font-black text-rose-500 uppercase tracking-wider">Paisa Saathi is listening... / सुन रहे हैं...</div>
                                    <p className="text-xs font-bold text-rose-900 leading-snug">{voiceTrackingText}</p>
                                  </div>
                                </div>
                              )}

                              {!isVoiceTracking && voiceTrackingText && (voiceTrackingText.includes('Added') || voiceTrackingText.includes('जोड़') || voiceTrackingText.includes('successfully')) && (
                                <div className="p-3.5 bg-emerald-50 border border-emerald-150 rounded-2xl flex items-center gap-3 text-left animate-fadeIn shadow-3xs">
                                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                                    <span className="text-xs font-semibold">✓</span>
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">HISAAB DIRECT RECOGNIZED</div>
                                    <p className="text-xs font-bold text-slate-800 leading-snug">{voiceTrackingText}</p>
                                  </div>
                                </div>
                              )}

                              {/* Expense Items List */}
                              <div className="space-y-2.5 text-left">
                                <div className="flex justify-between items-center mb-1 px-1">
                                  <h4 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wide">{b('dailyLogsHead')}</h4>
                                  <span className="text-[10px] font-bold text-rose-600">Total Outflow: ₹{trackerTotal.toLocaleString('en-IN')}</span>
                                </div>

                                {(expenses || []).length === 0 ? (
                                  <div className="p-5.5 text-center bg-slate-50 rounded-xl text-slate-450 border border-dashed border-slate-200 text-xs font-bold">
                                    Hisaab khali hai. ＋ Add Expense par click karein ya voice use karein!
                                  </div>
                                ) : (
                                  <div className="space-y-2 pr-1 max-h-[220px] overflow-y-auto w-full">
                                    {(expenses || []).map((exp) => (
                                      <div key={exp.id} className="p-3.5 bg-white border border-slate-100 rounded-2xl flex justify-between items-center shadow-3xs transition-all hover:bg-slate-50/60">
                                        <div className="flex items-center gap-3">
                                          <span className="text-xl shrink-0">
                                            {exp.type === 'income' ? '💰' : 
                                             exp.category === 'Kirana' ? '🛒' : 
                                             exp.category === 'Travel' ? '⛽' : 
                                             exp.category === 'Kiraya' ? '🏠' : 
                                             exp.category === 'Dawai' ? '💊' : '🪙'}
                                          </span>
                                          <div>
                                            <div className="font-black text-xs text-slate-800">{exp.title}</div>
                                            <div className="text-[9px] text-slate-400 mt-0.5">{exp.date} • {exp.category}</div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                          <span className={`text-xs font-black ${exp.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {exp.type === 'income' ? '+' : '-'}₹{exp.amount}
                                          </span>
                                          <button 
                                            type="button"
                                            onClick={() => handleDeleteExpense(exp.id)}
                                            title="Delete Entry"
                                            className="text-slate-400 hover:text-rose-600 p-1.5 shrink-0 bg-slate-50 hover:bg-rose-50 rounded-lg border border-slate-150 cursor-pointer active:scale-95 transition-all"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* SUB-TAB 2: VOICE */}
                          {ledgerSubTab === 'voice' && (
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 text-center space-y-4 animate-fadeIn">
                              <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-700 shadow-3xs">
                                <Mic className="w-5 h-5 animate-pulse" />
                              </div>
                              
                              <div>
                                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Bolkar Kharch Jodein (Voice Expense Logger)</h4>
                                <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed font-semibold">
                                  Simply press the mic and speak naturally, for example "Maine chai par bees rupay kharch kiye."
                                </p>
                              </div>

                              {/* Large speech action button */}
                              <button
                                type="button"
                                onClick={handleVoiceExpenseTrackerClick}
                                className={`w-full py-3 rounded-xl font-black text-xs transition-all tracking-wide flex items-center justify-center gap-2 cursor-pointer ${
                                  isVoiceTracking
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-md border-none'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md border-none'
                                }`}
                              >
                                {isVoiceTracking ? (
                                  <>
                                    <MicOff className="w-4 h-4 shrink-0" />
                                    <span>Stop Listening / बंद करें</span>
                                  </>
                                ) : (
                                  <>
                                    <Mic className="w-4 h-4 shrink-0" />
                                    <span>Start Speaking / बोलना शुरू करें</span>
                                  </>
                                )}
                              </button>

                              {voiceTrackingText && (
                                <div className={`text-[11px] p-3.5 rounded-xl border font-bold text-center flex items-center justify-center gap-2 animate-fadeIn ${
                                  isVoiceTracking 
                                    ? 'bg-rose-50 text-rose-800 border-rose-150 animate-pulse shadow-2xs' 
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-150 shadow-2xs'
                                }`}>
                                  <span className="text-base shrink-0">{isVoiceTracking ? '🎙️' : '✓'}</span>
                                  <span className="leading-normal">{voiceTrackingText}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* SUB-TAB 3: FILES (Consent & statement upload) */}
                          {ledgerSubTab === 'files' && (
                            <div className="space-y-4 animate-fadeIn text-left text-slate-800 border-none">

                              {/* 1. Account Aggregator Protocol - beautifully integrated with chatbot colors */}
                              <div className="bg-emerald-50/75 border border-emerald-150 rounded-2xl p-4.5 shadow-3xs font-sans">
                                <div className="flex items-start gap-3.5">
                                  <div className="w-12 h-12 rounded-2xl bg-emerald-100/50 border border-emerald-200 flex items-center justify-center shrink-0">
                                    <Landmark className="w-5 h-5 text-emerald-600" />
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-extrabold text-slate-800 text-xs tracking-tight">Account Aggregator Protocol</h5>
                                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                                        aggregatorProtocolActive ? 'bg-emerald-105 text-emerald-800 border border-emerald-200/50' : 'bg-rose-100 text-rose-800 border border-rose-200/50'
                                      }`}>
                                        {aggregatorProtocolActive ? (selectedLang === 'English' ? 'Active' : 'सक्रिय') : (selectedLang === 'English' ? 'Off' : 'बंद')}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-emerald-800/95 font-bold leading-relaxed mt-0.5">
                                      Secure OTP-based ledger sync under RBI directives (FIP/FIU consent architecture)
                                    </p>
                                  </div>
                                </div>

                                <div className="border-t border-emerald-150/45 my-3.5"></div>

                                <div className="flex items-center justify-between gap-2.5">
                                  <span className="text-[11px] font-extrabold text-slate-700">
                                    {selectedLang === 'English' ? 'Consent Status details:' : 'सहमति स्थिति विवरण:'}
                                  </span>
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextState = !aggregatorProtocolActive;
                                        setAggregatorProtocolActive(nextState);
                                        speakResponse(
                                          nextState
                                            ? (selectedLang === 'English' ? "Account aggregator sync enabled." : "अकाउंट एग्रीगेटर सिंक चालू कर दिया गया है।")
                                            : (selectedLang === 'English' ? "Account aggregator sync disabled." : "अकाउंट एग्रीगेटर सिंक बंद कर दिया गया है।")
                                        );
                                      }}
                                      className={`text-[9px] font-black tracking-wider px-3.5 py-2.5 rounded-xl uppercase border transition-all duration-200 active:scale-95 shadow-2xs cursor-pointer flex items-center gap-1.5 hover:brightness-105 ${
                                        aggregatorProtocolActive 
                                          ? 'text-emerald-700 bg-emerald-100 border-[#10b981]/30 hover:bg-emerald-200/80' 
                                          : 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100'
                                      }`}
                                      title={selectedLang === 'English' ? "Click to toggle custom consent status" : "सहमति स्थिति बदलने के लिए क्लिक करें"}
                                    >
                                      <span className={`w-2 h-2 rounded-full inline-block ${aggregatorProtocolActive ? 'bg-[#10b981] animate-pulse' : 'bg-rose-450'}`} />
                                      <span>{aggregatorProtocolActive ? "CONSENT BOUNDED ACTIVE" : "CONSENT DISABLED"}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* 3. Statement manual file Upload details */}
                              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4.5 space-y-3 shadow-3xs">
                                <div className="font-extrabold text-xs text-slate-800">Upload Passbook or Statement</div>
                                
                                <div className="border border-dashed border-slate-200 hover:border-emerald-500 transition-colors rounded-2xl p-5 text-center bg-white flex flex-col items-center justify-center relative cursor-pointer group">
                                  <input
                                    type="file"
                                    accept=".pdf,.csv,.txt"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files.length > 0) {
                                        const fileName = e.target.files[0].name;
                                        setUploadedStatementFile(fileName);
                                        speakResponse(`Statement ${fileName} registered! Analyzing parameters securely.`);
                                      }
                                    }}
                                  />
                                  <Landmark className="w-8 h-8 text-slate-350 group-hover:text-emerald-555 mb-2 transition-colors shrink-0" />
                                  <div className="font-extrabold text-[11px] text-slate-700">Click to select Statement file (PDF / CSV)</div>
                                  <p className="text-[9px] text-slate-400 mt-1 font-semibold">Maximum 5MB • Safe & Encrypted scan</p>
                                </div>

                                {uploadedStatementFile && (
                                  <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center justify-between animate-fadeIn">
                                    <span className="text-[10px] text-emerald-850 font-extrabold">📄 {uploadedStatementFile}</span>
                                    <button
                                      type="button"
                                      onClick={() => setUploadedStatementFile('')}
                                      className="text-slate-400 hover:text-rose-500 text-[10px] font-black cursor-pointer"
                                    >
                                      Clear
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* SUB-TAB 4: AUTO DEDUCT (Recurring or scheduled bills simulator) */}
                          {ledgerSubTab === 'autodeduct' && (
                            <div className="space-y-3.5 animate-fadeIn text-left text-slate-805">
                              <div className="p-1 px-1 flex justify-between items-center">
                                <h4 className="font-extrabold text-[10px] text-slate-405 uppercase tracking-wide">Automated Sync & Deductions</h4>
                                <span className="text-[8px] tracking-wider uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-black border border-emerald-100">Active Setup</span>
                              </div>

                              <div className="space-y-2.5">
                                {[
                                  { title: "Kothri Kiraya (Room Rent)", amount: "2,500", date: "Every 1st", type: "Kiraya", status: "AUTO PAID", statusColor: "text-emerald-700 bg-emerald-50 border border-emerald-100" },
                                  { title: "Unions subscription (Taxi Assn.)", amount: "100", date: "Every 5th", type: "Travel", status: "AUTO PAID", statusColor: "text-emerald-700 bg-emerald-50 border border-emerald-100" },
                                  { title: "Family Mobile Recharge Plan", amount: "299", date: "Every 12th", type: "Manoranjan", status: "DETECTED", statusColor: "text-sky-700 bg-sky-50 border border-sky-120" },
                                  { title: "Chhota Karz (Auto Loan EMI)", amount: "1,500", date: "Every 15th", type: "Travel", status: "UPCOMING", statusColor: "text-amber-700 bg-amber-50 border border-amber-120" }
                                ].map((bill, index) => (
                                  <div key={index} className="p-3.5 bg-white border border-slate-100 rounded-2xl flex justify-between items-center hover:bg-slate-50/50 transition-colors shadow-3xs">
                                    <div className="flex items-center gap-3">
                                      <span className="text-lg">
                                        {bill.type === 'Kiraya' ? '🏠' : bill.type === 'Travel' ? '🚕' : '📱'}
                                      </span>
                                      <div>
                                        <div className="font-black text-xs text-slate-800">{bill.title}</div>
                                        <div className="text-[9px] text-slate-400 mt-0.5">{bill.date} • Auto Debit</div>
                                      </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                      <div className="text-xs font-black text-slate-800">₹{bill.amount}</div>
                                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${bill.statusColor}`}>
                                        {bill.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Financial Score Expansion Card */}
                      <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-3xs text-left">
                        <h4 className="font-extrabold text-xs text-slate-400 mb-2 uppercase tracking-wide">{b('scoreDetailsHead')}</h4>
                        
                        <div className="space-y-3">
                          {[
                            { name: "Bachat ki aadat (Savings habits)", score: 85, color: "bg-emerald-600" },
                            { name: "Emergency fund (Aapat nidhi)", score: 40, color: "bg-amber-500" },
                            { name: "Karz level (No dangerous debt)", score: 90, color: "bg-emerald-600" },
                            { name: "Nivesh variety (Investment knowledge)", score: 45, color: "bg-orange-500" }
                          ].map((subScore, idx) => (
                            <div key={idx}>
                              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                                <span>{subScore.name}</span>
                                <span>{subScore.score}/100</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full">
                                <div className={`h-full rounded-full ${subScore.color}`} style={{ width: `${subScore.score}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Tips to grow score */}
                        <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-150 text-left">
                          <h5 className="text-xs font-black text-emerald-900 mb-1.5">💡 Score badhane ke tarike (Improvement tips)</h5>
                          <ol className="text-[10px] text-emerald-800 space-y-1.5 pl-0 list-none font-semibold">
                            <li 
                              onClick={() => handlePromptChipClick("महीने का ₹500 का SIP कैसे शुरू करें?")}
                              className="cursor-pointer hover:underline flex items-center gap-1.5 active:scale-[0.99] transition-transform select-none"
                            >
                              <span>1. Direct Click ➔ Har mahine ₹500 ka SIP shuru karein (Increases Nivesh variety) 📈</span>
                            </li>
                            <li 
                              onClick={() => setIsAddingGoal(true)}
                              className="cursor-pointer hover:underline flex items-center gap-1.5 active:scale-[0.99] transition-transform select-none"
                            >
                              <span>2. Direct Click ➔ Emergency khata alag karke ₹50,000 badhayein (Add Emergency Goal) 💰</span>
                            </li>
                          </ol>
                        </div>
                      </div>

                      {/* Mere Lakshya Goal manager Screen */}
                      <div className="bg-white border border-slate-150 rounded-2xl p-4 shadow-3xs space-y-4 text-left">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wide">{b('myGoalsHead')}</h4>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 font-black px-2 py-0.5 rounded-full">{(goals || []).length} active</span>
                        </div>
                        {isAddingGoal ? (
                          <form onSubmit={handleAddGoalSubmit} className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-150">
                            <div className="flex justify-between items-center bg-slate-100 p-1.5 rounded-lg border border-slate-200 mb-1">
                              <div className="text-xs font-black text-slate-700 uppercase tracking-wider">Naya Lakshya / New Goal</div>
                              <button
                                type="button"
                                onClick={handleVoiceAddGoalAskClick}
                                className={`inline-flex items-center gap-1 text-[10px] uppercase font-black px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                  isVoiceTracking
                                    ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                }`}
                                title="Ask & Add with Voice"
                              >
                                <Mic className="w-3 h-3" />
                                <span>Speak / बोलें 🎙️</span>
                              </button>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">LAKSHYA NAAM / GOAL TITLE</label>
                              <div className="relative flex items-center">
                                <input
                                  type="text"
                                  required
                                  value={newGoalTitle}
                                  onChange={(e) => setNewGoalTitle(e.target.value)}
                                  placeholder="Nayi taxi, Shop banna, ghar, etc."
                                  className="w-full p-2 pr-10 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-emerald-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => startMicForField('newGoalTitle', "कृपया अपने लक्ष्य का नाम बोलें। जैसे कि नयी टैक्सी या बच्चों की पढ़ाई।")}
                                  className={`absolute right-1 p-1.5 rounded-md transition-all active:scale-90 ${activeVoiceField === 'newGoalTitle' ? 'bg-rose-500 text-white animate-pulse shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                  title="Click to speak goal title"
                                >
                                  <Mic className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">TARGET AMOUNT (₹)</label>
                                <div className="relative flex items-center">
                                  <input
                                    type="number"
                                    required
                                    value={newGoalTarget}
                                    onChange={(e) => setNewGoalTarget(e.target.value)}
                                    placeholder="e.g. 100000"
                                    className="w-full p-2 pr-10 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-emerald-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => startMicForField('newGoalTarget', "कृपया अपने लक्ष्य की राशि बोलें। जैसे कि पचास हज़ार।")}
                                    className={`absolute right-1 p-1.5 rounded-md transition-all active:scale-95 ${activeVoiceField === 'newGoalTarget' ? 'bg-rose-500 text-white animate-pulse shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    title="Click to speak target amount"
                                  >
                                    <Mic className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">CATEGORY / श्रेणी</label>
                                <select
                                  value={newGoalCategory}
                                  onChange={(e) => setNewGoalCategory(e.target.value)}
                                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold font-semibold focus:outline-none focus:border-emerald-500"
                                >
                                  <option value="Education">Education 🎓</option>
                                  <option value="Vehicle">Vehicle/Taxi 🚕</option>
                                  <option value="Home">Home/Land 🏠</option>
                                  <option value="Wedding">Wedding 💍</option>
                                  <option value="Emergency">Emergency 🏥</option>
                                  <option value="Business">Business 💼</option>
                                  <option value="General">General 🎯</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex gap-2 text-left">
                              <button
                                type="submit"
                                className="flex-1 bg-[#10b981] hover:bg-[#059669] text-slate-950 font-black py-2 rounded-lg text-xs text-center transition-all active:scale-95 shadow-xs"
                              >
                                Save Goal
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsAddingGoal(false)}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-3 rounded-lg text-xs transition-all active:scale-95"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button 
                            type="button"
                            onClick={() => setIsAddingGoal(true)}
                            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-605 font-bold py-2.5 px-4 rounded-xl text-xs border border-slate-200 border-dashed text-center flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                          >
                            <Plus className="w-4 h-4 text-slate-400" />
                            <span>Naya Lakshya Jodhein (Add Goal)</span>
                          </button>
                        )}
                      </div>

                    </div>
                  )}

                  {/* TAB 4: SIKHEIN (Educational investment modules - Screen 16 & 15) */}
                  {activeTab === 'sikhein' && (
                    <div id="education_tab" className="space-y-4">
                      
                      {/* Safety & Anti-Fraud Warnings Header Banner */}
                      <div className="bg-rose-50 border border-rose-250 p-4 rounded-2xl">
                        <div className="flex gap-2.5 items-start text-rose-950">
                          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-black text-rose-900 text-sm">Savdhaan Raheinn! (Anti-Fraud warning)</h4>
                            <p className="text-[10px] text-rose-700 leading-normal mt-0.5">
                              Pehle janch karein, tabhi paisa lagayein. Koi bhi agent aapka OTP maange toh humara <b>Paisa Saathi chat support</b> par turant salah lein.
                            </p>
                          </div>
                        </div>

                        {/* Safety Points */}
                        <div className="mt-3.5 space-y-2.5">
                          {[
                            { name: "OTP Fraud", alert: "Khatarnak", detail: "Koi aapko phone kare OTP poochne, direct phone cut karein! Bank kabhi OTP nahi maangega.", statusColor: "bg-rose-100 text-rose-800" },
                            { name: "Guaranteed Duplication Schemes", alert: "Savdhaan", detail: "Chit fund se bachein. Ek mahine mein doona karne ka lalach dene wali company bilkul nakli hai.", statusColor: "bg-amber-100 text-amber-800" },
                            { name: "Safe investment rules", alert: "Surakshit", detail: "Sarkari post office savings, banks, aur regulatory safe options (jaise SEBI mutual funds) hi best hote hain.", statusColor: "bg-emerald-100 text-emerald-800" }
                          ].map((safetyItem, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => {
                                handlePromptChipClick(`${safetyItem.name} Fraud Protection: "${safetyItem.detail}" - Isse kaise bachein?`);
                              }}
                              className="p-3 bg-white hover:bg-rose-50/10 cursor-pointer hover:border-rose-400 border border-slate-100 select-none active:scale-[0.98] transition-all rounded-xl text-xs"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-black text-slate-800">{safetyItem.name}</span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${safetyItem.statusColor}`}>
                                  {safetyItem.alert}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1">{safetyItem.detail}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Educational portal items */}
                      <div className="space-y-3">
                        <h4 className="font-extrabold text-xs text-slate-400 pl-1 uppercase tracking-wider">{b('mySavingsOptionsHead')}</h4>
                        
                        {investmentGuidance.map((opt) => (
                          <div 
                            key={opt.id} 
                            onClick={() => {
                              setActiveTab('chat');
                              setInputVal(`${opt.title} के बारे में और बारीकी से बताएं`);
                              submitChatMessage(`${opt.title} के बारे में और बारीकी से बताएं`);
                            }}
                            className="p-4 bg-white border border-slate-150 rounded-xl shadow-3xs cursor-pointer hover:border-emerald-500 transition-all flex justify-between items-center active:scale-[0.99]"
                          >
                            <div className="space-y-1 pr-4">
                              <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase">
                                {opt.title.includes('SIP') ? 'SIP Option' : 'Safe Bank Saving'}
                              </span>
                              <h5 className="font-black text-slate-800 text-sm mt-1">{opt.title}</h5>
                              <p className="text-[10px] text-slate-500 leading-normal">{opt.description}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
                          </div>
                        ))}
                      </div>

                      {/* Actionable expert tips */}
                      <div className="space-y-3">
                        <h4 className="font-extrabold text-xs text-slate-400 pl-1 uppercase tracking-wider">{b('expertTipsHead')}</h4>
                        
                        <div className="grid grid-cols-1 gap-2">
                          {savingsTips.map((tip) => (
                            <div 
                              key={tip.id} 
                              onClick={() => {
                                handlePromptChipClick(`${tip.category}: "${tip.tip}" - Is bachat tip ko aur acche se samjhayein.`);
                              }}
                              className="p-3.5 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-400 active:scale-[0.98] cursor-pointer transition-all border border-emerald-100 rounded-xl flex gap-2 text-emerald-950 font-bold text-xs select-none"
                            >
                              <span className="shrink-0 text-base">💡</span>
                              <div>
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded mr-1.5 font-black uppercase">{tip.category}</span>
                                <p className="mt-1 text-slate-700 font-semibold leading-relaxed">{tip.tip}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 5: PROFILE (Settings, stats & help - Screen 17) */}
                  {activeTab === 'profile' && (
                    <div id="profile_tab" className="space-y-4">
                      
                      {/* Top profile stats section */}
                      <div className="bg-emerald-900 text-white rounded-3xl p-5 text-center relative overflow-hidden">
                        <div className="w-16 h-16 rounded-full bg-amber-400 text-emerald-950 font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-md border-2 border-white">
                          {user.name ? user.name[0].toUpperCase() : 'S'}
                        </div>
                        <h3 className="text-xl font-extrabold text-white">
                          {user.name 
                            ? user.name.charAt(0).toUpperCase() + user.name.slice(1) 
                            : 'Ramesh Kumar'}
                        </h3>
                        <p className="text-xs text-emerald-200 mt-1 font-semibold">{user.mobile_number} • {user.user_type || 'Gig Worker'}</p>

                        <div className="grid grid-cols-3 gap-2.5 text-center mt-5 pt-4 border-t border-emerald-800/60">
                          <div>
                            <div className="text-amber-300 text-base font-black">72</div>
                            <span className="text-[9px] text-emerald-200 font-bold uppercase tracking-wider block mt-0.5">SCORE</span>
                          </div>

                          <div>
                            <div className="text-amber-300 text-base font-black">₹{user.monthly_income?.toLocaleString('en-IN') || '15K'}</div>
                            <span className="text-[9px] text-emerald-200 font-bold uppercase tracking-wider block mt-0.5">INCOME</span>
                          </div>

                          <div>
                            <div className="text-amber-300 text-base font-black">12 din</div>
                            <span className="text-[9px] text-emerald-200 font-bold uppercase tracking-wider block mt-0.5">STREAK</span>
                          </div>
                        </div>
                      </div>

                      {/* Settings Cards & Options list */}
                      <div className="bg-white border border-slate-150 rounded-2xl p-2 shadow-3xs space-y-1">
                        {[
                          { title: "Personal Details / व्यक्तिगत जानकारी", icon: <User className="w-4 h-4 text-slate-400" />, onClick: () => {
                            handlePromptChipClick("व्यक्तिगत जानकारी कैसे बदलें?");
                          }},
                          { title: `Language / भाषा: ${user.language || 'Hindi'}`, icon: <Volume2 className="w-4 h-4 text-slate-400" />, onClick: () => {
                            const nextLang = user.language === 'Hindi' ? 'English' : 'Hindi';
                            handleProfileUpdate({ language: nextLang });
                            setSelectedLang(nextLang);
                          }},
                          { title: "Financial Health Score", icon: <Award className="w-4 h-4 text-slate-400" />, onClick: () => setActiveTab('lakshya') },
                          { title: selectedLang === 'English' ? "How to Use / Play Demo 🎥" : "कैसे इस्तेमाल करें 🎥", icon: <Video className="w-4 h-4 text-emerald-650 animate-pulse" />, onClick: () => {
                            voice.current.cancelSpeaking();
                            setShowDemoPlayer(true);
                          }},
                          { title: selectedLang === 'English' ? "Download User Journey & Chat Log (Safar Nama)" : "सफ़र नामा रिपोर्ट डाउनलोड करें (User Journey)", icon: <Download className="w-4 h-4 text-emerald-600 animate-pulse" />, onClick: downloadUserJourney },
                          { title: "Help & Whatsapp Support", icon: <HelpCircle className="w-4 h-4 text-slate-400" />, onClick: () => {
                            handlePromptChipClick("व्हाट्सप्प सपोर्ट नंबर क्या है?");
                          }}
                        ].map((option, index) => (
                          <button 
                            key={index}
                            onClick={option.onClick}
                            className="w-full p-3.5 rounded-xl text-left flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="bg-slate-50 p-2 rounded-lg shrink-0">{option.icon}</span>
                              <span>{option.title}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                          </button>
                        ))}
                      </div>

                      {/* VOICE & SOUND DIAGNOSTIC DESK */}
                      <div className="bg-gradient-to-br from-emerald-50 to-amber-50 border border-emerald-150 rounded-2xl p-4 shadow-3xs space-y-3 text-left">
                        <div className="flex items-center gap-2 border-b border-emerald-100 pb-2">
                          <Volume2 className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                          <h4 className="font-extrabold text-[11px] uppercase text-emerald-900 tracking-wider">
                            {selectedLang === 'English' ? "🎙️ Voice & Sound Support Desk" : "🎙️ आवाज़ और स्पीकर समस्या निवारण"}
                          </h4>
                        </div>

                        {/* Connection Warning for HTTP */}
                        {typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && (
                          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-950 rounded-xl space-y-1.5">
                            <p className="text-[10px] font-black leading-relaxed">
                              ⚠️ {selectedLang === 'English' ? "Unsecure HTTP Connection Detected!" : "नॉन-एचटीटीपीएस कनेक्शन!"}
                            </p>
                            <p className="text-[9px] font-medium text-rose-800 leading-normal">
                              {selectedLang === 'English' 
                                ? "Browsers strictly disable both microphone (Speech-to-text) and speech (sound) on non-secure HTTP links. Click below to reload over secure HTTPS." 
                                : "सुरक्षा नीति के कारण बिना HTTPS वाले सर्वर पर आवाज़ और माइक बंद रहते हैं। इस बटन को दबाकर HTTPS पर स्विच करें:"}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                if (typeof window !== 'undefined' && window.location) {
                                  window.location.protocol = 'https:';
                                }
                              }}
                              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-1.5 px-3 rounded-lg text-[9px] uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer text-center"
                            >
                              🚀 Switch to Secure HTTPS / सुरक्षित करें
                            </button>
                          </div>
                        )}

                        {/* Diagnostics Checklist */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-700 font-bold">
                          <div className="p-2 bg-emerald-100/40 rounded-xl border border-emerald-100/60 flex items-center justify-between">
                            <span>{selectedLang === 'English' ? "🔊 Speaker Support:" : "🔊 स्पीकर सपोर्ट:"}</span>
                            <span className="text-emerald-750 font-black">
                              {typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined' ? "✅ YES" : "❌ NO"}
                            </span>
                          </div>
                          <div className="p-2 bg-emerald-100/40 rounded-xl border border-emerald-100/60 flex items-center justify-between">
                            <span>{selectedLang === 'English' ? "🎤 Mic Support:" : "🎙️ माइक सपोर्ट:"}</span>
                            <span className="text-emerald-750 font-black">
                              {typeof window !== 'undefined' && (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window)) ? "✅ YES" : "❌ NO"}
                            </span>
                          </div>
                          <div className="p-2 bg-emerald-100/40 rounded-xl border border-emerald-100/60 flex items-center justify-between col-span-2">
                            <span>{selectedLang === 'English' ? "🔒 Secure Context (HTTPS):" : "🔒 सुरक्षित कनेक्शन (HTTPS):"}</span>
                            <span className={`font-black ${typeof window !== 'undefined' && window.isSecureContext ? "text-emerald-750" : "text-amber-600"}`}>
                              {typeof window !== 'undefined' && window.isSecureContext ? "✅ YES" : "⚠️ NO"}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              // Force unlock mobile browser synthesis AudioContext restriction
                              if (typeof window !== 'undefined' && window.speechSynthesis) {
                                try {
                                  window.speechSynthesis.cancel();
                                  const u = new SpeechSynthesisUtterance('');
                                  u.volume = 0;
                                  window.speechSynthesis.speak(u);
                                  if (window.speechSynthesis.paused) {
                                    window.speechSynthesis.resume();
                                  }
                                } catch (err) {}
                              }
                              
                              setSoundCheckActive(true);
                              voice.current.speak(
                                selectedLang === 'English' 
                                  ? "Hello! Paisa Saathi audio system is active. Sound is working perfectly." 
                                  : "नमस्ते! पैसा साथी ऑडियो सिस्टम सक्रिय है। आवाज बिल्कुल सही काम कर रही है।",
                                selectedLang,
                                () => {},
                                () => setSoundCheckActive(false),
                                () => setSoundCheckActive(false)
                              );
                            }}
                            className={`flex-1 font-extrabold py-2 px-3 rounded-xl text-[10px] uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-all shadow-3xs cursor-pointer ${soundCheckActive ? 'bg-amber-400 text-slate-900 animate-pulse' : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'}`}
                          >
                            <span>📢 {selectedLang === 'English' ? "Test Sound" : "आवाज़ टेस्ट करें"}</span>
                          </button>

                          <button
                            type="button"
                            disabled={micCheckStatus === 'testing'}
                            onClick={() => {
                              setMicCheckStatus('testing');
                              if (typeof window !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                                navigator.mediaDevices.getUserMedia({ audio: true })
                                  .then((stream) => {
                                    setMicCheckStatus('authorized');
                                    stream.getTracks().forEach(track => track.stop());
                                  })
                                  .catch((err) => {
                                    console.error("Mic check error:", err);
                                    setMicCheckStatus('blocked');
                                  });
                              } else {
                                setMicCheckStatus('blocked');
                              }
                            }}
                            className={`flex-1 font-extrabold py-2 px-3 rounded-xl text-[10px] uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-all shadow-3xs cursor-pointer ${
                              micCheckStatus === 'testing' ? 'bg-amber-200 text-slate-600 animate-pulse' :
                              micCheckStatus === 'authorized' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              micCheckStatus === 'blocked' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                              'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                            }`}
                          >
                            <span>
                              {micCheckStatus === 'testing' ? (selectedLang === 'English' ? "Testing..." : "जांच...") :
                               micCheckStatus === 'authorized' ? (selectedLang === 'English' ? "Mic: Active! ✅" : "माइक: ओके! ✅") :
                               micCheckStatus === 'blocked' ? (selectedLang === 'English' ? "Mic: Blocked ❌" : "माइक: ब्लॉक ❌") :
                               (selectedLang === 'English' ? "Test Mic Permission" : "माइक परमिशन जांचें")}
                            </span>
                          </button>
                        </div>

                        {/* Helpful Troubleshooting tip depending on mic state */}
                        {micCheckStatus === 'blocked' && (
                          <p className="text-[9px] font-semibold text-rose-700 bg-rose-50 p-2 rounded-lg leading-normal">
                            💡 **{selectedLang === 'English' ? "How to Unblock Mic" : "माइक ब्लॉक दूर करें"}:** 
                            {selectedLang === 'English' 
                              ? " Click the padlock/configurations icon left of URL bar, change microphone permission to 'Allow', then refresh the page."
                              : " ब्राउज़र में URL के पास ताले (lock) या सेटिंग वाले बटन को दबाएं। 'Microphone / माइक' को 'Allow' या हमेशा चालू करें, फिर पेज रीफ्रेश करें।"}
                          </p>
                        )}

                        <p className="text-[8px] text-slate-500 font-medium leading-relaxed italic">
                          ℹ️ {selectedLang === 'English' 
                            ? "iOS Safari Users: Make sure physical Silent/Mute switch is turned OFF. Web apps are silenced when phone is set to silent." 
                            : "iPhone यूजर्स: कृपया मोबाइल का साइलेंट बटन ऑन करें। म्यूट होने पर सफारी साउंड को रोकता है।"}
                        </p>
                      </div>

                      {/* Trust guarantee message block */}
                      <div className="p-3 bg-emerald-50 text-emerald-950 border border-emerald-100 rounded-xl flex gap-2 items-center text-[10px] font-bold">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-emerald-800 text-[10px] leading-relaxed">
                          हम आपका पैसा नहीं छूते, कोई हिडन चार्ज नहीं, सिर्फ सुरक्षित वित्तीय मार्गदर्शन।
                        </span>
                      </div>

                      {/* Logout Action Button */}
                      <button
                        onClick={handleLogout}
                        className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-sm py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-3xs"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout / ऐप बंद करें</span>
                      </button>

                    </div>
                  )}
                </div>
              )}
            </>)}
        </main>

        {/* --- GLOBAL VOICE COMPANION (आवाज़ साथी - Page 1 & subsequent pages) --- */}
        {currentScreen !== 'splash' && (
          <div id="voice-companion-panel" className="bg-emerald-900 text-emerald-50 border-t border-emerald-800 shrink-0 flex flex-col z-40 relative shadow-inner">
            <div className="px-4 py-2.5 flex items-center justify-between gap-3 bg-emerald-950/60">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 ${isListening ? 'bg-rose-500 text-white animate-pulse scale-105' : 'bg-emerald-600 text-emerald-100'}`}>
                  {isListening ? <Mic className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] font-black tracking-widest uppercase text-amber-400/90 flex items-center gap-1">
                    <span>आवाज़ साथी</span>
                    <span className="text-[8px] text-emerald-400 font-bold">• VOICE ASSISTANT</span>
                  </div>
                  <p className="text-[11px] font-extrabold leading-snug text-white/95 mt-0.5 line-clamp-2">
                    {voiceStatusText}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                {/* Voice Status Waves */}
                {isSpeaking && (
                  <div className="flex items-center gap-0.5 px-1.5 py-1 bg-emerald-900/40 rounded-lg shrink-0">
                    <span className="w-0.5 h-2.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-0.5 h-4 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-0.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                )}

                {/* Speaker Toggle Icon */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !isVoiceEnabled;
                    setIsVoiceEnabled(next);
                    voice.current.setTtsEnabled(next);
                    if (next) {
                      setVoiceStatusText("आवाज़ साथी चालू है! (Voice ON)");
                      voice.current.speak("Aawaz sathi chaloo hai", selectedLang);
                    } else {
                      setVoiceStatusText("आवाज़ म्यूट है। (Voice Output Muted)");
                      voice.current.cancelSpeaking();
                    }
                  }}
                  title={isVoiceEnabled ? "Mute Companion" : "Unmute Companion"}
                  className={`p-2 rounded-lg transition-all ${isVoiceEnabled ? 'bg-emerald-800 text-emerald-200 hover:bg-emerald-700' : 'bg-stone-800 text-stone-400'}`}
                >
                  <Volume2 className={`w-3.5 h-3.5 ${!isVoiceEnabled ? 'opacity-45' : ''}`} />
                </button>

                {/* Start Speaking Mic Action */}
                <button
                  type="button"
                  onClick={isListening ? handleStopListening : handleStartListening}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all hover:scale-103 active:scale-97 flex items-center gap-1 shadow-sm ${
                    isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-400 text-emerald-950 hover:bg-amber-300'
                  }`}
                >
                  {isListening ? "स्टॉप" : "बोलें / SPEAK"}
                </button>
              </div>
            </div>

            {/* Simulated Voice chips block for Iframe browser security compliance */}
            <div className="px-3.5 py-1.5 bg-emerald-950 border-t border-emerald-900/50 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none items-center">
              <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest leading-none shrink-0">💡 CLICK TO REPAIR/SIMULATE SPEECH:</span>
              
              {currentScreen === 'login' && !otpSent && (
                <button
                  type="button"
                  onClick={() => handleVoiceTranscript("My phone number is 9 8 7 6 5 4 3 2 1 0")}
                  className="px-2 py-1 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-800/40 rounded-md text-[9px] font-bold text-emerald-200 transition-colors shrink-0"
                >
                  🗣️ "Mera Phone: 9876543210"
                </button>
              )}

              {currentScreen === 'login' && otpSent && (
                <button
                  type="button"
                  onClick={() => handleVoiceTranscript("My login code is 1 2 3 4")}
                  className="px-2 py-1 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-800/40 rounded-md text-[9px] font-bold text-emerald-200 transition-colors shrink-0"
                >
                  🗣️ "Mera code 1-2-3-4"
                </button>
              )}

              {currentScreen === 'language' && (
                <button
                  type="button"
                  onClick={() => handleVoiceTranscript("Choose Hindi for me please")}
                  className="px-2 py-1 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-800/40 rounded-md text-[9px] font-bold text-emerald-200 transition-colors shrink-0"
                >
                  🗣️ "Bhasha Hindi chuno"
                </button>
              )}

              {currentScreen === 'onboarding' && (
                <button
                  type="button"
                  onClick={() => handleVoiceTranscript("Mera naam Raju hai aur meri kamai pachis hazar hai")}
                  className="px-2 py-1 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-800/40 rounded-md text-[9px] font-bold text-emerald-200 transition-colors shrink-0"
                >
                  🗣️ "Mera naam Raju kamai 25000"
                </button>
              )}

              {currentScreen === 'main' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleVoiceTranscript("Pachas rupaye rasgulla khane par kharch kiye spent")}
                    className="px-2 py-1 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-800/40 rounded-md text-[9px] font-bold text-emerald-200 transition-colors shrink-0"
                  >
                    💸 spent ₹50 on Sweet
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVoiceTranscript("Sau rupaye bachaye save for child education goal")}
                    className="px-2 py-1 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-800/40 rounded-md text-[9px] font-bold text-emerald-200 transition-colors shrink-0"
                  >
                    🎯 Save ₹100 for Goal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('chat');
                      handleVoiceTranscript("महीने का ₹500 का SIP कैसे शुरू करें?");
                    }}
                    className="px-2 py-1 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-800/40 rounded-md text-[9px] font-bold text-emerald-200 transition-colors shrink-0"
                  >
                    💬 Chat: "SIP kya hai?"
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Bottom Custom Navigation tabs */}
        {currentScreen === 'main' && user && (
            <nav id="app-footer-nav" className="absolute bottom-0 inset-x-0 h-16 bg-white border-t border-slate-150 flex items-center justify-around z-40 px-2 shrink-0">
              {[
                { id: 'home', label: b('navHome'), icon: <Landmark className="w-5 h-5" /> },
                { id: 'chat', label: b('navChat'), icon: <MessageSquare className="w-5 h-5 animate-pulse" /> },
                { id: 'lakshya', label: b('navGoals'), icon: <TrendingUp className="w-5 h-5" /> },
                { id: 'sikhein', label: b('navLearn'), icon: <Award className="w-5 h-5" /> },
                { id: 'profile', label: b('navProfile'), icon: <User className="w-5 h-5" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setErrorMsg('');
                  }}
                  className={`flex flex-col items-center justify-center w-14 h-12 rounded-lg transition-all ${
                    highlightedTab === tab.id
                      ? 'ring-4 ring-amber-400 ring-offset-2 scale-110 shadow-lg bg-amber-50 text-amber-800 font-extrabold animate-bounce z-50'
                      : activeTab === tab.id
                      ? 'text-emerald-700 bg-emerald-50/50 scale-105 font-black'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab.icon}
                  <span className="text-[10px] font-extrabold mt-0.5 tracking-wide">{tab.label}</span>
                </button>
              ))}
            </nav>
          )}

        {/* Floating Calling Agent Helper FAB */}
        {currentScreen === 'main' && user && !isCallActive && (
          <button
            id="calling-agent-fab"
            onClick={startVoiceCall}
            className="absolute bottom-20 right-4 h-12 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl flex items-center gap-2 font-bold text-xs z-35 animate-bounce active:scale-95 transition-all border-2 border-emerald-300"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-100"></span>
            </span>
            <span>📞 Call Helper (सहायता साथी)</span>
          </button>
        )}

        {/* Calling Agent Phone Overlay */}
        {isCallActive && (
          <div className="absolute inset-0 bg-slate-900/98 z-50 flex flex-col justify-between p-6 text-white font-sans animate-fade-in select-none">
            {/* Call Header */}
            <div className="flex flex-col items-center pt-8">
              <div className="flex items-center gap-1.5 bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-700/30 text-emerald-200 text-[9px] font-extrabold uppercase tracking-widest mb-4">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                <span>Paisa Saathi Voice Helpline</span>
              </div>
              
              <h2 className="text-xl font-black text-white mt-1">AI ध्वनि सहायक (Voice Sathi)</h2>
              <p className="text-slate-400 text-xs mt-1">100% Secure Free Helpline</p>
            </div>

            {/* Speaking Avatar & Ring Waves */}
            <div className="flex flex-col items-center justify-center my-6 py-4 flex-1">
              <div className="relative">
                {/* Visual Ripple waves if AI is speaking or listening */}
                {(isCallAgentSpeaking || isCallAgentListening) && (
                  <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-pulse scale-150"></div>
                )}
                {(isCallAgentSpeaking) && (
                  <div className="absolute inset-x-0 -bottom-2 flex justify-center gap-1 z-10">
                    <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-5 bg-emerald-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                )}
                <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-emerald-500 flex items-center justify-center overflow-hidden shadow-2xl relative">
                  <span className="text-6xl select-none">🧑‍💼</span>
                  {isCallAgentListening && (
                    <div className="absolute inset-0 bg-emerald-950/70 flex flex-col items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Call timing / status */}
              <div className="text-center mt-6">
                <p className="font-mono text-base tracking-widest text-emerald-400 font-bold">
                  {callStatus === 'connecting' ? "Ringing..." : formatCallDuration(callDuration)}
                </p>
                <p className="text-xs text-slate-400 font-extrabold mt-1">
                  {callStatus === 'connecting' ? "Connecting Call / घंटी जा रही है..." : 
                   isCallAgentSpeaking ? "Saathi speaking / साथी बोल रहा है..." :
                   isCallAgentListening ? "Listening... बोलिए..." : "Connected / जुड़े हुए हैं"}
                </p>
              </div>

              {/* Real-time Subtitles */}
              <div className="w-full max-w-sm mt-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800 min-h-24 flex flex-col justify-between gap-3 text-left">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">आपने बोला (Transcript):</span>
                  <p className="text-xs italic text-slate-200 mt-1 font-semibold leading-relaxed">
                    {callTranscript || "बोलें, मैं सुन रहा हूँ..."}
                  </p>
                </div>
                <div className="border-t border-slate-900/40 my-1"></div>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">साथी का जवाब (Response):</span>
                  <p className="text-xs text-slate-100 font-medium leading-relaxed mt-1">
                    {callResponseText || "नमस्ते! घंटी बजने के बाद बात करें। मैं आपकी मदद के लिए तैयार हूँ।"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick-Preset Speech Buttons in case Web Speech blocks mic (100% robust fallback!) */}
            <div className="w-full max-w-sm mx-auto mb-6">
              <p className="text-slate-400 text-[10px] font-black text-center uppercase tracking-widest mb-2">
                Click Option below to Voice Command / नीचे विकल्प दबाकर भी बोल सकते हैं
              </p>
              <div className="grid grid-cols-2 gap-2 text-left">
                <button
                  onClick={() => {
                    endVoiceCall();
                    setActiveTab('lakshya');
                    speakResponse(selectedLang === 'English' ? "Opening expenses and budget tracker page." : "मैंने आपके लिए दैनिक खर्च वाला पन्ना खोल दिया है।");
                  }}
                  className="bg-slate-800/80 hover:bg-slate-800 cursor-pointer active:scale-95 text-[10px] font-bold py-2 px-2.5 rounded-lg border border-slate-700/60 transition-all text-slate-200"
                >
                  💸 Show Expenses / खर्च
                </button>
                <button
                  onClick={() => {
                    endVoiceCall();
                    setActiveTab('lakshya');
                    setIsAddingGoal(true);
                    speakResponse(selectedLang === 'English' ? "Opening add saving goal form." : "नया बचत लक्ष्य जोड़ने के लिए फॉर्म खोल दिया है।");
                  }}
                  className="bg-slate-800/80 hover:bg-slate-800 cursor-pointer active:scale-95 text-[10px] font-bold py-2 px-2.5 rounded-lg border border-slate-700/60 transition-all text-slate-200"
                >
                  🎯 Add Saving goal / लक्ष्य
                </button>
                <button
                  onClick={() => {
                    endVoiceCall();
                    setActiveTab('sikhein');
                    speakResponse(selectedLang === 'English' ? "Opening safe investment options and government schemes." : "निवेश योजना और सरकारी योजनाओं का पन्ना खुल गया है।");
                  }}
                  className="bg-slate-800/80 hover:bg-slate-800 cursor-pointer active:scale-95 text-[10px] font-bold py-2 px-2.5 rounded-lg border border-slate-700/60 transition-all text-slate-200"
                >
                  💡 Learn Investing / निवेश
                </button>
                <button
                  onClick={() => {
                    endVoiceCall();
                    setActiveTab('profile');
                    speakResponse(selectedLang === 'English' ? "Opening language selection page inside profile settings." : "भाषा बदलने के लिए प्रोफाइल सेटिंग्स खोल दी गयी है।");
                  }}
                  className="bg-slate-800/80 hover:bg-slate-800 cursor-pointer active:scale-95 text-[10px] font-bold py-2 px-2.5 rounded-lg border border-slate-700/60 transition-all text-slate-200"
                >
                  🌐 Set Language / भाषा
                </button>
              </div>
            </div>

            {/* Hangups / Red End call */}
            <div className="flex flex-col items-center pb-6">
              <button
                onClick={endVoiceCall}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-lg transition-all border-4 border-slate-900"
              >
                <Phone className="w-7 h-7 rotate-135" />
              </button>
              <span className="text-rose-500 text-[10px] font-black uppercase tracking-wider mt-3">फोन काटें (End Call)</span>
            </div>
          </div>
        )}

        {showDemoPlayer && (
          <ProductDemoPlayer 
            onClose={() => setShowDemoPlayer(false)} 
            selectedLang={selectedLang} 
            speakText={(text, force) => speakResponse(text, force)} 
            stopSpeaking={() => voice.current.cancelSpeaking()} 
            userName={user?.name || ''}
          />
        )}

        </div>
      </div>
  );
}
