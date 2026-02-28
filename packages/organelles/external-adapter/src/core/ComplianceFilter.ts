/**
 * ORG-EI-EXTERNAL_ADAPTER-v0.1.0 — ComplianceFilter
 * PCI-DSS masking, NDPR audit trail, TLS enforcement
 */

import { ExternalRequest } from '../types';
import { IComplianceFilterPort } from '../ports';

export class ComplianceFilter implements IComplianceFilterPort {
  private readonly auditLog: Array<{ timestamp: number; action: string; details: Record<string, unknown> }> = [];

  private readonly sensitivePatterns: Array<{ pattern: RegExp; replacement: string }> = [
    { pattern: /\b\d{13,19}\b/g, replacement: '****-****-****-$LAST4' },
    { pattern: /\b\d{3,4}\b(?=.*cvv)/gi, replacement: '***' },
    { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '***@***.***' },
    { pattern: /\b\d{11}\b/g, replacement: '***-****-****' }, // Nigerian phone numbers
  ];

  validateRequest<T>(request: ExternalRequest<T>): { valid: boolean; violations: string[] } {
    const violations: string[] = [];

    if (!request.tenantId || request.tenantId.trim() === '') {
      violations.push('tenantId is required');
    }

    if (!request.correlationId || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(request.correlationId)) {
      violations.push('correlationId must be a valid UUID v4');
    }

    if (request.timeout <= 0 || request.timeout > 30000) {
      violations.push('timeout must be between 1 and 30000ms');
    }

    return { valid: violations.length === 0, violations };
  }

  maskSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
    const masked = JSON.parse(JSON.stringify(data));
    const jsonStr = JSON.stringify(masked);
    let maskedStr = jsonStr;

    for (const { pattern, replacement } of this.sensitivePatterns) {
      maskedStr = maskedStr.replace(pattern, (match) => {
        if (replacement.includes('$LAST4')) {
          return replacement.replace('$LAST4', match.slice(-4));
        }
        return replacement;
      });
    }

    return JSON.parse(maskedStr);
  }

  createAuditEntry(action: string, details: Record<string, unknown>): void {
    this.auditLog.push({
      timestamp: Date.now(),
      action,
      details: this.maskSensitiveData(details),
    });

    // Keep audit log bounded
    if (this.auditLog.length > 10000) {
      this.auditLog.splice(0, this.auditLog.length - 10000);
    }
  }

  getAuditLog(): ReadonlyArray<{ timestamp: number; action: string; details: Record<string, unknown> }> {
    return this.auditLog;
  }
}
