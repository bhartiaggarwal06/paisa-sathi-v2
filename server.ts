import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { initializeFirestore, setLogLevel, doc, getDoc, getDocs, setDoc, deleteDoc, collection, query, where, limit } from 'firebase/firestore';
import { SchedulerService } from './src/server/scheduler/SchedulerService';


dotenv.config({ override: true });

const DB_FILE = path.resolve('db.json');

// Initialize Firebase using the provisioned credentials
let firestoreDb: any = null;
try {
  const firebaseConfigPath = path.resolve('firebase-applet-config.json');
  if (fs.existsSync(firebaseConfigPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
    const firebaseApp = initializeApp(firebaseConfig);
    firestoreDb = initializeFirestore(firebaseApp, {
      experimentalForceLongPolling: true,
      experimentalAutoDetectLongPolling: true
    }, firebaseConfig.firestoreDatabaseId);
    setLogLevel('error');
    console.log("Firebase App & Firestore successfully initialized server-side with forced Long Polling.");
  } else {
    console.warn("firebase-applet-config.json not found! Operating in offline/local mock mode.");
  }
} catch (err) {
  console.error("Error initializing Firebase server-side:", err);
}

// Initialize local database JSON if not exists
const DEFAULT_DB = {
  users: [
    {
      id: "user_ramesh",
      mobile_number: "9876543210",
      language: "Hindi",
      user_type: "Driver",
      name: "Ramesh Kumar",
      monthly_income: 25050,
      primary_goal: "Bachi ki padhai / Child education",
      is_logged_in: true,
      is_onboarded: true,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      financial_score: 72,
      savings_target: 500000,
      savings_accumulated: 125000,
      current_month_aay: 25000,
      current_month_kharch: 18000,
      current_month_bachat: 7000
    }
  ],
  chat_history: [
    {
      id: "chat_init",
      user_id: "user_ramesh",
      user_message: "Hello",
      ai_response: "Namaste Ramesh ji! 🙏 Main Paisa Saathi hoon. Main aapko bachat aur nivesh samajhne mein madad karunga. Aaj kya poochhna chahenge?",
      timestamp: new Date().toISOString()
    }
  ],
  alerts: [
    {
      id: "alert_1",
      user_id: "user_ramesh",
      alert_title: "₹500 cut gaye (Deduction)",
      alert_description: "Yeh isliye hua kyunki aapne trip cancel kiya tha. Agli baar trip cancel karne se pehle screen par warning zaroor dekhein. Hamara lakshya aapka nuksan bachana hai.",
      created_at: new Date().toISOString()
    },
    {
      id: "alert_2",
      user_id: "user_ramesh",
      alert_title: "Chori aur Fraud se bachein!",
      alert_description: "Dhyan rakhein! Paisa Saathi ya koi bhi bank aapka OTP, PIN ya check book nahi maangta. Phone par kisi ko bhi apna details na dein.",
      created_at: new Date().toISOString()
    },
    {
      id: "alert_3",
      user_id: "user_ramesh",
      alert_title: "Naya Bachat Challenge unlocked 🌟",
      alert_description: "Aapne is mahine ₹7,000 bachaaye hain! Bachi ki padhai ke liye har mahine ₹500 ka SIP shuru karne ka sahi samay hai.",
      created_at: new Date().toISOString()
    }
  ],
  savings_tips: [
    {
      id: "tip_1",
      tip: "Roz ₹50 bachaayein: Saaf tiffin ghar se laayein, bahar ki chai aur biscuit ka kharch kam karein.",
      category: "Dainik Kharch",
      language: "Hindi"
    },
    {
      id: "tip_2",
      tip: "Bike maintenance samay par karein: Engine oil badalne se mileage badhta hai aur petrol ka paisa bachta hai.",
      category: "Gaadi Kharch",
      language: "Hindi"
    },
    {
      id: "tip_3",
      tip: "Sarkari Yojana ka fayda uthayein: Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY) mein sirf ₹436/saal mein ₹2 Lakh ka bima milta hai.",
      category: "Suraksha",
      language: "Hindi"
    },
    {
      id: "tip_4",
      tip: "Emergency fund rakhein: Har mahine aay ka 5% ek alag khate mein daalein, taaki bura samay aane par udhar na maangna pade.",
      category: "Bachat",
      language: "Hindi"
    }
  ],
  investment_guidance: [
    {
      id: "guidance_1",
      title: "Mutual Fund (SIP) Kya hai?",
      description: "SIP ka matlab hai 'Systematic Investment Plan'. Har mahine thoda paisa (jaise ₹500) nivesh karna. Isse aapka paisa dheere-dheere badhta hai aur inflation se ladne mein madad milti hai.",
      language: "Hindi"
    },
    {
      id: "guidance_2",
      title: "Recurring Deposit (RD) kya hai?",
      description: "Har mahine banks mein thoda paisa fix deposit karna. Isme 6% se 7% ka surakshit byaaj (interest) milta hai. Gareeb aur underserved logon ke liye behtareen aur safe option hai.",
      language: "Hindi"
    },
    {
      id: "guidance_3",
      title: "Digital Gold - Sirf ₹1 se gold kharidein",
      description: "Aap apne mobile se sirf ₹1 ka bhi sona kharid sakte hain. Yeh 24K pure hota hai aur safe locker mein rehta hai jab tak aap ise bechein nahi.",
      language: "Hindi"
    },
    {
      id: "guidance_4",
      title: "NPS (National Pension Scheme)",
      description: "Buzurgi ke dino ke liye sarkari surakshit yojana. Isme thoda-thoda jama karke aap 60 saal ke baad har mahine pension pa sakte hain.",
      language: "Hindi"
    }
  ],
  expenses: [
    { id: "exp_1", user_id: "user_ramesh", category: "Kirana", amount: 6300, date: "Aaj, 10:30 AM", title: "Kirana dukan samaan" },
    { id: "exp_2", user_id: "user_ramesh", category: "Travel", amount: 120, date: "Aaj, 08:30 AM", title: "Bus ticket" },
    { id: "exp_3", user_id: "user_ramesh", category: "Kiraya", amount: 3600, date: "Kal", title: "Room rent part" },
    { id: "exp_4", user_id: "user_ramesh", category: "Dawai", amount: 480, date: "2 din pehle", title: "Khansi ki dawai" },
    { id: "exp_5", user_id: "user_ramesh", category: "Manoranjan", amount: 200, date: "Is hafte", title: "Mobile recharge" }
  ],
  goals: [
    {
      id: "goal_ramesh_1",
      user_id: "user_ramesh",
      title: "Bachi ki padhai / Child education",
      target_amount: 500000,
      accumulated_amount: 125000,
      category: "Education",
      status: "Active"
    }
  ]
};

function getDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const db = JSON.parse(content);
    // Backward compatibility validation
    if (db.users) {
      db.users.forEach((u: any) => {
        if (u.is_onboarded === undefined) {
          u.is_onboarded = !!(u.name && u.name !== "Chalak / Sathi");
        }
      });
    }
    if (!db.goals) {
      db.goals = [
        {
          id: "goal_ramesh_1",
          user_id: "user_ramesh",
          title: "Bachi ki padhai / Child education",
          target_amount: 500000,
          accumulated_amount: 125000,
          category: "Education",
          status: "Active"
        }
      ];
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    }
    return db;
  } catch (error) {
    console.error("Error reading JSON db, resetting to default:", error);
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
    return DEFAULT_DB;
  }
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Firestore cloud database persistent synchronizers
async function syncToFirestore(db: any) {
  if (!firestoreDb) return;
  try {
    // 1. Sync users
    if (db.users) {
      for (const u of db.users) {
        if (u.id) {
          try {
            await setDoc(doc(firestoreDb, 'users', u.id), u);
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, `users/${u.id}`);
          }
        }
      }
    }
    // 2. Sync expenses
    if (db.expenses) {
      for (const e of db.expenses) {
        if (e.id) {
          try {
            await setDoc(doc(firestoreDb, 'expenses', e.id), e);
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, `expenses/${e.id}`);
          }
        }
      }
    }
    // 3. Sync goals
    if (db.goals) {
      for (const g of db.goals) {
        if (g.id) {
          try {
            await setDoc(doc(firestoreDb, 'goals', g.id), g);
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, `goals/${g.id}`);
          }
        }
      }
    }
    // 4. Sync alerts
    if (db.alerts) {
      for (const a of db.alerts) {
        if (a.id) {
          try {
            await setDoc(doc(firestoreDb, 'alerts', a.id), a);
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, `alerts/${a.id}`);
          }
        }
      }
    }
    // 5. Sync chat history
    if (db.chat_history) {
      for (const c of db.chat_history) {
        if (c.id) {
          try {
            await setDoc(doc(firestoreDb, 'chat_history', c.id), c);
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, `chat_history/${c.id}`);
          }
        }
      }
    }
    console.log("[Firestore] Cloud database persistent sync completed successfully.");
  } catch (err) {
    console.error("[Firestore] Background sync failed:", err);
  }
}

