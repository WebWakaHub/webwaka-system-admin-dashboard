# Payment & Billing System Specification

**Module ID:** Module 3
**Module Name:** Payment & Billing System
**Version:** 1.0
**Date:** 2026-02-12
**Status:** DRAFT
**Author:** webwakaagent3 (Architecture)
**Reviewers:** webwakaagent4 (Engineering), webwakaagent5 (Quality)

---

## 1. Module Overview

### 1.1 Purpose

To provide a robust, reliable, and secure system for processing payments, managing subscriptions, and handling all billing-related operations for the WebWaka platform. This module is critical for monetizing services and ensuring a seamless financial experience for users and tenants.

### 1.2 Scope

**In Scope:**
- Integration with Nigerian payment gateways (Paystack, Flutterwave).
- Processing one-time payments for products and services.
- Managing subscription plans (e.g., monthly, yearly).
- Handling recurring billing cycles for subscriptions.
- Generating and sending invoices to customers.
- Securely managing customer payment methods.
- Providing a history of transactions and invoices for users.

**Out of Scope:**
- Tax calculation and remittance.
- Management of physical goods or shipping.
- Cryptocurrency payments.
- Advanced fraud detection beyond what is provided by the payment gateways.

### 1.3 Success Criteria

- [ ] A user can successfully subscribe to a monthly plan using Paystack.
- [ ] The system automatically handles a recurring monthly payment without manual intervention.
- [ ] An invoice is automatically generated and sent to the user after a successful payment.

---

## 2. Requirements

### 2.1 Functional Requirements

**FR-1: Payment Gateway Integration**
- **Description:** The system must integrate with at least two major Nigerian payment gateways: Paystack and Flutterwave.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] Users can choose between Paystack or Flutterwave at checkout.
  - [ ] The system can process payments from both gateways successfully.

**FR-2: One-Time Payments**
- **Description:** Users must be able to make one-time payments for specific products or services.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] An API endpoint exists to initiate a one-time payment.
  - [ ] The system records a successful transaction after payment.

**FR-3: Subscription Management**
- **Description:** The system must support the creation and management of subscription plans and handle user subscriptions to these plans.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] Admins can create, update, and delete subscription plans (e.g., Basic, Pro, Premium).
  - [ ] Users can subscribe to, upgrade, downgrade, and cancel plans.

**FR-4: Recurring Billing**
- **Description:** The system must automatically charge users for their recurring subscriptions based on the billing cycle (e.g., monthly, yearly).
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] A scheduled job runs daily to process due subscriptions.
  - [ ] The system attempts to charge the user's saved payment method.
  - [ ] The subscription status is updated based on the payment outcome (e.g., `active`, `past_due`).

**FR-5: Invoicing**
- **Description:** The system must generate and send invoices to users after each successful payment.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] An invoice is created in the database for every transaction.
  - [ ] A PDF version of the invoice is generated.
  - [ ] The PDF invoice is sent to the user's registered email address.

### 2.2 Non-Functional Requirements

**NFR-1: Security**
- **Requirement:** All payment data must be handled in a PCI-DSS compliant manner. Sensitive data like credit card numbers must never be stored on our servers.

**NFR-2: Reliability**
- **Requirement:** The system must have an uptime of 99.95%. Payment processing must be highly reliable to prevent loss of revenue.

**NFR-3: Scalability**
- **Requirement:** The system must be able to handle a high volume of concurrent transactions during peak periods.

---

## 3. Architecture

### 3.1 High-Level Architecture

The Payment & Billing System will be built around a set of core services that interact with external payment gateways through a provider-based abstraction.

**Components:**
1.  **Payment Gateway Provider:** An interface that defines the contract for interacting with any payment gateway. Concrete implementations will be created for Paystack and Flutterwave.
2.  **Payment Service:** Handles the initiation and processing of one-time and recurring payments through the gateway provider.
3.  **Subscription Service:** Manages the lifecycle of user subscriptions (create, update, cancel, status changes).
4.  **Billing Service:** A scheduled service responsible for triggering recurring payments and generating invoices.
5.  **Invoice Service:** Manages the creation, storage, and delivery of invoices.

