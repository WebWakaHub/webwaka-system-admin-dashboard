import { EventBus } from '../../event-system/EventBus';
import { Logger } from '../../logging/Logger';
import { TransactionScorer } from './components/TransactionScorer';
import { AnomalyDetector } from './components/AnomalyDetector';
import { RuleEngine } from './components/RuleEngine';
import { AccountMonitor } from './components/AccountMonitor';
import { VelocityChecker } from './components/VelocityChecker';
import { BehavioralAnalyzer } from './components/BehavioralAnalyzer';
import { FraudAlertManager } from './components/FraudAlertManager';
import { ComplianceManager } from './components/ComplianceManager';

export interface FraudPreventionConfig {
  enableTransactionScoring: boolean;
  enableAnomalyDetection: boolean;
  enableRuleEngine: boolean;
  enableAccountMonitoring: boolean;
  enableVelocityChecking: boolean;
  enableBehavioralAnalysis: boolean;
  enableAlertManagement: boolean;
  enableCompliance: boolean;
}

export class FraudPreventionSystem {
  private eventBus: EventBus;
  private logger: Logger;
  private config: FraudPreventionConfig;

  // Core components
  private transactionScorer: TransactionScorer;
  private anomalyDetector: AnomalyDetector;
  private ruleEngine: RuleEngine;
  private accountMonitor: AccountMonitor;
  private velocityChecker: VelocityChecker;
  private behavioralAnalyzer: BehavioralAnalyzer;
  private fraudAlertManager: FraudAlertManager;
  private complianceManager: ComplianceManager;

  private isInitialized: boolean = false;

  constructor(eventBus: EventBus, logger: Logger, config?: Partial<FraudPreventionConfig>) {
    this.eventBus = eventBus;
    this.logger = logger;

    this.config = {
      enableTransactionScoring: true,
      enableAnomalyDetection: true,
      enableRuleEngine: true,
      enableAccountMonitoring: true,
      enableVelocityChecking: true,
      enableBehavioralAnalysis: true,
      enableAlertManagement: true,
      enableCompliance: true,
      ...config,
    };

    // Initialize components
    this.transactionScorer = new TransactionScorer(eventBus, logger);
    this.anomalyDetector = new AnomalyDetector(eventBus, logger);
    this.ruleEngine = new RuleEngine(eventBus, logger);
    this.accountMonitor = new AccountMonitor(eventBus, logger);
    this.velocityChecker = new VelocityChecker(eventBus, logger);
    this.behavioralAnalyzer = new BehavioralAnalyzer(eventBus, logger);
    this.fraudAlertManager = new FraudAlertManager(eventBus, logger);
    this.complianceManager = new ComplianceManager(eventBus, logger);
  }

  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Fraud Prevention System...');

      // Setup event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      this.logger.info('Fraud Prevention System initialized successfully');

