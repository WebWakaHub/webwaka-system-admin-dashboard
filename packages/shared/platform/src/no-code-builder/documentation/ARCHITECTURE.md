# No-Code/Low-Code Builder - Architecture

**Date:** 2026-02-12  
**Module:** No-Code/Low-Code Builder  
**Author:** webwakaagent3 (Architecture)

---

## 1. High-Level Architecture

The No-Code/Low-Code Builder is a comprehensive module designed to empower non-technical users to create and deploy web applications. The architecture is composed of four main components:

1.  **Builder Frontend:** A React-based single-page application (SPA) that provides the visual editor for creating applications.
2.  **Backend Services:** A set of services that manage application definitions, deployments, and other backend operations.
3.  **Component Renderer:** A library responsible for rendering application components based on their JSON definitions.
4.  **Deployment Provider:** An abstraction layer for deploying applications to a public URL.

![Architecture Diagram](https://example.com/architecture.png)  
*(Note: This is a placeholder for a real architecture diagram)*

### Data Flow

1.  **Design:** The user interacts with the Builder Frontend to design their application. All changes are saved as a JSON document to the Application Service.
2.  **Deploy:** The user clicks "Deploy". The Deployment Service fetches the latest JSON definition from the Application Service.
3.  **Render:** The Deployment Service uses the Component Renderer to generate the application files (HTML, CSS, JS).
4.  **Host:** The Deployment Service uses the Deployment Provider to deploy the generated files to a static hosting provider (e.g., AWS S3, Cloudflare Pages).

---

## 2. Component Details

### 2.1 Builder Frontend

- **Technology:** React, TypeScript, Redux/Zustand, React-dnd
- **Responsibilities:**
    - Provides the visual canvas for drag-and-drop component arrangement.
    - Manages the component library.
    - Provides property panels for configuring components.
    - Handles data binding with the Headless CMS.
    - Manages the event-action workflow builder.
    - Communicates with the backend services via REST API.

### 2.2 Backend Services

- **Technology:** Node.js, TypeScript, Express/Fastify, PostgreSQL
- **Services:**
    - **ApplicationService:** Manages the CRUD operations for application definitions. Stores definitions as JSONB in the database.
    - **DeploymentService:** Handles the deployment and undeployment of applications. Orchestrates the rendering and hosting process.
- **API:** A RESTful API for managing applications and deployments.

### 2.3 Component Renderer

- **Technology:** TypeScript
- **Responsibilities:**
    - Takes an application's JSON definition as input.
    - Generates HTML, CSS, and client-side JavaScript for each page.
    - Renders all component types (Text, Image, Button, etc.).
    - Handles data binding for repeaters.
    - Injects client-side script for event handling.

### 2.4 Deployment Provider

- **Technology:** TypeScript
- **Responsibilities:**
    - Provides an abstraction layer for deploying to different hosting providers.
    - Implements `deploy()` and `undeploy()` methods.
    - Can be implemented for AWS S3, Cloudflare Pages, Vercel, etc.

---

## 3. Design Patterns

### 3.1 State Management

- **Pattern:** Centralized State Management (Redux/Zustand)
- **Reasoning:** The builder's UI is complex, with many interacting components. A centralized state management library provides a single source of truth and makes state changes predictable.

### 3.2 Component Rendering

- **Pattern:** Render Prop / Headless Component
- **Reasoning:** The Component Renderer is designed to be decoupled from the final presentation. This allows for flexibility in how components are rendered (e.g., for different platforms or frameworks in the future).

### 3.3 Service-Oriented Architecture (SOA)

- **Pattern:** Service-Oriented Architecture
- **Reasoning:** The backend is divided into distinct services (ApplicationService, DeploymentService) with clear responsibilities. This improves modularity, maintainability, and scalability.

### 3.4 Event-Driven Architecture

- **Pattern:** Event-Driven Architecture
- **Reasoning:** The module emits events for all major operations (create, update, delete, deploy). This allows other modules to subscribe to these events and react accordingly, creating a loosely coupled system.

---

## 4. Database Schema

- **Table:** `builder_apps`
- **Columns:**
    - `id` (UUID, primary key)
    - `tenant_id` (UUID, not null)
    - `created_by` (UUID, not null)
    - `name` (VARCHAR, not null)
    - `description` (TEXT)
    - `definition` (JSONB, not null)
    - `deployment_status` (VARCHAR, default 'draft')
    - `public_url` (VARCHAR)
    - `created_at` (TIMESTAMP)
    - `updated_at` (TIMESTAMP)
- **Indexes:**
    - `idx_builder_apps_tenant_id`
    - `idx_builder_apps_deployment_status`

---

## 5. Extensibility

### 5.1 Component Registration API

- **Concept:** A future enhancement will be to add a Component Registration API. This will allow other modules or third-party plugins to register their own custom components in the builder.
- **Implementation:**
    - A `ComponentRegistry` service will manage the list of available components.
    - Plugins will provide a component definition (schema, properties, renderer).
    - The builder frontend will dynamically load and display registered components.

### 5.2 Deployment Provider Strategy

- **Concept:** The `DeploymentProvider` is designed as a strategy pattern. This allows for easy extension to support new hosting providers.
- **Implementation:**
    - Create a new class that implements the `DeploymentProvider` interface.
    - Implement the `deploy()` and `undeploy()` methods for the new provider.
    - Configure the `DeploymentService` to use the new provider.

---

## 6. Security Considerations

- **Tenant Isolation:** All database queries are scoped to the `tenant_id` to ensure strict data isolation.
- **Permission Control:** All API endpoints are protected by permission checks using the WEEG module.
- **Input Sanitization:** All user-provided content must be sanitized to prevent XSS attacks.
- **Sandboxed Deployments:** Deployed applications are hosted on a separate domain and are sandboxed from the main platform.

---

**Document Status:** ✅ **COMPLETE**
