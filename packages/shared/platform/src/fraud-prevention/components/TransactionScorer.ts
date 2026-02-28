import { EventBus } from '../../../event-system/EventBus';
import { Logger } from '../../../logging/Logger';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  merchantCategory: string;
  location: string;
  device: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface FraudScore {
  transactionId: string;
  userId: string;
  score: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  timestamp: number;
}

export class TransactionScorer {
  private eventBus: EventBus;
  private logger: Logger;
  private scoreCache: Map<string, FraudScore> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes

  constructor(eventBus: EventBus, logger: Logger) {
    this.eventBus = eventBus;
    this.logger = logger;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventBus.subscribe('fraud.transaction.scoring.requested', (event: any) => {
      this.scoreTransaction(event.data.transaction);
    });
  }

  async scoreTransaction(transaction: Transaction): Promise<FraudScore> {
    const startTime = Date.now();

    try {
      // Check cache first
      const cached = this.scoreCache.get(transaction.id);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        this.logger.debug(`Cache hit for transaction ${transaction.id}`);
        return cached;
      }

      // Calculate fraud score based on multiple factors
      let score = 0;
      const factors: string[] = [];

      // Factor 1: Amount-based detection
      const amountScore = this.scoreAmount(transaction.amount);
      score += amountScore * 0.25;
      if (amountScore > 50) factors.push('unusual_amount');

      // Factor 2: Merchant category detection
      const merchantScore = this.scoreMerchantCategory(transaction.merchantCategory);
      score += merchantScore * 0.20;
      if (merchantScore > 50) factors.push('risky_merchant_category');

      // Factor 3: Geographic detection
      const geoScore = this.scoreGeographic(transaction.location);
      score += geoScore * 0.20;
      if (geoScore > 50) factors.push('unusual_location');

      // Factor 4: Device detection
      const deviceScore = this.scoreDevice(transaction.device);
      score += deviceScore * 0.15;
      if (deviceScore > 50) factors.push('new_device');

      // Factor 5: Velocity detection
      const velocityScore = this.scoreVelocity(transaction.userId);
      score += velocityScore * 0.20;
      if (velocityScore > 50) factors.push('high_velocity');

      // Normalize score to 0-100
      score = Math.min(100, Math.max(0, score));

      // Determine risk level
      const riskLevel = this.getRiskLevel(score);

      const fraudScore: FraudScore = {
        transactionId: transaction.id,
        userId: transaction.userId,
        score: Math.round(score),
        riskLevel,
        factors,
        timestamp: Date.now(),
      };

      // Cache the score
      this.scoreCache.set(transaction.id, fraudScore);

      // Publish fraud score event
      this.eventBus.publish('fraud.transaction.scored', {
        fraudScore,
        latency: Date.now() - startTime,
      });

      this.logger.info(`Transaction ${transaction.id} scored: ${fraudScore.score} (${riskLevel})`);

      return fraudScore;
    } catch (error) {
      this.logger.error(`Error scoring transaction ${transaction.id}:`, error);
      throw error;
    }
  }

  private scoreAmount(amount: number): number {
    // Score based on amount
    if (amount < 1000) return 10;
    if (amount < 10000) return 30;
    if (amount < 100000) return 50;
    if (amount < 1000000) return 70;
    return 90;
  }

  private scoreMerchantCategory(category: string): number {
    // Score based on merchant category risk
    const highRiskCategories = ['gambling', 'adult', 'cryptocurrency', 'wire_transfer'];
    if (highRiskCategories.includes(category)) return 70;

    const mediumRiskCategories = ['travel', 'jewelry', 'electronics'];
    if (mediumRiskCategories.includes(category)) return 40;

    return 20;
  }

  private scoreGeographic(location: string): number {
    // Score based on geographic location
    // This would typically integrate with geolocation service
    // For now, return a base score
    return 30;
  }

  private scoreDevice(device: string): number {
    // Score based on device
    // This would typically integrate with device fingerprinting service
    // For now, return a base score
    return 25;
  }

  private scoreVelocity(userId: string): number {
    // Score based on transaction velocity
    // This would typically check recent transaction history
    // For now, return a base score
    return 20;
  }

  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score < 30) return 'low';
    if (score < 60) return 'medium';
    if (score < 85) return 'high';
    return 'critical';
  }

  async getScore(transactionId: string): Promise<FraudScore | null> {
    return this.scoreCache.get(transactionId) || null;
  }

  clearCache(): void {
    this.scoreCache.clear();
  }
}
