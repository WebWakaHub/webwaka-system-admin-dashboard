# SYS-CFG-CONFIGPLATFORM-v0.1.0-P0-T03-API_CONTRACT.md

## Document Metadata

| Field             | Value                                     |
| :---------------- | :---------------------------------------- |
| **Document ID**   | SYS-CFG-CONFIGPLATFORM-v0.1.0-P0-T03-API_CONTRACT |
| **System Code**   | SYS-CFG-CONFIGPLATFORM                    |
| **Phase**         | P0                                        |
| **Task**          | T03                                       |
| **Issue Number**  | #38                                       |
| **Executing Agent** | webwakaagent3                             |
| **Date**          | 2026-02-25                                |

## 1. Introduction

This document specifies the API and Data Contract for the SYS-CFG-CONFIGPLATFORM-v0.1.0 system, also known as the **Configuration Platform System** within the WebWaka platform. This system is responsible for managing various configuration aspects, including feature flags, runtime configurations, environment-specific settings, secret and credential management, configuration versioning, audit logging, role-based access, and schema validation.

## 2. System Overview

The Configuration Platform System is a critical component of the WebWaka platform, providing centralized and robust management for all application configurations. It ensures consistency, security, and traceability of configuration changes across different environments and services.

### 2.1. System Organs

The system is composed of four primary organs, each responsible for a specific set of functionalities:

| Organ Name | Code     | Description                                                               |
| :--------- | :------- | :------------------------------------------------------------------------ |
| **Configuration & Settings Management** | CFG-CSM  | Core configuration CRUD operations and versioning.                        |
| **Feature Flags & Lifecycle** | CFG-FFL  | Management of feature flags, targeting rules, and rollout strategies.     |
| **Secrets & Credential Management** | CFG-SCM  | Integration with vault services for secret management and rotation.       |
| **Audit & Compliance** | CFG-AUD  | Logging of configuration changes, drift detection, and compliance reports.|

## 3. API Contract Specification

This section details the public APIs, endpoints, request/response schemas, and data contracts for the SYS-CFG-CONFIGPLATFORM-v0.1.0 system. The APIs are designed to be RESTful, stateless, and secure, adhering to industry best practices for microservices architecture.

### 3.1. General API Principles

*   **RESTful Design**: Adherence to REST principles for resource-oriented APIs.
*   **JSON Payloads**: All request and response bodies will use JSON format.
*   **Authentication & Authorization**: All API endpoints will be secured using OAuth2.0 for authentication and Role-Based Access Control (RBAC) for authorization.
*   **Versioning**: API versions will be managed through URI pathing (e.g., `/v1/`).
*   **Error Handling**: Standardized error response formats including HTTP status codes and detailed error messages.

### 3.2. Endpoints and Operations

#### 3.2.1. CFG-CSM (Configuration & Settings Management)

This organ provides APIs for managing core configurations.

| Endpoint | Method | Description | Request Schema | Response Schema | Authorization |
| :------- | :----- | :---------- | :------------- | :-------------- | :------------ |
| `/v1/configurations` | `POST` | Create a new configuration. | `ConfigCreateRequest` | `ConfigResponse` | `admin` |
| `/v1/configurations/{id}` | `GET` | Retrieve a configuration by ID. | N/A | `ConfigResponse` | `admin`, `operator`, `viewer` |
| `/v1/configurations/{id}` | `PUT` | Update an existing configuration. | `ConfigUpdateRequest` | `ConfigResponse` | `admin`, `operator` |
| `/v1/configurations/{id}` | `DELETE` | Delete a configuration. | N/A | `204 No Content` | `admin` |
| `/v1/configurations/{id}/versions` | `GET` | Retrieve all versions of a configuration. | N/A | `ConfigVersionListResponse` | `admin`, `operator`, `viewer` |
| `/v1/configurations/{id}/rollback` | `POST` | Rollback a configuration to a specific version. | `ConfigRollbackRequest` | `ConfigResponse` | `admin` |

