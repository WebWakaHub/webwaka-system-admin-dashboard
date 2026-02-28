import { DataSource } from 'typeorm';
import { MemberAuditLog } from '../models/MemberAuditLog';
import { Member } from '../models/Member';

/**
 * MemberAuditLogger
 * Logs all member-related actions for compliance and debugging.
 */
export class MemberAuditLogger {
  constructor(private dataSource: DataSource) {}

  /**
   * Log member creation
   */
  async logCreate(
    tenantId: string,
    memberId: string,
    member: Member,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const auditLog = this.dataSource.getRepository(MemberAuditLog).create({
      tenantId,
      memberId,
      action: 'create',
      oldValues: null,
      newValues: this.sanitizeMemberData(member),
      changedBy: userId,
      ipAddress,
      userAgent,
    });

    await this.dataSource.getRepository(MemberAuditLog).save(auditLog);
  }

  /**
   * Log member update
   */
  async logUpdate(
    tenantId: string,
    memberId: string,
    oldMember: Member,
    newMember: Member,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const auditLog = this.dataSource.getRepository(MemberAuditLog).create({
      tenantId,
      memberId,
      action: 'update',
      oldValues: this.sanitizeMemberData(oldMember),
      newValues: this.sanitizeMemberData(newMember),
      changedBy: userId,
      ipAddress,
      userAgent,
    });

    await this.dataSource.getRepository(MemberAuditLog).save(auditLog);
  }

  /**
   * Log member deletion
   */
  async logDelete(
    tenantId: string,
    memberId: string,
    member: Member,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const auditLog = this.dataSource.getRepository(MemberAuditLog).create({
      tenantId,
      memberId,
      action: 'delete',
      oldValues: this.sanitizeMemberData(member),
      newValues: null,
      changedBy: userId,
      ipAddress,
      userAgent,
    });

    await this.dataSource.getRepository(MemberAuditLog).save(auditLog);
  }

  /**
   * Log member status change
   */
  async logStatusChange(
    tenantId: string,
    memberId: string,
    oldStatus: string,
    newStatus: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const auditLog = this.dataSource.getRepository(MemberAuditLog).create({
      tenantId,
      memberId,
      action: 'status_change',
      oldValues: { status: oldStatus },
      newValues: { status: newStatus },
      changedBy: userId,
      ipAddress,
      userAgent,
    });

    await this.dataSource.getRepository(MemberAuditLog).save(auditLog);
  }

  /**
   * Sanitize member data for audit log (remove sensitive fields)
   */
  private sanitizeMemberData(member: Member): Record<string, any> {
    const { version, createdBy, updatedBy, ...sanitized } = member as any;
    return sanitized;
  }

  /**
   * Get audit logs for a member
   */
  async getAuditLogs(
    tenantId: string,
    memberId: string,
    limit: number = 50
  ): Promise<MemberAuditLog[]> {
    return await this.dataSource.getRepository(MemberAuditLog).find({
      where: { tenantId, memberId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
