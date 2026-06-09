import { IDispatchStrategy, IDispatchLogEntry, UserBudgetState } from './types';
import { WhatsAppDispatchStrategy } from './DispatchStrategies';
import { AdviceBuilderFactory } from './AdviceBuilders';

/**
 * Singleton Coordinator managing automatic queue cycles and dispatch strategies
 * Demonstrates Single Responsibility, Interface Segregation, and Dependency Inversion.
 */
export class SchedulerService {
  private static instance: SchedulerService | null = null;
  private strategies: Map<string, IDispatchStrategy> = new Map();
  private logs: IDispatchLogEntry[] = [];
  private isRunning: boolean = false;
  private intervalId: any = null;

  private constructor() {
    // Registry Pattern: Self-registers appropriate dispatch providers dynamically
    this.registerStrategy(new WhatsAppDispatchStrategy());
  }

  public static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  public registerStrategy(strategy: IDispatchStrategy) {
    this.strategies.set(strategy.channelName, strategy);
    console.log(`[SchedulerService] Strategy registered successfully for channel: [${strategy.channelName.toUpperCase()}]`);
  }

  public getLogs(): IDispatchLogEntry[] {
    return this.logs;
  }

  public addLog(log: IDispatchLogEntry) {
    this.logs.unshift(log);
    if (this.logs.length > 50) {
      this.logs.pop();
    }
  }

  public clearLogs() {
    this.logs = [];
  }

  /**
   * Starts background worker loop. Decouples state lookup by requiring a retrieval callback,
   * satisfying Dependency Inversion Principle.
   */
  public start(getUsersCollection: () => UserBudgetState[], tickIntervalMs: number = 45000) {
    if (this.isRunning) {
      console.log("[SchedulerService] Worker daemon is already running.");
      return;
    }

    this.isRunning = true;
    console.log(`[SchedulerService] Booting automatic dispatch loop with process interval: ${tickIntervalMs}ms...`);
    
    this.intervalId = setInterval(async () => {
      try {
        const users = getUsersCollection();
        await this.runTick(users);
      } catch (err) {
        console.error(`[SchedulerService] Exception caught inside background scheduling daemon:`, err);
      }
    }, tickIntervalMs);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log("[SchedulerService] Stopped background automatic dispatcher.");
  }

  /**
   * Evaluates opted-in WhatsApp configurations, formats messages dynamically, and dispatches them.
   * Returns total messages correctly processed.
   */
  public async runTick(users: UserBudgetState[]): Promise<number> {
    console.log(`[SchedulerService] Tick active. Looking up opted-in profiles across ${users.length} users...`);
    let processCount = 0;

    for (const user of users) {
      const channels = user.channels_config || [];
      const waConfig = channels.find((c: any) => c.channel === 'whatsapp');

      // Only prepare message if the WhatsApp channel is actively opted in
      if (waConfig && waConfig.isEnabled) {
        const recipient = waConfig.phoneNumber || user.mobile_number;
        if (!recipient) {
          console.warn(`[SchedulerService] User "${user.name || user.id}" opted-in but does not possess a valid target phone number.`);
          continue;
        }

        const language = user.language || 'Hindi';

        // 1. Resolve advice algorithm strategy using Factory Pattern
        const adviceBuilder = AdviceBuilderFactory.getBuilder(user.primary_goal);
        let adviceText = adviceBuilder.build(user, language);

        // 2. Decorate with cyber-security fraud alerts if requested (Single Source of Truth)
        if (waConfig.topics?.scamWarnings) {
          adviceText += language === 'English'
            ? `\n\n⚠️ Cyber Alert: Banks or Paisa Saathi never request your PIN number, OTP, or passwords over call/SMS.`
            : `\n\n⚠️ फ्रॉड अलर्ट: पैसा साथी या बैंक अधिकारी कभी भी आपसे फोन पर पिन नंबर, ओटीपी (OTP) या गुप्त लॉक कोड नहीं मांगते। सुरक्षित रहें!`;
        }

        // 3. Decorate with explicit app deep link for prompt login/re-entry
        const appUrl = process.env.APP_URL || 'https://ais-dev-53bimrueqevicwnfa74qld-273438617201.asia-east1.run.app';
        adviceText += language === 'English'
          ? `\n\n📲 Access Paisa Saathi complete saving dashboard here: ${appUrl}`
          : `\n\n📲 अपना बचत खाता और सोने के भाव का पूरा विवरण यहाँ पैसा साथी ऐप में देखें: ${appUrl}`;

        // 4. Resolve dispatch strategy from strategy registry
        const strategy = this.strategies.get('whatsapp');
        if (!strategy) {
          console.error(`[SchedulerService] Missing WhatsApp strategy in dispatcher map!`);
          continue;
        }

        // 5. Send payload
        const success = await strategy.send({
          recipientPhone: recipient,
          messageText: adviceText
        });

        // 6. Log historical ledger entry
        const logEntry: IDispatchLogEntry = {
          id: 'log_' + Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          userId: user.id,
          userName: user.name || 'User',
          channel: 'WhatsApp',
          recipient,
          message: adviceText,
          success,
          notes: success 
            ? `Successfully triggered background WhatsApp advisory alert` 
            : `Failed to construct underlying socket request`
        };

        this.addLog(logEntry);
        processCount++;
      }
    }

    console.log(`[SchedulerService] Dispatch Tick completed. Processed payload deliveries for ${processCount} profiles.`);
    return processCount;
  }
}
