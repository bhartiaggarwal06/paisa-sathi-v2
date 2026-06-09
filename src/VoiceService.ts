// Standalone, modular Voice Engine for Paisa Saathi
// Abstracts Text-to-Speech (TTS) and Speech-to-Text (STT)
// Highly extensible to swap with different web or cloud vendors (e.g., Azure Voice, Google TTS API, etc.)

export interface VoiceEngineConfig {
  defaultLanguage: string;
}

export class VoiceService {
  private config: VoiceEngineConfig;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isTtsEnabled: boolean = true;
  private activeRecognizer: any = null;

  constructor(config: VoiceEngineConfig = { defaultLanguage: 'Hindi' }) {
    this.config = config;
  }

  // Get language code helper for web APIs
  public getLangCode(langName: string): string {
    switch (langName) {
      case 'Hindi': return 'hi-IN';
      case 'Marathi': return 'mr-IN';
      case 'Bengali': return 'bn-IN';
      case 'Tamil': return 'ta-IN';
      case 'Telugu': return 'te-IN';
      case 'English': return 'en-IN';
      default: return 'hi-IN';
    }
  }

  // Enable/Disable Voice Audio Out
  public setTtsEnabled(enabled: boolean) {
    this.isTtsEnabled = enabled;
    if (!enabled) {
      this.cancelSpeaking();
    }
  }

  public getTtsEnabled(): boolean {
    return this.isTtsEnabled;
  }

  // Speak text using Web Speech API (Text-to-Speech)
  public speak(
    text: string, 
    lang: string, 
    onStart?: () => void, 
    onEnd?: () => void, 
    onError?: (error: any) => void
  ): void {
    if (!this.isTtsEnabled) return;

    // Check compatibility
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn("Speech Synthesis is not supported in this browser.");
      if (onError) onError("Not supported");
      return;
    }

    // Force release any paused synthesis channel of the browser
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (err) {}

    // Cancel any ongoing speech
    this.cancelSpeaking();

