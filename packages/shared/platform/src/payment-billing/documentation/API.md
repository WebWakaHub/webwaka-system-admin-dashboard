# Payment & Billing System - API

**Date:** 2026-02-12  
**Module:** Payment & Billing System  
**Author:** webwakaagent3 (Documentation)

---

## 1. Overview

The Payment & Billing System exposes a RESTful API for managing payments, subscriptions, and invoices. All endpoints are protected by authentication and permission checks.

## 2. Endpoints

### 2.1 Payments

**POST /payments/initialize**

- **Description**: Initialize a one-time payment.
- **Request Body**:
  ```json
  {
    "amount": 500000,
    "currency": "NGN",
    "email": "user@example.com",
    "gateway": "paystack"
  }
  ```
- **Response**:
  ```json
  {
    "payment": { ... },
    "authorizationUrl": "https://checkout.paystack.com/xxx"
  }
  ```

**POST /payments/verify/:reference**

- **Description**: Verify a payment after the user completes checkout.
- **Response**:
  ```json
  {
    "payment": { ... }
  }
  ```

**GET /payments/:id**

- **Description**: Get a payment by ID.

**GET /payments**

- **Description**: List all payments for the current user.

### 2.2 Subscriptions

**POST /subscriptions**

- **Description**: Create a new subscription.
- **Request Body**:
  ```json
  {
    "planId": "plan-pro-monthly",
    "customerId": "cus_xxx",
    "trialPeriodDays": 14
  }
  ```

**GET /subscriptions/:id**

- **Description**: Get a subscription by ID.

**GET /subscriptions**

- **Description**: List all subscriptions for the current user.

**PUT /subscriptions/:id/plan**

- **Description**: Update a subscription's plan (upgrade/downgrade).
- **Request Body**:
  ```json
  {
    "newPlanId": "plan-enterprise-monthly"
  }
  ```

**POST /subscriptions/:id/cancel**

- **Description**: Cancel a subscription.
- **Request Body**:
  ```json
  {
    "cancelAtPeriodEnd": true
  }
  ```

### 2.3 Invoices

**GET /invoices/:id**

- **Description**: Get an invoice by ID.

**GET /invoices**

- **Description**: List all invoices for the current user.

### 2.4 Webhooks

**POST /webhooks/:gateway**

- **Description**: Handle incoming webhooks from payment gateways.
- **Headers**:
  - `x-paystack-signature`: The webhook signature from Paystack.
  - `x-flutterwave-signature`: The webhook signature from Flutterwave.

## 3. Events

The module emits the following events:

- `payment.initialized`
- `payment.success`
- `payment.failed`
- `subscription.created`
- `subscription.updated`
- `subscription.canceled`
- `invoice.created`
- `invoice.paid`
