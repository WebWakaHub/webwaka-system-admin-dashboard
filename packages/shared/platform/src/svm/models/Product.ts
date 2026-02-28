/**
 * Product Model for SVM
 * Represents a product managed by an MVM
 */

import { Money } from '../../commerce/primitives/Money';

export interface SVMProduct {
  readonly productId: string;
  readonly accountId: string;
  name: string;
  description: string;
  price: Money;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class SVMProductModel implements SVMProduct {
  readonly productId: string;
  readonly accountId: string;
  name: string;
  description: string;
  price: Money;
  images: string[];
  createdAt: Date;
  updatedAt: Date;

  constructor(
    productId: string,
    accountId: string,
    name: string,
    description: string,
    price: Money,
    images: string[] = []
  ) {
    this.productId = productId;
    this.accountId = accountId;
    this.name = name;
    this.description = description;
    this.price = price;
    this.images = images;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  updateDetails(name: string, description: string, price: Money): void {
    this.name = name;
    this.description = description;
    this.price = price;
    this.updatedAt = new Date();
  }

  updateImages(images: string[]): void {
    this.images = images;
    this.updatedAt = new Date();
  }

  toJSON(): Record<string, unknown> {
    return {
      productId: this.productId,
      accountId: this.accountId,
      name: this.name,
      description: this.description,
      price: this.price.toJSON(),
      images: this.images,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
