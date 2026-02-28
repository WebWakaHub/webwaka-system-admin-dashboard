# SYS-ANA-ANALYTICSPLATFORM-v0.1.0-P5-T03: User Guide & API Reference

**Document ID:** SYS-ANA-ANALYTICSPLATFORM-v0.1.0-P5-T03  
**Phase:** 5 (Documentation) | **Task:** 3  
**Executing Agent:** webwakaagent8 | **Issue:** [#25](https://github.com/WebWakaHub/webwaka-system-universe/issues/25)

---

## I. USER GUIDE

### A. Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Full access: create, edit, delete, trigger, manage users |
| **Viewer** | Read-only: view dashboards, pipelines, datasets, reports |

### B. DRM Organ — Data Ingestion Platform

**Connecting a Data Source:**
1. Navigate to **Data Sources** in the sidebar
2. Click **Add Source** (admin only)
3. Select type: Database, REST API, File Upload, or S3
4. Enter connection details and save

**Creating a Pipeline:**
1. Navigate to **Pipelines**
2. Click **New Pipeline** and select a source
3. Configure schedule and transformation settings
4. Click **Trigger Run** to execute immediately

**Uploading Files:**
1. Navigate to **File Upload**
2. Drag and drop or select CSV, JSON, or Parquet files
3. Review the validation preview
4. Click **Upload** to ingest

**Monitoring:**
1. Navigate to **Monitoring** for real-time pipeline run status
2. Expand any run to view detailed logs
3. Navigate to **Quality Metrics** for success rates and error trends

### C. IOP Organ — Intelligence & Optimization Platform

**Registering an Analytical Model:**
1. Navigate to **Models** (admin only)
2. Click **Register Model**
3. Define input/output schema and model type
4. Save and activate the model

**Generating Reports:**
1. Navigate to **Reports**
2. Select a template or create a new one
3. Click **Generate Now** for on-demand generation
4. Download the report from **Generated Reports**

---

## II. API REFERENCE

### Authentication

All API calls require a valid JWT session cookie obtained via Manus OAuth.

### DRM Organ Procedures

| Procedure | Input | Output |
|-----------|-------|--------|
| `dataSources.list` | `{ limit?, offset? }` | `DataSource[]` |
| `dataSources.create` | `{ name, type, config }` | `{ success, id }` |
| `dataSources.delete` | `{ id }` | `{ success }` |
| `pipelines.list` | `{ sourceId?, limit? }` | `Pipeline[]` |
| `pipelines.create` | `{ name, sourceId, schedule? }` | `{ success, id }` |
| `pipelines.triggerRun` | `{ pipelineId }` | `{ success, runId }` |
| `datasets.list` | `{ limit?, offset? }` | `Dataset[]` |
| `datasets.upload` | `{ name, format, storageUrl, rowCount? }` | `{ success, id }` |
| `apiEndpoints.list` | `{ limit? }` | `ApiEndpoint[]` |
| `apiEndpoints.create` | `{ name, url, method, authType }` | `{ success, id }` |
| `qualityMetrics.summary` | — | `QualityMetricsSummary` |
| `monitoring.runs` | `{ pipelineId?, limit? }` | `PipelineRun[]` |
| `monitoring.logs` | `{ runId }` | `RunLog[]` |

### IOP Organ Procedures

| Procedure | Input | Output |
|-----------|-------|--------|
| `models.list` | `{ limit? }` | `AnalyticalModel[]` |
| `models.create` | `{ name, type, inputSchema, outputSchema }` | `{ success, id }` |
| `models.execute` | `{ modelId, inputRef }` | `{ success, executionId }` |
| `models.history` | `{ modelId, limit? }` | `ModelExecution[]` |
| `reports.list` | `{ limit? }` | `ReportTemplate[]` |
| `reports.create` | `{ name, queryConfig, format, schedule? }` | `{ success, id }` |
| `reports.generate` | `{ templateId }` | `{ success, reportId }` |
| `reports.generated` | `{ templateId?, limit? }` | `GeneratedReport[]` |
| `recommendations.list` | `{ status?, limit? }` | `Recommendation[]` |
| `recommendations.update` | `{ id, status }` | `{ success }` |
| `dashboard.stats` | — | `DashboardStats` |

---

**Executing Agent:** webwakaagent8 | **Authority:** AGENT_EXECUTION_CONTEXT_MASTER_CONSTITUTION_v1.0.0
