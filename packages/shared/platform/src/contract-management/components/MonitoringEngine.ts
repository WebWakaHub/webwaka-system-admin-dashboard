import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface Milestone {
  id: string;
  contractId: string;
  name: string;
  dueDate: Date;
  description: string;
  status: 'pending' | 'completed' | 'overdue' | 'at_risk';
  completedDate?: Date;
  notes: string;
}

export interface ComplianceCheck {
  id: string;
  contractId: string;
  checkType: string;
  status: 'passed' | 'failed' | 'pending' | 'warning';
  result: string;
  timestamp: Date;
  details: Record<string, any>;
}

export interface PerformanceMetric {
  id: string;
  contractId: string;
  metricName: string;
  targetValue: number;
  actualValue: number;
  unit: string;
  status: 'on_track' | 'at_risk' | 'failed';
  timestamp: Date;
}

export class MonitoringEngine extends EventEmitter {
  private milestones: Map<string, Milestone> = new Map();
  private complianceChecks: Map<string, ComplianceCheck> = new Map();
  private performanceMetrics: Map<string, PerformanceMetric> = new Map();
  private contractMilestones: Map<string, Milestone[]> = new Map();
  private contractChecks: Map<string, ComplianceCheck[]> = new Map();
  private contractMetrics: Map<string, PerformanceMetric[]> = new Map();

  constructor() {
    super();
  }

  /**
   * Add milestone
   */
  async addMilestone(
    contractId: string,
    data: Partial<Milestone>
  ): Promise<Milestone> {
    const milestone: Milestone = {
      id: uuidv4(),
      contractId,
      name: data.name || '',
      dueDate: data.dueDate || new Date(),
      description: data.description || '',
      status: 'pending',
      notes: data.notes || ''
    };

    this.milestones.set(milestone.id, milestone);
    const milestones = this.contractMilestones.get(contractId) || [];
    milestones.push(milestone);
    this.contractMilestones.set(contractId, milestones);

    this.emit('milestone:added', milestone);

    return milestone;
  }

  /**
   * Update milestone status
   */
  async updateMilestoneStatus(
    milestoneId: string,
    status: 'pending' | 'completed' | 'overdue' | 'at_risk',
    notes?: string
  ): Promise<Milestone> {
    const milestone = this.milestones.get(milestoneId);
    if (!milestone) {
      throw new Error('Milestone not found');
    }

    milestone.status = status;
    if (status === 'completed') {
      milestone.completedDate = new Date();
    }
    if (notes) {
      milestone.notes = notes;
    }

    this.milestones.set(milestoneId, milestone);
    this.emit('milestone:updated', milestone);

    return milestone;
  }

  /**
   * Get contract milestones
   */
  async getContractMilestones(contractId: string): Promise<Milestone[]> {
    return this.contractMilestones.get(contractId) || [];
  }

  /**
   * Add compliance check
   */
  async addComplianceCheck(
    contractId: string,
    data: Partial<ComplianceCheck>
  ): Promise<ComplianceCheck> {
    const check: ComplianceCheck = {
      id: uuidv4(),
      contractId,
      checkType: data.checkType || '',
      status: data.status || 'pending',
      result: data.result || '',
      timestamp: new Date(),
      details: data.details || {}
    };

    this.complianceChecks.set(check.id, check);
    const checks = this.contractChecks.get(contractId) || [];
    checks.push(check);
    this.contractChecks.set(contractId, checks);

    this.emit('compliance:checked', check);

    return check;
  }

  /**
   * Get contract compliance checks
   */
  async getContractComplianceChecks(contractId: string): Promise<ComplianceCheck[]> {
    return this.contractChecks.get(contractId) || [];
  }

  /**
   * Add performance metric
   */
  async addPerformanceMetric(
    contractId: string,
    data: Partial<PerformanceMetric>
  ): Promise<PerformanceMetric> {
    const metric: PerformanceMetric = {
      id: uuidv4(),
      contractId,
      metricName: data.metricName || '',
      targetValue: data.targetValue || 0,
      actualValue: data.actualValue || 0,
      unit: data.unit || '',
      status: this.calculateMetricStatus(data.targetValue || 0, data.actualValue || 0),
      timestamp: new Date()
    };

    this.performanceMetrics.set(metric.id, metric);
    const metrics = this.contractMetrics.get(contractId) || [];
    metrics.push(metric);
    this.contractMetrics.set(contractId, metrics);

    this.emit('metric:added', metric);

    return metric;
  }

  /**
   * Get contract performance metrics
   */
  async getContractPerformanceMetrics(contractId: string): Promise<PerformanceMetric[]> {
    return this.contractMetrics.get(contractId) || [];
  }

  /**
   * Get monitoring summary
   */
  async getMonitoringSummary(contractId: string): Promise<{
    milestones: Milestone[];
    complianceChecks: ComplianceCheck[];
    performanceMetrics: PerformanceMetric[];
    overallStatus: string;
  }> {
    const milestones = await this.getContractMilestones(contractId);
    const complianceChecks = await this.getContractComplianceChecks(contractId);
    const performanceMetrics = await this.getContractPerformanceMetrics(contractId);

    const overallStatus = this.calculateOverallStatus(
      milestones,
      complianceChecks,
      performanceMetrics
    );

    return {
      milestones,
      complianceChecks,
      performanceMetrics,
      overallStatus
    };
  }

  /**
   * Check for overdue milestones
   */
  async checkOverdueMilestones(contractId: string): Promise<Milestone[]> {
    const milestones = await this.getContractMilestones(contractId);
    const now = new Date();
    const overdue = milestones.filter(
      m => m.dueDate < now && m.status !== 'completed'
    );

    for (const milestone of overdue) {
      if (milestone.status !== 'overdue') {
        await this.updateMilestoneStatus(milestone.id, 'overdue');
      }
    }

    return overdue;
  }

  /**
   * Calculate metric status
   */
  private calculateMetricStatus(
    targetValue: number,
    actualValue: number
  ): 'on_track' | 'at_risk' | 'failed' {
    const percentage = (actualValue / targetValue) * 100;
    if (percentage >= 90) {
      return 'on_track';
    } else if (percentage >= 70) {
      return 'at_risk';
    } else {
      return 'failed';
    }
  }

  /**
   * Calculate overall status
   */
  private calculateOverallStatus(
    milestones: Milestone[],
    complianceChecks: ComplianceCheck[],
    performanceMetrics: PerformanceMetric[]
  ): string {
    const failedMilestones = milestones.filter(m => m.status === 'overdue').length;
    const failedChecks = complianceChecks.filter(c => c.status === 'failed').length;
    const failedMetrics = performanceMetrics.filter(m => m.status === 'failed').length;

    if (failedMilestones > 0 || failedChecks > 0 || failedMetrics > 0) {
      return 'at_risk';
    }

    const atRiskMilestones = milestones.filter(m => m.status === 'at_risk').length;
    const atRiskMetrics = performanceMetrics.filter(m => m.status === 'at_risk').length;

    if (atRiskMilestones > 0 || atRiskMetrics > 0) {
      return 'warning';
    }

    return 'on_track';
  }
}