      this.eventBus.publish('fraud.system.initialized', {
        timestamp: Date.now(),
        config: this.config,
      });
    } catch (error) {
      this.logger.error('Error initializing Fraud Prevention System:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    // Listen for transaction events
    this.eventBus.subscribe('transaction.created', (event: any) => {
      this.processTransaction(event.data.transaction);
    });

    // Listen for account events
    this.eventBus.subscribe('account.activity.detected', (event: any) => {
      this.processAccountActivity(event.data.activity);
    });

    // Listen for login events
    this.eventBus.subscribe('user.login.attempted', (event: any) => {
      this.processLogin(event.data.userId, event.data.device, event.data.location);
    });
  }

  private async processTransaction(transaction: any): Promise<void> {
    try {
      if (!this.isInitialized) return;

      // Score transaction
      if (this.config.enableTransactionScoring) {
        this.eventBus.publish('fraud.transaction.scoring.requested', {
          data: { transaction },
        });
      }

      // Check velocity
      if (this.config.enableVelocityChecking) {
        this.eventBus.publish('fraud.velocity.check.requested', {
          data: { userId: transaction.userId, checkType: 'transaction' },
        });
      }

      // Detect anomalies
      if (this.config.enableAnomalyDetection) {
        this.eventBus.publish('fraud.anomaly.detection.requested', {
          data: { userId: transaction.userId, transaction },
        });
      }

      // Evaluate rules
      if (this.config.enableRuleEngine) {
        this.eventBus.publish('fraud.rule.evaluation.requested', {
          data: { transaction },
        });
      }

      // Analyze behavior
      if (this.config.enableBehavioralAnalysis) {
        this.eventBus.publish('fraud.behavior.analysis.requested', {
          data: { userId: transaction.userId, transaction },
        });
      }

      // Check compliance
      if (this.config.enableCompliance) {
        await this.complianceManager.checkCBNCompliance(transaction.userId, transaction.amount);
        await this.complianceManager.calculateTaxWithholding(
          transaction.id,
          transaction.userId,
          transaction.amount
        );
      }
    } catch (error) {
      this.logger.error(`Error processing transaction ${transaction.id}:`, error);
    }
  }

  private async processAccountActivity(activity: any): Promise<void> {
    try {
      if (!this.isInitialized) return;

      // Monitor account activity
      if (this.config.enableAccountMonitoring) {
        this.eventBus.publish('fraud.account.activity.detected', {
          data: { activity },
        });
      }

      // Check compliance
      if (this.config.enableCompliance) {
        await this.complianceManager.checkNDPRCompliance(activity.userId);
        await this.complianceManager.checkAMLKYCCompliance(activity.userId);
      }
    } catch (error) {
      this.logger.error(`Error processing account activity for user ${activity.userId}:`, error);
    }
  }

  private async processLogin(userId: string, device: string, location: string): Promise<void> {
    try {
      if (!this.isInitialized) return;

      // Monitor account login
      if (this.config.enableAccountMonitoring) {
        this.eventBus.publish('fraud.account.login.attempted', {
          data: { userId, device, location },
        });
      }

      // Check velocity
      if (this.config.enableVelocityChecking) {
        this.eventBus.publish('fraud.velocity.check.requested', {
          data: { userId, checkType: 'transaction' },
        });
      }
    } catch (error) {
      this.logger.error(`Error processing login for user ${userId}:`, error);
    }
  }

  // Public API methods

  async scoreTransaction(transaction: any): Promise<any> {
    return this.transactionScorer.scoreTransaction(transaction);
  }

  async detectAnomalies(userId: string, transaction: any): Promise<any> {
    return this.anomalyDetector.detectAnomalies(userId, transaction);
  }

  async evaluateRules(transaction: any): Promise<any> {
    return this.ruleEngine.evaluateRules(transaction);
  }

  async monitorAccount(activity: any): Promise<any> {
    return this.accountMonitor.monitorActivity(activity);
  }

  async checkVelocity(userId: string, checkType: string): Promise<any> {
    return this.velocityChecker.checkVelocity(userId, checkType as any);
  }

  async analyzeBehavior(userId: string, transaction: any): Promise<any> {
    return this.behavioralAnalyzer.analyzeBehavior(userId, transaction);
  }

  async createAlert(
    userId: string,
    alertType: string,
    severity: string,
    message: string,
    metadata: Record<string, any>
  ): Promise<any> {
    return this.fraudAlertManager.createAlert(
      userId,
      alertType as any,
      severity as any,
      message,
      metadata
    );
  }

  async logAudit(
    userId: string,
    action: string,
    resource: string,
    details: Record<string, any>
  ): Promise<any> {
    return this.complianceManager.logAudit(userId, action, resource, details);
  }

  // Component access methods

  getTransactionScorer(): TransactionScorer {
    return this.transactionScorer;
  }

  getAnomalyDetector(): AnomalyDetector {
    return this.anomalyDetector;
  }

  getRuleEngine(): RuleEngine {
    return this.ruleEngine;
  }

  getAccountMonitor(): AccountMonitor {
    return this.accountMonitor;
  }

  getVelocityChecker(): VelocityChecker {
    return this.velocityChecker;
  }

  getBehavioralAnalyzer(): BehavioralAnalyzer {
    return this.behavioralAnalyzer;
  }

  getFraudAlertManager(): FraudAlertManager {
    return this.fraudAlertManager;
  }

  getComplianceManager(): ComplianceManager {
    return this.complianceManager;
  }

  // Status methods

  isInitialized_(): boolean {
    return this.isInitialized;
  }

  getConfig(): FraudPreventionConfig {
    return this.config;
  }

  updateConfig(config: Partial<FraudPreventionConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('Fraud Prevention System configuration updated');
  }

  async shutdown(): Promise<void> {
    try {
      this.logger.info('Shutting down Fraud Prevention System...');
      this.isInitialized = false;
      this.logger.info('Fraud Prevention System shut down successfully');
    } catch (error) {
      this.logger.error('Error shutting down Fraud Prevention System:', error);
      throw error;
    }
  }
}
