/**
 * Hospitality Booking Engine - Module Index
 * 
 * Main entry point for the Hospitality Booking Engine module.
 * Exports all public APIs and components.
 * 
 * @module hospitality-booking-engine
 * @author webwakaagent4
 */

// Types
export * from './types';

// Database Schema
export * from './database/schema';

// Services
export { BookingService } from './services/booking-service';
export { OfflineSyncEngine, SyncQueueItem, SyncResult } from './services/offline-sync-engine';
export { 
  NotificationService, 
  NotificationType, 
  NotificationResult,
  TermiiSMSProvider,
  SMTPEmailProvider,
  ISMSProvider,
  IEmailProvider,
} from './services/notification-service';

// Adapters
export { 
  PaymentGatewayAdapter, 
  IPaymentGateway,
  PaymentInitializationRequest,
  RefundRequest,
} from './adapters/payment-gateway-adapter';
export { PaystackAdapter } from './adapters/paystack-adapter';
export { FlutterwaveAdapter } from './adapters/flutterwave-adapter';
export { InterswitchAdapter } from './adapters/interswitch-adapter';

// Events
export { EventPublisher, IEventBus } from './events/event-publisher';

// API
export { BookingController } from './api/controllers/booking-controller';
export { createBookingRoutes } from './api/routes/booking-routes';

/**
 * Module Metadata
 */
export const MODULE_METADATA = {
  id: 'hospitality-booking-engine',
  name: 'Hospitality Booking Engine',
  version: '1.0.0',
  description: 'Comprehensive reservation and booking management for hospitality businesses',
  author: 'webwakaagent4',
  suite: 'Hospitality Suite',
  dependencies: [
    'minimal-kernel',
    'property-management',
    'channel-management',
    'guest-management',
  ],
  compliance: {
    nigerianFirst: true,
    mobileFirst: true,
    pwaFirst: true,
    africaFirst: true,
  },
};

/**
 * Module Initialization
 * 
 * Initializes the Booking Engine module with required dependencies.
 */
export async function initializeBookingEngine(config: {
  // Database
  databaseUrl: string;
  
  // Event Bus
  eventBusUrl: string;
  
  // Payment Gateways
  paystackSecretKey: string;
  flutterwaveSecretKey: string;
  interswitchClientId: string;
  interswitchClientSecret: string;
  interswitchMerchantCode: string;
  
  // SMS Gateway
  termiiApiKey: string;
  termiiSenderId: string;
  
  // Email
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  
  // App
  appUrl: string;
}): Promise<{
  bookingService: BookingService;
  bookingController: BookingController;
  offlineSyncEngine: OfflineSyncEngine;
  notificationService: NotificationService;
}> {
  // Initialize payment gateway adapters
  const paystackAdapter = new PaystackAdapter(config.paystackSecretKey);
  const flutterwaveAdapter = new FlutterwaveAdapter(config.flutterwaveSecretKey);
  const interswitchAdapter = new InterswitchAdapter(
    config.interswitchClientId,
    config.interswitchClientSecret,
    config.interswitchMerchantCode
  );

  const paymentGatewayAdapter = new PaymentGatewayAdapter(
    new Map([
      ['paystack', paystackAdapter],
      ['flutterwave', flutterwaveAdapter],
      ['interswitch', interswitchAdapter],
    ])
  );

  // Initialize event bus (mock for now)
  const eventBus: IEventBus = {
    publish: async (topic: string, payload: any) => {
      console.log(`Event published to ${topic}:`, payload);
    },
  };

  const eventPublisher = new EventPublisher(eventBus);

  // Initialize booking service
  const bookingService = new BookingService(eventPublisher, paymentGatewayAdapter);

  // Initialize offline sync engine
  const offlineSyncEngine = new OfflineSyncEngine(bookingService, eventPublisher);

  // Initialize notification service
  const smsProvider = new TermiiSMSProvider(config.termiiApiKey, config.termiiSenderId);
  const emailProvider = new SMTPEmailProvider({
    host: config.smtpHost,
    port: config.smtpPort,
    user: config.smtpUser,
    pass: config.smtpPass,
  });

  const notificationService = new NotificationService(smsProvider, emailProvider);

  // Initialize booking controller
  const bookingController = new BookingController(bookingService);

  console.log('Hospitality Booking Engine initialized successfully');

  return {
    bookingService,
    bookingController,
    offlineSyncEngine,
    notificationService,
  };
}
