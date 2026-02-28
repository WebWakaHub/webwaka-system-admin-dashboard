# No-Code/Low-Code Builder Specification

**Module ID:** Module 2
**Module Name:** No-Code/Low-Code Builder
**Version:** 1.0
**Date:** 2026-02-12
**Status:** DRAFT
**Author:** webwakaagent3 (Architecture)
**Reviewers:** webwakaagent4 (Engineering), webwakaagent5 (Quality)

---

## 1. Module Overview

### 1.1 Purpose

To empower non-technical users to create and deploy simple, data-driven web applications and websites using a visual drag-and-drop interface. This module will democratize web development on the WebWaka platform, enabling rapid prototyping and deployment without writing code.

### 1.2 Scope

**In Scope:**
- A visual, drag-and-drop UI builder for arranging components on a canvas.
- A library of pre-built, responsive UI components (e.g., text, images, buttons, forms, containers).
- Data binding to connect UI components with content from the Headless CMS module.
- A simple, event-based workflow builder for defining client-side logic (e.g., "on button click, show a message").
- One-click deployment of the created application to a publicly accessible URL.
- Application templates to help users get started quickly.

**Out of Scope:**
- A professional-grade code editor or IDE.
- Support for writing custom backend logic or server-side code.
- Generation of native mobile applications (iOS/Android).
- Direct database connections from the builder interface.

### 1.3 Success Criteria

- [ ] A user can build and deploy a simple multi-page "About Us" website connected to the Headless CMS in under 30 minutes.
- [ ] The builder interface is intuitive and requires no prior coding knowledge to use.
- [ ] Deployed applications are fully responsive and achieve a Google Lighthouse score of 85+ for performance.

---

## 2. Requirements

### 2.1 Functional Requirements

**FR-1: Visual Application Canvas**
- **Description:** Users must have a visual canvas where they can drag, drop, resize, and arrange UI components.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] Components snap to a grid for easy alignment.
  - [ ] The canvas can be toggled between desktop, tablet, and mobile views.

**FR-2: Component Library**
- **Description:** A library of pre-built UI components must be available to users.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] The library includes at least: Text, Image, Button, Form, Input, Container, Repeater/List.
  - [ ] Each component has a configuration panel to adjust its properties (e.g., text content, color, size).

**FR-3: Headless CMS Data Binding**
- **Description:** Users must be able to connect UI components to data stored in the Headless CMS.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] A user can select a Content Model from the Headless CMS.
  - [ ] A user can bind a Repeater component to a list of entries from a model.
  - [ ] A user can bind individual components (e.g., Text, Image) to fields within a content entry.

**FR-4: Event-Based Logic**
- **Description:** Users must be able to define simple, client-side logic using an event-action model.
- **Priority:** SHOULD
- **Acceptance Criteria:**
  - [ ] A user can select a component and choose a trigger event (e.g., "Click", "Submit").
  - [ ] A user can define a resulting action (e.g., "Show Alert", "Navigate to Page", "Call API Endpoint").

**FR-5: One-Click Deployment**
- **Description:** Users must be able to deploy their application to a live, public URL with a single click.
- **Priority:** MUST
- **Acceptance Criteria:**
  - [ ] A "Deploy" button triggers the deployment process.
  - [ ] The system automatically provisions a unique URL for the application.
  - [ ] The deployment process takes less than 2 minutes.

### 2.2 Non-Functional Requirements

**NFR-1: Performance**
- **Requirement:** The builder interface must load in under 5 seconds. Deployed applications must have a First Contentful Paint (FCP) of under 2 seconds on a 3G connection.

**NFR-2: Usability**
- **Requirement:** The builder interface must be highly intuitive. A new user should be able to understand the basic workflow without a tutorial.

**NFR-3: Security**
- **Requirement:** Deployed applications must be sandboxed and isolated from each other and the core platform. All data from the Headless CMS must be fetched via read-only APIs.

---

## 3. Architecture

### 3.1 High-Level Architecture

The No-Code/Low-Code Builder will be a single-page application (SPA) built with React. It will interact with a dedicated backend service for managing application definitions and deployments.

**Components:**
1.  **Builder Frontend:** The React-based visual editor UI.
2.  **Application Definition Service:** A backend service to manage the JSON definitions of user-created applications.
3.  **Deployment Service:** A service that takes an application's JSON definition and generates a static, server-rendered, or client-rendered web application.
4.  **Component Renderer:** A shared library responsible for rendering the final application based on its JSON definition.

**Data Flow:**
1.  User interacts with the Builder Frontend to design their application.
2.  Changes are saved as a JSON document to the Application Definition Service.
3.  User clicks "Deploy". The Deployment Service fetches the latest JSON definition.
4.  The Deployment Service uses the Component Renderer to generate the application files and deploys them to a static hosting provider (e.g., S3/Cloudflare Pages).

### 3.2 Design Patterns

- **State Management:** A centralized state management library (like Redux or Zustand) will be used for the builder's complex UI state.
- **Render Prop/Headless Component:** The Component Renderer will use a render prop or headless component pattern to decouple application logic from the final presentation.

---

## 4. API Specification

### 4.1 REST API Endpoints

#### Create Application
- **Method:** POST
- **Path:** `/api/v1/builder/apps`
- **Description:** Creates a new, empty application.

#### Save Application Definition
- **Method:** PUT
- **Path:** `/api/v1/builder/apps/:appId`
- **Description:** Saves the complete JSON definition of the application.

#### Deploy Application
- **Method:** POST
- **Path:** `/api/v1/builder/apps/:appId/deploy`
- **Description:** Triggers the deployment process for the specified application.

---

## 5. Data Model

### 5.1 Entities

#### Entity: `Application`
- **Description:** Represents a single application created by a user.
- **Attributes:**
  - `id`: UUID (PK)
  - `tenant_id`: UUID
  - `created_by`: UUID
  - `name`: VARCHAR(255)
  - `definition`: JSONB (Stores the entire application structure, component tree, styles, and logic)
  - `deployment_status`: VARCHAR (e.g., DRAFT, DEPLOYING, LIVE, FAILED)
  - `public_url`: VARCHAR(255)

### 5.2 Database Schema

```sql
CREATE TABLE builder_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  created_by UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  definition JSONB NOT NULL,
  deployment_status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  public_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 6. Dependencies

### 6.1 Internal Dependencies

- **Headless CMS:** For providing content to the applications.
- **User & Identity Management:** For authenticating users of the builder.
- **Website & Page Builder:** May share component libraries or rendering technology.

### 6.2 External Dependencies

- **React-dnd:** For drag-and-drop functionality in the builder.
- **Static Hosting Provider (e.g., AWS S3, Cloudflare Pages):** For hosting the deployed applications.

---

## 7. Compliance

- **Nigerian-First:** Deployed applications will be served from infrastructure that ensures low latency for Nigerian users.
- **Mobile-First & PWA-First:** All pre-built components will be fully responsive. The generated applications will be PWA-compliant by default.

---

## 8. Testing Requirements

- **Unit Testing:** All services and builder components must have 100% unit test coverage.
- **Integration Testing:** Test the interaction between the builder frontend, backend services, and the Headless CMS.
- **End-to-End Testing:** Create a test that builds and deploys a simple application, then verifies the deployed application works as expected.

---

## 9. Documentation Requirements

- **Module Documentation:** README, ARCHITECTURE, API docs.
- **User Documentation:** A user guide with tutorials on how to use the builder, connect to data, and deploy an FAQ.
