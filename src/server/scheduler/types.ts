export interface UserBudgetState {
  id: string;
  name: string;
  mobile_number: string;
  primary_goal?: string;
  savings_accumulated?: number;
  current_month_bachat?: number;
  current_month_kharch?: number;
  channels_config?: any[];
  language?: string;
}

export interface IMessagePayload {
  recipientPhone: string;
  messageText: string;
  metadata?: Record<string, any>;
}

// Open-Closed Principle: Core Dispatcher sends messages through dynamic IDispatchStrategy interfaces
export interface IDispatchStrategy {
  channelName: string;
  send(payload: IMessagePayload): Promise<boolean>;
}

// Strategy Pattern for personalized financial advice summaries based on primary goals
export interface IAdviceBuilderStrategy {
  build(user: UserBudgetState, language: string): string;
}

export interface IDispatchLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  channel: string;
  recipient: string;
  message: string;
  success: boolean;
  notes: string;
}
