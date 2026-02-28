/**
 * Type definitions for the No-Code/Low-Code Builder module
 */

// ============================================================================
// Component Types
// ============================================================================

export enum ComponentType {
  TEXT = 'text',
  IMAGE = 'image',
  BUTTON = 'button',
  CONTAINER = 'container',
  FORM = 'form',
  INPUT = 'input',
  REPEATER = 'repeater',
}

export interface ComponentDefinition {
  id: string;
  type: ComponentType;
  properties: Record<string, any>;
  children?: ComponentDefinition[];
  dataBinding?: DataBinding;
  events?: EventDefinition[];
}

// ============================================================================
// Data Binding Types
// ============================================================================

export interface DataBinding {
  source: 'cms' | 'static' | 'variable';
  modelId?: string;
  modelPluralName?: string;
  field?: string;
  value?: any;
}

// ============================================================================
// Event Types
// ============================================================================

export enum EventTrigger {
  CLICK = 'click',
  SUBMIT = 'submit',
  CHANGE = 'change',
  LOAD = 'load',
}

export enum EventAction {
  SHOW_ALERT = 'show_alert',
  NAVIGATE = 'navigate',
  CALL_API = 'call_api',
  SET_VARIABLE = 'set_variable',
}

export interface EventDefinition {
  trigger: EventTrigger;
  action: EventAction;
  parameters: Record<string, any>;
}

// ============================================================================
// Application Types
// ============================================================================

export enum DeploymentStatus {
  DRAFT = 'draft',
  DEPLOYING = 'deploying',
  LIVE = 'live',
  FAILED = 'failed',
}

export interface Page {
  id: string;
  name: string;
  path: string;
  components: ComponentDefinition[];
}

export interface ApplicationDefinition {
  id: string;
  tenantId: string;
  createdBy: string;
  name: string;
  description?: string;
  pages: Page[];
  globalStyles?: Record<string, any>;
  deploymentStatus: DeploymentStatus;
  publicUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApplicationRequest {
  name: string;
  description?: string;
}

export interface UpdateApplicationRequest {
  name?: string;
  description?: string;
  pages?: Page[];
  globalStyles?: Record<string, any>;
}

export interface DeployApplicationResponse {
  status: 'success' | 'error';
  publicUrl?: string;
  error?: string;
}

// ============================================================================
// Builder Configuration
// ============================================================================

export interface NoCodeBuilderConfig {
  database: any;
  eventBus: any;
  permissionSystem: any;
  deploymentProvider: DeploymentProvider;
}

export interface DeploymentProvider {
  deploy(appId: string, definition: ApplicationDefinition): Promise<string>;
  undeploy(appId: string): Promise<void>;
}

// ============================================================================
// Error Types
// ============================================================================

export class ApplicationNotFoundError extends Error {
  constructor(appId: string) {
    super(`Application not found: ${appId}`);
    this.name = 'ApplicationNotFoundError';
  }
}

export class DeploymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeploymentError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class PermissionDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionDeniedError';
  }
}
