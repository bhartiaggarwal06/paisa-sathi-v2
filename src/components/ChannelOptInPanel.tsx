import React, { useState, useEffect } from 'react';
import { 
  Check, X, Bell, Settings, MessageSquare, AlertTriangle, 
  Volume2, ExternalLink, Lock, Shield, Coins, TrendingUp, Sparkles, PhoneCall 
} from 'lucide-react';

export type ChannelType = 'whatsapp' | 'sms' | 'telegram' | 'email';

export interface ChannelConfig {
  channel: ChannelType;
  isEnabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  format: 'text' | 'voice_summary' | 'rich_report';
  language: string;
  topics: {
    weeklyBachat: boolean;
    emergencyAlerts: boolean;
    scamWarnings: boolean;
    goldPrices: boolean;
  };
  phoneNumber?: string;
  telegramUsername?: string;
  emailAddress?: string;
}

interface ChannelOptInPanelProps {
  user: any;
  selectedLang: string;
  b: (key: any) => string;
  speakResponse: (text: string, lang?: string) => void;
  onUpdateChannels: (updatedConfigs: ChannelConfig[]) => Promise<void>;
  // Dashboard stats passed optionally to customize advice
  expenses: any[];
  goals: any[];
}

export default function ChannelOptInPanel({
  user,
  selectedLang,
  b,
  speakResponse,
  onUpdateChannels,
  expenses = [],
  goals = []
}: ChannelOptInPanelProps) {
  // Read config with WhatsApp as the primary starting channel option
  const initialConfigs: ChannelConfig[] = user?.channels_config || [
    {
      channel: 'whatsapp',
      isEnabled: false,
      frequency: 'weekly',
      format: 'voice_summary',
      language: selectedLang || 'Hindi',
      topics: {
        weeklyBachat: true,
        emergencyAlerts: true,
        scamWarnings: true,
        goldPrices: false,
      },
      phoneNumber: user?.mobile_number || '',
    }
  ];

  const [configs, setConfigs] = useState<ChannelConfig[]>(initialConfigs);
  const [editingChannel, setEditingChannel] = useState<ChannelType | null>(null);
  
  // Simulation States
  const [simulatedNotification, setSimulatedNotification] = useState<{
    channel: ChannelType;
    message: string;
    linkName: string;
    linkUrl: string;
    show: boolean;
  } | null>(null);

  // Auto-Testing Scheduler States
  const [schedulerSeconds, setSchedulerSeconds] = useState<number>(10);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Modern Clean Code Server-Side States
  const [serverLogs, setServerLogs] = useState<any[]>([]);
  const [isTriggeringServer, setIsTriggeringServer] = useState<boolean>(false);

  const fetchServerLogs = async () => {
    try {
      const res = await fetch('/api/scheduler/logs');
      if (res.ok) {
        const data = await res.json();
        setServerLogs(data);
      }
    } catch (err) {
      console.warn("Could not retrieve backend scheduler log ledger:", err);
    }
  };

  const triggerServerScheduler = async () => {
    setIsTriggeringServer(true);
    try {
      const res = await fetch('/api/scheduler/trigger', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const speech = selectedLang === 'English'
          ? "Ding! Server-side automatic queue executed. Your background WhatsApp alert compiled successfully!"
          : "टिन टिन! सर्वर-साइड स्वचालित शेड्यूलर शुरू। रिपोर्ट व्हाट्सएप संदेश के रूप में तैयार हो चुकी है!";
        speakResponse(speech);
        setServerLogs(data.logs || []);
        generateMockMessage('whatsapp');
      }
    } catch (err) {
      console.error("Manual execution of background queue failed:", err);
    } finally {
      setIsTriggeringServer(false);
    }
  };

  useEffect(() => {
    fetchServerLogs();
    const interval = setInterval(fetchServerLogs, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && countdown !== null) {
      if (countdown > 0) {
        interval = setInterval(() => {
          setCountdown(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
      } else {
        setIsTimerRunning(false);
        setCountdown(null);
        // Automatically tie local countdown complete to real server execution trigger!
        triggerServerScheduler();
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, countdown]);

  const handleToggleChannel = async (channelType: ChannelType) => {
    const updated = configs.map(cfg => {
      if (cfg.channel === channelType) {
        const nextState = !cfg.isEnabled;
        if (nextState) {
          // Speak dynamic welcome
          const chLabel = channelType === 'whatsapp' ? 'WhatsApp' : channelType.toUpperCase();
          const speech = selectedLang === 'English'
            ? `Excellent choice! You are now setting up updates on ${chLabel}.`
            : `बहुत बढ़िया! आपने ${chLabel} पर अपडेट्स चालू करना चुना है। चलिए इसे सेट करते हैं।`;
          speakResponse(speech);
          // Set to edit naturally to show customization form
          setEditingChannel(channelType);
        } else {
          const speech = selectedLang === 'English'
            ? `Turned off ${channelType} updates.`
            : `${channelType === 'whatsapp' ? 'WhatsApp' : channelType.toUpperCase()} अपडेट्स बंद कर दिए गए हैं।`;
          speakResponse(speech);
        }
        return { ...cfg, isEnabled: nextState };
      }
      return cfg;
    });
    setConfigs(updated);
    await onUpdateChannels(updated);
  };

  const handleSaveChannelDetails = async (channelType: ChannelType, partialCfg: Partial<ChannelConfig>) => {
    const updated = configs.map(cfg => {
      if (cfg.channel === channelType) {
        return { ...cfg, ...partialCfg, isEnabled: true };
      }
      return cfg;
    });
    setConfigs(updated);
    await onUpdateChannels(updated);
    setEditingChannel(null);

    const speech = selectedLang === 'English'
      ? `Preferences saved for ${channelType}.`
      : `${channelType === 'whatsapp' ? 'WhatsApp' : channelType.toUpperCase()} की प्राथमिकताएं सुरक्षित कर दी गयी हैं।`;
    speakResponse(speech);
  };

  // Generate Personalized highly engaging advice to show in a WhatsApp mockup
  const generateMockMessage = (channel: ChannelType) => {
    const userName = user?.name || (selectedLang === 'English' ? 'Ramesh Ji' : 'रमेश जी');
    const bachatAmt = user?.current_month_bachat || 7000;
    const goalTitle = user?.primary_goal || (selectedLang === 'English' ? 'Child Education' : 'बेटी की पढ़ाई');
    
    let advice = "";
    let linkLabel = "";
    let linkUrl = "";

    if (goalTitle.includes('padhai') || goalTitle.includes('education')) {
      advice = selectedLang === 'English'
        ? `Namaste ${userName} Ji! 🌸 Your savings tracker score is 78%! Under Sukanya Samriddhi Yojana scheme, investing ₹500/month guarantees ₹12,00,000 for child's future marriage or college. Complete absolute tax-free interest.`
        : `नमस्ते ${userName} जी! 🌸 इस हफ्ते आपने शानदार ₹${bachatAmt} की बचत की। सुकन्या समृद्धि योजना भारत सरकार की योजना है जिसमें सिर्फ ₹500 प्रतिमाह डालकर आप अपनी बच्ची की उच्च शिक्षा के लिए ₹12,00,000 का फंड बना सकते हैं। बिल्कुल टैक्स फ्री ब्याज!`;
      linkLabel = selectedLang === 'English' ? "Open SSY Govt Pension/Savings Calculator" : "सुकन्या सरकारी कैलकुलेटर खोलें ↗";
      linkUrl = "https://www.india.gov.in/ssy-calculator";
    } else if (goalTitle.includes('auto') || goalTitle.includes('taxi') || goalTitle.includes('vehicle')) {
      advice = selectedLang === 'English'
        ? `Namaste ${userName} Ji! 🚕 Fast tracker update: You have saved ₹${bachatAmt} this month. Transfer ₹1,000 extra to earn 6.5% safe interest in post office Recurring Deposit. This brings you closer to your Auto dream!`
        : `नमस्ते ${userName} जी! 🚕 ऑटो अपडेट: आपने इस महीने कुल ₹${bachatAmt} बचाए हैं। डाकघर (Post Office) आरडी योजना में हर महीने ₹1,000 सुरक्षित जमा करके 6.5% निश्चित ब्याज कमाएं ताकि आपका अपना ऑटो का सपना जल्द पूरा हो सके!`;
      linkLabel = selectedLang === 'English' ? "Check Gold & RD Rates" : "डाकघर आरडी स्कीम ब्याज दरें देखें ↗";
      linkUrl = "https://www.postoffice.gov.in";
    } else {
      advice = selectedLang === 'English'
        ? `Namaste ${userName} Ji! 🪙 Your Paisa Saathi weekly advice: Spend ₹50 less on daily tea/snack to save ₹1,500 monthly. Secure PMSBY Safety insurance worth ₹2 Lakh for just ₹436 a year.`
        : `नमस्ते ${userName} जी! 🪙 पैसा साथी साप्ताहिक सलाह: हर रोज चाय-नाश्ते पर ₹50 कम खर्च करके महीने के ₹1,500 बचाएं। प्रधानमंत्री सुरक्षा बीमा योजना (PMSBY) से सिर्फ ₹436/साल में ₹2 लाख का एक्सीडेंट बीमा पाएं।`;
      linkLabel = selectedLang === 'English' ? "Apply for PMSBY Insurance" : "सरकारी बीमा योजना की जानकारी ↗";
      linkUrl = "https://www.jansuraksha.gov.in";
    }

    // Add extra text highlighting fraud warning
    advice += "\n\n⚠️ Paisa Saathi Cyber Warning: Bank managers never ask for OTP or PIN over phone. Beware of fake lottery calls!";

    // Add Paisa Saathi application launch link
    const appLaunchUrl = window.location.origin;
    advice += selectedLang === 'English'
      ? `\n\n📲 Access your complete money helper dashboard in Paisa Saathi App anytime here: ${appLaunchUrl}`
      : `\n\n📲 अपने मासिक खर्च और सोने के भाव का पूरा डिजिटल बहीखाता यहाँ पैसा साथी ऐप में खोलकर देखें: ${appLaunchUrl}`;

    setSimulatedNotification({
      channel,
      message: advice,
      linkName: linkLabel,
      linkUrl,
      show: true
    });

    const triggerSpeech = selectedLang === 'English'
      ? `Sending simulated custom update to your virtual ${channel === 'whatsapp' ? 'WhatsApp' : channel.toUpperCase()} screen!`
      : `आपके वर्चुअल ${channel === 'whatsapp' ? 'WhatsApp' : channel.toUpperCase()} पर सलाह सन्देश भेज दिया गया है! स्क्रीन पर देखें।`;
    speakResponse(triggerSpeech);
  };

  const channelInfo = {
    whatsapp: {
      name: 'WhatsApp Updates',
      descHi: 'सीधे व्हाट्सएप्प पर साप्ताहिक सलाह और बचत का मुख्य संदेश पायें।',
      descEn: 'Receive weekly advice & saving summary alerts directly on WhatsApp.',
      color: 'bg-emerald-600 border-emerald-500 hover:bg-emerald-700 text-white',
      accentColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      brand: 'WhatsApp',
      icon: '🟢'
    }
  };

  return (
    <div className="bg-white border border-slate-150 rounded-2xl p-4.5 shadow-3xs space-y-4 text-left">
      {/* Block Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-emerald-600" />
          <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
            {selectedLang === 'English' ? "WHATSAPP UPDATE SETTINGS" : "व्हाट्सएप्प संदेश और अपडेट्स सुविधा"}
          </h4>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 font-bold leading-normal">
        {selectedLang === 'English'
          ? "No more opening the app every day! Stay safe, track savings milestones, and get government scheme links directly on WhatsApp."
          : "अब रोज़ाना ऐप खोलने की चिंता छोड़ें! सीधे व्हाट्सएप्प पर अपनी बचत का लेखा-जोखा और सरकारी योजनाओं की लिंक पायें।"}
      </p>

      {/* WhatsApp card container */}
      <div className="grid grid-cols-1 gap-3">
        {configs.map(cfg => {
          const info = channelInfo[cfg.channel];
          return (
            <div 
              key={cfg.channel} 
              className={`border rounded-xl p-3.5 transition-all text-left flex flex-col justify-between ${
                cfg.isEnabled 
                  ? 'bg-slate-50 border-emerald-500 shadow-3xs' 
                  : 'bg-white border-slate-200 opacity-90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{info.icon}</span>
                    <span className="font-extrabold text-[12px] text-slate-800">{info.name}</span>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                    cfg.isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {cfg.isEnabled 
                      ? (selectedLang === 'English' ? 'ACTIVE' : 'सक्रिय ✓') 
                      : (selectedLang === 'English' ? 'OFF' : 'बंद ✖')}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed mb-3">
                  {selectedLang === 'English' ? info.descEn : info.descHi}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleToggleChannel(cfg.channel)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all text-center active:scale-95 cursor-pointer border ${
                    cfg.isEnabled
                      ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                      : info.color
                  }`}
                >
                  {cfg.isEnabled 
                    ? (selectedLang === 'English' ? 'Disable' : 'बंद करें ✖') 
                    : (selectedLang === 'English' ? `Get on ${info.brand}` : `${info.brand} पर पाएँ `)}
                </button>
                {cfg.isEnabled && (
                  <button
                    type="button"
                    onClick={() => setEditingChannel(cfg.channel)}
                    className="p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg active:scale-90 transition-all cursor-pointer"
                    title="Settings"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Form for Preference Configuration if editing */}
      {editingChannel && (() => {
        const cfg = configs.find(c => c.channel === editingChannel)!;
        const info = channelInfo[editingChannel];
        return (
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 mt-4 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-emerald-600" />
                <span className="font-extrabold text-xs text-slate-705 uppercase">
                  {editingChannel === 'whatsapp' ? 'WhatsApp Preferences' : `${editingChannel.toUpperCase()} प्राथमिकताएं`}
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setEditingChannel(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Config Fields */}
            <div className="space-y-3.5">
              {/* Contact Identifier */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                  {editingChannel === 'email' ? 'EMAIL ADDRESS / ईमेल पता' : 'CONTACT NUMBER / फ़ोन नंबर'}
                </label>
                <input
                  type={editingChannel === 'email' ? 'email' : 'text'}
                  value={editingChannel === 'email' ? (cfg.emailAddress || '') : (cfg.phoneNumber || '')}
                  onChange={(e) => {
                    const val = e.target.value;
                    const field = editingChannel === 'email' ? 'emailAddress' : 'phoneNumber';
                    setConfigs(configs.map(c => c.channel === editingChannel ? { ...c, [field]: val } : c));
                  }}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-emerald-500"
                  placeholder={editingChannel === 'email' ? 'apnaamail@gmail.com' : '9876543210'}
                />
              </div>

              {/* Frequency Slices */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                  {selectedLang === 'English' ? 'UPDATE FREQUENCY / HOW OFTEN' : 'अपडेट आवृति / कितनी बार'}
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-200/50 p-1 rounded-xl">
                  {[
                    { id: 'daily', hi: 'रोज़ाना', en: 'Daily' },
                    { id: 'weekly', hi: 'साप्ताहिक', en: 'Weekly (Best)' },
                    { id: 'monthly', hi: 'मासिक', en: 'Monthly' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setConfigs(configs.map(c => c.channel === editingChannel ? { ...c, frequency: f.id as any } : c));
                      }}
                      className={`py-1.5 rounded-lg text-[10px] font-black tracking-tight text-center cursor-pointer ${
                        cfg.frequency === f.id
                          ? 'bg-emerald-600 text-white shadow-3xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {selectedLang === 'English' ? f.en : f.hi}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format selection */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">
                  {selectedLang === 'English' ? 'MESSAGE CONTENT FORMAT' : 'प्रारूप / सन्देश प्रकार'}
                </label>
                <select
                  value={cfg.format}
                  onChange={(e) => {
                    setConfigs(configs.map(c => c.channel === editingChannel ? { ...c, format: e.target.value as any } : c));
                  }}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-emerald-500"
                >
                  <option value="text">
                    {selectedLang === 'English' ? 'Simple Text Alert' : 'साधारण लिखित सन्देश'}
                  </option>
                  <option value="voice_summary">
                    {selectedLang === 'English' ? 'Audio Voice Note Sathi Link' : 'बोलता हुआ ऑडियो वॉइस नोट लिंक 🎙️'}
                  </option>
                  <option value="rich_report">
                    {selectedLang === 'English' ? 'Detailed PDF Document statement' : 'विस्तृत पीडीएफ बहीखाता रिपोर्ट'}
                  </option>
                </select>
              </div>

              {/* Topics Checkbox List */}
              <div className="space-y-2">
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase">
                  {selectedLang === 'English' ? 'SUBSCRIBED TOPICS' : 'रुचि के विषय (सब्सक्राइब करें)'}
                </label>
                <div className="bg-white border border-slate-150 p-2.5 rounded-xl space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={cfg.topics.weeklyBachat}
                      onChange={(e) => {
                        const updatedTopics = { ...cfg.topics, weeklyBachat: e.target.checked };
                        setConfigs(configs.map(c => c.channel === editingChannel ? { ...c, topics: updatedTopics } : c));
                      }}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] font-bold text-slate-700">
                      {selectedLang === 'English' ? 'Weekly Savings Summary' : 'साप्ताहिक बचत और बजट रिपोर्ट'}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={cfg.topics.emergencyAlerts}
                      onChange={(e) => {
                        const updatedTopics = { ...cfg.topics, emergencyAlerts: e.target.checked };
                        setConfigs(configs.map(c => c.channel === editingChannel ? { ...c, topics: updatedTopics } : c));
                      }}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] font-bold text-slate-700">
                      {selectedLang === 'English' ? 'Emergency Goal Milestones' : 'नये लक्ष्य और बचत माइलस्टोन'}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={cfg.topics.scamWarnings}
                      onChange={(e) => {
                        const updatedTopics = { ...cfg.topics, scamWarnings: e.target.checked };
                        setConfigs(configs.map(c => c.channel === editingChannel ? { ...c, topics: updatedTopics } : c));
                      }}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] font-bold text-slate-700">
                      {selectedLang === 'English' ? 'Cyber Security Fraud Alerts' : 'जालसाजी और फ्रॉड चेतावनी अलर्ट (PMJDY Verified)'}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={cfg.topics.goldPrices}
                      onChange={(e) => {
                        const updatedTopics = { ...cfg.topics, goldPrices: e.target.checked };
                        setConfigs(configs.map(c => c.channel === editingChannel ? { ...c, topics: updatedTopics } : c));
                      }}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] font-bold text-slate-700">
                      {selectedLang === 'English' ? 'Digital Gold Rates & Micro-SIP' : 'गोल्ड रेट और ₹1 डिजिटल सोना सलाह'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Dynamic Auto-Testing Scheduler */}
              <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight flex items-center gap-1">
                    ⏰ {selectedLang === 'English' ? 'TEST AUTOMATIC DISPATCHER' : 'स्वचालित टेस्ट शेड्यूलर'}
                  </span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                    {selectedLang === 'English' ? 'Auto-Trigger' : 'ऑटो-ट्रिगर'}
                  </span>
                </div>
                
                <p className="text-[9px] text-slate-500 font-bold leading-normal">
                  {selectedLang === 'English' 
                    ? "Schedule an update to trigger on its own after the selected time to simulate real-world background delivery."
                    : "चुनें कि कितने सेकंड बाद पैसा साथी खुद बैकग्राउंड से आपकी रिपोर्ट व्हाट्सएप संदेश के रूप में तैयार करे।"}
                </p>

                <div className="flex items-center gap-2">
                  <div className="grid grid-cols-3 gap-1 flex-1">
                    {[5, 15, 30].map(s => (
                      <button
                        key={s}
                        type="button"
                        disabled={isTimerRunning}
                        onClick={() => setSchedulerSeconds(s)}
                        className={`py-1.5 rounded-lg text-[10px] font-black cursor-pointer text-center ${
                          schedulerSeconds === s
                            ? 'bg-slate-800 text-white shadow-2xs'
                            : 'bg-white border border-slate-250 text-slate-600 hover:bg-slate-50'
                        } ${isTimerRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {s}s
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isTimerRunning) {
                        setIsTimerRunning(false);
                        setCountdown(null);
                        speakResponse(selectedLang === 'English' ? "Timer cancelled." : "शेड्यूलर बंद कर दिया गया है।");
                      } else {
                        setCountdown(schedulerSeconds);
                        setIsTimerRunning(true);
                        const startSpeech = selectedLang === 'English'
                          ? `Timer started. Your automated update will prepare in ${schedulerSeconds} seconds.`
                          : `टाइमर शुरू। ठीक ${schedulerSeconds} सेकंड बाद पैसा साथी रिपोर्ट WhatsApp पर खुद लैंड होगी।`;
                        speakResponse(startSpeech);
                      }
                    }}
                    className={`py-1.5 px-3.5 rounded-lg text-[10px] font-black transition-all cursor-pointer text-center whitespace-nowrap shadow-3xs active:scale-95 ${
                      isTimerRunning 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isTimerRunning 
                      ? (selectedLang === 'English' ? 'Cancel' : 'निरस्त करें ✖') 
                      : (selectedLang === 'English' ? 'Schedule' : 'शेड्यूल करें ⏰')}
                  </button>
                </div>

                {/* Live Countdown Display */}
                {isTimerRunning && countdown !== null && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-2.5 flex items-center justify-between text-[10px] font-black animate-pulse">
                    <span>
                      {selectedLang === 'English' 
                        ? '⏳ Sathi alert landing on WhatsApp mockup automatically...' 
                        : '⏳ रिपोर्ट व्हाट्सएप स्क्रीन पर स्वतः आ रही है...'}
                    </span>
                    <span className="text-xs text-white bg-emerald-600 px-2.5 py-0.5 rounded-full font-black">
                      {countdown}s
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions for Config save */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleSaveChannelDetails(editingChannel, cfg)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] py-2 px-3 rounded-xl transition-all cursor-pointer text-center active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{selectedLang === 'English' ? 'Save Settings' : 'सेटिंग सुरक्षित करें'}</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  generateMockMessage(editingChannel);
                }}
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200 font-extrabold text-[11px] py-2 px-3 rounded-xl transition-all cursor-pointer text-center active:scale-95 flex items-center justify-center gap-1.5"
                title="Simulate push alert now"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-700" />
                <span>{selectedLang === 'English' ? 'Send Instant Alert' : 'तात्कालिक टेस्ट सन्देश भेजें'}</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* Simulated Live Message Mockup Screen (Highly engaging device simulation) */}
      {simulatedNotification && simulatedNotification.show && (
        <div className="bg-[#e5ddd5] rounded-3xl p-3 border-4 border-slate-800 shadow-xl space-y-2 animate-fadeIn relative overflow-hidden">
          {/* Top WhatsApp phone styling header bar */}
          <div className="bg-[#075e54] text-white flex justify-between items-center px-4 py-1.5 rounded-t-xl -mt-3 -mx-3 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-400 text-emerald-950 font-black text-[9px] flex items-center justify-center border border-white">
                Sa
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-tight">Paisa Saathi (bilingual)</p>
                <p className="text-[7px] text-emerald-100 font-medium">online. official help-companion</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setSimulatedNotification(null)}
              className="text-emerald-100 hover:text-white p-1 text-[11px] font-bold cursor-pointer"
            >
              Close ✕
            </button>
          </div>

          <p className="text-[9px] text-slate-500 text-center font-bold bg-[#d1ebd5] py-0.5 rounded-full w-24 mx-auto mb-2 tracking-wider">
            {selectedLang === 'English' ? "TODAY" : "आज का संदेश"}
          </p>

          {/* Chat bubble body mock */}
          <div className="flex justify-start">
            <div className="bg-white rounded-xl rounded-tl-none p-3 max-w-[90%] shadow-2xs relative text-left space-y-2">
              {/* WhatsApp message green status arrow */}
              <div className="absolute top-0 -left-1.5 w-2 h-2.5 bg-white clip-triangle" />
              
              <div className="flex items-center gap-1 text-[8px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-1.5 py-0.5 rounded-md font-bold self-start w-fit">
                <Shield className="w-2.5 h-2.5 text-emerald-600" />
                <span>Official Partner (Verified Govt Links)</span>
              </div>

              <p className="text-[10px] text-slate-800 font-bold whitespace-pre-wrap leading-relaxed">
                {simulatedNotification.message}
              </p>

              {/* Action Link Box inside the message to verify link presence */}
              <div className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-2.5 mt-2 transition-all flex items-center justify-between gap-1.5">
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-black text-slate-700 truncate uppercase mt-0.5">
                    {simulatedNotification.linkName}
                  </div>
                  <div className="text-[7px] font-mono text-emerald-600 truncate mt-0.5">
                    {simulatedNotification.linkUrl}
                  </div>
                </div>
                <a 
                  href={simulatedNotification.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#128C7E] text-white p-2.5 rounded-full text-[10px] font-black active:scale-90 transition-transform shrink-0 flex items-center justify-center hover:bg-emerald-700"
                  title="Click Link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Dynamic Paisa Saathi Companion App Launch Box */}
              <div className="bg-[#e8f5e9] hover:bg-[#c8e6c9] border border-emerald-300 rounded-xl p-2.5 mt-2 transition-all flex items-center justify-between gap-1.5 cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-black text-emerald-900 truncate uppercase mt-0.5">
                    {selectedLang === 'English' ? 'Open Paisa Saathi App 🚀' : 'पैसा साथी मुख्य ऐप खोलें 🚀'}
                  </div>
                  <div className="text-[7px] font-mono text-slate-500 truncate mt-0.5">
                    {window.location.origin}
                  </div>
                </div>
                <a 
                  href={window.location.origin}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-850 text-white p-2.5 rounded-full text-[10px] font-black active:scale-90 transition-transform shrink-0 flex items-center justify-center hover:bg-emerald-900 shadow-3xs"
                  title="Open App Companion"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="text-right">
                <span className="text-[8px] text-slate-400 font-bold inline-flex items-center gap-0.5">
                  {(new Date()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                  <span className="text-sky-500 font-black">✓✓</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-[9px] text-[#075e54] font-black underline bg-white/60 p-1.5 rounded-lg border border-emerald-100 inline-block">
              {selectedLang === 'English' 
                ? "💡 Info: The above advice is live-generated based on your family budget and goals!"
                : "💡 सूचना: ऊपर दी सलाह आपके बजट और सपनों के हिसाब से लाइव तैयार की गयी है!"}
            </p>
          </div>
        </div>
      )}

      {/* SOLID Server-Side Scheduler Log Console / Queue Manager */}
      <div id="scheduler-monitor-console" className="bg-slate-900 text-slate-100 rounded-3xl p-4 border border-slate-800 shadow-2xl mt-4 space-y-3 font-sans">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div>
              <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-200">
                {selectedLang === 'English' ? "SOLID Server Scheduler Monitor" : "सॉलिड सर्वर-साइड शेड्यूलर मॉनिटर"}
              </h5>
              <p className="text-[9px] text-slate-400">
                Active Cycle: <span className="font-mono text-emerald-400 font-bold bg-slate-950 px-1.5 py-0.5 rounded">45 Seconds</span>
              </p>
            </div>
          </div>

          <button
            id="trigger-server-dispatch-btn"
            type="button"
            disabled={isTriggeringServer}
            onClick={triggerServerScheduler}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[9px] uppercase px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-md disabled:opacity-50"
          >
            {isTriggeringServer ? (
              <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : "⚡"}
            <span>{selectedLang === 'English' ? "Trigger Server Tick" : "सर्वर टिक शुरू करें"}</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
          {selectedLang === 'English'
            ? "The background daemon generates targeted scheme updates with specific advise algorithms based on user goals using SOLID structure. Memory logs below display true transaction telemetry:"
            : "बैकग्राउंड शेड्यूलर उपयोगकर्ता के लक्ष्यों के आधार पर योजना सलाह तैयार करता है। नीचे दिए गए लॉग सर्वर मेमोरी में दर्ज वास्तविक लेनदेन प्रदर्शित करते हैं:"}
        </p>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {serverLogs.length === 0 ? (
            <div className="text-center py-6 text-[10px] text-slate-500 font-bold bg-slate-950/40 rounded-xl border border-slate-800/50">
              📭 {selectedLang === 'English' ? "No logs registered yet. Tap 'Trigger Server Tick' or turn on WhatsApp to wait for a 45s cycle." : "अभी तक कोई लॉग दर्ज नहीं किया गया है। व्हाट्सएप चालू कर शेड्यूल का इंतजार करें।"}
            </div>
          ) : (
            serverLogs.map((log: any) => (
              <div 
                key={log.id} 
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 space-y-1 hover:border-slate-700 transition-colors"
                id={`server-log-${log.id}`}
              >
                <div className="flex items-center justify-between text-[8px] font-mono">
                  <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className={`px-1.5 py-0.5 rounded-sm font-bold ${
                    log.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {log.success ? '✓ DISPATCHED' : '✖ FAILURE'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-300">
                  <span>To: {log.userName} (+{log.recipient})</span>
                  <span className="text-slate-400 text-[8px] font-mono">ID: {log.id}</span>
                </div>

                <p className="text-[9px] text-slate-400 font-mono bg-slate-950 p-2 rounded border border-slate-850/40 whitespace-pre-wrap leading-normal font-medium">
                  {log.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
