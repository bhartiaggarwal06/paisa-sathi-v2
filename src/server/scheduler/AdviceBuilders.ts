import { IAdviceBuilderStrategy, UserBudgetState } from './types';

export class SukanyaSamriddhiAdviceBuilder implements IAdviceBuilderStrategy {
  build(user: UserBudgetState, language: string): string {
    const name = user.name || (language === 'English' ? 'Friend' : 'साथी');
    const bachatAmt = user.current_month_bachat || 0;
    const isEnglish = language === 'English';

    return isEnglish
      ? `Namaste ${name} Ji! 🌸 Your Paisa Saathi update: Under Sukanya Samriddhi Yojana (SSY) scheme, investing just ₹500/month guarantees secure interest and college funds for your daughter. Move closer to your Education Goal! Total month savings: ₹${bachatAmt}.`
      : `नमस्ते ${name} जी! 🌸 पैसा साथी अपडेट: अपनी बेटी के सुदृढ़ भविष्य (सुकन्या समृद्धि योजना - SSY) में केवल ₹500 प्रतिमाह जमा करके निश्चित सरकारी ब्याज प्राप्त करें। इस महीने आपकी कुल बचत ₹${bachatAmt} है!`;
  }
}

export class PostOfficeRDAdviceBuilder implements IAdviceBuilderStrategy {
  build(user: UserBudgetState, language: string): string {
    const name = user.name || (language === 'English' ? 'Friend' : 'साथी');
    const bachatAmt = user.current_month_bachat || 0;
    const isEnglish = language === 'English';

    return isEnglish
      ? `Namaste ${name} Ji! 🚕 Your Paisa Saathi update: Transfer extra earnings to Post Office RD scheme and earn guaranteed 6.7% safe interest. Great way to fund your next vehicle or business shop milestone! Month savings: ₹${bachatAmt}.`
      : `नमस्ते ${name} जी! 🚕 आपका पैसा साथी अपडेट: डाकघर (Post Office RD) में खाता खोलें और 6.7% निश्चित सरकारी ब्याज प्राप्त कर अपने ऑटो, टैक्सी या व्यापार के सपने को साकार करें। इस महीने की कुल बचत ₹${bachatAmt} है!`;
  }
}

export class GeneralBachatAdviceBuilder implements IAdviceBuilderStrategy {
  build(user: UserBudgetState, language: string): string {
    const name = user.name || (language === 'English' ? 'Friend' : 'साथी');
    const bachatAmt = user.current_month_bachat || 0;
    const isEnglish = language === 'English';

    return isEnglish
      ? `Namaste ${name} Ji! 🪙 Your Paisa Saathi weekly ledger: Reduce daily tea/chai expense by just ₹30 to build over ₹1,000 monthly auto-savings. Secure ₹2 Lakh personal accident covers via PM Suraksha Bima (PMSBY) for a mere ₹436/year. Month savings: ₹${bachatAmt}.`
      : `नमस्ते ${name} जी! 🪙 आपका पैसा साथी साप्ताहिक बहीखाता: रोज़मर्रा के छोटे फ़िज़ूल खर्चों में ₹30 की कटौती कर महीने के ₹1,000 की बचत जुटाएं। साथ ही सरकारी सुरक्षा बीमा (PMSBY) के तहत ₹436/साल में ₹2 लाख का एक्सीडेंट बीमा ज़रूर आज ही सक्रिय कराएं। कुल बचत: ₹${bachatAmt}.`;
  }
}

// Simple Factory Pattern selecting strategies based on keywords in primary_goal
export class AdviceBuilderFactory {
  static getBuilder(goal?: string): IAdviceBuilderStrategy {
    const cleanedGoal = (goal || '').toLowerCase();
    if (cleanedGoal.includes('padhai') || cleanedGoal.includes('education') || cleanedGoal.includes('ssy') || cleanedGoal.includes('beti')) {
      return new SukanyaSamriddhiAdviceBuilder();
    }
    if (cleanedGoal.includes('auto') || cleanedGoal.includes('taxi') || cleanedGoal.includes('vehicle') || cleanedGoal.includes('business') || cleanedGoal.includes('gaadi') || cleanedGoal.includes('dukaan')) {
      return new PostOfficeRDAdviceBuilder();
    }
    return new GeneralBachatAdviceBuilder();
  }
}