#### 3.2.2. CFG-FFL (Feature Flags & Lifecycle)

This organ provides APIs for managing feature flags.

| Endpoint | Method | Description | Request Schema | Response Schema | Authorization |
| :------- | :----- | :---------- | :------------- | :-------------- | :------------ |
| `/v1/feature-flags` | `POST` | Create a new feature flag. | `FeatureFlagCreateRequest` | `FeatureFlagResponse` | `admin` |
| `/v1/feature-flags/{id}` | `GET` | Retrieve a feature flag by ID. | N/A | `FeatureFlagResponse` | `admin`, `operator`, `viewer` |
| `/v1/feature-flags/{id}` | `PUT` | Update an existing feature flag. | `FeatureFlagUpdateRequest` | `FeatureFlagResponse` | `admin`, `operator` |
| `/v1/feature-flags/{id}/status` | `PATCH` | Update the status of a feature flag (e.g., enable/disable). | `FeatureFlagStatusUpdateRequest` | `FeatureFlagResponse` | `admin`, `operator` |
| `/v1/feature-flags/{id}/targeting-rules` | `PUT` | Update targeting rules for a feature flag. | `TargetingRulesUpdateRequest` | `FeatureFlagResponse` | `admin`, `operator` |

#### 3.2.3. CFG-SCM (Secrets & Credential Management)

This organ provides APIs for managing secrets and credentials.

| Endpoint | Method | Description | Request Schema | Response Schema | Authorization |
| :------- | :----- | :---------- | :------------- | :-------------- | :------------ |
| `/v1/secrets` | `POST` | Create a new secret. | `SecretCreateRequest` | `SecretResponse` | `admin` |
| `/v1/secrets/{id}` | `GET` | Retrieve secret metadata by ID. | N/A | `SecretMetadataResponse` | `admin` |
| `/v1/secrets/{id}` | `PUT` | Update an existing secret. | `SecretUpdateRequest` | `SecretResponse` | `admin` |
| `/v1/secrets/{id}/rotate` | `POST` | Rotate a secret. | N/A | `SecretResponse` | `admin` |

#### 3.2.4. CFG-AUD (Audit & Compliance)

This organ provides APIs for audit logging and compliance reporting.

| Endpoint | Method | Description | Request Schema | Response Schema | Authorization |
| :------- | :----- | :---------- | :------------- | :-------------- | :------------ |
| `/v1/audit-logs` | `GET` | Retrieve audit logs with filters. | `AuditLogFilterRequest` | `AuditLogListResponse` | `admin`, `viewer` |
| `/v1/audit-reports` | `GET` | Generate compliance reports. | `ComplianceReportRequest` | `ComplianceReportResponse` | `admin` |

### 3.3. Data Contract (Schemas)

#### 3.3.1. Common Data Types

| Type | Description | Format/Constraints |
| :--- | :---------- | :----------------- |
| `UUID` | Unique identifier. | String, UUID v4 format |
| `Timestamp` | Date and time. | String, ISO 8601 format |
| `String` | Textual data. | String, UTF-8 encoded |
| `Boolean` | True/False value. | Boolean |
| `Integer` | Whole number. | Integer |

#### 3.3.2. CFG-CSM Schemas

##### `ConfigCreateRequest`

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string", "description": "Name of the configuration" },
    "environment": { "type": "string", "enum": ["dev", "staging", "prod"], "description": "Deployment environment" },
    "data": { "type": "object", "description": "Configuration data (JSON object)" },
    "schema_id": { "type": "string", "description": "ID of the configuration schema to validate against" }
  },
  "required": ["name", "environment", "data"]
}
```

##### `ConfigUpdateRequest`

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string", "description": "Updated name of the configuration" },
    "data": { "type": "object", "description": "Updated configuration data (JSON object)" },
    "schema_id": { "type": "string", "description": "ID of the configuration schema to validate against" }
  }
}
```

