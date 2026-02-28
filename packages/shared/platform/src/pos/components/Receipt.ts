import { v4 as uuidv4 } from 'uuid';
import { Sale, SaleItem } from '../models/Sale';

/**
 * Represents a receipt for a sale
 */
export class Receipt {
  readonly id: string;
  readonly saleId: string;
  readonly receiptNumber: string;
  readonly merchantName: string;
  readonly merchantAddress?: string;
  readonly merchantPhone?: string;
  readonly items: SaleItem[];
  readonly subtotal: number;
  readonly discount: number;
  readonly tax: number;
  readonly total: number;
  readonly paymentMethod: string;
  readonly amountPaid: number;
  readonly change: number;
  readonly customerName?: string;
  readonly customerPhone?: string;
  readonly createdAt: Date;
  printedAt?: Date;
  emailedAt?: Date;
  smsedAt?: Date;

  constructor(
    sale: Sale,
    receiptNumber: string,
    merchantName: string,
    merchantAddress?: string,
    merchantPhone?: string,
    customerName?: string,
    customerPhone?: string
  ) {
    this.id = uuidv4();
    this.saleId = sale.id;
    this.receiptNumber = receiptNumber;
    this.merchantName = merchantName;
    this.merchantAddress = merchantAddress;
    this.merchantPhone = merchantPhone;
    this.items = sale.items;
    this.subtotal = sale.items.reduce((sum, item) => sum + item.total, 0);
    this.discount = sale.discount?.amount || 0;
    this.tax = sale.tax.amount;
    this.total = sale.total.amount;
    this.paymentMethod = sale.paymentMethod;
    this.amountPaid = sale.amountPaid.amount;
    this.change = sale.getChange()?.amount || 0;
    this.customerName = customerName;
    this.customerPhone = customerPhone;
    this.createdAt = new Date();
  }

  /**
   * Generate text receipt
   */
  generateText(): string {
    let text = '';
    text += `${'='.repeat(40)}\n`;
    text += `${this.merchantName.padStart(20 + this.merchantName.length / 2)}\n`;
    if (this.merchantAddress) {
      text += `${this.merchantAddress.padStart(20 + this.merchantAddress.length / 2)}\n`;
    }
    if (this.merchantPhone) {
      text += `${this.merchantPhone.padStart(20 + this.merchantPhone.length / 2)}\n`;
    }
    text += `${'='.repeat(40)}\n`;
    text += `Receipt #: ${this.receiptNumber}\n`;
    text += `Date: ${this.createdAt.toLocaleString()}\n`;
    if (this.customerName) {
      text += `Customer: ${this.customerName}\n`;
    }
    text += `${'='.repeat(40)}\n`;

    // Items
    text += `${'Item'.padEnd(20)} ${'Qty'.padEnd(5)} ${'Price'.padEnd(10)}\n`;
    text += `${'-'.repeat(40)}\n`;
    for (const item of this.items) {
      text += `${item.productName.substring(0, 20).padEnd(20)} ${item.quantity.toString().padEnd(5)} ${item.total.toFixed(2).padEnd(10)}\n`;
    }
    text += `${'-'.repeat(40)}\n`;

    // Totals
    text += `Subtotal: ${this.subtotal.toFixed(2).padStart(30)}\n`;
    if (this.discount > 0) {
      text += `Discount: -${this.discount.toFixed(2).padStart(28)}\n`;
    }
    text += `Tax: ${this.tax.toFixed(2).padStart(35)}\n`;
    text += `${'='.repeat(40)}\n`;
    text += `Total: ${this.total.toFixed(2).padStart(34)}\n`;
    text += `Payment Method: ${this.paymentMethod}\n`;
    text += `Amount Paid: ${this.amountPaid.toFixed(2).padStart(28)}\n`;
    if (this.change > 0) {
      text += `Change: ${this.change.toFixed(2).padStart(31)}\n`;
    }
    text += `${'='.repeat(40)}\n`;
    text += `Thank you for your purchase!\n`;
    text += `${'='.repeat(40)}\n`;

    return text;
  }

  /**
   * Generate HTML receipt
   */
  generateHTML(): string {
    let html = `
      <html>
        <head>
          <title>Receipt #${this.receiptNumber}</title>
          <style>
            body { font-family: monospace; margin: 20px; }
            .receipt { max-width: 400px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .items { margin: 20px 0; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .totals { border-top: 1px solid #000; margin-top: 10px; padding-top: 10px; }
            .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
            .total-amount { font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2>${this.merchantName}</h2>
              ${this.merchantAddress ? `<p>${this.merchantAddress}</p>` : ''}
              ${this.merchantPhone ? `<p>${this.merchantPhone}</p>` : ''}
              <p>Receipt #: ${this.receiptNumber}</p>
              <p>${this.createdAt.toLocaleString()}</p>
            </div>
            <div class="items">
    `;

    for (const item of this.items) {
      html += `
        <div class="item">
          <span>${item.productName} x${item.quantity}</span>
          <span>${item.total.toFixed(2)}</span>
        </div>
      `;
    }

    html += `
            </div>
            <div class="totals">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>${this.subtotal.toFixed(2)}</span>
              </div>
    `;

    if (this.discount > 0) {
      html += `
        <div class="total-row">
          <span>Discount:</span>
          <span>-${this.discount.toFixed(2)}</span>
        </div>
      `;
    }

    html += `
              <div class="total-row">
                <span>Tax:</span>
                <span>${this.tax.toFixed(2)}</span>
              </div>
              <div class="total-row total-amount">
                <span>Total:</span>
                <span>${this.total.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Payment Method:</span>
                <span>${this.paymentMethod}</span>
              </div>
              <div class="total-row">
                <span>Amount Paid:</span>
                <span>${this.amountPaid.toFixed(2)}</span>
              </div>
    `;

    if (this.change > 0) {
      html += `
        <div class="total-row">
          <span>Change:</span>
          <span>${this.change.toFixed(2)}</span>
        </div>
      `;
    }

    html += `
            </div>
            <p style="text-align: center; margin-top: 20px;">Thank you for your purchase!</p>
          </div>
        </body>
      </html>
    `;

    return html;
  }

  /**
   * Mark as printed
   */
  markPrinted(): void {
    this.printedAt = new Date();
  }

  /**
   * Mark as emailed
   */
  markEmailed(): void {
    this.emailedAt = new Date();
  }

  /**
   * Mark as SMS sent
   */
  markSmsSent(): void {
    this.smsedAt = new Date();
  }
}
