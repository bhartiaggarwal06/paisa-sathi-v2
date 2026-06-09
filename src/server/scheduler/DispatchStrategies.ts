import { IDispatchStrategy, IMessagePayload } from './types';

export class WhatsAppDispatchStrategy implements IDispatchStrategy {
  readonly channelName = 'whatsapp';

  async send(payload: IMessagePayload): Promise<boolean> {
    console.log(`[WhatsAppDispatchStrategy] [SIMULATION-STUB] Preparing to send message to: ${payload.recipientPhone}`);
    console.log(`[WhatsAppDispatchStrategy] [SANDBOX SIMULATOR] Live simulated message successfully queued/dispatched:`);
    console.log(`=========================================`);
    console.log(`Recipient: +${payload.recipientPhone}`);
    console.log(`Message Content:`);
    console.log(payload.messageText);
    console.log(`=========================================`);
    return true;
  }
}

// Open-Closed Principle: SMS Strategy stub can readily be swapped / extended later
export class SmsDispatchStrategy implements IDispatchStrategy {
  readonly channelName = 'sms';

  async send(payload: IMessagePayload): Promise<boolean> {
    console.log(`[SmsDispatchStrategy] [SIMULATION-STUB] Message sent to standard cellular band +${payload.recipientPhone}: ${payload.messageText}`);
    return true;
  }
}