##### `ConfigResponse`

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid", "description": "Unique ID of the configuration" },
    "name": { "type": "string", "description": "Name of the configuration" },
    "environment": { "type": "string", "enum": ["dev", "staging", "prod"], "description": "Deployment environment" },
    "data": { "type": "object", "description": "Configuration data (JSON object)" },
    "version": { "type": "integer", "description": "Current version of the configuration" },
    "created_at": { "type": "string", "format": "date-time", "description": "Timestamp of creation" },
    "updated_at": { "type": "string", "format": "date-time", "description": "Timestamp of last update" }
  }
}
```

##### `ConfigVersionListResponse`

```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "version": { "type": "integer", "description": "Version number" },
      "created_at": { "type": "string", "format": "date-time", "description": "Timestamp of this version" },
      "created_by": { "type": "string", "description": "User who created this version" }
    }
  }
}
```

##### `ConfigRollbackRequest`

```json
{
  "type": "object",
  "properties": {
    "version": { "type": "integer", "description": "Version number to rollback to" }
  },
  "required": ["version"]
}
```

#### 3.3.3. CFG-FFL Schemas

##### `FeatureFlagCreateRequest`

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string", "description": "Name of the feature flag" },
    "description": { "type": "string", "description": "Description of the feature flag" },
    "default_status": { "type": "boolean", "description": "Default status (enabled/disabled)" },
    "targeting_rules": { "type": "object", "description": "JSON object defining targeting rules" }
  },
  "required": ["name", "default_status"]
}
```

##### `FeatureFlagUpdateRequest`

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string", "description": "Updated name of the feature flag" },
    "description": { "type": "string", "description": "Updated description of the feature flag" }
  }
}
```

##### `FeatureFlagStatusUpdateRequest`

```json
{
  "type": "object",
  "properties": {
    "status": { "type": "boolean", "description": "New status of the feature flag" }
  },
  "required": ["status"]
}
```

##### `TargetingRulesUpdateRequest`

```json
{
  "type": "object",
  "properties": {
    "rules": { "type": "object", "description": "Updated JSON object defining targeting rules" }
  },
  "required": ["rules"]
}
```

##### `FeatureFlagResponse`

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid", "description": "Unique ID of the feature flag" },
    "name": { "type": "string", "description": "Name of the feature flag" },
    "description": { "type": "string", "description": "Description of the feature flag" },
    "status": { "type": "boolean", "description": "Current status (enabled/disabled)" },
    "targeting_rules": { "type": "object", "description": "JSON object defining targeting rules" },
    "created_at": { "type": "string", "format": "date-time", "description": "Timestamp of creation" },
    "updated_at": { "type": "string", "format": "date-time", "description": "Timestamp of last update" }
  }
}
```

#### 3.3.4. CFG-SCM Schemas

##### `SecretCreateRequest`

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string", "description": "Name of the secret" },
    "value": { "type": "string", "description": "Value of the secret" },
    "environment": { "type": "string", "enum": ["dev", "staging", "prod"], "description": "Deployment environment" },
    "rotation_policy": { "type": "object", "description": "JSON object defining rotation policy" }
  },
  "required": ["name", "value", "environment"]
}
```

##### `SecretUpdateRequest`

```json
{
  "type": "object",
  "properties": {
    "value": { "type": "string", "description": "Updated value of the secret" },
    "rotation_policy": { "type": "object", "description": "Updated JSON object defining rotation policy" }
  }
}
```

##### `SecretResponse`

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid", "description": "Unique ID of the secret" },
    "name": { "type": "string", "description": "Name of the secret" },
    "environment": { "type": "string", "enum": ["dev", "staging", "prod"], "description": "Deployment environment" },
    "last_rotated_at": { "type": "string", "format": "date-time", "description": "Timestamp of last rotation" },
    "next_rotation_due": { "type": "string", "format": "date-time", "description": "Timestamp of next rotation due" },
    "created_at": { "type": "string", "format": "date-time", "description": "Timestamp of creation" },
    "updated_at": { "type": "string", "format": "date-time", "description": "Timestamp of last update" }
  }
}
```

