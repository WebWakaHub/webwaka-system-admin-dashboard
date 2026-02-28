/**
 * Termii SMS Gateway Adapter
 * Nigerian SMS gateway integration
 */

export interface TermiiConfig {
  apiKey: string;
  senderId: string;
  apiUrl: string;
}

export interface SendSMSRequest {
  to: string; // Phone number in format: +234XXXXXXXXXX
  message: string;
  senderId?: string;
}

export interface SendSMSResponse {
  messageId: string;
  status: 'success' | 'failed';
  balance: number;
}

export class TermiiAdapter {
  private config: TermiiConfig;

  constructor(config: TermiiConfig) {
    this.config = config;
  }

  /**
   * Send SMS via Termii
   */
  async sendSMS(request: SendSMSRequest): Promise<SendSMSResponse> {
    // Validate Nigerian phone number
    if (!request.to.startsWith('+234')) {
      throw new Error('Only Nigerian phone numbers (+234) are supported');
    }

    // TODO: Implement actual Termii API call
    // const response = await fetch(`${this.config.apiUrl}/sms/send`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     api_key: this.config.apiKey,
    //     to: request.to,
    //     from: request.senderId || this.config.senderId,
    //     sms: request.message,
    //     type: 'plain',
    //     channel: 'generic',
    //   }),
    // });

    // Stub implementation
    console.log('[TERMII] Sending SMS:', {
      to: request.to,
      message: request.message,
      senderId: request.senderId || this.config.senderId,
    });

    return {
      messageId: `termii-${Date.now()}`,
      status: 'success',
      balance: 1000, // Stub balance
    };
  }

  /**
   * Get SMS balance
   */
  async getBalance(): Promise<number> {
    // TODO: Implement actual Termii API call
    // const response = await fetch(`${this.config.apiUrl}/get-balance?api_key=${this.config.apiKey}`);
    
    return 1000; // Stub balance
  }

  /**
   * Handle delivery report webhook
   */
  async handleDeliveryReport(payload: any): Promise<void> {
    console.log('[TERMII] Delivery report received:', payload);
    
    // TODO: Update message recipient status based on delivery report
    // - Extract messageId from payload
    // - Update recipient status (delivered/failed)
    // - Store failure reason if failed
  }
}