async function syncFromFirestore() {
  if (!firestoreDb) return;
  try {
    console.log("[Firestore] Connecting and pulling live state from Cloud Firestore...");
    
    const db: any = {
      users: [],
      expenses: [],
      goals: [],
      alerts: [],
      chat_history: [],
      savings_tips: DEFAULT_DB.savings_tips,
      investment_guidance: DEFAULT_DB.investment_guidance
    };

    // Load users
    try {
      const snap = await getDocs(collection(firestoreDb, 'users'));
      db.users = snap.docs.map(d => d.data());
    } catch (e) {
      console.warn("Failed pulling users collection, will seed defaults:", e);
      handleFirestoreError(e, OperationType.GET, 'users');
    }

    // Load expenses
    try {
      const snap = await getDocs(collection(firestoreDb, 'expenses'));
      db.expenses = snap.docs.map(d => d.data());
    } catch (e) {
      console.warn("Failed pulling expenses collection:", e);
      handleFirestoreError(e, OperationType.GET, 'expenses');
    }

    // Load goals
    try {
      const snap = await getDocs(collection(firestoreDb, 'goals'));
      db.goals = snap.docs.map(d => d.data());
    } catch (e) {
      console.warn("Failed pulling goals collection:", e);
      handleFirestoreError(e, OperationType.GET, 'goals');
    }

    // Load alerts
    try {
      const snap = await getDocs(collection(firestoreDb, 'alerts'));
      db.alerts = snap.docs.map(d => d.data());
    } catch (e) {
      console.warn("Failed pulling alerts collection:", e);
      handleFirestoreError(e, OperationType.GET, 'alerts');
    }

    // Load chat history
    try {
      const snap = await getDocs(collection(firestoreDb, 'chat_history'));
      db.chat_history = snap.docs.map(d => d.data());
    } catch (e) {
      console.warn("Failed pulling chat history collection:", e);
      handleFirestoreError(e, OperationType.GET, 'chat_history');
    }

    // Check if we need to seed the cloud database (e.g. if completely brand new and user_ramesh is missing)
    const hasRamesh = db.users.some((u: any) => u.id === 'user_ramesh');
    if (!hasRamesh) {
      console.log("[Firestore] Seeding new project with default Paisa Saathi records...");
      db.users.push(...DEFAULT_DB.users);
      db.expenses.push(...DEFAULT_DB.expenses);
      db.goals.push(...DEFAULT_DB.goals);
      db.alerts.push(...DEFAULT_DB.alerts);
      db.chat_history.push(...DEFAULT_DB.chat_history);
      
      // Save synchronously to local db.json then sync all to Firestore
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
      await syncToFirestore(db);
    } else {
      // Overwrite local db.json with actual Firestore values
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
      console.log("[Firestore] Pulled and restored live dashboard records successfully! Count:", {
        users: db.users.length,
        expenses: db.expenses.length,
        goals: db.goals.length,
        alerts: db.alerts.length,
        chat: db.chat_history.length
      });
    }
  } catch (err) {
    console.error("[Firestore] Startup pull failed, using local fallback DB:", err);
  }
}

function saveDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  if (firestoreDb) {
    syncToFirestore(data).catch(err => {
      console.error("[Firestore] Background sync error:", err);
    });
  }
}