##### `SecretMetadataResponse`

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid", "description": "Unique ID of the secret" },
    "name": { "type": "string", "description": "Name of the secret" },
    "environment": { "type": "string", "enum": ["dev", "staging", "prod"], "description": "Deployment environment" },
    "last_rotated_at": { "type": "string", "format": "date-time", "description": "Timestamp of last rotation" },
    "next_rotation_due": { "type": "string", "format": "date-time", "description": "Timestamp of next rotation due" },
    "created_at": { "type": "string", "format": "date-time", "description": "Timestamp of creation" },
    "updated_at": { "type": "string", "format": "date-time", "description": "Timestamp of last update" }
  }
}
```

#### 3.3.5. CFG-AUD Schemas

##### `AuditLogFilterRequest`

```json
{
  "type": "object",
  "properties": {
    "start_date": { "type": "string", "format": "date-time", "description": "Start date for filtering logs" },
    "end_date": { "type": "string", "format": "date-time", "description": "End date for filtering logs" },
    "user_id": { "type": "string", "description": "User ID to filter logs by" },
    "action_type": { "type": "string", "description": "Type of action to filter logs by" },
    "resource_id": { "type": "string", "description": "Resource ID to filter logs by" }
  }
}
```

##### `AuditLogListResponse`

```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": { "type": "string", "format": "uuid", "description": "Unique ID of the audit log entry" },
      "timestamp": { "type": "string", "format": "date-time", "description": "Timestamp of the event" },
      "user_id": { "type": "string", "description": "ID of the user who performed the action" },
      "action_type": { "type": "string", "description": "Type of action performed (e.g., CREATE, UPDATE, DELETE)" },
      "resource_type": { "type": "string", "description": "Type of resource affected (e.g., CONFIGURATION, FEATURE_FLAG, SECRET)" },
      "resource_id": { "type": "string", "description": "ID of the resource affected" },
      "details": { "type": "object", "description": "JSON object with action-specific details" }
    }
  }
}
```

##### `ComplianceReportRequest`

```json
{
  "type": "object",
  "properties": {
    "report_type": { "type": "string", "enum": ["SOX", "GDPR", "HIPAA"], "description": "Type of compliance report to generate" },
    "start_date": { "type": "string", "format": "date-time", "description": "Start date for the report" },
    "end_date": { "type": "string", "format": "date-time", "description": "End date for the report" }
  },
  "required": ["report_type", "start_date", "end_date"]
}
```

##### `ComplianceReportResponse`

```json
{
  "type": "object",
  "properties": {
    "report_id": { "type": "string", "format": "uuid", "description": "Unique ID of the generated report" },
    "report_type": { "type": "string", "description": "Type of compliance report" },
    "generated_at": { "type": "string", "format": "date-time", "description": "Timestamp of report generation" },
    "status": { "type": "string", "description": "Status of the report generation" },
    "download_url": { "type": "string", "format": "uri", "description": "URL to download the report" }
  }
}
```

## 4. Constitutional Compliance References

This API Contract adheres to the following constitutional compliance principles and regulations:

*   **Security by Design**: All APIs are designed with security as a primary concern, incorporating authentication, authorization, and data encryption where necessary.
*   **Data Privacy**: Personal and sensitive data handling complies with relevant data privacy regulations (e.g., GDPR, CCPA) by minimizing data exposure and providing appropriate access controls.
*   **Auditability**: Comprehensive audit logging is implemented to ensure all configuration changes and access attempts are recorded for compliance and forensic analysis.
*   **Reliability & Resilience**: APIs are designed for high availability and fault tolerance, with appropriate error handling and retry mechanisms.
*   **Transparency**: API documentation is clear, concise, and publicly accessible to authorized users, promoting transparency in system interactions.

## 5. Executing Agent Signature

```
webwakaagent3
Configuration & Settings Agent
AEE-02-DG Autonomous Execution Protocol
```
