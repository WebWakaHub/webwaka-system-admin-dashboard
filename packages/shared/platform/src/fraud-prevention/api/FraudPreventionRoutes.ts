import express, { Router, Request, Response } from 'express';
import { FraudPreventionSystem } from '../FraudPreventionSystem';
import { Logger } from '../../logging/Logger';

export class FraudPreventionRoutes {
  private router: Router;
  private fraudPreventionSystem: FraudPreventionSystem;
  private logger: Logger;

  constructor(fraudPreventionSystem: FraudPreventionSystem, logger: Logger) {
    this.router = express.Router();
    this.fraudPreventionSystem = fraudPreventionSystem;
    this.logger = logger;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Transaction scoring endpoints
    this.router.post('/transactions/score', this.scoreTransaction.bind(this));
    this.router.get('/transactions/:transactionId/score', this.getTransactionScore.bind(this));

    // Anomaly detection endpoints
    this.router.post('/users/:userId/anomalies/detect', this.detectAnomalies.bind(this));
    this.router.get('/users/:userId/anomalies', this.getUserAnomalies.bind(this));

    // Rule engine endpoints
    this.router.post('/rules/evaluate', this.evaluateRules.bind(this));
    this.router.get('/rules', this.getRules.bind(this));
    this.router.post('/rules', this.createRule.bind(this));
    this.router.put('/rules/:ruleId', this.updateRule.bind(this));
    this.router.delete('/rules/:ruleId', this.deleteRule.bind(this));

    // Account monitoring endpoints
    this.router.post('/accounts/monitor', this.monitorAccount.bind(this));
    this.router.get('/accounts/:userId/profile', this.getAccountProfile.bind(this));
    this.router.get('/accounts/:userId/suspicious-activities', this.getSuspiciousActivities.bind(this));

    // Velocity checking endpoints
    this.router.post('/velocity/check', this.checkVelocity.bind(this));
    this.router.get('/velocity/limits', this.getVelocityLimits.bind(this));
    this.router.post('/velocity/limits', this.setVelocityLimit.bind(this));

    // Behavioral analysis endpoints
    this.router.post('/behavior/analyze', this.analyzeBehavior.bind(this));
    this.router.get('/behavior/:userId/profile', this.getBehaviorProfile.bind(this));

    // Alert management endpoints
    this.router.post('/alerts', this.createAlert.bind(this));
    this.router.get('/alerts/:alertId', this.getAlert.bind(this));
    this.router.get('/users/:userId/alerts', this.getUserAlerts.bind(this));
    this.router.put('/alerts/:alertId/acknowledge', this.acknowledgeAlert.bind(this));
    this.router.put('/alerts/:alertId/resolve', this.resolveAlert.bind(this));

    // Compliance endpoints
    this.router.post('/compliance/ndpr/check', this.checkNDPRCompliance.bind(this));
    this.router.post('/compliance/cbn/check', this.checkCBNCompliance.bind(this));
    this.router.post('/compliance/aml-kyc/check', this.checkAMLKYCCompliance.bind(this));
    this.router.post('/compliance/tax/withhold', this.calculateTaxWithholding.bind(this));
    this.router.get('/audit-logs', this.getAuditLogs.bind(this));
    this.router.get('/audit-logs/:userId', this.getUserAuditLogs.bind(this));

    // System endpoints
    this.router.get('/status', this.getStatus.bind(this));
    this.router.get('/config', this.getConfig.bind(this));
    this.router.put('/config', this.updateConfig.bind(this));
  }

