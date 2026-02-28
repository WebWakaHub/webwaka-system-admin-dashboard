/**
 * InvoiceService - Manages invoice generation and delivery
 */

import { Invoice, InvoiceStatus, InvoiceLineItem } from '../types';
import { InvoiceNotFoundError } from '../errors';

export class InvoiceService {
  constructor(
    private database: any,
    private eventBus: any
  ) {}

  /**
   * Create an invoice
   */
  async createInvoice(
    tenantId: string,
    userId: string,
    params: {
      subscriptionId?: string;
      paymentId?: string;
      lineItems: InvoiceLineItem[];
      currency: string;
      dueDate?: Date;
    }
  ): Promise<Invoice> {
    const subtotal = params.lineItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = 0; // Tax calculation out of scope
    const total = subtotal + tax;

    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      tenantId,
      userId,
      subscriptionId: params.subscriptionId,
      paymentId: params.paymentId,
      invoiceNumber: `INV-${Date.now()}`,
      status: InvoiceStatus.OPEN,
      subtotal,
      tax,
      total,
      currency: params.currency,
      lineItems: params.lineItems,
      dueDate: params.dueDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.database.query(
      `INSERT INTO invoices (id, tenant_id, user_id, subscription_id, payment_id, invoice_number, status, subtotal, tax, total, currency, line_items, due_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        invoice.id,
        invoice.tenantId,
        invoice.userId,
        invoice.subscriptionId,
        invoice.paymentId,
        invoice.invoiceNumber,
        invoice.status,
        invoice.subtotal,
        invoice.tax,
        invoice.total,
        invoice.currency,
        JSON.stringify(invoice.lineItems),
        invoice.dueDate,
        invoice.createdAt,
        invoice.updatedAt,
      ]
    );

    // Emit event
    await this.eventBus.publish('invoice.created', {
      invoiceId: invoice.id,
      tenantId,
      userId,
      total: invoice.total,
      currency: invoice.currency,
    });

    return invoice;
  }

  /**
   * Mark invoice as paid
   */
  async markInvoiceAsPaid(
    tenantId: string,
    invoiceId: string,
    paymentId: string
  ): Promise<Invoice> {
    const invoice = await this.getInvoice(tenantId, invoiceId);

    invoice.status = InvoiceStatus.PAID;
    invoice.paymentId = paymentId;
    invoice.paidAt = new Date();
    invoice.updatedAt = new Date();

    await this.database.query(
      `UPDATE invoices SET status = $1, payment_id = $2, paid_at = $3, updated_at = $4 WHERE id = $5`,
      [invoice.status, invoice.paymentId, invoice.paidAt, invoice.updatedAt, invoice.id]
    );

    // Emit event
    await this.eventBus.publish('invoice.paid', {
      invoiceId: invoice.id,
      tenantId,
      userId: invoice.userId,
      paymentId,
    });

    return invoice;
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(tenantId: string, invoiceId: string): Promise<Invoice> {
    const result = await this.database.query(
      `SELECT * FROM invoices WHERE tenant_id = $1 AND id = $2`,
      [tenantId, invoiceId]
    );

    if (result.rows.length === 0) {
      throw new InvoiceNotFoundError(invoiceId);
    }

    return this.mapRowToInvoice(result.rows[0]);
  }

  /**
   * List invoices for a user
   */
  async listInvoices(tenantId: string, userId: string): Promise<Invoice[]> {
    const result = await this.database.query(
      `SELECT * FROM invoices WHERE tenant_id = $1 AND user_id = $2 ORDER BY created_at DESC`,
      [tenantId, userId]
    );

    return result.rows.map(this.mapRowToInvoice);
  }

  private mapRowToInvoice(row: any): Invoice {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      userId: row.user_id,
      subscriptionId: row.subscription_id,
      paymentId: row.payment_id,
      invoiceNumber: row.invoice_number,
      status: row.status,
      subtotal: row.subtotal,
      tax: row.tax,
      total: row.total,
      currency: row.currency,
      lineItems: JSON.parse(row.line_items || '[]'),
      dueDate: row.due_date,
      paidAt: row.paid_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
