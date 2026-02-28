# WebWaka Role, Permission, and Capability Delegation Model

**Document Type:** Canonical Product Strategy
**Authority:** webwakaagent2 (Product & Platform Strategy)
**Status:** DRAFT
**Version:** 0.1
**Date:** 2026-02-04

## 1. Introduction

This document outlines the Role-Based Access Control (RBAC) model for the WebWaka platform, including the framework for managing permissions and delegating capabilities. This model is a critical component of the platform's security and governance, ensuring that users only have access to the features and data that are relevant to their roles.

## 2. Core Concepts

### 2.1. Roles

A **role** is a collection of permissions that are assigned to a user or a group of users. Roles are defined based on the user's responsibilities and tasks within the platform. For example, a "Store Manager" role might have permissions to manage products, orders, and customers, while a "Cashier" role might only have permissions to process sales.

### 2.2. Permissions

A **permission** is a specific action that a user is allowed to perform on the platform. Permissions are granular and can be defined for any action, such as creating, reading, updating, or deleting a specific type of data. For example, a "product:create" permission would allow a user to create a new product.

### 2.3. Capabilities

A **capability** is a high-level feature or function that can be enabled or disabled for a specific tenant or user. Capabilities are used to control access to major platform features, such as the Commerce Suite or the Transportation Ecosystem Suite. For example, a tenant might have the "commerce-suite" capability enabled, but not the "transportation-suite" capability.

## 3. Delegation Model

The WebWaka platform uses a hierarchical delegation model, allowing permissions and capabilities to be delegated from higher-level users to lower-level users.

### 3.1. Super Admin Delegation

The Super Admin can delegate capabilities and administrative permissions to Partners and Tenants.

### 3.2. Partner Delegation

Partners can delegate capabilities and permissions to their own Tenants.

### 3.3. Tenant Delegation

Tenants can create their own custom roles and delegate permissions to their own users, such as store managers, cashiers, or drivers.

## 4. Default Roles

The WebWaka platform will ship with a set of default roles for each suite, which can be customized by tenants to meet their specific needs. Examples of default roles include:

### 4.1. Commerce Suite

*   **Store Owner:** Full administrative access to the tenant's store.
*   **Store Manager:** Can manage products, orders, and customers.
*   **Cashier:** Can only process sales at the point of sale.

### 4.2. Transportation Ecosystem Suite

*   **Fleet Owner:** Full administrative access to the tenant's fleet.
*   **Dispatcher:** Can manage drivers, vehicles, and trips.
*   **Driver:** Can only view and manage their own trips.

---

**END OF ROLE, PERMISSION, AND CAPABILITY DELEGATION MODEL**
