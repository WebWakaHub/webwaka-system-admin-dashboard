/**
 * Economic Engine REST API Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { EconomicEngine } from '../EconomicEngine';


export class EconomicEngineRoutes {
  private router: Router;
  private engine: EconomicEngine;

  constructor(engine: EconomicEngine) {
    this.router = Router();
    this.engine = engine;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Transaction endpoints
    this.router.post('/transactions', this.createTransaction.bind(this));
    this.router.get('/transactions/:transactionId', this.getTransaction.bind(this));
    this.router.get('/transactions/creator/:creatorId', this.getCreatorTransactions.bind(this));
    this.router.get('/transactions/tenant/:tenantId', this.getTenantTransactions.bind(this));

    // Wallet endpoints
    this.router.post('/wallets', this.createWallet.bind(this));
    this.router.get('/wallets/:walletId', this.getWallet.bind(this));

    this.router.post('/wallets/:walletId/add-funds', this.addFunds.bind(this));
    this.router.post('/wallets/:walletId/withdraw-funds', this.withdrawFunds.bind(this));
    this.router.post('/wallets/transfer', this.transferFunds.bind(this));

    // Revenue distribution endpoints
    this.router.post('/revenue/distribute', this.distributeRevenue.bind(this));
    this.router.get('/revenue/model', this.getRevenueSharingModel.bind(this));

    // Commission endpoints
    this.router.post('/commissions/calculate', this.calculateCommission.bind(this));
    this.router.get('/commissions/config', this.getCommissionConfig.bind(this));

    // Metrics endpoints
    this.router.get('/metrics/statistics', this.getStatistics.bind(this));
  }

  private async createTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId, creatorId, amount, currency, description, metadata } = req.body;

      if (!tenantId || !creatorId || !amount || !currency) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const result = this.engine.processTransaction(
        tenantId,
        creatorId,
        amount,
        currency,
        description,
        {},
        metadata
      );

      res.status(201).json(result.transaction);
    } catch (error) {
      next(error);
    }
  }

  private async getTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { transactionId } = req.params;

      const transaction = this.engine.getTransaction(transactionId);

      res.status(200).json(transaction);
    } catch (error) {
      next(error);
    }
  }

  private async getCreatorTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { creatorId } = req.params;
      const { tenantId } = req.query;

      if (!tenantId) {
        res.status(400).json({ error: 'Missing tenantId query parameter' });
        return;
      }

      const transactions = this.engine.getCreatorTransactions(creatorId, tenantId as string);

      res.status(200).json(transactions);
    } catch (error) {
      next(error);
    }
  }

  private async getTenantTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId } = req.params;

      const transactions = this.engine.getTenantTransactions(tenantId);

      res.status(200).json(transactions);
    } catch (error) {
      next(error);
    }
  }

  private async createWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, tenantId, currency } = req.body;

      if (!userId || !tenantId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const wallet = this.engine.createWallet(userId, tenantId, currency);

      res.status(201).json(wallet);
    } catch (error) {
      next(error);
    }
  }

  private async getWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { walletId } = req.params;

      const wallet = this.engine.getWallet(walletId);

      res.status(200).json(wallet);
    } catch (error) {
      next(error);
    }
  }



  private async addFunds(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { walletId } = req.params;
      const { amount, transactionId } = req.body;

      if (!amount || !transactionId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const wallet = this.engine.addFundsToWallet(walletId, amount, transactionId);

      res.status(200).json(wallet);
    } catch (error) {
      next(error);
    }
  }

  private async withdrawFunds(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { walletId } = req.params;
      const { amount, transactionId } = req.body;

      if (!amount || !transactionId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const wallet = this.engine.withdrawFromWallet(walletId, amount, transactionId);

      res.status(200).json(wallet);
    } catch (error) {
      next(error);
    }
  }

  private async transferFunds(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fromWalletId, toWalletId, amount, transactionId } = req.body;

      if (!fromWalletId || !toWalletId || !amount || !transactionId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const result = this.engine.transferFunds(fromWalletId, toWalletId, amount, transactionId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  private async distributeRevenue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { transaction } = req.body;

      if (!transaction) {
        res.status(400).json({ error: 'Missing transaction' });
        return;
      }

      const model = this.engine.getRevenueSharingModel();

      res.status(200).json(model);
    } catch (error) {
      next(error);
    }
  }

  private async getRevenueSharingModel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const model = this.engine.getRevenueSharingModel();

      res.status(200).json(model);
    } catch (error) {
      next(error);
    }
  }

  private async calculateCommission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { participantId, level, amount, performanceScore, engagementScore } = req.body;

      if (!participantId || !level || !amount) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const config = this.engine.getCommissionConfig();

      res.status(200).json(config);
    } catch (error) {
      next(error);
    }
  }

  private async getCommissionConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const config = this.engine.getCommissionConfig();

      res.status(200).json(config);
    } catch (error) {
      next(error);
    }
  }

  private async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId } = req.query;

      const stats = this.engine.getStatistics(tenantId as string);

      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
