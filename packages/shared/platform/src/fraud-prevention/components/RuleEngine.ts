import { EventBus } from '../../../event-system/EventBus';
import { Logger } from '../../../logging/Logger';

export interface FraudRule {
  id: string;
  name: string;
  description: string;
  conditions: RuleCondition[];
  action: 'approve' | 'review' | 'block';
  priority: number;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: any;
}

export interface RuleEvaluationResult {
  ruleId: string;
  matched: boolean;
  action: 'approve' | 'review' | 'block';
  score: number;
}

export class RuleEngine {
  private eventBus: EventBus;
  private logger: Logger;
  private rules: Map<string, FraudRule> = new Map();
  private ruleOrder: string[] = [];

  constructor(eventBus: EventBus, logger: Logger) {
    this.eventBus = eventBus;
    this.logger = logger;
    this.setupEventListeners();
    this.loadDefaultRules();
  }

  private setupEventListeners(): void {
    this.eventBus.subscribe('fraud.rule.evaluation.requested', (event: any) => {
      this.evaluateRules(event.data.transaction);
    });

    this.eventBus.subscribe('fraud.rule.created', (event: any) => {
      this.addRule(event.data.rule);
    });

    this.eventBus.subscribe('fraud.rule.updated', (event: any) => {
      this.updateRule(event.data.rule);
    });

    this.eventBus.subscribe('fraud.rule.deleted', (event: any) => {
      this.deleteRule(event.data.ruleId);
    });
  }

  private loadDefaultRules(): void {
    // Load default fraud rules
    const defaultRules: FraudRule[] = [
      {
        id: 'rule_high_amount',
        name: 'High Amount Transaction',
        description: 'Block transactions exceeding 1M NGN',
        conditions: [{ field: 'amount', operator: 'greater_than', value: 1000000 }],
        action: 'block',
        priority: 1,
        enabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'rule_rapid_transactions',
        name: 'Rapid Transactions',
        description: 'Review if more than 5 transactions in 1 hour',
        conditions: [{ field: 'transactionCount', operator: 'greater_than', value: 5 }],
        action: 'review',
        priority: 2,
        enabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'rule_high_risk_merchant',
        name: 'High Risk Merchant',
        description: 'Review transactions from high-risk merchants',
        conditions: [
          {
            field: 'merchantCategory',
            operator: 'in',
            value: ['gambling', 'adult', 'cryptocurrency'],
          },
        ],
        action: 'review',
        priority: 3,
        enabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    defaultRules.forEach((rule) => this.addRule(rule));
  }

  async evaluateRules(transaction: any): Promise<RuleEvaluationResult[]> {
    try {
      const results: RuleEvaluationResult[] = [];

      // Sort rules by priority
      const sortedRuleIds = [...this.ruleOrder].sort((a, b) => {
        const ruleA = this.rules.get(a)!;
        const ruleB = this.rules.get(b)!;
        return ruleA.priority - ruleB.priority;
      });

      for (const ruleId of sortedRuleIds) {
        const rule = this.rules.get(ruleId);
        if (!rule || !rule.enabled) continue;

        const matched = this.evaluateConditions(transaction, rule.conditions);
        const result: RuleEvaluationResult = {
          ruleId: rule.id,
          matched,
          action: matched ? rule.action : 'approve',
          score: matched ? this.getScoreForAction(rule.action) : 0,
        };

        results.push(result);

        if (matched) {
          this.logger.info(`Rule ${rule.id} matched for transaction ${transaction.id}`);
        }
      }

      // Publish rule evaluation event
      this.eventBus.publish('fraud.rules.evaluated', {
        transactionId: transaction.id,
        results,
      });

      return results;
    } catch (error) {
      this.logger.error(`Error evaluating rules for transaction ${transaction.id}:`, error);
      throw error;
    }
  }

  private evaluateConditions(transaction: any, conditions: RuleCondition[]): boolean {
    return conditions.every((condition) => this.evaluateCondition(transaction, condition));
  }

  private evaluateCondition(transaction: any, condition: RuleCondition): boolean {
    const value = this.getTransactionValue(transaction, condition.field);

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'greater_than':
        return value > condition.value;
      case 'less_than':
        return value < condition.value;
      case 'contains':
        return String(value).includes(String(condition.value));
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);
      default:
        return false;
    }
  }

  private getTransactionValue(transaction: any, field: string): any {
    return transaction[field];
  }

  private getScoreForAction(action: string): number {
    switch (action) {
      case 'approve':
        return 0;
      case 'review':
        return 50;
      case 'block':
        return 100;
      default:
        return 0;
    }
  }

  addRule(rule: FraudRule): void {
    this.rules.set(rule.id, rule);
    if (!this.ruleOrder.includes(rule.id)) {
      this.ruleOrder.push(rule.id);
    }
    this.logger.info(`Rule ${rule.id} added`);
  }

  updateRule(rule: FraudRule): void {
    this.rules.set(rule.id, rule);
    this.logger.info(`Rule ${rule.id} updated`);
  }

  deleteRule(ruleId: string): void {
    this.rules.delete(ruleId);
    this.ruleOrder = this.ruleOrder.filter((id) => id !== ruleId);
    this.logger.info(`Rule ${ruleId} deleted`);
  }

  getRule(ruleId: string): FraudRule | undefined {
    return this.rules.get(ruleId);
  }

  getAllRules(): FraudRule[] {
    return Array.from(this.rules.values());
  }

  getRuleCount(): number {
    return this.rules.size;
  }
}