  private async scoreTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { transaction } = req.body;
      const score = await this.fraudPreventionSystem.scoreTransaction(transaction);
      res.json(score);
    } catch (error) {
      this.logger.error('Error scoring transaction:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async getTransactionScore(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;
      const score = await this.fraudPreventionSystem
        .getTransactionScorer()
        .getScore(transactionId);
      res.json(score || { error: 'Score not found' });
    } catch (error) {
      this.logger.error('Error getting transaction score:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async detectAnomalies(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { transaction } = req.body;
      const anomalies = await this.fraudPreventionSystem.detectAnomalies(userId, transaction);
      res.json(anomalies);
    } catch (error) {
      this.logger.error('Error detecting anomalies:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async getUserAnomalies(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      res.json({ userId, anomalies: [] });
    } catch (error) {
      this.logger.error('Error getting user anomalies:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async evaluateRules(req: Request, res: Response): Promise<void> {
    try {
      const { transaction } = req.body;
      const results = await this.fraudPreventionSystem.evaluateRules(transaction);
      res.json(results);
    } catch (error) {
      this.logger.error('Error evaluating rules:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async getRules(req: Request, res: Response): Promise<void> {
    try {
      const rules = this.fraudPreventionSystem.getRuleEngine().getAllRules();
      res.json(rules);
    } catch (error) {
      this.logger.error('Error getting rules:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async createRule(req: Request, res: Response): Promise<void> {
    try {
      const { rule } = req.body;
      this.fraudPreventionSystem.getRuleEngine().addRule(rule);
      res.json(rule);
    } catch (error) {
      this.logger.error('Error creating rule:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async updateRule(req: Request, res: Response): Promise<void> {
    try {
      const { ruleId } = req.params;
      const { rule } = req.body;
      this.fraudPreventionSystem.getRuleEngine().updateRule(rule);
      res.json(rule);
    } catch (error) {
      this.logger.error('Error updating rule:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async deleteRule(req: Request, res: Response): Promise<void> {
    try {
      const { ruleId } = req.params;
      this.fraudPreventionSystem.getRuleEngine().deleteRule(ruleId);
      res.json({ success: true });
    } catch (error) {
      this.logger.error('Error deleting rule:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async monitorAccount(req: Request, res: Response): Promise<void> {
    try {
      const { activity } = req.body;
      const result = await this.fraudPreventionSystem.monitorAccount(activity);
      res.json(result);
    } catch (error) {
      this.logger.error('Error monitoring account:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async getAccountProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const profile = this.fraudPreventionSystem
        .getAccountMonitor()
        .getAccountProfile(userId);
      res.json(profile || { error: 'Profile not found' });
    } catch (error) {
      this.logger.error('Error getting account profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async getSuspiciousActivities(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const activities = this.fraudPreventionSystem
        .getAccountMonitor()
        .getSuspiciousActivities(userId);
      res.json(activities);
    } catch (error) {
      this.logger.error('Error getting suspicious activities:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async checkVelocity(req: Request, res: Response): Promise<void> {
    try {
      const { userId, checkType } = req.body;
      const result = await this.fraudPreventionSystem.checkVelocity(userId, checkType);
      res.json(result);
    } catch (error) {
      this.logger.error('Error checking velocity:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async getVelocityLimits(req: Request, res: Response): Promise<void> {
    try {
      const limits = this.fraudPreventionSystem.getVelocityChecker().getVelocityLimits();
      res.json(limits);
    } catch (error) {
      this.logger.error('Error getting velocity limits:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async setVelocityLimit(req: Request, res: Response): Promise<void> {
    try {
      const { limit } = req.body;
      this.fraudPreventionSystem.getVelocityChecker().setVelocityLimit(limit);
      res.json(limit);
    } catch (error) {
      this.logger.error('Error setting velocity limit:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async analyzeBehavior(req: Request, res: Response): Promise<void> {
    try {
      const { userId, transaction } = req.body;
      const deviations = await this.fraudPreventionSystem.analyzeBehavior(userId, transaction);
      res.json(deviations);
    } catch (error) {
      this.logger.error('Error analyzing behavior:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async getBehaviorProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const profile = this.fraudPreventionSystem
        .getBehavioralAnalyzer()
        .getBehaviorProfile(userId);
      res.json(profile || { error: 'Profile not found' });
    } catch (error) {
      this.logger.error('Error getting behavior profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async createAlert(req: Request, res: Response): Promise<void> {
    try {
      const { userId, alertType, severity, message, metadata } = req.body;
      const alert = await this.fraudPreventionSystem.createAlert(
        userId,
        alertType,
        severity,
        message,
        metadata
      );
      res.json(alert);
    } catch (error) {
      this.logger.error('Error creating alert:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async getAlert(req: Request, res: Response): Promise<void> {
    try {
      const { alertId } = req.params;
      const alert = this.fraudPreventionSystem.getFraudAlertManager().getAlert(alertId);
      res.json(alert || { error: 'Alert not found' });
    } catch (error) {
      this.logger.error('Error getting alert:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async getUserAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const alerts = this.fraudPreventionSystem.getFraudAlertManager().getUserAlerts(userId);
      res.json(alerts);
    } catch (error) {
      this.logger.error('Error getting user alerts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async acknowledgeAlert(req: Request, res: Response): Promise<void> {
    try {
      const { alertId } = req.params;
      const alert = await this.fraudPreventionSystem
        .getFraudAlertManager()
        .acknowledgeAlert(alertId);
      res.json(alert);
    } catch (error) {
      this.logger.error('Error acknowledging alert:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async resolveAlert(req: Request, res: Response): Promise<void> {
    try {
      const { alertId } = req.params;
      const alert = await this.fraudPreventionSystem
        .getFraudAlertManager()
        .resolveAlert(alertId);
      res.json(alert);
    } catch (error) {
      this.logger.error('Error resolving alert:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async checkNDPRCompliance(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;
      const check = await this.fraudPreventionSystem
        .getComplianceManager()
        .checkNDPRCompliance(userId);
      res.json(check);
    } catch (error) {
      this.logger.error('Error checking NDPR compliance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async checkCBNCompliance(req: Request, res: Response): Promise<void> {
    try {
      const { userId, transactionAmount } = req.body;
      const check = await this.fraudPreventionSystem
        .getComplianceManager()
        .checkCBNCompliance(userId, transactionAmount);
      res.json(check);
    } catch (error) {
      this.logger.error('Error checking CBN compliance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async checkAMLKYCCompliance(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;
      const check = await this.fraudPreventionSystem
        .getComplianceManager()
        .checkAMLKYCCompliance(userId);
      res.json(check);
    } catch (error) {
      this.logger.error('Error checking AML/KYC compliance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async calculateTaxWithholding(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId, userId, grossAmount } = req.body;
      const withholding = await this.fraudPreventionSystem
        .getComplianceManager()
        .calculateTaxWithholding(transactionId, userId, grossAmount);
      res.json(withholding);
    } catch (error) {
      this.logger.error('Error calculating tax withholding:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const logs = this.fraudPreventionSystem.getComplianceManager().getAuditLogs();
      res.json(logs);
    } catch (error) {
      this.logger.error('Error getting audit logs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async getUserAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const logs = this.fraudPreventionSystem
        .getComplianceManager()
        .getAuditLogs(userId);
      res.json(logs);
    } catch (error) {
      this.logger.error('Error getting user audit logs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = {
        initialized: this.fraudPreventionSystem.isInitialized_(),
        config: this.fraudPreventionSystem.getConfig(),
        timestamp: Date.now(),
      };
      res.json(status);
    } catch (error) {
      this.logger.error('Error getting status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async getConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = this.fraudPreventionSystem.getConfig();
      res.json(config);
    } catch (error) {
      this.logger.error('Error getting config:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async updateConfig(req: Request, res: Response): Promise<void> {
    try {
      const { config } = req.body;
      this.fraudPreventionSystem.updateConfig(config);
      res.json(this.fraudPreventionSystem.getConfig());
    } catch (error) {
      this.logger.error('Error updating config:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  getRouter(): Router {
    return this.router;
  }
}