    // Clean text of emojis & markdown symbols for cleaner pronunciation
    const cleanText = text
      .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '') // strip emojis
      .replace(/[*#_\\`~\[\]]/g, '') // strip markdown
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    // Use a slight timeout (50ms) to bypass browser's asynchronous cancel lock
    setTimeout(() => {
      try {
        const langCode = this.getLangCode(lang);
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = langCode;

        // Dynamic speech parameters optimized for clarity
        utterance.rate = 0.95; // Slightly slower for clear understanding by underserved cohorts
        utterance.pitch = 1.0;

        // Prevent garbage collection of the utterance while speaking (famous iOS/Safari/Chrome bug)
        if (typeof window !== 'undefined') {
          const customWin = window as any;
          if (!customWin._activeUtterances) {
            customWin._activeUtterances = [];
          }
          customWin._activeUtterances.push(utterance);
        }

        // Event handlers
        utterance.onstart = () => {
          if (onStart) onStart();
        };

        utterance.onend = () => {
          this.currentUtterance = null;
          // Clear active utterance reference from global to allow safe GC
          if (typeof window !== 'undefined') {
            const customWin = window as any;
            if (customWin._activeUtterances) {
              customWin._activeUtterances = customWin._activeUtterances.filter((u: any) => u !== utterance);
            }
          }
          if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
          this.currentUtterance = null;
          if (typeof window !== 'undefined') {
            const customWin = window as any;
            if (customWin._activeUtterances) {
              customWin._activeUtterances = customWin._activeUtterances.filter((u: any) => u !== utterance);
            }
          }
          if (e.error !== 'interrupted' && onError) {
            onError(e);
          }
        };

        // Select high quality local voice if available
        const voices = window.speechSynthesis.getVoices();
        const matchedVoice = voices.find(v => v.lang.startsWith(langCode.substring(0, 2)));
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }

        this.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error("Speech Synthesis failed:", e);
        if (onError) onError(e);
      }
    }, 50);
  }

  // Cancel any active speech synthesis
  public cancelSpeaking(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        // In Safari, if cancel() is called while speaking is paused, it hangs the verbal queue.
        // Calling resume() right after cancel() unblocks the voice engine.
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (err) {}
    }
    this.currentUtterance = null;
  }

  // Check if speech synthesis is currently active
  public isSpeaking(): boolean {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      return window.speechSynthesis.speaking;
    }
    return false;
  }

  // Safely stop any running speech recognition
  public stopListening(): void {
    if (this.activeRecognizer) {
      try {
        this.activeRecognizer.stop();
      } catch (e) {
        // Already stopped
      }
      this.activeRecognizer = null;
    }
  }

  // Start Voice Listening (Speech-to-Text)
  public listen(
    lang: string,
    onStart: () => void,
    onResult: (transcript: string) => void,
    onEnd: () => void,
    onError: (error: string) => void
  ): { stop: () => void } {
    this.stopListening();

    const customWindow = window as any;
    const SpeechRecognitionClass = customWindow.SpeechRecognition || customWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      onError("browser_unsupported");
      return { stop: () => {} };
    }

    // Safety checks for secure origin - output warning instead of blocking execution
    if (typeof window !== 'undefined' && window.location) {
      const isSecure = window.location.protocol === 'https:' || 
                       window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       (window as any).isSecureContext;
      if (!isSecure) {
        console.warn("Paisa Saathi Voice Engine: Secure context safety check failed. Proceeding with caution in developer mode.");
      }
    }

    try {
      const recognizer = new SpeechRecognitionClass();
      recognizer.continuous = false;
      recognizer.interimResults = false;
      recognizer.lang = this.getLangCode(lang);

      recognizer.onstart = () => {
        onStart();
      };

      recognizer.onerror = (event: any) => {
        console.error("Speech recognition error event:", event);
        if (event.error === 'aborted') {
          // Programmatic stop/abort represents normal transition, not user error
          return;
        }
        
        if (event.error === 'not-allowed') {
          onError("not-allowed");
        } else if (event.error === 'network') {
          onError("network-error");
        } else {
          onError(event.error || "Error in Speech Capture");
        }
      };

      recognizer.onend = () => {
        if (this.activeRecognizer === recognizer) {
          this.activeRecognizer = null;
        }
        onEnd();
      };

      recognizer.onresult = (event: any) => {
        if (event.results && event.results.length > 0) {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            onResult(transcript);
          }
        }
      };

      this.activeRecognizer = recognizer;
      recognizer.start();

      return {
        stop: () => {
          this.stopListening();
        }
      };
    } catch (e: any) {
      console.error("Speech recognition initialization failed:", e);
      onError(e.message || "Failed initialization");
      return { stop: () => {} };
    }
  }

  // Voice NLP Parser - parses quantities, amounts, categories and savings goals
  // from speech transcripts in Hindi/English/Hinglish
  public parseVoiceInput(transcript: string): {
    amount?: number;
    category?: string;
    title?: string;
    isExpense?: boolean;
    isSavings?: boolean;
    goalTitle?: string;
    goalTarget?: number;
  } {
    const text = transcript.toLowerCase();
    const result: any = {};

    // 1. Try to extract numbers (e.g. "pachas", "sau", "50", "500", "panch sau")
    const words = text.split(/\s+/);
    let extractedNumber: number | undefined;

    // Direct digit extraction
    const matchDigits = text.match(/\d+/);
    if (matchDigits) {
      extractedNumber = parseInt(matchDigits[0], 10);
    } else {
      // Simple Hindi & English numbers dictionary
      const numberMap: Record<string, number> = {
        'sau': 100, 'so': 100, 'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'paanch': 5, 'panch': 5,
        'chhah': 6, 'saat': 7, 'aath': 8, 'nau': 9, 'das': 10, 'dass': 10, 'bees': 20, 'chees': 30,
        'tees': 30, 'chalis': 40, 'pachas': 50, 'saath': 60, 'sattar': 70, 'assi': 80, 'nabbe': 90,
        'dedh': 150, 'dhayi': 250, 'hazar': 1000, 'hajari': 1000, 'lakh': 100000,
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'hundred': 100, 'thousand': 1000,
        'fifty': 50, 'ten': 10, 'twenty': 20
      };

      // Simple scanning for composite values (e.g., "paanch sau" -> 5 * 100)
      let tempVal = 0;
      let multiplier = 1;
      
      for (const w of words) {
        if (numberMap[w] !== undefined) {
          const val = numberMap[w];
          if (val === 100 || val === 1000 || val === 100000) {
            if (tempVal === 0) {
              tempVal = val;
            } else {
              tempVal *= val;
            }
          } else {
            tempVal += val;
          }
        }
      }
      if (tempVal > 0) {
        extractedNumber = tempVal;
      }
    }

    // Amount found
    if (extractedNumber) {
      result.amount = extractedNumber;
    }

    // 2. Identify Intent - Expense vs Saving/Goal
    const expenseWords = ['spent', 'kharch', 'kharcha', 'deduct', 'bought', 'kharida', 'dost ko diya', 'diye', 'lag gaye', 'khaya', 'piya', 'rent'];
    const savingsWords = ['bachat', 'save', 'bachaye', 'gullak', 'nivesh', 'sip', 'invest', 'jamaye', 'jama'];
    const goalWords = ['lakshya', 'goal', 'target', 'banna', 'purchase', 'kharidna', 'taxi', 'padhai', 'education', 'shaadi', 'wedding'];

    const hasExpenseWord = expenseWords.some(w => text.includes(w));
    const hasSavingsWord = savingsWords.some(w => text.includes(w));
    const hasGoalWord = goalWords.some(w => text.includes(w));

    if (hasGoalWord || (hasSavingsWord && text.includes('lakshya'))) {
      result.isSavings = true;
      result.goalTarget = result.amount || 100000;
      
      // Attempt to extract title of goal
      if (text.includes('taxi') || text.includes('gadi') || text.includes('gaari')) {
        result.goalTitle = 'Nayi Taxi / Gaadi';
        result.category = 'Vehicle';
      } else if (text.includes('padhai') || text.includes('padhae') || text.includes('padhaee') || text.includes('school') || text.includes('child')) {
        result.goalTitle = 'Child Education / Bacho ki padhai';
        result.category = 'Education';
      } else if (text.includes('rent') || text.includes('kamra') || text.includes('kamre') || text.includes('ghar') || text.includes('home')) {
        result.goalTitle = 'Home purchase / Ghar banwana';
        result.category = 'Home';
      } else if (text.includes('shaadi') || text.includes('shadi') || text.includes('marriage')) {
        result.goalTitle = 'Wedding / Shaadi ka kharch';
        result.category = 'Wedding';
      } else {
        result.goalTitle = transcript; // Use verbatim transcript
        result.category = 'General';
      }
    } else if (hasExpenseWord) {
      result.isExpense = true;
      result.amount = result.amount || 0;
      
      // Determine expense category
      if (text.includes('kirana') || text.includes('rashan') || text.includes('dukan') || text.includes('samaan') || text.includes('grocery') || text.includes('dudh') || text.includes('milki')) {
        result.category = 'Kirana';
        result.title = 'Kirana rashan';
      } else if (text.includes('bus') || text.includes('metro') || text.includes('taxi') || text.includes('petrol') || text.includes('diesel') || text.includes('travel') || text.includes('yatra')) {
        result.category = 'Travel';
        result.title = 'Safar / Fuel kharch';
      } else if (text.includes('rent') || text.includes('kiraya') || text.includes('kamra')) {
        result.category = 'Kiraya';
        result.title = 'Room Rent';
      } else if (text.includes('dawae') || text.includes('dawai') || text.includes('doctor') || text.includes('hastpal') || text.includes('medicine')) {
        result.category = 'Dawai';
        result.title = 'Medical / Dawai';
      } else if (text.includes('recharge') || text.includes('mobile') || text.includes('chai') || text.includes('manoranjan') || text.includes('movie')) {
        result.category = 'Manoranjan';
        result.title = 'Chai / Mobile recharge';
      } else {
        result.category = 'Manoranjan'; // default
        result.title = transcript;
      }
    }

    return result;
  }
}