**Data Flow (Recurring Payment):**
1.  The Billing Service's scheduled job identifies a subscription due for renewal.
2.  It requests the Subscription Service to process the renewal.
3.  The Subscription Service retrieves the user's payment method and requests the Payment Service to create a charge.
4.  The Payment Service uses the appropriate Payment Gateway Provider to process the charge.
5.  The gateway returns a success or failure response.
6.  The Payment Service updates the transaction status and informs the Subscription Service.
7.  The Subscription Service updates the subscription status (`active` or `past_due`).
8.  The Invoice Service generates an invoice and sends it to the user.

### 3.2 Design Patterns

- **Strategy Pattern:** The Payment Gateway Provider uses the strategy pattern to allow for the easy addition of new payment gateways without changing the core services.
- **State Pattern:** The Subscription entity will use a state pattern to manage its lifecycle (e.g., `trialing`, `active`, `past_due`, `canceled`).

---

## 4. API Specification

### 4.1 REST API Endpoints

#### Initiate Payment
- **Method:** POST
- **Path:** `/api/v1/payments/initiate`
- **Description:** Initiates a one-time payment and returns a payment link.

#### Subscribe to Plan
- **Method:** POST
- **Path:** `/api/v1/subscriptions`
- **Description:** Subscribes a user to a specific plan.

#### Get Subscription
- **Method:** GET
- **Path:** `/api/v1/subscriptions/:subscriptionId`
- **Description:** Retrieves details of a specific subscription.

#### List Invoices
- **Method:** GET
- **Path:** `/api/v1/invoices`
- **Description:** Retrieves a list of invoices for the current user.

---

## 5. Data Model

### 5.1 Entities

- **Product:** Represents a service that can be subscribed to.
- **Plan:** Defines the pricing and billing cycle for a product (e.g., Pro Plan - ₦5,000/month).
- **Subscription:** Represents a user's subscription to a specific plan.
- **Payment:** Records a single payment transaction.
- **Invoice:** Represents a bill for a specific period, containing line items.
- **Customer:** Stores customer information from the payment gateway (e.g., customer ID, saved payment methods).

### 5.2 Database Schema

```sql
CREATE TABLE products (id UUID, name TEXT, ...);
CREATE TABLE plans (id UUID, product_id UUID, price BIGINT, currency VARCHAR(3), interval VARCHAR(50), ...);
CREATE TABLE subscriptions (id UUID, user_id UUID, plan_id UUID, status VARCHAR(50), ...);
CREATE TABLE payments (id UUID, user_id UUID, amount BIGINT, currency VARCHAR(3), status VARCHAR(50), gateway VARCHAR(50), ...);
CREATE TABLE invoices (id UUID, user_id UUID, subscription_id UUID, status VARCHAR(50), total BIGINT, ...);
```

---

## 6. Dependencies

- **User & Identity Management:** To associate payments and subscriptions with users.
- **External Payment Gateways:** Paystack, Flutterwave.

---

## 7. Compliance

- **Nigerian-First:** MUST support NGN currency and integrate with Paystack and Flutterwave.
- **Security:** MUST be PCI-DSS compliant. No sensitive card details will be stored locally.
- **Data Privacy:** MUST be NDPR compliant.

---

## 8. Testing Requirements

- **Unit Testing:** All services must have 100% unit test coverage.
- **Integration Testing:** Test the full payment and subscription lifecycle with mock payment gateway responses.
- **End-to-End Testing:** Conduct tests with real (sandboxed) payment gateway accounts to verify the entire flow.

---

## 9. Documentation Requirements

- **Module Documentation:** README, ARCHITECTURE, API docs.
- **User Documentation:** A guide for users on how to manage their subscriptions and view their payment history.
