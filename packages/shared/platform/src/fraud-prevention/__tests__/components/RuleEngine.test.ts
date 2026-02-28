import { RuleEngine, FraudRule } from '../../components/RuleEngine';
import { EventBus } from '../../../events/EventBus';
import { Logger } from '../../../logging/Logger';

describe('RuleEngine', () => {
  let engine: RuleEngine;
  let eventBus: EventBus;
  let logger: Logger;

  beforeEach(() => {
    eventBus = new EventBus();
    logger = new Logger('test');
    engine = new RuleEngine(eventBus, logger);
  });

  describe('evaluateRules', () => {
    describe('Basic Functionality', () => {
      it('should evaluate a single rule', async () => {
        const rule: FraudRule = {
          id: 'rule-001',
          name: 'High Amount Detection',
          priority: 1,
          conditions: [
            { field: 'amount', operator: 'greater_than', value: 1000000 }
          ],
          action: 'flag',
          enabled: true,
        };

        const transaction = {
          amount: 2000000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        };

        const result = await engine.evaluateRules([rule], transaction);

        expect(result).toBeDefined();
        expect(result.matched).toBe(true);
        expect(result.matchedRules).toContain('rule-001');
      });

      it('should evaluate multiple rules', async () => {
        const rules: FraudRule[] = [
          {
            id: 'rule-001',
            name: 'High Amount',
            priority: 1,
            conditions: [{ field: 'amount', operator: 'greater_than', value: 1000000 }],
            action: 'flag',
            enabled: true,
          },
          {
            id: 'rule-002',
            name: 'Risky Merchant',
            priority: 2,
            conditions: [{ field: 'merchantCategory', operator: 'equals', value: 'gambling' }],
            action: 'flag',
            enabled: true,
          },
        ];

        const transaction = {
          amount: 2000000,
          merchantCategory: 'gambling',
          timestamp: Date.now(),
        };

        const result = await engine.evaluateRules(rules, transaction);

        expect(result.matched).toBe(true);
        expect(result.matchedRules.length).toBeGreaterThanOrEqual(1);
      });

      it('should return no matches for non-matching rules', async () => {
        const rule: FraudRule = {
          id: 'rule-001',
          name: 'High Amount Detection',
          priority: 1,
          conditions: [
            { field: 'amount', operator: 'greater_than', value: 1000000 }
          ],
          action: 'flag',
          enabled: true,
        };

        const transaction = {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        };

        const result = await engine.evaluateRules([rule], transaction);

        expect(result.matched).toBe(false);
        expect(result.matchedRules.length).toBe(0);
      });
    });

    describe('Condition Operators', () => {
      it('should handle equals operator', async () => {
        const rule: FraudRule = {
          id: 'rule-equals',
          name: 'Equals Test',
          priority: 1,
          conditions: [
            { field: 'merchantCategory', operator: 'equals', value: 'gambling' }
          ],
          action: 'flag',
          enabled: true,
        };

        const matchingTransaction = {
          amount: 50000,
          merchantCategory: 'gambling',
          timestamp: Date.now(),
        };

        const nonMatchingTransaction = {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        };

        const matchResult = await engine.evaluateRules([rule], matchingTransaction);
        const nonMatchResult = await engine.evaluateRules([rule], nonMatchingTransaction);

        expect(matchResult.matched).toBe(true);
        expect(nonMatchResult.matched).toBe(false);
      });

      it('should handle not_equals operator', async () => {
        const rule: FraudRule = {
          id: 'rule-not-equals',
          name: 'Not Equals Test',
          priority: 1,
          conditions: [
            { field: 'merchantCategory', operator: 'not_equals', value: 'grocery' }
          ],
          action: 'flag',
          enabled: true,
        };

        const matchingTransaction = {
          amount: 50000,
          merchantCategory: 'gambling',
          timestamp: Date.now(),
        };

        const nonMatchingTransaction = {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        };

        const matchResult = await engine.evaluateRules([rule], matchingTransaction);
        const nonMatchResult = await engine.evaluateRules([rule], nonMatchingTransaction);

        expect(matchResult.matched).toBe(true);
        expect(nonMatchResult.matched).toBe(false);
      });

      it('should handle greater_than operator', async () => {
        const rule: FraudRule = {
          id: 'rule-gt',
          name: 'Greater Than Test',
          priority: 1,
          conditions: [
            { field: 'amount', operator: 'greater_than', value: 1000000 }
          ],
          action: 'flag',
          enabled: true,
        };

        const matchingTransaction = {
          amount: 2000000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        };

        const nonMatchingTransaction = {
          amount: 500000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        };

        const matchResult = await engine.evaluateRules([rule], matchingTransaction);
        const nonMatchResult = await engine.evaluateRules([rule], nonMatchingTransaction);

        expect(matchResult.matched).toBe(true);
        expect(nonMatchResult.matched).toBe(false);
      });

      it('should handle less_than operator', async () => {
        const rule: FraudRule = {
          id: 'rule-lt',
          name: 'Less Than Test',
          priority: 1,
          conditions: [
            { field: 'amount', operator: 'less_than', value: 100000 }
          ],
          action: 'flag',
          enabled: true,
        };

        const matchingTransaction = {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        };

        const nonMatchingTransaction = {
          amount: 500000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        };

        const matchResult = await engine.evaluateRules([rule], matchingTransaction);
        const nonMatchResult = await engine.evaluateRules([rule], nonMatchingTransaction);

        expect(matchResult.matched).toBe(true);
        expect(nonMatchResult.matched).toBe(false);
      });

      it('should handle contains operator', async () => {
        const rule: FraudRule = {
          id: 'rule-contains',
          name: 'Contains Test',
          priority: 1,
          conditions: [
            { field: 'merchantCategory', operator: 'contains', value: 'gambl' }
          ],
          action: 'flag',
          enabled: true,
        };

        const matchingTransaction = {
          amount: 50000,
          merchantCategory: 'gambling',
          timestamp: Date.now(),
        };

        const nonMatchingTransaction = {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        };

        const matchResult = await engine.evaluateRules([rule], matchingTransaction);
        const nonMatchResult = await engine.evaluateRules([rule], nonMatchingTransaction);

        expect(matchResult.matched).toBe(true);
        expect(nonMatchResult.matched).toBe(false);
      });

      it('should handle in operator', async () => {
        const rule: FraudRule = {
          id: 'rule-in',
          name: 'In Test',
          priority: 1,
          conditions: [
            { field: 'merchantCategory', operator: 'in', value: ['gambling', 'adult', 'crypto'] }
          ],
          action: 'flag',
          enabled: true,
        };

        const matchingTransaction = {
          amount: 50000,
          merchantCategory: 'gambling',
          timestamp: Date.now(),
        };

        const nonMatchingTransaction = {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        };

        const matchResult = await engine.evaluateRules([rule], matchingTransaction);
        const nonMatchResult = await engine.evaluateRules([rule], nonMatchingTransaction);

        expect(matchResult.matched).toBe(true);
        expect(nonMatchResult.matched).toBe(false);
      });
    });

    describe('Complex Conditions', () => {
      it('should evaluate AND conditions', async () => {
        const rule: FraudRule = {
          id: 'rule-and',
          name: 'AND Condition Test',
          priority: 1,
          conditions: [
            { field: 'amount', operator: 'greater_than', value: 1000000 },
            { field: 'merchantCategory', operator: 'equals', value: 'gambling' },
          ],
          action: 'flag',
          enabled: true,
        };

        const matchingTransaction = {
          amount: 2000000,
          merchantCategory: 'gambling',
          timestamp: Date.now(),
        };

        const partiallyMatchingTransaction = {
          amount: 2000000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        };

        const matchResult = await engine.evaluateRules([rule], matchingTransaction);
        const partialResult = await engine.evaluateRules([rule], partiallyMatchingTransaction);

        expect(matchResult.matched).toBe(true);
        expect(partialResult.matched).toBe(false);
      });

      it('should evaluate multiple conditions', async () => {
        const rule: FraudRule = {
          id: 'rule-multi',
          name: 'Multiple Conditions',
          priority: 1,
          conditions: [
            { field: 'amount', operator: 'greater_than', value: 1000000 },
            { field: 'merchantCategory', operator: 'in', value: ['gambling', 'adult'] },
            { field: 'timestamp', operator: 'greater_than', value: Date.now() - 86400000 },
          ],
          action: 'flag',
          enabled: true,
        };

        const transaction = {
          amount: 2000000,
          merchantCategory: 'gambling',
          timestamp: Date.now(),
        };

        const result = await engine.evaluateRules([rule], transaction);

        expect(result.matched).toBe(true);
      });
    });

    describe('Rule Priority', () => {
      it('should respect rule priority order', async () => {
        const rules: FraudRule[] = [
          {
            id: 'rule-priority-1',
            name: 'Priority 1',
            priority: 1,
            conditions: [{ field: 'amount', operator: 'greater_than', value: 1000000 }],
            action: 'flag',
            enabled: true,
          },
          {
            id: 'rule-priority-2',
            name: 'Priority 2',
            priority: 2,
            conditions: [{ field: 'merchantCategory', operator: 'equals', value: 'gambling' }],
            action: 'flag',
            enabled: true,
          },
        ];

        const transaction = {
          amount: 2000000,
          merchantCategory: 'gambling',
          timestamp: Date.now(),
        };

        const result = await engine.evaluateRules(rules, transaction);

        // Both rules should match, but priority 1 should be first
        expect(result.matchedRules[0]).toBe('rule-priority-1');
      });

      it('should evaluate higher priority rules first', async () => {
        const rules: FraudRule[] = [
          {
            id: 'rule-low-priority',
            name: 'Low Priority',
            priority: 10,
            conditions: [{ field: 'amount', operator: 'greater_than', value: 100000 }],
            action: 'flag',
            enabled: true,
          },
          {
            id: 'rule-high-priority',
            name: 'High Priority',
            priority: 1,
            conditions: [{ field: 'amount', operator: 'greater_than', value: 1000000 }],
            action: 'flag',
            enabled: true,
          },
        ];

        const transaction = {
          amount: 2000000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        };

        const result = await engine.evaluateRules(rules, transaction);

        expect(result.matchedRules[0]).toBe('rule-high-priority');
      });
    });

    describe('Rule Conflicts', () => {
      it('should handle conflicting rules', async () => {
        const rules: FraudRule[] = [
          {
            id: 'rule-conflict-1',
            name: 'Conflict 1',
            priority: 1,
            conditions: [{ field: 'amount', operator: 'greater_than', value: 1000000 }],
            action: 'flag',
            enabled: true,
          },
          {
            id: 'rule-conflict-2',
            name: 'Conflict 2',
            priority: 1,
            conditions: [{ field: 'amount', operator: 'less_than', value: 500000 }],
            action: 'allow',
            enabled: true,
          },
        ];

        const transaction = {
          amount: 2000000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        };

        const result = await engine.evaluateRules(rules, transaction);

        // Should handle conflict gracefully
        expect(result).toBeDefined();
        expect(result.matchedRules).toContain('rule-conflict-1');
      });
    });

    describe('Disabled Rules', () => {
      it('should not evaluate disabled rules', async () => {
        const rule: FraudRule = {
          id: 'rule-disabled',
          name: 'Disabled Rule',
          priority: 1,
          conditions: [
            { field: 'amount', operator: 'greater_than', value: 100000 }
          ],
          action: 'flag',
          enabled: false,
        };

        const transaction = {
          amount: 2000000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        };

        const result = await engine.evaluateRules([rule], transaction);

        expect(result.matched).toBe(false);
        expect(result.matchedRules.length).toBe(0);
      });

      it('should evaluate enabled rules', async () => {
        const rule: FraudRule = {
          id: 'rule-enabled',
          name: 'Enabled Rule',
          priority: 1,
          conditions: [
            { field: 'amount', operator: 'greater_than', value: 100000 }
          ],
          action: 'flag',
          enabled: true,
        };

        const transaction = {
          amount: 2000000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        };

        const result = await engine.evaluateRules([rule], transaction);

        expect(result.matched).toBe(true);
        expect(result.matchedRules).toContain('rule-enabled');
      });
    });

    describe('Default Rules', () => {
      it('should include high amount rule', async () => {
        const rules = await engine.getDefaultRules();

        const highAmountRule = rules.find(r => r.name.includes('High Amount'));
        expect(highAmountRule).toBeDefined();
      });

      it('should include rapid transaction rule', async () => {
        const rules = await engine.getDefaultRules();

        const rapidRule = rules.find(r => r.name.includes('Rapid'));
        expect(rapidRule).toBeDefined();
      });

      it('should include high-risk merchant rule', async () => {
        const rules = await engine.getDefaultRules();

        const merchantRule = rules.find(r => r.name.includes('Merchant'));
        expect(merchantRule).toBeDefined();
      });
    });

    describe('Error Handling', () => {
      it('should handle empty rule set', async () => {
        const transaction = {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        };

        const result = await engine.evaluateRules([], transaction);

        expect(result.matched).toBe(false);
        expect(result.matchedRules.length).toBe(0);
      });

      it('should handle null transaction', async () => {
        const rule: FraudRule = {
          id: 'rule-null',
          name: 'Null Test',
          priority: 1,
          conditions: [{ field: 'amount', operator: 'greater_than', value: 100000 }],
          action: 'flag',
          enabled: true,
        };

        expect(async () => {
          await engine.evaluateRules([rule], null as any);
        }).not.toThrow();
      });

      it('should handle invalid rule', async () => {
        const rule: any = {
          id: 'rule-invalid',
          // Missing required fields
        };

        const transaction = {
          amount: 50000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        };

        expect(async () => {
          await engine.evaluateRules([rule], transaction);
        }).not.toThrow();
      });

      it('should handle missing transaction fields', async () => {
        const rule: FraudRule = {
          id: 'rule-missing',
          name: 'Missing Fields',
          priority: 1,
          conditions: [{ field: 'amount', operator: 'greater_than', value: 100000 }],
          action: 'flag',
          enabled: true,
        };

        const transaction: any = {
          merchantCategory: 'grocery',
          // Missing amount
        };

        const result = await engine.evaluateRules([rule], transaction);

        expect(result).toBeDefined();
      });
    });

    describe('Edge Cases', () => {
      it('should handle very large rule set', async () => {
        const rules: FraudRule[] = [];

        for (let i = 0; i < 1000; i++) {
          rules.push({
            id: `rule-${i}`,
            name: `Rule ${i}`,
            priority: i,
            conditions: [{ field: 'amount', operator: 'greater_than', value: i * 1000 }],
            action: 'flag',
            enabled: true,
          });
        }

        const transaction = {
          amount: 2000000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        };

        const result = await engine.evaluateRules(rules, transaction);

        expect(result).toBeDefined();
        expect(result.matchedRules.length).toBeGreaterThan(0);
      });

      it('should handle rules with same priority', async () => {
        const rules: FraudRule[] = [
          {
            id: 'rule-same-1',
            name: 'Same Priority 1',
            priority: 1,
            conditions: [{ field: 'amount', operator: 'greater_than', value: 1000000 }],
            action: 'flag',
            enabled: true,
          },
          {
            id: 'rule-same-2',
            name: 'Same Priority 2',
            priority: 1,
            conditions: [{ field: 'merchantCategory', operator: 'equals', value: 'gambling' }],
            action: 'flag',
            enabled: true,
          },
        ];

        const transaction = {
          amount: 2000000,
          merchantCategory: 'gambling',
          timestamp: Date.now(),
        };

        const result = await engine.evaluateRules(rules, transaction);

        expect(result.matched).toBe(true);
        expect(result.matchedRules.length).toBe(2);
      });
    });

    describe('Performance', () => {
      it('should evaluate rules quickly', async () => {
        const rule: FraudRule = {
          id: 'rule-perf',
          name: 'Performance Test',
          priority: 1,
          conditions: [
            { field: 'amount', operator: 'greater_than', value: 1000000 }
          ],
          action: 'flag',
          enabled: true,
        };

        const transaction = {
          amount: 2000000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        };

        const startTime = performance.now();
        await engine.evaluateRules([rule], transaction);
        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(50);
      });

      it('should handle concurrent rule evaluations', async () => {
        const rule: FraudRule = {
          id: 'rule-concurrent',
          name: 'Concurrent Test',
          priority: 1,
          conditions: [
            { field: 'amount', operator: 'greater_than', value: 1000000 }
          ],
          action: 'flag',
          enabled: true,
        };

        const promises = [];

        for (let i = 0; i < 100; i++) {
          promises.push(
            engine.evaluateRules([rule], {
              amount: 2000000,
              merchantCategory: 'grocery',
              timestamp: Date.now(),
            })
          );
        }

        const results = await Promise.all(promises);

        expect(results.length).toBe(100);
        results.forEach(result => {
          expect(result.matched).toBe(true);
        });
      });
    });

    describe('Event Publishing', () => {
      it('should publish rule evaluation event', async () => {
        const eventSpy = jest.spyOn(eventBus, 'publish');

        const rule: FraudRule = {
          id: 'rule-event',
          name: 'Event Test',
          priority: 1,
          conditions: [
            { field: 'amount', operator: 'greater_than', value: 1000000 }
          ],
          action: 'flag',
          enabled: true,
        };

        const transaction = {
          amount: 2000000,
          merchantCategory: 'grocery',
          timestamp: Date.now(),
        };

        await engine.evaluateRules([rule], transaction);

        expect(eventSpy).toHaveBeenCalled();
        eventSpy.mockRestore();
      });
    });
  });

  describe('addRule', () => {
    it('should add a new rule', async () => {
      const rule: FraudRule = {
        id: 'rule-add-001',
        name: 'New Rule',
        priority: 1,
        conditions: [{ field: 'amount', operator: 'greater_than', value: 1000000 }],
        action: 'flag',
        enabled: true,
      };

      await engine.addRule(rule);

      const rules = await engine.getRules();
      expect(rules.some(r => r.id === 'rule-add-001')).toBe(true);
    });
  });

  describe('updateRule', () => {
    it('should update an existing rule', async () => {
      const rule: FraudRule = {
        id: 'rule-update-001',
        name: 'Original Name',
        priority: 1,
        conditions: [{ field: 'amount', operator: 'greater_than', value: 1000000 }],
        action: 'flag',
        enabled: true,
      };

      await engine.addRule(rule);

      const updatedRule = { ...rule, name: 'Updated Name' };
      await engine.updateRule(updatedRule);

      const rules = await engine.getRules();
      const updated = rules.find(r => r.id === 'rule-update-001');
      expect(updated?.name).toBe('Updated Name');
    });
  });

  describe('deleteRule', () => {
    it('should delete a rule', async () => {
      const rule: FraudRule = {
        id: 'rule-delete-001',
        name: 'To Delete',
        priority: 1,
        conditions: [{ field: 'amount', operator: 'greater_than', value: 1000000 }],
        action: 'flag',
        enabled: true,
      };

      await engine.addRule(rule);
      await engine.deleteRule('rule-delete-001');

      const rules = await engine.getRules();
      expect(rules.some(r => r.id === 'rule-delete-001')).toBe(false);
    });
  });

  describe('getRules', () => {
    it('should return all rules', async () => {
      const rules = await engine.getRules();

      expect(Array.isArray(rules)).toBe(true);
      expect(rules.length).toBeGreaterThanOrEqual(0);
    });
  });
});
