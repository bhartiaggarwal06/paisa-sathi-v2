import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipForward, RotateCcw, Volume2, VolumeX, 
  X, Laptop, ArrowRight, Check, CheckCircle2, Award, 
  TrendingUp, Wallet, Shield, Landmark, MessageSquare, Plus, FileText, Sparkles, AlertTriangle, Mic, Lightbulb
} from 'lucide-react';

interface DemoPlayerProps {
  onClose: () => void;
  selectedLang: string;
  speakText: (text: string, forceLang?: string) => void;
  stopSpeaking: () => void;
  userName?: string;
}

interface Scene {
  id: number;
  title: string;
  duration: number; // in seconds
  voiceoverEn: string;
  voiceoverHi: string;
  screen: 'login' | 'home' | 'earnings' | 'expenses' | 'chat' | 'benefits' | 'report' | 'end';
}

export default function ProductDemoPlayer({ onClose, selectedLang, speakText, stopSpeaking, userName }: DemoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [sceneProgress, setSceneProgress] = useState<number>(0); // 0 to 100
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x or 1.5x or 2x
  const [narrationEnabled, setNarrationEnabled] = useState<boolean>(true);
  const [demoLang, setDemoLang] = useState<'Hindi' | 'English'>('Hindi');
  
  const parsedFirstName = userName ? userName.trim().split(/[\s,]+/)[0] : '';
  const firstName = parsedFirstName ? (parsedFirstName.charAt(0).toUpperCase() + parsedFirstName.slice(1).toLowerCase()) : '';
  
  const getDynamicStoryTitle = () => {
    if (firstName) {
      return `${firstName} Ka Ek Din – Paisa Saathi Ke Saath`;
    }
    return "Mera Ek Din – Paisa Saathi Ke Saath";
  };

  const formatText = (text: string) => {
    if (!text) return '';
    const currentFirst = firstName || 'Harish';
    const currentFull = firstName || 'Harish';
    
    return text
      .replace(/Harish Mishra/g, currentFull)
      .replace(/Harish ji/g, `${currentFirst} ji`)
      .replace(/Harish/g, currentFirst);
  };

  // Simulated Cursor state for a realistic hand click effect
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; opacity: number; clicking: boolean }>({ x: 50, y: 50, opacity: 0, clicking: false });
  
  // Simulation application state
  const [simPhone, setSimPhone] = useState<string>('');
  const [simOtp, setSimOtp] = useState<string>('');
  const [simLoggedIn, setSimLoggedIn] = useState<boolean>(false);
  const [simAppTab, setSimAppTab] = useState<'home' | 'expense' | 'goals' | 'learn' | 'benefits' | 'chat'>('home');
  
  // Audio Speech Wave pulse toggle
  const [voiceWavePulse, setVoiceWavePulse] = useState<boolean>(false);
  const [voiceTextBubble, setVoiceTextBubble] = useState<string>('');

  // Daily ledger simulations
  const [simIncome, setSimIncome] = useState<number>(0);
  const [simExpenses, setSimExpenses] = useState<Array<{ category: string; amount: number; description: string }>>([]);
  const [simChatMessages, setSimChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([]);
  const [simGoalProgress, setSimGoalProgress] = useState<number>(0);

  useEffect(() => {
    const activeFirst = firstName || 'Harish';
    const activeFirstHi = demoLang === 'Hindi' ? (firstName === 'Harish' || !firstName ? 'हरीश' : firstName) : activeFirst;
    setSimChatMessages([
      { 
        sender: 'assistant', 
        text: demoLang === 'Hindi' 
          ? `नमस्ते ${activeFirstHi} जी! मैं आपका पैसा साथी हूँ। आज क्या पूछना चाहेंगे?` 
          : `Namaste ${activeFirst} ji! Main aapka Paisa Saathi hoon. Aaj kya poochhna chahenge?` 
      }
    ]);
  }, [userName, firstName, demoLang]);

  const timerRef = useRef<any>(null);

  // 8 Narrative Scenes defined by user
  const baseScenes: Scene[] = [
    {
      id: 1,
      title: "1. MORNING (सुबह की शुरुआत)",
      duration: 15,
      voiceoverEn: "Meet Harish Mishra, a delivery partner who earns daily but finds it difficult to save money consistently.",
      voiceoverHi: "मिलिए हरीश मिश्रा जी से, एक डिलीवरी पार्टनर जो रोज़ कमाते हैं लेकिन लगातार बचत करने में उन्हें मुश्किल होती है।",
      screen: 'login'
    },
    {
      id: 2,
      title: "2. START OF WORKDAY (दिन की शुरुआत)",
      duration: 12,
      voiceoverEn: "Before starting work, Harish checks his finances for the day.",
      voiceoverHi: "काम शुरू करने से पहले, हरीश जी आज की अपनी वित्तीय स्थिति चेक करते हैं।",
      screen: 'home'
    },
    {
      id: 3,
      title: "3. DURING THE DAY: INCOME (कमाई दर्ज करना)",
      duration: 14,
      voiceoverEn: "Harish can update his earnings using simple voice commands.",
      voiceoverHi: "हरीश जी आसान वॉयस कमांड का उपयोग करके अपनी कमाई को अपडेट कर सकते हैं।",
      screen: 'earnings'
    },
    {
      id: 4,
      title: "4. RECORDING EXPENSES (खर्चे जोड़ना)",
      duration: 20,
      voiceoverEn: "Expenses can be added in seconds without typing.",
      voiceoverHi: "बिना टाइप किए कुछ ही सेकंड में खर्चे भी जोड़े जा सकते हैं।",
      screen: 'expenses'
    },
    {
      id: 5,
      title: "5. ASKING FOR HELP (दीदी से सवाल)",
      duration: 16,
      voiceoverEn: "The AI assistant provides simple and practical financial guidance.",
      voiceoverHi: "दीदी एआई असिस्टेंट उन्हें सरल और व्यावहारिक वित्तीय सलाह देती है।",
      screen: 'chat'
    },
    {
      id: 6,
      title: "6. GOVERNMENT BENEFITS (सरकारी योजनाएं)",
      duration: 13,
      voiceoverEn: "Paisa Saathi also helps users discover schemes they may be eligible for.",
      voiceoverHi: "पैसा साथी यूज़र्स को उन सरकारी योजनाओं को खोजने में भी मदद करता है जिनके वे योग्य हो सकते हैं।",
      screen: 'benefits'
    },
    {
      id: 7,
      title: "7. WEEKLY REPORT (साप्ताहिक ब्यौरा)",
      duration: 15,
      voiceoverEn: "At the end of the week, Harish receives a simple summary of his finances.",
      voiceoverHi: "हफ्ते के अंत में, हरीश जी को अपने पैसों का एक बहुत ही सरल लेखा-जोखा मिलता है।",
      screen: 'report'
    },
    {
      id: 8,
      title: "8. END SCREEN (सुरक्षित लक्ष्य)",
      duration: 12,
      voiceoverEn: "With small daily actions, Harish is building better financial habits and moving closer to his goals.",
      voiceoverHi: "रोज़ाना के छोटे-छोटे कदमों से, हरीश जी बेहतर वित्तीय आदतें बना रहे हैं और अपने लक्ष्यों के करीब पहुँच रहे हैं।",
      screen: 'end'
    }
  ];

  const scenes: Scene[] = baseScenes.map(scene => ({
    ...scene,
    voiceoverEn: formatText(scene.voiceoverEn),
    voiceoverHi: formatText(scene.voiceoverHi)
  }));

  // Narration assistant trigger of Text-To-Speech
  const playNarration = (index: number) => {
    if (!narrationEnabled) return;
    stopSpeaking();
    
    setTimeout(() => {
      const scene = scenes[index];
      const textToSpeak = demoLang === 'English' ? scene.voiceoverEn : scene.voiceoverHi;
      const langCode = demoLang === 'English' ? 'English' : 'Hindi';
      speakText(textToSpeak, langCode);
    }, 150);
  };

  // Main driver loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    playNarration(currentSceneIndex);

    let localProgress = 0;
    const ticksPerScene = 10;
    const intervalMs = 100;
    const stepIncrement = 1 / (scenes[currentSceneIndex].duration * ticksPerScene * playbackSpeed);

    timerRef.current = setInterval(() => {
      localProgress += stepIncrement;
      setSceneProgress(Math.min(100, Math.floor(localProgress * 100)));

      animateSimulator(currentSceneIndex, localProgress);

      if (localProgress >= 1) {
        clearInterval(timerRef.current);
        // Advance
        if (currentSceneIndex < scenes.length - 1) {
          setCurrentSceneIndex(prev => prev + 1);
          setSceneProgress(0);
        } else {
          // Restart loop
          setCurrentSceneIndex(0);
          setSceneProgress(0);
          resetSimulationData();
        }
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSceneIndex, playbackSpeed, demoLang, narrationEnabled]);

  const resetSimulationData = () => {
    const activeFirst = firstName || 'Harish';
    const activeFirstHi = demoLang === 'Hindi' ? (firstName === 'Harish' || !firstName ? 'हरीश' : firstName) : activeFirst;
    setSimPhone('');
    setSimOtp('');
    setSimLoggedIn(false);
    setSimAppTab('home');
    setSimIncome(0);
    setSimExpenses([]);
    setVoiceWavePulse(false);
    setVoiceTextBubble('');
    setSimGoalProgress(0);
    setSimChatMessages([
      { 
        sender: 'assistant', 
        text: demoLang === 'Hindi' 
          ? `नमस्ते ${activeFirstHi} जी! मैं आपका पैसा साथी हूँ। आज क्या पूछना चाहेंगे?` 
          : `Namaste ${activeFirst} ji! Main aapka Paisa Saathi hoon. Aaj kya poochhna chahenge?` 
      }
    ]);
  };

  const animateSimulator = (sceneIndex: number, progress: number) => {
    switch (sceneIndex) {
      case 0: // SCENE 1 - LOGIN
        setSimAppTab('home');
        if (progress < 0.1) {
          setCursorPos({ x: 50, y: 54, opacity: 1, clicking: false });
        } else if (progress >= 0.1 && progress < 0.35) {
          // Type Phone Number
          setCursorPos({ x: 45, y: 54, opacity: 1, clicking: true });
          setSimPhone('9876543210');
        } else if (progress >= 0.35 && progress < 0.5) {
          // Trigger OTP Enter
          setCursorPos({ x: 50, y: 70, opacity: 1, clicking: true });
          setSimOtp('123456');
        } else if (progress >= 0.5 && progress < 0.75) {
          // Click Verify & Logged In
          setCursorPos({ x: 50, y: 78, opacity: 1, clicking: true });
          setSimLoggedIn(true);
        } else {
          setCursorPos({ x: 50, y: 78, opacity: 0, clicking: false });
        }
        break;

      case 1: // SCENE 2 - START OF WORKDAY
        setSimLoggedIn(true);
        setSimAppTab('home');
        setVoiceWavePulse(false);
        setVoiceTextBubble('');
        if (progress < 0.4) {
          // Highlights emergency savings cards
          setCursorPos({ x: 50, y: 25, opacity: 1, clicking: false });
        } else if (progress >= 0.4 && progress < 0.8) {
          // Inspect Daily Saving Goal target ₹50
          setCursorPos({ x: 52, y: 48, opacity: 1, clicking: false });
        } else {
          setCursorPos({ x: 52, y: 48, opacity: 0, clicking: false });
        }
        break;

      case 2: // SCENE 3 - DURING THE DAY (INCOME)
        setSimLoggedIn(true);
        setSimAppTab('home');
        if (progress >= 0.1 && progress < 0.3) {
          // Move cursor to Voice input icon bar
          setCursorPos({ x: 50, y: 88, opacity: 1, clicking: true });
          setVoiceWavePulse(true);
        } else if (progress >= 0.3 && progress < 0.75) {
          setVoiceWavePulse(true);
          setVoiceTextBubble(demoLang === 'Hindi' ? '"मैंने आज १२०० रुपये कमाए।"' : '"Maine aaj 1200 rupaye kamaye."');
        } else if (progress >= 0.75 && progress < 0.95) {
          setVoiceWavePulse(false);
          setVoiceTextBubble('');
          setSimIncome(1200);
          setCursorPos({ x: 50, y: 25, opacity: 1, clicking: false });
        } else {
          setCursorPos({ x: 50, y: 25, opacity: 0, clicking: false });
        }
        break;

      case 3: // SCENE 4 - EXPENSES RECORDING
        setSimLoggedIn(true);
        setSimAppTab('expense');
        if (progress >= 0.0 && progress < 0.3) {
          // Fuel expense 300
          setVoiceWavePulse(true);
          setVoiceTextBubble(demoLang === 'Hindi' ? '"मैंने ३०० रुपये पेट्रोल पर खर्च किए।"' : '"Maine 300 rupaye petrol par kharch kiye."');
          if (simExpenses.length === 0) {
            setSimExpenses([{ category: "Petrol ⛽", amount: 300, description: "Fuel for deliveries" }]);
          }
        } else if (progress >= 0.3 && progress < 0.6) {
          // Grocery expense 200
          setVoiceWavePulse(true);
          setVoiceTextBubble(demoLang === 'Hindi' ? '"मैंने २०० रुपये किराना पर खर्च किए।"' : '"Maine 200 rupaye grocery par kharch kiye."');
          if (simExpenses.length === 1) {
            setSimExpenses(prev => [...prev, { category: "Kirana 🌾", amount: 200, description: "Household groceries" }]);
          }
        } else if (progress >= 0.6 && progress < 0.9) {
          // Medicine expense 150
          setVoiceWavePulse(true);
          setVoiceTextBubble(demoLang === 'Hindi' ? '"मैंने १५० रुपये दवाई पर खर्च किए।"' : '"Maine 150 rupaye dawai par kharch kiye."');
          if (simExpenses.length === 2) {
            setSimExpenses(prev => [...prev, { category: "Dawai 💊", amount: 150, description: "Monthly medicines" }]);
          }
        } else {
          setVoiceWavePulse(false);
          setVoiceTextBubble('');
          setCursorPos({ x: 50, y: 50, opacity: 0, clicking: false });
        }
        break;

      case 4: // SCENE 5 - CHAT WITH AI
        setSimLoggedIn(true);
        setSimAppTab('chat');
        // Ensure starting state of simChatMessages is clean when we just entered the scene
        if (progress < 0.05 && simChatMessages.length !== 1) {
          const activeFirst = firstName || 'Harish';
          const activeFirstHi = demoLang === 'Hindi' ? (firstName === 'Harish' || !firstName ? 'हरीश' : firstName) : activeFirst;
          setSimChatMessages([
            { 
              sender: 'assistant', 
              text: demoLang === 'Hindi' 
                ? `नमस्ते ${activeFirstHi} जी! मैं आपका पैसा साथी हूँ। आज क्या पूछना चाहेंगे?` 
                : `Namaste ${activeFirst} ji! Main aapka Paisa Saathi hoon. Aaj kya poochhna chahenge?` 
            }
          ]);
        }

        if (progress >= 0.05 && progress < 0.25) {
          setVoiceWavePulse(true);
          setVoiceTextBubble(demoLang === 'Hindi' ? '"मुझे बाइक खरीदनी है एक साल में। कितना बचाना पड़ेगा?"' : '"Mujhe bike kharidni hai ek saal mein. Kitna bachana padega?"');
          if (simChatMessages.length === 1) {
            setSimChatMessages(prev => [
              ...prev, 
              { sender: 'user', text: demoLang === 'Hindi' ? "मुझे बाइक खरीदनी है एक साल में। कितना बचाना पड़ेगा?" : "I want to buy a bike in a year. How much do I need to save?" }
            ]);
          }
        } else if (progress >= 0.25 && progress < 0.50) {
          setVoiceWavePulse(false);
          setVoiceTextBubble('');
          if (simChatMessages.length === 2) {
            setSimChatMessages(prev => [
              ...prev, 
              { 
                sender: 'assistant', 
                text: demoLang === 'Hindi' 
                  ? "अगर बाइक की कीमत ₹80,000 है तो आपको लगभग ₹6,700 हर महीने बचाना होगा। चिंता न करें, पैसा साथी आपके इस लक्ष्य को पूरा करने में प्रतिदिन मदद करेगा।" 
                  : "If the bike costs ₹80,000, you will need to save approximately ₹6,700 every month. Paisa Saathi is here to guide you daily." 
              }
            ]);
          }
        } else if (progress >= 0.50 && progress < 0.70) {
          setVoiceWavePulse(true);
          setVoiceTextBubble(demoLang === 'Hindi' ? '"क्या इसके लिए कोई सुरक्षित और सरकारी योजना है?"' : '"Kya iske liye koi surakshit aur sarkari yojana hai?"');
          if (simChatMessages.length === 3) {
            setSimChatMessages(prev => [
              ...prev,
              { sender: 'user', text: demoLang === 'Hindi' ? "क्या इसके लिए कोई सुरक्षित और सरकारी योजना है?" : "Is there any safe government scheme for this goal?" }
            ]);
          }
        } else if (progress >= 0.70 && progress < 0.85) {
          setVoiceWavePulse(false);
          setVoiceTextBubble('');
          if (simChatMessages.length === 4) {
            setSimChatMessages(prev => [
              ...prev,
              {
                sender: 'assistant',
                text: demoLang === 'Hindi'
                  ? "हाँ हरीश जी! आप पास के पोस्ट ऑफिस (डाकघर) में आरडी (Recurring Deposit) योजना शुरू कर सकते हैं। इसमें 6.7% की निश्चित और गारंटीड ब्याज दर मिलती है और आपका पैसा बिल्कुल सुरक्षित रहता है।"
                  : "Yes Harish ji! You can open a Post Office Recurring Deposit (RD) scheme. It offers a secure and guaranteed 6.7% interest rate, and your money is 100% safe."
              }
            ]);
          }
        } else if (progress >= 0.85 && progress < 0.95) {
          setVoiceWavePulse(true);
          setVoiceTextBubble(demoLang === 'Hindi' ? '"बहुत बढ़िया! मैं आज से ही शुरू करूँगा। धन्यवाद!"' : '"Bahut badhiya! Main aaj se hi shuru karunga. Dhanyawad!"');
          if (simChatMessages.length === 5) {
            setSimChatMessages(prev => [
              ...prev,
              { sender: 'user', text: demoLang === 'Hindi' ? "बहुत बढ़िया! मैं आज से ही शुरू करूँगा। धन्यवाद!" : "Excellent! I will start from today. Thank you!" }
            ]);
          }
        } else if (progress >= 0.95) {
          setVoiceWavePulse(false);
          setVoiceTextBubble('');
          if (simChatMessages.length === 6) {
            setSimChatMessages(prev => [
              ...prev,
              {
                sender: 'assistant',
                text: demoLang === 'Hindi'
                  ? "बहुत शानदार फैसला हरीश जी! नियमित बचत ही उज्जवल भविष्य की नींव है। मैं आपका बजट और प्रगति ट्रैक करती रहूँगी।"
                  : "Fantastic decision, Harish ji! Regular small savings build a bright financial foundation. I will keep tracking your budget and progress."
              }
            ]);
          }
          setCursorPos({ x: 50, y: 50, opacity: 0, clicking: false });
        }
        break;

      case 5: // SCENE 6 - GOVERNMENT BENEFITS
        setSimLoggedIn(true);
        setSimAppTab('benefits');
        setVoiceWavePulse(false);
        setVoiceTextBubble('');
        if (progress < 0.5) {
          setCursorPos({ x: 55, y: 30, opacity: 1, clicking: false });
        } else {
          setCursorPos({ x: 55, y: 65, opacity: 1, clicking: false });
        }
        break;

      case 6: // SCENE 7 - WEEKLY REPORT
        setSimLoggedIn(true);
        setSimAppTab('expense');
        setVoiceWavePulse(false);
        setVoiceTextBubble('');
        setCursorPos({ x: 50, y: 50, opacity: 0, clicking: false });
        break;

      case 7: // SCENE 8 - END SCREEN
        setSimLoggedIn(true);
        setSimAppTab('goals');
        setVoiceWavePulse(false);
        setVoiceTextBubble('');
        setSimGoalProgress(4300);
        setCursorPos({ x: 50, y: 50, opacity: 0, clicking: false });
        break;

      default:
        break;
    }
  };

  const skipScene = () => {
    stopSpeaking();
    if (currentSceneIndex < scenes.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
      setSceneProgress(0);
    } else {
      setCurrentSceneIndex(0);
      setSceneProgress(0);
      resetSimulationData();
    }
  };

  const restartDemo = () => {
    stopSpeaking();
    setCurrentSceneIndex(0);
    setSceneProgress(0);
    resetSimulationData();
    setIsPlaying(true);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[200] flex flex-col md:flex-row items-center justify-center p-4 md:p-8 animate-fadeIn text-slate-100">
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* LEFT CONTROL COLUMN: STORY PROGRESS & TRANSCRIPTIONS */}
      <div className="w-full md:w-[460px] shrink-0 flex flex-col justify-between h-auto md:h-[600px] space-y-4 md:space-y-0 text-left md:pr-8 z-10">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-xl text-slate-950">
                <Laptop className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </span>
              <div>
                <h1 className="font-black text-base text-emerald-400 tracking-tight">Paisa Saathi</h1>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">{getDynamicStoryTitle()}</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="p-1 px-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
            >
              Close Demo <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Context Overview Card */}
          <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl mb-4 text-xs space-y-1.5 font-medium leading-relaxed text-slate-350">
            <div className="flex items-center gap-1.5 text-amber-300 font-black">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Storytelling Tour</span>
            </div>
            <p>
              Understanding how simple voice and mobile interfaces empower {firstName || 'our delivery partner'}, to check in on their budget, add voice expenses, ask AI for investment help, and unlock massive safety nets.
            </p>
          </div>

          {/* Config switches */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div>
              <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1.5 font-black">Voiceover Language</label>
              <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
                <button
                  onClick={() => setDemoLang('Hindi')}
                  className={`flex-1 py-1 text-[10px] rounded-lg font-black transition-all cursor-pointer ${demoLang === 'Hindi' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  हिन्दी (Hindi)
                </button>
                <button
                  onClick={() => setDemoLang('English')}
                  className={`flex-1 py-1 text-[10px] rounded-lg font-black transition-all cursor-pointer ${demoLang === 'English' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  English
                </button>
              </div>
            </div>

            <div>
              <label className="text-[9px] uppercase tracking-wider text-slate-400 block mb-1.5 font-black">Simulation Timing</label>
              <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
                {[1, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => setPlaybackSpeed(s)}
                    className={`flex-1 py-1 text-[10px] rounded-lg font-black transition-all cursor-pointer ${playbackSpeed === s ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Audio toggle button */}
          <button
            onClick={() => {
              if (narrationEnabled) {
                stopSpeaking();
                setNarrationEnabled(false);
              } else {
                setNarrationEnabled(true);
                playNarration(currentSceneIndex);
              }
            }}
            className={`w-full py-2.5 px-3 border rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs font-extrabold transition-all mb-4 ${
              narrationEnabled 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            {narrationEnabled ? <Volume2 className="w-4 h-4 animate-bounce" /> : <VolumeX className="w-4 h-4" />}
            {narrationEnabled ? "AUDIO NARRATOR: RECITING" : "AUDIO NARRATOR: MUTED"}
          </button>

          {/* Narrator Teleprompter */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 min-h-[110px] flex flex-col justify-center relative overflow-hidden shadow-inner">
            <span className="absolute top-2 left-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full font-black">
              🎤 NARRATOR SUBTITLE
            </span>
            <p className="text-sm font-black text-white text-center leading-relaxed italic animate-fadeIn select-none mt-2">
              "{demoLang === 'English' ? scenes[currentSceneIndex].voiceoverEn : scenes[currentSceneIndex].voiceoverHi}"
            </p>
          </div>
        </div>

        {/* Story Sceneline indicator */}
        <div className="space-y-2 border-t border-slate-900 pt-4">
          <div className="flex items-center justify-between text-xs font-black text-slate-400">
            <span>STORY PROGRESS ({currentSceneIndex+0 + 1}/8)</span>
            <span className="text-amber-400 font-extrabold">{scenes[currentSceneIndex].title}</span>
          </div>
          <div className="grid grid-cols-8 gap-1.5">
            {scenes.map((sc, i) => (
              <div 
                key={sc.id} 
                onClick={() => {
                  stopSpeaking();
                  setCurrentSceneIndex(i);
                  setSceneProgress(0);
                  setIsPlaying(true);
                }}
                className={`h-2.5 rounded-full cursor-pointer transition-all ${
                  i < currentSceneIndex 
                    ? 'bg-emerald-500' 
                    : i === currentSceneIndex 
                    ? 'bg-amber-400 ring-2 ring-amber-300' 
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
                title={sc.title}
              />
            ))}
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
            <span>Morning Start</span>
            <span>Evening Milestones</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: SIMULATED SMARTPHONE WORKFLOW PREVIEW */}
      <div className="flex-1 max-w-sm relative">
        
        {/* Smartphone Shell */}
        <div className="border-[11px] border-slate-800 bg-slate-900 rounded-[3.2rem] p-3 shadow-2xl flex flex-col h-[600px] w-full max-w-[340px] mx-auto relative overflow-hidden md:scale-[1.03] border-slate-800/90 shadow-emerald-950/20">
          
          {/* Top Notch Speaker */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-800 rounded-b-2xl z-[60] flex items-center justify-center">
            <div className="w-12 h-1 bg-slate-950 rounded-full"></div>
          </div>

          {/* Smartphone screen contents */}
          <div className="flex-1 bg-slate-50 text-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col relative select-none">
            
            {/* SCREEN 1: LOGIN (SCENE 1) */}
            {scenes[currentSceneIndex].screen === 'login' && !simLoggedIn && (
              <div className="flex-1 flex flex-col justify-between p-5 bg-gradient-to-b from-emerald-50 to-white text-left animate-fadeIn">
                <div className="space-y-5 pt-6">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-xl font-black shadow-md">
                    🪙
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Paisa Saathi</h3>
                    <p className="text-[10px] text-slate-500 font-bold">Har Kamgar Ka Surakshit Sathi</p>
                  </div>

                  <div className="space-y-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[7px] bg-emerald-50 border border-emerald-150 text-emerald-800 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Secure Authentication
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Phone Number (फोन नंबर)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs font-black text-slate-400">+91</span>
                        <input 
                          type="text" 
                          value={simPhone} 
                          readOnly 
                          placeholder="98765 43210"
                          className="w-full border border-slate-200 p-2 pl-10 text-xs rounded-xl font-bold bg-slate-50 text-slate-900 outline-none"
                        />
                      </div>
                    </div>

                    {simOtp && (
                      <div className="space-y-1.5 animate-scaleUp">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-serif">Enter OTP (ओटीपी)</label>
                        <input 
                          type="text" 
                          value={simOtp} 
                          readOnly 
                          placeholder="• • • • • •"
                          className="w-full border border-slate-200 p-2 text-center text-xs rounded-xl font-black bg-slate-50 text-slate-900 tracking-widest outline-none"
                        />
                      </div>
                    )}

                    <button 
                      type="button" 
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-[10px] uppercase tracking-wider shadow-sm flex items-center justify-center gap-1"
                    >
                      <span>{simOtp ? 'Verify & Login ➜' : 'Get OTP Code ➜'}</span>
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-[8px] font-bold px-2 py-1 rounded-full border border-slate-200">
                    <Shield className="w-3 h-3 text-emerald-600" />
                    <span>UIDAI Secured Registry</span>
                  </div>
                </div>
              </div>
            )}

            {/* MAIN SHELL COMPONENT FOR HOME, DAILY INCOMES, EXPENSES, CHAT, BENEFITS */}
            {(scenes[currentSceneIndex].screen !== 'login' || simLoggedIn) && scenes[currentSceneIndex].screen !== 'end' && (
              <div className="flex-1 flex flex-col justify-between text-left relative bg-slate-50 animate-fadeIn">
                
                {/* Simulated Header */}
                <div className="bg-emerald-900 text-white px-4 py-3.5 pt-6 flex items-center justify-between shrink-0 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-sm uppercase">
                      {firstName ? firstName.substring(0, 2) : 'HM'}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[12px] leading-none flex items-center gap-1 text-white">
                        {firstName || 'Harish Mishra'}
                        <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block animate-pulse"></span>
                      </h4>
                      <p className="text-[8px] text-emerald-200 font-bold uppercase tracking-wider mt-0.5">Paisa Saathi Member</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-400 text-emerald-950 font-black tracking-wider text-[8px] px-2.5 py-0.5 rounded-full select-none border border-amber-300">
                    🏆 SCORE: 850
                  </div>
                </div>

                {/* Simulated Main Body View Area */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3 pb-6 border-b border-indigo-50/20">
                  
                  {/* APP TAB: HOME SCREEN OR CHECK-IN (SCENE 1, 2, 3) */}
                  {simAppTab === 'home' && (
                    <div className="space-y-3.5 animate-fadeIn">
                      
                      {/* Financial Metrics Health Card */}
                      <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-4 rounded-2xl shadow-md relative overflow-hidden">
                        <span className="absolute right-3.5 bottom-12 text-6xl opacity-10">💰</span>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[7.5px] bg-[#128C7E]/40 border border-[#128C7E]/50 px-2 py-0.5 rounded-full font-black text-amber-300 uppercase">
                              🛡️ Budget Status: Safe
                            </span>
                            <div className="flex items-baseline gap-1 mt-1 text-white">
                              <span className="text-xl font-black">₹{simIncome > 0 ? (7500).toLocaleString() : (6300).toLocaleString()}</span>
                            </div>
                            <p className="text-[8px] text-teal-200 font-bold uppercase tracking-wider mt-0.5">Wallet / Bank Balance</p>
                          </div>

                          <div className="text-right">
                            <span className="text-[8px] text-emerald-200 font-black uppercase tracking-wider">Financial Health</span>
                            <span className="font-bold text-amber-300 text-[10px] block mt-0.5">⭐ Excellent</span>
                          </div>
                        </div>

                        {/* Progress Bar towards Two Wheeler saved target */}
                        <div className="mt-3.5 pt-2 border-t border-white/10 space-y-1">
                          <div className="flex justify-between text-[8px] font-bold text-teal-100">
                            <span>Goal: Buy a Two Wheeler</span>
                            <span>₹{simGoalProgress > 0 ? (4300).toLocaleString() : (2500).toLocaleString()} / ₹80,000</span>
                          </div>
                          <div className="w-full bg-black/3.5 h-1.5 rounded-full overflow-hidden border border-white/5 bg-slate-900/40">
                            <div className="bg-gradient-to-r from-amber-400 to-amber-300 h-full rounded-full transition-all duration-300" style={{ width: simGoalProgress > 0 ? '5.4%' : '3.1%' }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Daily checkin card */}
                      <div className="bg-indigo-50/45 border border-indigo-100 p-3 rounded-2xl text-left space-y-1.5 shadow-3xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] text-slate-400 font-black tracking-wide uppercase">Daily Check-In Checks</span>
                          <span className="text-[8px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-extrabold uppercase">Today's Plan</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-slate-800">
                          <div>
                            <span className="text-[7.5px] text-slate-400 tracking-wide font-bold uppercase">Saving Goal</span>
                            <p className="text-xs font-black text-slate-900">₹50</p>
                          </div>
                          <div>
                            <span className="text-[7.5px] text-slate-400 tracking-wide font-bold uppercase">Today's Income</span>
                            <p className="text-xs font-black text-emerald-600">₹{simIncome}</p>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic highlights representing Harish completing deliveries & receiving pay */}
                      <div className="bg-white border border-slate-100 p-3 rounded-2xl flex gap-2.5 items-start text-slate-800 shadow-3xs">
                        <span className="text-lg shrink-0">🚚</span>
                        <div className="space-y-0.5">
                          <h6 className="font-extrabold text-[10px] text-slate-900">Delivery Orders Completed</h6>
                          <p className="text-[8px] text-slate-500 font-medium">5 orders successfully dropped today. Daily income active.</p>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* APP TAB: EXPENSE ACCOUNTING LEDGER (SCENE 4, 7) */}
                  {simAppTab === 'expense' && (
                    <div className="space-y-3.5 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Daily Hisab-Kitab Ledger</h4>
                        <span className="text-[7px] bg-emerald-50 border border-emerald-150 font-black px-2 py-0.5 rounded-full text-emerald-800 uppercase">
                          Safe Budgeting
                        </span>
                      </div>

                      {/* Expense metrics card */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
                          <div>
                            <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider">Total Expenses Added</span>
                            <h3 className="text-lg font-black text-slate-900">
                              ₹{scenes[currentSceneIndex].id === 7 ? "3,200" : simExpenses.reduce((acc, e) => acc + e.amount, 0)}
                            </h3>
                          </div>
                          <span className="p-1 px-2.5 bg-rose-50 border border-rose-100 text-rose-600 text-[8px] font-black rounded-lg">
                            Live Check
                          </span>
                        </div>

                        {/* List items representation */}
                        <div className="space-y-2 max-h-[160px] overflow-hidden">
                          {scenes[currentSceneIndex].id === 7 ? (
                            <>
                              <div className="flex justify-between items-center text-[9px] border-b border-slate-50 pb-2">
                                <span className="font-extrabold text-slate-800">Petrol ⛽</span>
                                <span className="font-black text-rose-600">-₹1,200</span>
                              </div>
                              <div className="flex justify-between items-center text-[9px] border-b border-slate-50 pb-2">
                                <span className="font-extrabold text-slate-800">Kirana Groceries 🌾</span>
                                <span className="font-black text-rose-600">-₹1,500</span>
                              </div>
                              <div className="flex justify-between items-center text-[9px] pb-1">
                                <span className="font-extrabold text-slate-800">Dawai Medications 💊</span>
                                <span className="font-black text-rose-600">-₹500</span>
                              </div>
                            </>
                          ) : simExpenses.length === 0 ? (
                            <p className="text-[9px] text-slate-400 text-center py-4 font-bold select-none italic">
                              No expenses logged today. Tap mic helper to talk!
                            </p>
                          ) : (
                            simExpenses.map((exp, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[9px] border-b border-slate-50 pb-2 last:border-0">
                                <div>
                                  <p className="font-extrabold text-slate-800">{exp.category}</p>
                                  <p className="text-[7.5px] text-slate-400 font-bold">{exp.description}</p>
                                </div>
                                <span className="font-black text-rose-600">-₹{exp.amount}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Scene 7: Weekly Audit Report Card explicitly requested */}
                      {scenes[currentSceneIndex].id === 7 && (
                        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg border border-slate-800 relative overflow-hidden animate-scaleUp">
                          <span className="absolute top-2 right-2.5 bg-amber-400 text-slate-950 text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider select-none">
                            Weekly Report Details
                          </span>
                          <h5 className="font-extrabold text-amber-300 text-[10px] uppercase tracking-wider mb-2">
                            {firstName || 'Mera'} Weekly Audit Sheet
                          </h5>
                          
                          <div className="grid grid-cols-3 gap-1 grid-divider-v py-2 border-t border-b border-white/10 text-center">
                            <div>
                              <p className="text-[7px] text-slate-400 font-bold uppercase">Income</p>
                              <p className="text-xs font-black text-emerald-400">₹7,500</p>
                            </div>
                            <div>
                              <p className="text-[7px] text-slate-400 font-bold uppercase">Expenses</p>
                              <p className="text-xs font-black text-rose-450 text-rose-450 font-sans">₹3,200</p>
                            </div>
                            <div>
                              <p className="text-[7px] text-slate-400 font-bold uppercase">Savings</p>
                              <p className="text-xs font-black text-amber-400">₹4,300</p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between text-[8px] font-bold text-slate-400">
                            <span>Goal Completed (5% Progress Met):</span>
                            <span className="text-emerald-400">₹4,300 Saved 🎉</span>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* APP TAB: SAVINGS GOAL (SCENE 8) */}
                  {simAppTab === 'goals' && (
                    <div className="space-y-3.5 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Active Savings Goals</h4>
                      </div>

                      {/* Goal row widget */}
                      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-3xs relative overflow-hidden text-left">
                        <span className="absolute right-3.5 top-2 bg-amber-50 text-amber-800 border border-amber-150 text-[7.5px] font-black px-2 py-0.5 rounded-full select-none">
                          Timeline: 1 Year
                        </span>
                        <h5 className="font-black text-slate-900 text-xs flex items-center gap-1">
                          🏍️ Buy a Two Wheeler
                        </h5>
                        <p className="text-[8.5px] text-slate-400 font-bold mt-1">Target Savings Amount: ₹80,000</p>

                        <div className="mt-4 space-y-1.5">
                          <div className="flex justify-between text-[8px] font-black text-slate-500">
                            <span>Today's Total Saved: ₹4,300</span>
                            <span className="text-emerald-600">5.4% Milestones Done</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-300 w-[5.4%]"></div>
                          </div>
                        </div>
                      </div>

                      {/* Safe pig suggestion alerts */}
                      <div className="bg-emerald-50/50 border border-emerald-150 p-3 rounded-2xl flex gap-2.5 items-start text-emerald-950">
                        <span className="text-base select-none">🎯</span>
                        <div className="space-y-0.5 leading-none">
                          <h6 className="font-extrabold text-[9px]">Prakriya (Process) Status</h6>
                          <p className="text-[7.5px] text-slate-500 mt-1">Your saving of ₹50 daily securely keeps you leading on timeline!</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* APP TAB: COMMUNITY AND AI CHAT DIALOGUE (SCENE 5) */}
                  {simAppTab === 'chat' && (
                    <div className="flex-1 flex flex-col justify-between h-[270px] border border-slate-200 bg-[#dfecdb]/30 rounded-2xl overflow-hidden p-2 text-left space-y-2 relative animate-fadeIn">
                      
                      {/* Active helper banner decoration */}
                      <div className="bg-[#128C7E] text-white py-1 px-2.5 rounded-xl text-[8.5px] font-extrabold flex justify-between items-center select-none shadow-3xs shrink-0">
                        <span>💬 DIAL DEVI CHAT BOT</span>
                        <span className="text-amber-300 animate-pulse font-sans">● LIVE COG</span>
                      </div>

                      {/* Message history */}
                      <div className="flex-1 overflow-y-auto space-y-2.5 p-1 max-h-[200px] Scrollbar-hide flex flex-col justify-end">
                        {simChatMessages.map((msg, i) => {
                          const isSelf = msg.sender === 'user';
                          return (
                            <div key={i} className={`flex flex-col max-w-[85%] ${isSelf ? 'self-end' : 'self-start'} animate-scaleUp`}>
                              <div className={`p-2 rounded-xl text-[9px] font-bold mt-0.5 border leading-relaxed ${
                                isSelf 
                                  ? 'bg-[#dcf8c6] border-[#c2e4a5] text-slate-900 rounded-tr-none' 
                                  : 'bg-white border-slate-150 text-slate-850 rounded-tl-none'
                              }`}>
                                {msg.text}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  )}

                  {/* APP TAB: GOVERNMENT SCHEMES & BENEFITS (SCENE 6) */}
                  {simAppTab === 'benefits' && (
                    <div className="space-y-3.5 animate-fadeIn text-left">
                      <div className="flex gap-1.5 items-center pb-2 border-b border-slate-100">
                        <div className="text-sm">🇮🇳</div>
                        <div>
                          <h5 className="font-extrabold text-[10px] leading-none text-slate-900">Mikhya Sarkari Yojanaen</h5>
                          <span className="text-[7.5px] text-slate-400 font-extrabold uppercase mt-1 inline-block">Direct Subsidies Eligible</span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-0.5">
                        {/* PMSBY Scheme */}
                        <div className="p-3 bg-white border border-emerald-100 rounded-xl leading-none shadow-3xs relative overflow-hidden">
                          <span className="absolute top-1.5 right-1.5 text-[6.5px] bg-emerald-50 border border-emerald-150 text-emerald-850 font-black px-1.5 py-0.5 rounded-full">
                            ₹20 / Yr
                          </span>
                          <h6 className="font-extrabold text-[9px] text-[#0f5132] pr-12">Pradhan Mantri Suraksha Bima (PMSBY)</h6>
                          <p className="text-[7.5px] text-slate-500 mt-1 flex items-center gap-1">
                            <span className="text-emerald-600 font-black">✔</span> ₹2 Lakh Accidental coverage.
                          </p>
                        </div>

                        {/* PMJJBY Scheme */}
                        <div className="p-3 bg-white border border-slate-100 rounded-xl leading-none shadow-3xs relative overflow-hidden">
                          <span className="absolute top-1.5 right-1.5 text-[6.5px] bg-indigo-50 border border-indigo-150 text-indigo-850 font-black px-1.5 py-0.5 rounded-full">
                            ₹436 / Yr
                          </span>
                          <h6 className="font-extrabold text-[9px] text-slate-900 pr-12">Pradhan Mantri Jeevan Jyoti (PMJJBY)</h6>
                          <p className="text-[7.5px] text-slate-500 mt-1 flex items-center gap-1">
                            <span className="text-emerald-600 font-black">✔</span> Guaranteed life security cover.
                          </p>
                        </div>

                        {/* Atal Pension Yojana */}
                        <div className="p-3 bg-white border border-amber-100 rounded-xl leading-none shadow-3xs relative overflow-hidden">
                          <span className="absolute top-1.5 right-1.5 text-[6.5px] bg-amber-50 border border-amber-150 text-amber-850 font-black px-1.5 py-0.5 rounded-full">
                            Sarkari
                          </span>
                          <h6 className="font-extrabold text-[9px] text-slate-900 pr-12">Atal Pension Yojana (APY)</h6>
                          <p className="text-[7.5px] text-slate-500 mt-1 flex items-center gap-1">
                            <span className="text-emerald-600 font-black">✔</span> Monthly pension plan of ₹1,000-₹5,000.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Simulated Audio Microphone Speech Wave overlay block */}
                {voiceWavePulse && (
                  <div className="absolute inset-x-0 bottom-14 bg-emerald-900/90 text-white p-3 border-t border-emerald-800/80 backdrop-blur-xs flex flex-col items-center gap-2 animate-scaleUp z-40 select-none">
                    
                    {/* Pulsing visual bars */}
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-3 bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                      <span className="w-1 h-5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-1 h-4 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1 h-6 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                      <span className="w-1 h-2.5 bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>

                    <div className="text-center">
                      <span className="text-[6.5px] bg-slate-950/40 px-2 py-0.5 rounded-full text-slate-350 font-bold uppercase tracking-widest leading-none">
                        🎙️ Voice Command Recieved
                      </span>
                      {voiceTextBubble && (
                        <p className="text-[10px] text-amber-300 font-black italic max-w-xs block select-none mt-1.5 leading-none">
                          {voiceTextBubble}
                        </p>
                      )}
                    </div>

                  </div>
                )}

                {/* Simulated Core Bottom Navigation Drawer tabs */}
                <div className="bg-white border-t border-slate-200 p-2 grid grid-cols-5 gap-1 shrink-0 select-none z-30">
                  {[
                    { id: 'home', icon: '🏠', label: "Home" },
                    { id: 'chat', icon: '💬', label: "Saathi Chat" },
                    { id: 'expense', icon: '📝', label: "Ledger" },
                    { id: 'goals', icon: '🎯', label: "Lakshya" },
                    { id: 'benefits', icon: '🇮🇳', label: "Yojana" }
                  ].map((tb) => (
                    <div 
                      key={tb.id} 
                      onClick={() => setSimAppTab(tb.id as any)}
                      className={`flex flex-col items-center justify-center p-1 rounded-xl cursor-pointer transition-all ${
                        simAppTab === tb.id 
                          ? 'bg-emerald-50 text-emerald-800 scale-105 font-black' 
                          : 'text-slate-450 hover:text-slate-700'
                      }`}
                    >
                      <span className="text-xs select-none">{tb.icon}</span>
                      <span className="text-[6.5px] font-black truncate tracking-tighter block mt-0.5">{tb.label}</span>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* SCREEN 8: END CLOSING MARKETING SLIDE (SCENE 8) */}
            {scenes[currentSceneIndex].screen === 'end' && (
              <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-[#0f5132] to-[#072416] text-white text-center pb-8 animate-fadeIn relative select-none">
                
                {/* Visual Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="space-y-4 pt-10">
                  <div className="w-16 h-16 rounded-3xl bg-amber-400 text-emerald-950 flex items-center justify-center text-3xl font-black shadow-lg mx-auto animate-bounce mt-4 select-none">
                    🪙
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-amber-300 tracking-tight leading-none uppercase">Paisa Saathi</h2>
                    <p className="text-[9px] text-[#2ac480] uppercase tracking-widest font-black block mt-2">A Financial Companion for Every Worker</p>
                  </div>
                </div>

                <div className="bg-white/10 border border-white/10 p-4 rounded-3xl mx-auto max-w-[270px] shadow-md backdrop-blur-3xs text-left space-y-2 leading-none">
                  <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-[9px] uppercase tracking-wide">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 fill-[#072416] shrink-0" />
                    <span>{firstName ? `${firstName}'s` : 'My'} Savings Done</span>
                  </div>
                  <p className="text-[10px] text-teal-100 font-medium leading-relaxed font-sans">
                    ★ Saved: <span className="text-white font-extrabold">₹4,300 towards Two Wheeler!</span><br />
                    ★ Daily checking builds better permanent habits.
                  </p>
                </div>

                <div className="mt-4 py-2 px-3.5 bg-[#dcf8c6] text-slate-900 border border-[#c2e4a5] text-[11px] font-black tracking-wider uppercase rounded-2xl select-none inline-flex items-center justify-center gap-1.5 max-w-[240px] mx-auto">
                  <span>TRACK.</span>
                  <span>SAVE.</span>
                  <span>GROW.</span>
                </div>
              </div>
            )}

            {/* Simulated clicking hand cursor icon overlay mapped to X, Y coordinates */}
            <div 
              className="absolute w-7 h-7 rounded-full bg-amber-400/50 border-2 border-white flex items-center justify-center text-xs shadow-lg transition-all duration-300 pointer-events-none select-none z-50 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${cursorPos.x}%`,
                top: `${cursorPos.y}%`,
                opacity: cursorPos.opacity,
                scale: cursorPos.clicking ? "0.85" : "1.1",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></div>
            </div>

          </div>
        </div>

        {/* COMPACT PLAYER DURATION STATUS TIMELINE CONTROLS */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 px-4 flex items-center justify-between gap-3 shadow-xl backdrop-blur-md text-white mt-4 max-w-[340px] mx-auto select-none">
          
          <button 
            onClick={restartDemo}
            className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-350 rounded-xl cursor-pointer active:scale-95 flex items-center justify-center text-xs transition-all"
            title="Restart Journey"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-full cursor-pointer active:scale-95 flex items-center justify-center shadow-md shadow-emerald-500/20 transition-all"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-slate-950 stroke-[3]" /> : <Play className="w-4 h-4 fill-slate-950 stroke-[3]" />}
          </button>

          <div className="flex-1 flex flex-col justify-center min-w-0 text-left">
            <span className="text-[7.5px] uppercase tracking-wider text-slate-400 font-black truncate block">
              {isPlaying ? `Playing Scene ${currentSceneIndex+1}/8` : "VIDEO PLAYBACK PAUSED"}
            </span>
            <div className="w-full bg-slate-850 h-1.5 rounded-full mt-1 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-100" style={{ width: `${sceneProgress}%` }}></div>
            </div>
          </div>

          <button 
            onClick={skipScene}
            className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-350 rounded-xl cursor-pointer active:scale-95 flex items-center justify-center text-xs transition-all"
            title="Next Step"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