// Initialise Gemini API
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. We will operate in education mock reply mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Static trust messages endpoint
  app.get('/api/trust-info', (req, res) => {
    res.json({
      messages: [
        { title: "हम आपका पैसा नहीं छूते", subtitle: "We never touch or hold your money" },
        { title: "कोई hidden charges नहीं", subtitle: "100% free with zero hidden cost" },
        { title: "सिर्फ मार्गदर्शन", subtitle: "Pure financial education & guidance" }
      ]
    });
  });

  // Authentication routes
  app.post('/api/auth/otp-request', (req, res) => {
    const { mobile_number } = req.body;
    if (!mobile_number) {
      return res.status(400).json({ error: "Mobile number is required" });
    }
    // Generate a simple 4 digit OTP for demo
    const otp = "1234";
    console.log(`[SMS Gateway Mock] Mobile: ${mobile_number}, OTP is ${otp}`);
    res.json({
      success: true,
      message: `Paisa Saathi: Aapka OTP 1234 hai. Kripya bachein aur kisi ko na batayein.`,
      otp: otp // returning for easy clickable prototype login
    });
  });

  app.post('/api/auth/otp-verify', async (req, res) => {
    const { mobile_number, otp, language, name } = req.body;
    if (!mobile_number || !otp) {
      return res.status(400).json({ error: "Mobile and OTP are required" });
    }

    if (otp !== "1234") {
      return res.status(400).json({ error: "Invalid OTP! Try 1234 for demo." });
    }

    const db = getDB();

    // Dynamically fetch from live Firestore database to make sure we load the real user record
    if (firestoreDb) {
      try {
        const q = query(collection(firestoreDb, 'users'), where('mobile_number', '==', mobile_number));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const cloudUser = snap.docs[0].data();
          const index = db.users.findIndex((u: any) => u.mobile_number === mobile_number);
          if (index !== -1) {
            db.users[index] = cloudUser;
          } else {
            db.users.push(cloudUser);
          }
          fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
        }
      } catch (err) {
        console.error("[Firestore] Dynamic fetch during OTP verify failed:", err);
      }
    }

    let user = db.users.find((u: any) => u.mobile_number === mobile_number);
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      // Create user template initially as unonboarded shell
      user = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        mobile_number,
        language: language || "Hindi",
        user_type: "Gig Worker",
        name: name || "", // empty means we require onboarding setup
        monthly_income: 0,
        primary_goal: "",
        is_logged_in: true,
        is_onboarded: false,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        financial_score: 65,
        savings_target: 300000,
        savings_accumulated: 0,
        current_month_aay: 0,
        current_month_kharch: 0,
        current_month_bachat: 0
      };
      db.users.push(user);
    } else {
      user.is_logged_in = true;
      user.last_login = new Date().toISOString();
      if (language && !user.language) user.language = language;
      if (name && !user.name) user.name = name;
      
      // Auto-onboard if vital details (name and monthly income) exist in the database
      if (user.name && user.name.trim() !== "" && user.monthly_income !== undefined && user.monthly_income !== null && Number(user.monthly_income) > 0) {
        user.is_onboarded = true;
      }
      
      // Determine if they are unonboarded (missing a name or income)
      if (!user.name || user.name.trim() === "" || !user.monthly_income || Number(user.monthly_income) <= 0) {
        isNewUser = true;
      } else {
        isNewUser = false;
      }
    }

    saveDB(db);
    res.json({
      success: true,
      token: "session_token_" + user.id,
      user,
      is_new_user: isNewUser
    });
  });

  // Get current user details
  app.get('/api/users/:mobile', async (req, res) => {
    const { mobile } = req.params;
    const db = getDB();

    // Dynamically fetch from live Firestore database to sync on demand
    if (firestoreDb) {
      try {
        const q = query(collection(firestoreDb, 'users'), where('mobile_number', '==', mobile));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const cloudUser = snap.docs[0].data();
          const index = db.users.findIndex((u: any) => u.mobile_number === mobile);
          if (index !== -1) {
            db.users[index] = cloudUser;
          } else {
            db.users.push(cloudUser);
          }
          fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
        }
      } catch (err) {
        console.error("[Firestore] Dynamic user fetch failed:", err);
      }
    }

    const user = db.users.find((u: any) => u.mobile_number === mobile);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  app.get('/api/users/by-id/:userId', (req, res) => {
    const { userId } = req.params;
    const db = getDB();
    const user = db.users.find((u: any) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  // Update user profile details
  app.post('/api/users/update', (req, res) => {
    const { id, name, monthly_income, primary_goal, language } = req.body;
    const db = getDB();
    const userIndex = db.users.findIndex((u: any) => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = db.users[userIndex];
    if (name !== undefined) user.name = name;
    if (monthly_income !== undefined) {
      user.monthly_income = Number(monthly_income);
      user.current_month_aay = Number(monthly_income);
      user.current_month_bachat = Math.max(0, user.current_month_aay - user.current_month_kharch);
    }
    if (primary_goal !== undefined) user.primary_goal = primary_goal;
    if (language !== undefined) user.language = language;
    
    // Mark as fully onboarded now
    user.is_onboarded = true;

    db.users[userIndex] = user;
    saveDB(db);
    res.json({ success: true, user });
  });

  // Update channels configuration for multi-channel opt-in
  app.post('/api/users/update-channels', (req, res) => {
    const { id, channels_config } = req.body;
    const db = getDB();
    const userIndex = db.users.findIndex((u: any) => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = db.users[userIndex];
    user.channels_config = channels_config;
    db.users[userIndex] = user;
    saveDB(db);
    res.json({ success: true, user });
  });

  // GET background scheduler dispatch logs for testing
  app.get('/api/scheduler/logs', (req, res) => {
    const logs = SchedulerService.getInstance().getLogs();
    res.json(logs);
  });

  // POST manually execute scheduler dispatch cycle (Instant run)
  app.post('/api/scheduler/trigger', async (req, res) => {
    const db = getDB();
    try {
      console.log("[API] Manually triggering background scheduler worker tick...");
      const processedCount = await SchedulerService.getInstance().runTick(db.users);
      const logs = SchedulerService.getInstance().getLogs();
      res.json({ success: true, processedCount, logs });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Trigger execution failed' });
    }
  });

  // Get alerts list
  app.get('/api/alerts/:userId', (req, res) => {
    const db = getDB();
    const userAlerts = db.alerts.filter((a: any) => a.user_id === req.params.userId);
    res.json(userAlerts);
  });

  // Add a custom alert
  app.post('/api/alerts', (req, res) => {
    const { user_id, alert_title, alert_description } = req.body;
    const db = getDB();
    const newAlert = {
      id: "alert_" + Math.random().toString(36).substr(2, 9),
      user_id,
      alert_title,
      alert_description,
      created_at: new Date().toISOString()
    };
    db.alerts.unshift(newAlert);
    saveDB(db);
    res.json(newAlert);
  });

  // Get savings tips
  app.get('/api/savings-tips', (req, res) => {
    const db = getDB();
    res.json(db.savings_tips);
  });

  // Add savings tip
  app.post('/api/savings-tips', (req, res) => {
    const { tip, category, language } = req.body;
    const db = getDB();
    const newTip = {
      id: "tip_" + Math.random().toString(36).substr(2, 9),
      tip,
      category,
      language: language || "Hindi"
    };
    db.savings_tips.push(newTip);
    saveDB(db);
    res.json(newTip);
  });

  // Get investment guidance
  app.get('/api/investment-guidance', (req, res) => {
    const db = getDB();
    res.json(db.investment_guidance);
  });

  // Get or post expenses
  app.get('/api/expenses/:userId', (req, res) => {
    const db = getDB();
    const userExp = db.expenses.filter((e: any) => e.user_id === req.params.userId || !e.user_id);
    res.json(userExp);
  });

  app.post('/api/expenses', (req, res) => {
    const { user_id, category, amount, title, type } = req.body;
    const db = getDB();
    const transactionType = type || 'expense';
    const newExp = {
      id: "exp_" + Math.random().toString(36).substr(2, 9),
      user_id,
      category,
      amount: Number(amount),
      date: "Aaj, " + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      title: title || `${category} ${transactionType === 'expense' ? 'kharch' : 'paisa'}`,
      type: transactionType
    };
    db.expenses.unshift(newExp);

    // Update user monthly details
    const user = db.users.find((u: any) => u.id === user_id);
    if (user) {
      if (transactionType === 'expense') {
        user.current_month_kharch += Number(amount);
      } else {
        user.current_month_aay += Number(amount);
      }
      user.current_month_bachat = Math.max(0, user.current_month_aay - user.current_month_kharch);
      // Adjust score dynamic
      if (user.current_month_kharch > user.current_month_aay) {
        user.financial_score = Math.max(20, user.financial_score - 5);
      } else {
        user.financial_score = Math.min(99, user.financial_score + 1);
      }
    }

    saveDB(db);
    res.json({ success: true, expense: newExp, user });
  });

  // Delete expense
  app.delete('/api/expenses/:id', (req, res) => {
    const { id } = req.params;
    const db = getDB();
    const expIndex = db.expenses.findIndex((e: any) => e.id === id);
    if (expIndex !== -1) {
      const deleted = db.expenses.splice(expIndex, 1)[0];
      
      // Update user monthly details
      if (deleted.user_id) {
        const user = db.users.find((u: any) => u.id === deleted.user_id);
        if (user) {
          const amount = Number(deleted.amount) || 0;
          if (!deleted.type || deleted.type === 'expense') {
            user.current_month_kharch = Math.max(0, (user.current_month_kharch || 0) - amount);
          } else {
            user.current_month_aay = Math.max(0, (user.current_month_aay || 0) - amount);
          }
          user.current_month_bachat = Math.max(0, user.current_month_aay - user.current_month_kharch);
          // Recalculate score dynamic back slightly
          if (user.current_month_kharch <= user.current_month_aay) {
            user.financial_score = Math.min(99, (user.financial_score || 70) + 1);
          }
        }
      }
      
      saveDB(db);
      if (firestoreDb) {
        deleteDoc(doc(firestoreDb, 'expenses', id)).catch(err => {
          console.error("[Firestore] Expense background delete failed:", err);
        });
      }
      return res.json({ success: true, deleted });
    }
    res.status(404).json({ error: "Not found" });
  });

  // Get goals list
  app.get('/api/goals/:userId', (req, res) => {
    const { userId } = req.params;
    const db = getDB();
    if (!db.goals) {
      db.goals = [];
    }
    let userGoals = db.goals.filter((g: any) => g.user_id === userId);
    
    // If no goals exist at all for this user, seed their primary_goal
    if (userGoals.length === 0) {
      const user = db.users.find((u: any) => u.id === userId);
      if (user) {
        const defaultGoal = {
          id: "goal_seed_" + Math.random().toString(36).substr(2, 9),
          user_id: userId,
          title: user.primary_goal || "Bachi ki padhai / Child education",
          target_amount: user.savings_target || 500000,
          accumulated_amount: user.savings_accumulated || 10000,
          category: "Education",
          status: "Active"
        };
        db.goals.push(defaultGoal);
        saveDB(db);
        userGoals = [defaultGoal];
      }
    }
    res.json(userGoals);
  });

  // Add a new custom goal
  app.post('/api/goals', (req, res) => {
    const { user_id, title, target_amount, accumulated_amount, category } = req.body;
    if (!user_id || !title) {
      return res.status(400).json({ error: "user_id and title are required" });
    }
    const db = getDB();
    if (!db.goals) {
      db.goals = [];
    }
    const newGoal = {
      id: "goal_" + Math.random().toString(36).substr(2, 9),
      user_id,
      title,
      target_amount: Number(target_amount) || 100000,
      accumulated_amount: Number(accumulated_amount) || 0,
      category: category || "General",
      status: "Active"
    };
    db.goals.push(newGoal);
    saveDB(db);
    res.json({ success: true, goal: newGoal });
  });

  // Delete goal
  app.delete('/api/goals/:id', (req, res) => {
    const { id } = req.params;
    const db = getDB();
    if (!db.goals) {
      db.goals = [];
    }
    const goalIndex = db.goals.findIndex((g: any) => g.id === id);
    if (goalIndex !== -1) {
      const deleted = db.goals.splice(goalIndex, 1)[0];
      saveDB(db);
      if (firestoreDb) {
        deleteDoc(doc(firestoreDb, 'goals', id)).catch(err => {
          console.error("[Firestore] Goal background delete failed:", err);
        });
      }
      return res.json({ success: true, deleted });
    }
    res.status(404).json({ error: "Goal not found" });
  });

// Helper function to extract cash transactions speak/written naturally by gig workers
function parseTransactionFromMessage(message: string): { amount: number; type: 'expense' | 'income'; title: string; category: string } | null {
  if (!message) return null;
  const text = message.toLowerCase();
  
  // Try to find a credit/income intent vs. debit/expense intent
  const expenseTriggers = [
    'kharch', 'kharcha', 'spent', 'debit', 'diye', 'diyya', 'spend', 'buy', 'bought', 'kharida', 'kharide',
    'kiraya', 'pay', 'paid', 'bhugtan', 'dhaba', 'hotel', 'chai', 'tea', 'petrol', 'diesel', 'medicine', 'dawai',
    'medical', 'food', 'khana', 'gaye', 'loss', 'gaya', 'diya', 'diye'
  ];
  const incomeTriggers = [
    'kamai', 'kamaya', 'earn', 'earned', 'mile', 'mila', 'mil', 'receive', 'received', 'credit', 'credited', 'salary',
    'payout', 'paisa aaya', 'aaya', 'bachaya', 'bachaye', 'save', 'saved', 'income', 'milna', 'mili', 'aaye'
  ];

  // Regexp for numbers, including Devanagari numerals
  // Replace Devanagari numerals to English
  const devanagariMap: Record<string, string> = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
  };
  let cleanedText = text;
  for (const [key, value] of Object.entries(devanagariMap)) {
    cleanedText = cleanedText.replaceAll(key, value);
  }

  // Also support Hindi text spelling of digits
  const wordToNumMap: Record<string, number> = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'paanch': 5, 'panch': 5, 'chhah': 6, 'cheh': 6, 'saat': 7, 'aath': 8, 'neu': 9, 'nau': 9, 'das': 10, 'dass': 10,
    'bees': 20, 'tees': 30, 'chalis': 40, 'pachas': 50, 'saath': 60, 'sattar': 70, 'assi': 80, 'nabbe': 90,
    'sau': 100, 'so': 100, 'hazar': 1000, 'hazari': 1000, 'thousand': 1000, 'lakh': 100000
  };

  // Convert spelled numbers to numeric form
  let amount = 0;
  
  // Standard Regex for digits
  const numMatch = cleanedText.match(/(?:rs|inr|₹|approx)?\.?\s*(\d+)/i);
  if (numMatch) {
    amount = parseInt(numMatch[1], 10);
  } else {
    // Check spelled words
    const words = cleanedText.split(/\s+/);
    let tempVal = 0;
    for (let i = 0; i < words.length; i++) {
      const w = words[i].replace(/[^\w]/g, ""); // keep only alphabets
      if (wordToNumMap[w] !== undefined) {
         const val = wordToNumMap[w];
         if (val === 100 || val === 1000 || val === 100000) {
           if (tempVal === 0) tempVal = val;
           else tempVal *= val;
         } else {
           tempVal += val;
         }
      }
    }
    if (tempVal > 0) {
      amount = tempVal;
    }
  }

  if (amount <= 0) return null;

  // Detect type
  let type: 'expense' | 'income' = 'expense'; // default is expense
  let isExpenseDetected = expenseTriggers.some(w => cleanedText.includes(w));
  let isIncomeDetected = incomeTriggers.some(w => cleanedText.includes(w));

  if (isIncomeDetected && !isExpenseDetected) {
    type = 'income';
  } else if (isExpenseDetected) {
    type = 'expense';
  } else {
    if (cleanedText.includes('diye') || cleanedText.includes('kharch') || cleanedText.includes('gaye') || cleanedText.includes('spent')) {
      type = 'expense';
    } else if (cleanedText.includes('mile') || cleanedText.includes('kamaye') || cleanedText.includes('aaya')) {
      type = 'income';
    }
  }

  // Determine category and descriptive title
  let category = 'General';
  let title = '';

  if (cleanedText.includes('kirana') || cleanedText.includes('rashan') || cleanedText.includes('dukan') || cleanedText.includes('grocery') || cleanedText.includes('samaan')) {
    category = 'Kirana';
    title = type === 'expense' ? 'Kirana Rashan' : 'Dukan ka paisa';
  } else if (cleanedText.includes('petrol') || cleanedText.includes('diesel') || cleanedText.includes('auto') || cleanedText.includes('bus') || cleanedText.includes('travel') || cleanedText.includes('yatra') || cleanedText.includes('safar') || cleanedText.includes('fuel')) {
    category = 'Travel';
    title = type === 'expense' ? 'Fuel / Safar' : 'Travel refund';
  } else if (cleanedText.includes('medicine') || cleanedText.includes('dawai') || cleanedText.includes('medical') || cleanedText.includes('doctor') || cleanedText.includes('ill') || cleanedText.includes('bimar') || cleanedText.includes('hospital')) {
    category = 'Health';
    title = 'Dawai & Ilaj';
  } else if (cleanedText.includes('chai') || cleanedText.includes('nashta') || cleanedText.includes('tea') || cleanedText.includes('khana') || cleanedText.includes('hotel') || cleanedText.includes('dhaba') || cleanedText.includes('lunch') || cleanedText.includes('dinner')) {
    category = 'Kirana';
    title = 'Chai-Nashta / Khana';
  } else if (cleanedText.includes('dost') || cleanedText.includes('friend') || cleanedText.includes('ramesh') || cleanedText.includes('bhai') || cleanedText.includes('yaar')) {
    category = 'General';
    title = type === 'expense' ? 'Dost ko diye' : 'Dost se mile';
  } else if (cleanedText.includes('rent') || cleanedText.includes('kiraya')) {
    category = 'Rent';
    title = 'Makaan Kiraya';
  }

  if (!title) {
    if (type === 'expense') {
      title = 'Voice Kharch';
    } else {
      title = 'Voice Kamai';
    }
  }

  return { amount, type, title, category };
}

  // Chatbot history
  app.get('/api/chat/history/:userId', (req, res) => {
    const db = getDB();
    const userHistory = db.chat_history.filter((c: any) => c.user_id === req.params.userId);
    res.json(userHistory);
  });

  // AI Chat Route utilizing server-side Gemini SDK call
  app.post('/api/chat', async (req, res) => {
    const { userId, message, language } = req.body;
    const db = getDB();
    const user = db.users.find((u: any) => u.id === userId);
    const userName = user ? user.name : "Sathi";
    const userGoal = user ? user.primary_goal : "Bachat";
    const selectedLanguage = language || user?.language || "Hindi";

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Try to auto-parse cash expenditure or income messages
    let transactionNote = "";
    if (user && message) {
      const parsedTx = parseTransactionFromMessage(message);
      if (parsedTx) {
        const { amount, type, title, category } = parsedTx;
        const newExp = {
          id: "exp_" + Math.random().toString(36).substr(2, 9),
          user_id: user.id,
          category: category,
          amount: Number(amount),
          date: "Aaj, " + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          title: title,
          type: type
        };
        db.expenses.unshift(newExp);
        
        if (type === 'expense') {
          user.current_month_kharch = (user.current_month_kharch || 0) + Number(amount);
        } else {
          user.current_month_aay = (user.current_month_aay || 0) + Number(amount);
        }
        user.current_month_bachat = Math.max(0, user.current_month_aay - user.current_month_kharch);
        
        // Adjust financial score
        if (user.current_month_kharch > user.current_month_aay) {
          user.financial_score = Math.max(20, user.financial_score - 3);
        } else {
          user.financial_score = Math.min(99, user.financial_score + 1);
        }
        
        saveDB(db);

        if (selectedLanguage === 'English') {
          transactionNote = `\n\n[Note: Successfully recorded ₹${amount} ${type === 'expense' ? 'expense' : 'income'} for "${title}" inside your Hisab-Kitab ledger. Your balances have been updated!]`;
        } else {
          transactionNote = `\n\n[नोट: आपके दैनिक बहीखाते में ₹${amount} का ${type === 'expense' ? 'खर्च' : 'कमाई'} ("${title}") जोड़ दिया गया है। आपका कुल बैलेंस अपडेट हो गया है!]`;
        }
      }
    }

    // System instruction based on the requirements
    const systemInstruction = `
You are "Paisa Saathi", a very friendly, reassuring, simple, non-judgmental financial guidance friend for financially underserved users in India (specifically delivery agents, gig workers, drivers, construction workers, and househelp).
The tagline is "Aapka Paisa, Aapka Saathi".

YOUR CHAT RULES:
1. Speak in extremely simple ${selectedLanguage}-first. If ${selectedLanguage} is Hindi, use simple Devanagari script. Keep it very conversational, like a wise elder brother or a companion ("saathi"). If you use Hinglish/Latin Hindi, make sure it is extremely friendly.
2. ALWAYS respond in maximum 2-3 short sentences. No big paragraphs.
3. Absolutely AVOID any financial jargon (like "equity", "asset class", "compounding formulas", "portfolio diversification").
4. Never sound like a formal bank or relationship manager.
5. NEVER ask for confidential info like OTP, PIN, check book, or bank password.
6. Education & Guidance only: Do NOT recommended specific mutual funds by name (e.g. do not say "Nippon Small Cap"), do NOT do transactions.
7. If the user expresses intent to save, start SIP (Systematic Investment Plan), or learn to invest:
   - Guide them step-by-step in Hindi/simple words.
   - For SIP:
     * Explain SIP simply: "SIP का मतलब है हर महीने थोड़ा-थोड़ा पैसा बचाकर निवेश करना।"
     * Build comfort: "आप इसे बहुत ही कम पैसों (₹100 या ₹500) से शुरू कर सकते हैं।"
     * Keep the conversational loop going: Ask them: "आप महीने में कितना पैसा बचा सकते हैं? ₹100 या ₹500?" OR "क्या आप बिल्कुल सुरक्षित विकल्प चाहते हैं?"
     * Educational steps: Explain that they need: 1. Bank account, 2. PAN card, 3. Mobile number linked.
8. If you don't know the exact answer or are unsure: "मुझे पूरी जानकारी नहीं है, लेकिन मैं समझाने की कोशिश करता हूँ" followed by simple layperson explanation.
9. Display reassurance: Reassure them with thoughts like "हम आपका पैसा नहीं छूते, सिर्फ मार्गदर्शन करते हैं" where appropriate!
`;

    let aiResponse = "";
    let searchSources: { title: string; url: string }[] = [];

    try {
      if (process.env.GEMINI_API_KEY) {
        const ai = getGeminiClient();
        // Load recent chat history for context to continue conversation naturally
        const previousChats = db.chat_history
          .filter((c: any) => c.user_id === userId)
          .slice(-6); // Last 6 turns for context
        
        const contents = [];
        
        // Append context history
        for (const turn of previousChats) {
          let cleanResponse = turn.ai_response || "";
          if (cleanResponse.includes("⚠️ [नोट:")) {
            const index = cleanResponse.indexOf("]:\n\n");
            if (index !== -1) {
              cleanResponse = cleanResponse.substring(index + 4);
            }
          }
          contents.push({ role: 'user', parts: [{ text: turn.user_message }] });
          contents.push({ role: 'model', parts: [{ text: cleanResponse }] });
        }
        
        // Append current message
        contents.push({ role: 'user', parts: [{ text: message }] });

        let geminiRes;
        try {
          // Attempt 1: call with search grounding
          geminiRes = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
              topP: 0.9,
              tools: [{ googleSearch: {} }]
            }
          });
        } catch (searchError: any) {
          console.warn("Gemini Search Grounding call failed (likely due to missing billing or quota limitations under the free tier). Retrying without Search tool...", searchError.message || searchError);
          // Attempt 2: retry WITHOUT tools (fully compatible with free tier API key)
          geminiRes = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
              topP: 0.9
            }
          });
        }

        aiResponse = geminiRes.text || "Main abhi samajh nahi paya. Ek baar phir se poochein?";
        
        // Extract links from search grounding metadata
        const chunks = geminiRes.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks && Array.isArray(chunks)) {
          for (const chunk of chunks) {
            if (chunk.web && chunk.web.uri) {
              searchSources.push({
                title: chunk.web.title || "Internet Results",
                url: chunk.web.uri
              });
            }
          }
        }
      } else {
        throw new Error("GEMINI_API_KEY is not defined in environment.");
      }
    } catch (e: any) {
      console.error("Gemini API Error under /api/chat:", e);

      const isQuotaExceeded = e.status === 429 || (e.message && (e.message.toLowerCase().includes('429') || e.message.toLowerCase().includes('quota') || e.message.toLowerCase().includes('resource_exhausted')));
      
      let errorHeader = "";
      if (isQuotaExceeded) {
        errorHeader = "⚠️ [नोट: मुख्य AI सर्वर का कोटा लिमिट पूरा हो गया है। कृपया Settings > Secrets में स्वयं की API Key डालें या थोड़ी देर बाद प्रयास करें। तब तक आपकी सुविधा के लिए सुरक्षित और सटीक उत्तर प्रस्तुत है]:\n\n";
      } else {
        errorHeader = "⚠️ [नोट: AI सर्वर से सही जवाब नहीं मिल पाया। स्थानीय बुद्धिमत्ता से आपका मार्गदर्शक उत्तर प्रस्तुत है]:\n\n";
      }

      // High-quality local offline fallback based on common worker keywords
      const lowerMsg = message.toLowerCase();
      let offlineText = "";

      if (lowerMsg.includes('sip') || lowerMsg.includes('नियम') || lowerMsg.includes('निवेश') || lowerMsg.includes('invest')) {
        offlineText = `SIP (सिस्टमैटिक इन्वेस्टमेंट प्लान) का मतलब है हर महीने थोड़ा-थोड़ा पैसा बचाकर म्यूचुअल फंड या सरकारी योजनाओं (जैसे पोस्ट ऑफिस RD) में निवेश करना। आप बहुत कम पैसों (जैसे ₹100 या ₹500) से शुरुआत कर सकते हैं। इसके लिए आपको बैंक खाता, पैन कार्ड और लिंक किया हुआ मोबाइल नंबर ही चाहिए। क्या आप महीने का ₹500 बचा सकते हैं?`;
      } else if (lowerMsg.includes('बचाए') || lowerMsg.includes('save') || lowerMsg.includes('बचत') || lowerMsg.includes('saving')) {
        offlineText = `बचत करने का सर्वोत्तम नियम है कि हर दिन सिर्फ ₹20 या ₹50 की फिजूलखर्ची (जैसे गुटखा, फालतू चाय, बाहर का खाना) को बचाकर किनारे रख लें। यह पैसा महीने के अंत में ₹1000 बन जाएगा। आप इस बचत से सुरक्षित रिकरिंग डिपॉजिट (RD) शुरू कर सकते हैं।`;
      } else if (lowerMsg.includes('cut') || lowerMsg.includes('कटा') || lowerMsg.includes('fees') || lowerMsg.includes('पैसा') || lowerMsg.includes('charges')) {
        offlineText = `पैसा साथी (Paisa Saathi) पूर्णतः निःशुल्क और सुरक्षित मार्गदर्शक है, हम आपका कोई पैसा नहीं काटते। यदि आपके बैंक से पैसे कटे हैं, तो तुरंत बैंक शाखा जाकर अपनी पासबुक अपडेट करवाएं या बैंक की हेल्पलाइन नंबर पर बात करें।`;
      } else if (lowerMsg.includes('fraud') || lowerMsg.includes('सुरक्षित') || lowerMsg.includes('सच्चा') || lowerMsg.includes('fake') || lowerMsg.includes('secure')) {
        offlineText = `सुरक्षित रहने के लिए सबसे बड़ा नियम ध्यान रखें: कभी भी कोई अनजान व्यक्ति अगर आपसे फ़ोन पर OTP, ATM PIN या यूपीआई पासवर्ड मांगे, तो उसे भूलकर भी न बताएं। हम आपका पैसा कभी नहीं छूते, केवल सही वित्तीय मार्गदर्शन देते हैं ताकि आपका भविष्य उज्जवल हो।`;
      } else if (lowerMsg.includes('loan') || lowerMsg.includes('उधार') || lowerMsg.includes('कर्ज') || lowerMsg.includes('udhaar')) {
        offlineText = `जब तक बहुत ज्यादा मजबूरी (जैसे इलाज) न हो, महंगे ब्याज वाले प्राइवेट फाइनेंस ऐप्स से बचकर रहें। हमेशा सरकारी बैंक (जैसे SBI, BOB) या क्रेडिट यूनियन से ही संपर्क करें जहाँ ब्याज दर कम और नियम सुरक्षित होते हैं।`;
      } else if (lowerMsg.includes('gold') || lowerMsg.includes('सोना') || lowerMsg.includes('sona') || lowerMsg.includes('silver')) {
        offlineText = `सोना निवेश का बहुत अच्छा विकल्प है। आजकल आप 'डिजिटल गोल्ड' की मदद से केवल ₹10 या ₹100 में शुद्ध सोना खरीदकर ऐप में सुरक्षित रख सकते हैं। इसमें सोनार के यहाँ मेकिंग चार्ज या चोरी का झंझट नहीं रहता।`;
      } else if (lowerMsg.includes('budget') || lowerMsg.includes('kharch') || lowerMsg.includes('खर्च') || lowerMsg.includes('spent')) {
        offlineText = `खर्चों पर काबू पाने के लिए हमारे 'लक्ष्य व खर्च' (Goals) पेज पर जाएं और 'नया खर्च जोड़ें' बटन दबाकर हर दिन का हिसाब लिखें। इससे आपको स्पष्ट रूप से पता चलेगा कि पैसा अनावश्यक कहाँ खर्च हो रहा है।`;
      } else if (lowerMsg.includes('mural') || lowerMsg.includes('sikhein') || lowerMsg.includes('learn') || lowerMsg.includes('योजना')) {
        offlineText = `आप हमारे 'सीखें और बढ़ें' (Sikhein) पेज पर जाकर विभिन्न योजनाओं, म्यूचुअल फंड और सोने के आसान कॉमिक्स व वीडियोस देख सकते हैं। बस नीचे दिख रहे 'सीखें' बटन पर क्लिक करें।`;
      } else {
        offlineText = `नमस्ते ${userName} जी! मैं आपका 'पैसा साथी' हूँ। मैं आपको रोज़ाना बचत करने, बिना जोखिम छोटे सुरक्षित निवेश (म्यूचुअल फंड/SIP) शुरू करने और वित्तीय सुरक्षा से जुड़े सुझाव दे सकता हूँ। आप बेझिझक मुझसे बचत या खर्च का प्रश्न पूछें!`;
      }

      aiResponse = errorHeader + offlineText;

      searchSources = [
        { title: "Gemini API Quota Help", url: "https://ai.google.dev/gemini-api/docs/rate-limits" },
        { title: "Paisa Saathi Help Center", url: "https://www.safepaisa.gov.in" }
      ];
    }

    if (transactionNote) {
      aiResponse += transactionNote;
    }

    // Save chat segment in the db
    const newChat = {
      id: "chat_" + Math.random().toString(36).substr(2, 9),
      user_id: userId || "user_ramesh",
      user_message: message,
      ai_response: aiResponse,
      search_sources: searchSources,
      timestamp: new Date().toISOString()
    };
    db.chat_history.push(newChat);
    saveDB(db);

    res.json(newChat);
  });

  // High-fidelity fallback multilingual rule-based parser for speech/calling agent navigation
  function fallbackCallAgent(message: string, userLang: string, userName: string, callState?: any) {
    const text = message.toLowerCase();
    
    // Identify likely language
    const isHindi = userLang === "Hindi" || /[\u0900-\u097F]/.test(text) || text.includes("kharch") || text.includes("bachat") || text.includes("karo") || text.includes("batana");
    const isMarathi = userLang === "Marathi" || text.includes("पाहिजे") || text.includes("दाखवा") || text.includes("नाव") || text.includes("नका");
    const isBengali = userLang === "Bengali" || text.includes("করো") || text.includes("টাকা") || text.includes("খরচ") || text.includes("কেমন");
    const isEnglish = userLang === "English" || (!isHindi && !isMarathi && !isBengali && (text.includes("show") || text.includes("add") || text.includes("open") || text.includes("page") || text.includes("setting")));

    // Stateful Call Helper conversational flow implementation if session state is active
    if (callState) {
      const isYes = text.includes("ha") || text.includes("haan") || text.includes("sahi") || text.includes("yes") || text.includes("confirm") || text.includes("theek") || text.includes("thik") || text.includes("ok") || text.includes("हाँ") || text.includes("हाँजी");
      const isNo = text.includes("no") || text.includes("nahi") || text.includes("nahin") || text.includes("galat") || text.includes("cancel") || text.includes("नहीं");

      if (callState.mode === "expense") {
        if (callState.stage === "awaiting_details") {
          const amtMatch = text.match(/\d+/);
          if (amtMatch) {
            const amt = Number(amtMatch[0]);
            let cat = "Khana / Food";
            if (text.includes("kirana") || text.includes("rashan") || text.includes("grocery") || text.includes("dokan")) cat = "Kirana";
            else if (text.includes("travel") || text.includes("auto") || text.includes("gaadi") || text.includes("petrol") || text.includes("fuel") || text.includes("bus")) cat = "Travel";
            else if (text.includes("rent") || text.includes("road") || text.includes("room") || text.includes("kiraya") || text.includes("kothri")) cat = "Kiraya";
            else if (text.includes("dawai") || text.includes("medicine") || text.includes("ill") || text.includes("hospital") || text.includes("doctor")) cat = "Dawai";
            else if (text.includes("mobile") || text.includes("recharge") || text.includes("phone") || text.includes("manoranjan")) cat = "Manoranjan";
            else {
              const words = text.split(/\s+/).filter(w => !/\d+/.test(w) && w.length > 3);
              if (words.length > 0) cat = words[0];
            }
            callState.stage = "awaiting_confirmation";
            callState.amount = amt;
            callState.category = cat;

            return {
              detected_language: "Hindi",
              response_text: `Ok, ₹${amt} ${cat === 'Kirana' ? 'kirane' : cat === 'Travel' ? 'travel' : cat === 'Kiraya' ? 'kiraye' : cat === 'Dawai' ? 'dawai' : cat === 'Manoranjan' ? 'mobile' : 'khane'} mein jod raha hun. Sahi hai?`,
              action: "lakshya",
              action_element: "none",
              explanation: "Captured stateful expense amount and category",
              updated_call_state: callState
            };
          } else {
            return {
              detected_language: "Hindi",
              response_text: "Kitna kharach hua aur kahan? (Amount aur category batao)",
              action: "none",
              action_element: "none",
              explanation: "No expense amount found, asking details again",
              updated_call_state: callState
            };
          }
        } else if (callState.stage === "awaiting_confirmation") {
          if (isYes) {
            const amt = callState.amount;
            const cat = callState.category;
            return {
              detected_language: "Hindi",
              response_text: `Ok, ₹${amt} ${cat === 'Kirana' ? 'kirane' : cat === 'Travel' ? 'travel' : cat === 'Kiraya' ? 'kiraye' : cat === 'Dawai' ? 'dawai' : cat === 'Manoranjan' ? 'mobile' : 'khane'} mein jod diya hai.\n\n{\n  "action": "ADD_EXPENSE",\n  "amount": ${amt},\n  "category": "${cat}",\n  "note": "Via Call Helper",\n  "timestamp": "${new Date().toISOString()}",\n  "balanceChange": ${-amt}\n}`,
              action: "lakshya",
              action_element: "none",
              explanation: "Confirmed stateful expense logging, output JSON block",
              updated_call_state: { mode: "idle", stage: "none", amount: null, category: null }
            };
          } else if (isNo) {
            return {
              detected_language: "Hindi",
              response_text: "Theek hai bhai, cancel kar diya hai. Kuch aur kharach ya bachat jorna hai?",
              action: "none",
              action_element: "none",
              explanation: "User cancelled confirmations",
              updated_call_state: { mode: "idle", stage: "none", amount: null, category: null }
            };
          } else {
            return {
              detected_language: "Hindi",
              response_text: `Ok, ₹${callState.amount} ${callState.category === 'Kirana' ? 'kirane' : callState.category === 'Travel' ? 'travel' : callState.category === 'Kiraya' ? 'kiraye' : callState.category === 'Dawai' ? 'dawai' : callState.category === 'Manoranjan' ? 'mobile' : 'khane'} mein jod raha hun. Sahi hai? (Boliye 'Haan' to confirm karne ke liye)`,
              action: "none",
              action_element: "none",
              explanation: "Waiting for confirmation approval",
              updated_call_state: callState
            };
          }
        }
      } else if (callState.mode === "deposit") {
        if (callState.stage === "awaiting_details") {
          const amtMatch = text.match(/\d+/);
          if (amtMatch) {
            const amt = Number(amtMatch[0]);
            let src = "Salary";
            if (text.includes("mzduri") || text.includes("kamai") || text.includes("daily") || text.includes("bhatta")) src = "Mzduri";
            else if (text.includes("bonus") || text.includes("gift")) src = "Bonus";
            else {
              const words = text.split(/\s+/).filter(w => !/\d+/.test(w) && w.length > 3 && !w.includes("paisa"));
              if (words.length > 0) src = words[0];
            }
            callState.stage = "awaiting_confirmation";
            callState.amount = amt;
            callState.category = src;

            return {
              detected_language: "Hindi",
              response_text: `Ok, ₹${amt} ${src} se add kar raha hun. Sahi hai?`,
              action: "lakshya",
              action_element: "none",
              explanation: "Captured stateful deposit details",
              updated_call_state: callState
            };
          } else {
            return {
              detected_language: "Hindi",
              response_text: "Kitna amount aaya aur kahan se? (source batao)",
              action: "none",
              action_element: "none",
              explanation: "No deposit amount found, asking details again",
              updated_call_state: callState
            };
          }
        } else if (callState.stage === "awaiting_confirmation") {
          if (isYes) {
            const amt = callState.amount;
            const src = callState.category;
            return {
              detected_language: "Hindi",
              response_text: `Ok, ₹${amt} ${src} se add kar diya hai.\n\n{\n  "action": "ADD_DEPOSIT",\n  "amount": ${amt},\n  "category": "${src}",\n  "note": "Via Call Helper",\n  "timestamp": "${new Date().toISOString()}",\n  "balanceChange": ${amt}\n}`,
              action: "lakshya",
              action_element: "none",
              explanation: "Confirmed stateful deposit, output JSON block",
              updated_call_state: { mode: "idle", stage: "none", amount: null, category: null }
            };
          } else if (isNo) {
            return {
              detected_language: "Hindi",
              response_text: "Theek hai bhai, cancel kar diya hai. Kuch aur kharach ya bachat jorna hai?",
              action: "none",
              action_element: "none",
              explanation: "User cancelled confirmation",
              updated_call_state: { mode: "idle", stage: "none", amount: null, category: null }
            };
          } else {
            return {
              detected_language: "Hindi",
              response_text: `Ok, ₹${callState.amount} ${callState.category} se add kar raha hun. Sahi hai? (Boliye 'Haan' to confirm karne ke liye)`,
              action: "none",
              action_element: "none",
              explanation: "Waiting for confirmation approval",
              updated_call_state: callState
            };
          }
        }
      }
    }

    // Checking for initial expense / deposit intent
    const isExpenseTrigger = text.includes("kharch jodo") || text.includes("expense add") || text.includes("spent") || text.includes("khaarch dalo") || text.includes("kharach jodo") || text.includes("expense jo") || text.includes("kharch") || text.includes("spent") || text.includes("kharcha");
    const isDepositTrigger = text.includes("paisa aaya") || text.includes("deposit karo") || text.includes("income jodo") || text.includes("salary mili") || text.includes("paisa mil") || text.includes("income jodo") || text.includes("add income") || text.includes("deposit");

    if (isExpenseTrigger) {
      // Slot-filling check instantly
      const amtMatch = text.match(/\d+/);
      let cat = "Khana / Food";
      if (text.includes("kirana") || text.includes("rashan") || text.includes("grocery") || text.includes("dokan")) cat = "Kirana";
      else if (text.includes("travel") || text.includes("auto") || text.includes("gaadi") || text.includes("petrol") || text.includes("fuel") || text.includes("bus")) cat = "Travel";
      else if (text.includes("rent") || text.includes("road") || text.includes("room") || text.includes("kiraya") || text.includes("kothri")) cat = "Kiraya";
      else if (text.includes("dawai") || text.includes("medicine") || text.includes("ill") || text.includes("doctor")) cat = "Dawai";
      else if (text.includes("mobile") || text.includes("recharge") || text.includes("phone")) cat = "Manoranjan";

      if (amtMatch) {
        const amt = Number(amtMatch[0]);
        return {
          detected_language: "Hindi",
          response_text: `Ok, ₹${amt} ${cat === 'Kirana' ? 'kirane' : cat === 'Travel' ? 'travel' : cat === 'Kiraya' ? 'kiraye' : cat === 'Dawai' ? 'dawai' : cat === 'Manoranjan' ? 'mobile' : 'khane'} mein jod raha hun. Sahi hai?`,
          action: "lakshya",
          action_element: "none",
          explanation: "Slot-filled expense directly",
          updated_call_state: { mode: "expense", stage: "awaiting_confirmation", amount: amt, category: cat }
        };
      } else {
        return {
          detected_language: "Hindi",
          response_text: "Kitna kharach hua aur kahan? (Amount aur category batao)",
          action: "none",
          action_element: "none",
          explanation: "Prompting user for expense details",
          updated_call_state: { mode: "expense", stage: "awaiting_details", amount: null, category: null }
        };
      }
    }

    if (isDepositTrigger) {
      const amtMatch = text.match(/\d+/);
      let src = "Salary";
      if (text.includes("mzduri") || text.includes("kamai") || text.includes("daily") || text.includes("bhatta")) src = "Mzduri";
      else if (text.includes("bonus") || text.includes("gift")) src = "Bonus";

      if (amtMatch) {
        const amt = Number(amtMatch[0]);
        return {
          detected_language: "Hindi",
          response_text: `Ok, ₹${amt} ${src} se add kar raha hun. Sahi hai?`,
          action: "lakshya",
          action_element: "none",
          explanation: "Slot-filled deposit details directly",
          updated_call_state: { mode: "deposit", stage: "awaiting_confirmation", amount: amt, category: src }
        };
      } else {
        return {
          detected_language: "Hindi",
          response_text: "Kitna amount aaya aur kahan se? (source batao)",
          action: "none",
          action_element: "none",
          explanation: "Prompting user for deposit details",
          updated_call_state: { mode: "deposit", stage: "awaiting_details", amount: null, category: null }
        };
      }
    }

    // 1. Expense and Saving Goals Keywords
    if (
      text.includes('kharch') || text.includes('expense') || text.includes('खर्च') || text.includes('खर्चा') || 
      text.includes('बचत') || text.includes('goal') || text.includes('गुल्लक') || text.includes('lakshya') ||
      text.includes('बचती') || text.includes('जमा') || text.includes('taka') || text.includes('খরচ') ||
      text.includes('money') || text.includes('save') || text.includes('saving')
    ) {
      const isExpenseForm = text.includes('jod') || text.includes('add') || text.includes('नया') || text.includes('योग') || text.includes('form') || text.includes('modal');
      if (isMarathi) {
        return {
          detected_language: "Marathi",
          response_text: isExpenseForm 
            ? "होय! मी आपल्यासाठी 'लक्ष्य आणि खर्च' स्क्रीन उघडली आहे. आपण नवीन खर्च लिहू शकता."
            : "नक्कीच! तुमच्या सर्व बचतींचे ध्येय आणि खर्च या पानावर दाखवले आहेत.",
          action: "lakshya",
          action_element: isExpenseForm ? "open_expense_modal" : "none",
          explanation: "Marathi fallback matching expense keywords"
        };
      } else if (isBengali) {
        return {
          detected_language: "Bengali",
          response_text: isExpenseForm 
            ? "হ্যাঁ! আমি আপনার জন্য 'লক্ষ্য ও খরচ' স্ক্রীন খুলে দিয়েছি। আপনি নতুন খরচ যুক্ত করতে পারেন।"
            : "অবশ্যই! আপনার সমস্ত সঞ্চয় লক্ষ্য এবং খরচ এই পৃষ্ঠায় দেখানো হয়েছে।",
          action: "lakshya",
          action_element: isExpenseForm ? "open_expense_modal" : "none",
          explanation: "Bengali fallback matching expense keywords"
        };
      } else if (isEnglish) {
        return {
          detected_language: "English",
          response_text: isExpenseForm 
            ? "Sure! I have opened the 'Goals & Expenses' page for you to log a new expense."
            : "Sure, here are all your saving goals and expense trackers on this page.",
          action: "lakshya",
          action_element: isExpenseForm ? "open_expense_modal" : "none",
          explanation: "English fallback matching expense keywords"
        };
      } else {
        return {
          detected_language: "Hindi",
          response_text: isExpenseForm 
            ? "जी! मैंने 'लक्ष्य व खर्च' का पन्ना खोल दिया है। आप अब नया खर्च जोड़ सकते हैं।"
            : "बिल्कुल! आपके सारे बचत लक्ष्य और दैनिक खर्च का ब्यौरा इस पन्ने पर हाजिर है।",
          action: "lakshya",
          action_element: isExpenseForm ? "open_expense_modal" : "none",
          explanation: "Hindi fallback matching expense keywords"
        };
      }
    }

    // 2. Learning and Scheme Keywords
    if (
      text.includes('sikhein') || text.includes('learn') || text.includes('सीखें') || text.includes('sip') || 
      text.includes('invest') || text.includes('म्यूचुअल') || text.includes('shikha') || text.includes('शिका') ||
      text.includes('skim') || text.includes('যোজনা') || text.includes('বিনিয়োগ') || text.includes('yojana') ||
      text.includes('scheme') || text.includes('study')
    ) {
      if (isMarathi) {
        return {
          detected_language: "Marathi",
          response_text: "मी आपल्यासाठी 'गुंतवणूक आणि सरकारी योजना' हे पान उघडले आहे. जिथे आपण खूप काही शिकू शकता!",
          action: "sikhein",
          action_element: "none",
          explanation: "Marathi fallback matching learn keyword"
        };
      } else if (isBengali) {
        return {
          detected_language: "Bengali",
          response_text: "আমি আপনার জন্য 'বিনিয়োগ ও सरकारी प्रकल्प' পৃষ্ঠাটি खुले आहे. इथून खूप काही शिकू शकता!",
          action: "sikhein",
          action_element: "none",
          explanation: "Bengali fallback matching learn keyword"
        };
      } else if (isEnglish) {
        return {
          detected_language: "English",
          response_text: "I have loaded the 'Learn & Schemes' tab for you to study smart savings and government schemes.",
          action: "sikhein",
          action_element: "none",
          explanation: "English fallback matching learn keyword"
        };
      } else {
        return {
          detected_language: "Hindi",
          response_text: "जी! मैंने आपके सीखने के लिए 'सुरक्षित निवेश व सरकारी योजना' का पन्ना खोल दिया है। यहाँ से जानें!",
          action: "sikhein",
          action_element: "none",
          explanation: "Hindi fallback matching learn keyword"
        };
      }
    }

    // 3. Conversation / Chat Assistant Keywords
    if (
      text.includes('chat') || text.includes('pooch') || text.includes('संदेह') || text.includes('प्रश्न') || 
      text.includes('सवाला') || text.includes('विचारा') || text.includes('बोल') || text.includes('जीज्ञेसा') ||
      text.includes('talk') || text.includes('question') || text.includes('ask') || text.includes('sathi')
    ) {
      if (isMarathi) {
        return {
          detected_language: "Marathi",
          response_text: "होय, मी चॅट सेवा उघडली आहे. आपण कोणताही प्रश्न थेट विचारू शकता.",
          action: "chat",
          action_element: "none",
          explanation: "Marathi fallback matching chat keyword"
        };
      } else if (isBengali) {
        return {
          detected_language: "Bengali",
          response_text: "হ্যাঁ, আমি চ্যাট উইন্ডো খুলে দিয়েছি। আপনি যে কোনো প্রশ্ন সরাসরি জিজ্ঞাসা করতে পারেন।",
          action: "chat",
          action_element: "none",
          explanation: "Bengali fallback matching chat keyword"
        };
      } else if (isEnglish) {
        return {
          detected_language: "English",
          response_text: "Sure, I have navigated to our chat assistant. You can ask any financial questions here.",
          action: "chat",
          action_element: "none",
          explanation: "English fallback matching chat keyword"
        };
      } else {
        return {
          detected_language: "Hindi",
          response_text: "जी हाँ, मैंने आपके लिए बातचीत कक्ष खोल दिया है। आप यहाँ मुझसे सवाल बोलकर या लिखकर पूछ सकते हैं।",
          action: "chat",
          action_element: "none",
          explanation: "Hindi fallback matching chat keyword"
        };
      }
    }

    // 4. Profile and Language settings Keywords
    if (
      text.includes('profile') || text.includes('भाषा') || text.includes('bhasha') || text.includes('नंबर') || 
      text.includes('नाम') || text.includes('नाव') || text.includes('settings') || text.includes('সেটিংস') ||
      text.includes('language') || text.includes('setting') || text.includes('username')
    ) {
      if (isMarathi) {
        return {
          detected_language: "Marathi",
          response_text: "मी आपली प्रोफाईल सेटिंग्स उघडली आहे. येथे आपण भाषा किंवा नाव सहज बदलू शकता.",
          action: "profile",
          action_element: "none",
          explanation: "Marathi fallback matching profile terms"
        };
      } else if (isBengali) {
        return {
          detected_language: "Bengali",
          response_text: "আমি আপনার প্রোফাইল সেটিংস খুলেছি। আপনি এখান থেকে আপনার নাম বা ভাষা পরিবর্তন করতে পারেন।",
          action: "profile",
          action_element: "none",
          explanation: "Bengali fallback matching profile terms"
        };
      } else if (isEnglish) {
        return {
          detected_language: "English",
          response_text: "Alright, I've opened your profile section. You can modify your name, language, or log-out here.",
          action: "profile",
          action_element: "none",
          explanation: "English fallback matching profile terms"
        };
      } else {
        return {
          detected_language: "Hindi",
          response_text: "अवश्य, मैंने आपकी प्रोफाइल सेटिंग्स खोल दी है। यहाँ से आप भाषा या नाम बदल सकते हैं।",
          action: "profile",
          action_element: "none",
          explanation: "Hindi fallback matching profile terms"
        };
      }
    }

    // 5. Home and Main Dashboard Keywords
    if (
      text.includes('home') || text.includes('मुख्य') || text.includes('शुरू') || text.includes('score') || 
      text.includes('dashboard') || text.includes('घर') || text.includes('पहला') || text.includes('main')
    ) {
      if (isMarathi) {
        return {
          detected_language: "Marathi",
          response_text: "मी आपल्याला मुख्य स्क्रीनवर घेऊन आलो आहे.",
          action: "home",
          action_element: "none",
          explanation: "Marathi fallback home redirection"
        };
      } else if (isBengali) {
        return {
          detected_language: "Bengali",
          response_text: "আমি আপনাকে মূল পৃষ্ঠায় (হোম স্ক্রীন) নিয়ে এসেছি।",
          action: "home",
          action_element: "none",
          explanation: "Bengali fallback home redirection"
        };
      } else if (isEnglish) {
        return {
          detected_language: "English",
          response_text: "I have taken you back to the home screen dashboard.",
          action: "home",
          action_element: "none",
          explanation: "English fallback home redirection"
        };
      } else {
        return {
          detected_language: "Hindi",
          response_text: "जी, मैं आपको अपने मुख्य पन्ने यानी होम स्क्रीन पर ले आया हूँ।",
          action: "home",
          action_element: "none",
          explanation: "Hindi fallback home redirection"
        };
      }
    }

    // Default conversational responses
    if (isMarathi) {
      return {
        detected_language: "Marathi",
        response_text: `नमस्कार ${userName} जी! मी तुमचा निरोप ऐकला: "${message}"। मी आपल्याला खर्च, लक्ष्य किंवा गुंतवणूक पानावर घेऊन जाऊ शकतो. आपण काय करू इच्छिता?`,
        action: "none",
        action_element: "none",
        explanation: "Marathi fallback general dialog"
      };
    } else if (isBengali) {
      return {
        detected_language: "Bengali",
        response_text: `নমস্কার ${userName} বাবু! আমি আপনার কথাটি বুঝতে পেরেছি: "${message}"। আমি আপনাকে খরচ, লক্ষ্য অথবা বিনিয়োগের পাতায় নিয়ে যেতে পারি। আপনি কোথায় যেতে চান?`,
        action: "none",
        action_element: "none",
        explanation: "Bengali fallback general dialog"
      };
    } else if (isEnglish) {
      return {
        detected_language: "English",
        response_text: `Hello ${userName}! I heard: "${message}". I can help navigate to Expenses, Goals, or Learning. Where should we go?`,
        action: "none",
        action_element: "none",
        explanation: "English fallback general dialog"
      };
    } else {
      return {
        detected_language: "Hindi",
        response_text: `नमस्ते ${userName} जी! मैंने आपका संदेश सुना: "${message}"। मैं आपको खर्च, लक्ष्य या सरकारी योजना पन्ने पर ले जा सकता हूँ। कहाँ चलें?`,
        action: "none",
        action_element: "none",
        explanation: "Hindi conversational prompt fallback"
      };
    }
  }

  // AI Calling Voice Agent Endpoint
  app.post('/api/call-agent', async (req, res) => {
    const { message, userId, activeTab } = req.body;
    const db = getDB();
    const user = db.users.find((u: any) => u.id === (userId || "user_ramesh"));
    const userName = user ? user.name : "Sathi";
    const userLang = user ? user.language : "Hindi";

    if (!message) {
      return res.status(400).json({ error: "Voice transcript message is required" });
    }

    const systemInstruction = `
You are the AI Voice Calling Agent (ध्वनि सहायक साथी) for "Paisa Saathi", a friendly helper who speaks to the user.
The user is talking/calling you because they are lost, need help navigating, or want to open something in the application.

Your core role and voice behavior:
You are a friendly voice navigation assistant inside a chatbot. When a user asks how to reach a specific feature, section, or step, you must:
1. Break the path into clear, numbered steps and in the user's selected/detected language (Hindi, English, Marathi, Bengali, etc.).
2. Use short, spoken-friendly language — as if talking aloud, not writing.
3. Each step covers exactly ONE action (tap, scroll, swipe, select).
4. Name the button or label exactly as it appears on screen before asking the user to act on it.
5. End every response by asking if the user successfully reached the step.

Navigate path Rules to respect dynamically:
- Always start from the chatbot home / landing screen.
- Mention if the user needs to be logged in before starting (Note: User is already logged in on the active screen).
- If the feature is inside a menu, describe how to open the menu first.
- If multiple paths exist, give the easiest one and briefly mention alternatives.
- If a feature needs a specific plan or permission, state this at the start — not at the end.

Your primary jobs are:
1. DETECT THE LANGUAGE/TONE of the user's spoken transcript.
   * If they spoke Devanagari Hindi or Hinglish, speak back in Hindi (Devanagari) with a highly reassuring, elder-brother friendly tone (e.g. speaking directly as if over a phone call).
   * If they spoke in Marathi, speak back in Marathi (Marathi script).
   * If they spoke in Bengali, Bengali.
   * If they spoke in English, English.
   * Always MATCH the user's input language exactly!
2. CHOOSE THE BEST NAVIGATION TARGET:
   Determine if the user's verbal command relates to going to a screen or opening an action. Match it to one of these valid action string tokens:
   - "home" (if they say "home", "scores", "main stats", "shuru", "dashboard")
   - "lakshya" (if they say "kharch", "bhavishya", "expense", "saving goal", "gullak", "budget", "paisa jodna", "add expense", "lakshya", "limits")
   - "chat" (if they say "chat", "poochna", "question", "sawaal", "fraud protect", "help team", "companion")
   - "sikhein" (if they say "sikhein", "learn", "yojana", "mural", "sip", "investment", "gold", "mutual fund")
   - "profile" (if they say "profile", "details", "bhasha", "language", "name change", "setting", "sign out")
   - "none" (if it is just general conversational talking or a basic financial Q&A where we don't need to change screens)

3. RESPOND IN VALID JSON ONLY! Do not wrap in markdown code blocks. The JSON schema must strictly contain:
   {
     "detected_language": "Hindi" | "English" | "Marathi" | "Bengali" | "Tamil" | "Telugu",
     "response_text": "One or multiple clear numbered, spoken-friendly steps ending with an inquiry about whether they reached it successfully.",
     "action": "home" | "lakshya" | "chat" | "sikhein" | "profile" | "none",
     "action_element": "open_expense_modal" | "open_goal_modal" | "open_language" | "none",
     "explanation": "Why you chose this tab or answer"
   }

Keep conversational responses simple and easy for semiliterate users.
Example input: "kharch wala panna kaise kholu"
Example output: { "detected_language": "Hindi", "response_text": "1. सबसे नीचे देखें, वहाँ 'लक्ष्य व खर्च' (Goals) नाम का बटन है।\\n2. उस बटन पर क्लिक करें।\\nक्या आप सफलतापूर्वक खर्च वाले पन्ने पर पहुँच पाए?", "action": "lakshya", "action_element": "none", "explanation": "User wanted navigation query" }
`;

    let callResponse;

    try {
      if (user && !user.call_state) {
        user.call_state = { mode: "idle", stage: "none", amount: null, category: null };
      }

      const isStatefulActive = user && user.call_state && user.call_state.mode && user.call_state.mode !== "idle";
      const lowercaseMessage = message.toLowerCase();
      const isStatefulNewTrigger = lowercaseMessage.includes("kharch") || lowercaseMessage.includes("expense") || lowercaseMessage.includes("spent") || lowercaseMessage.includes("paisa") || lowercaseMessage.includes("deposit") || lowercaseMessage.includes("income") || lowercaseMessage.includes("salary") || lowercaseMessage.includes("kharcha") || lowercaseMessage.includes("jodo");

      if (isStatefulActive || isStatefulNewTrigger) {
        callResponse = fallbackCallAgent(message, userLang, userName, user ? user.call_state : null);
      } else if (process.env.GEMINI_API_KEY) {
        try {
          const ai = getGeminiClient();
          const geminiRes = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Evaluate this user utterance spoken on the calling interface: "${message}". Current Active Tab is "${activeTab || 'home'}".`,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.3, // Low temperature for consistent JSON
              responseMimeType: "application/json"
            }
          });

          const rawText = (geminiRes.text || "").trim();
          try {
            // Parse directly
            callResponse = JSON.parse(rawText);
          } catch (jsonErr) {
            console.error("Gemini call-agent failed to output pure JSON. Output was:", rawText);
            // Regex-based extractor if markdown blocks were incorrectly added by some models
            const cleanJSONString = rawText.replace(/```json/i, '').replace(/```/g, '').trim();
            callResponse = JSON.parse(cleanJSONString);
          }
        } catch (apiError: any) {
          console.warn("Gemini API error (Quota limit or other). Executing high-fidelity local parser:", apiError.message || apiError);
          // Auto fall through to the multilingual dictionary fallback
          callResponse = fallbackCallAgent(message, userLang, userName, user ? user.call_state : null);
        }
      } else {
        // Direct local high-fidelity fallback when API Key is missing
        callResponse = fallbackCallAgent(message, userLang, userName, user ? user.call_state : null);
      }
    } catch (e: any) {
      console.error("Calling Agent Route error:", e);
      // Fail proof fallback
      callResponse = fallbackCallAgent(message, userLang, userName, user ? user.call_state : null);
    }

    if (user && callResponse && callResponse.updated_call_state) {
      user.call_state = callResponse.updated_call_state;
      saveDB(db);
    }

    res.json(callResponse);
  });

  // Hot swap Vite during developer edits or serve static production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const port = 3000; // MUST run on 3000, per rules

  // Connect and pull live data from Cloud Firestore on application startup
  if (firestoreDb) {
    try {
      await syncFromFirestore();
    } catch (e) {
      console.error("[Firestore] Initial database pull failed:", e);
    }
  }

  // Initialize and Boot the Server-Side Clean Scheduler Daemon (SOLID, Strategy, Factory)
  try {
    const scheduler = SchedulerService.getInstance();
    // Decouple storage lookup by passing a callback that queries live users from memory db
    scheduler.start(() => {
      const liveDb = getDB();
      return liveDb.users || [];
    }, 45000); // Cycles every 45s for sandbox/interactive validation
    console.log("[SchedulerService] Service daemon successfully running in server context.");
  } catch (schedErr) {
    console.error("[SchedulerService] Failed to launch background cron daemon:", schedErr);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Paisa Saathi Server is running on port ${port}`);
  });
}

startServer().catch((e) => {
  console.error("Failed to start server:", e);
});
