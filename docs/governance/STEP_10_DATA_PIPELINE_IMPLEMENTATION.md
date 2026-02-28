# Step 10: Data Pipeline Implementation (Week 4)

**Document Type:** Phase 2 Step Execution Report  
**Prepared by:** webwakaagent8 (Platform Analytics Agent)  
**Date:** 2026-02-08  
**Phase:** Phase 2, Week 4  
**Step:** Step 10 of PHASE_2_SIMPLIFIED_EXECUTION_LIST.md  
**Status:** ACTIVE IMPLEMENTATION  
**Authority:** AGENT_IDENTITY_REGISTRY.md (webwakaagent8 - Data, Analytics & Intelligence)

---

## Executive Summary

This document outlines the data pipeline implementation for Step 10. The data pipeline is responsible for collecting, processing, transforming, and loading data from the WebWaka platform into the analytics infrastructure.

**Step 10 Requirement:** Begin analytics implementation with data pipeline  
**Completion Target:** 60% of Phase 2 analytics work  
**Current Progress:** Data pipeline implementation begun  
**Status:** ✅ ON TRACK

---

## Data Pipeline Architecture

### 1. Pipeline Stages

The WebWaka data pipeline consists of four main stages: collection, processing, transformation, and loading.

| Stage | Purpose | Technology | Latency |
|---|---|---|---|
| **Collection** | Capture events from platform | Event SDK, API | Real-time |
| **Processing** | Stream processing and aggregation | Kafka, Spark Streaming | 1-5 minutes |
| **Transformation** | Data transformation and enrichment | Spark, dbt | 5-30 minutes |
| **Loading** | Load data into warehouse | Snowflake, S3 | 30-60 minutes |

### 2. Pipeline Modes

**Real-Time Pipeline (Streaming):**
- Latency: 1-5 minutes
- Use case: Real-time dashboards, alerts
- Technology: Kafka, Spark Streaming
- Frequency: Continuous

**Batch Pipeline (Daily):**
- Latency: 1-24 hours
- Use case: Historical analysis, reporting
- Technology: Spark, dbt
- Frequency: Once per day (midnight UTC)

**On-Demand Pipeline:**
- Latency: 5-30 minutes
- Use case: Ad-hoc analysis, debugging
- Technology: Spark, dbt
- Frequency: Manual trigger

---

## Event Collection Pipeline (Week 4)

### 1. Event Types and Schema

**Core Event Schema:**

```json
{
  "event_id": "uuid",
  "user_id": "uuid",
  "session_id": "uuid",
  "event_name": "string",
  "event_timestamp": "timestamp",
  "properties": {
    "page": "string",
    "referrer": "string",
    "device_type": "string",
    "browser": "string",
    "os": "string",
    "ip_address": "string",
    "country": "string",
    "custom_properties": {}
  },
  "context": {
    "app_version": "string",
    "sdk_version": "string",
    "lib": "string"
  }
}
```

**Event Types:**

| Event Type | Frequency | Properties | Use Case |
|---|---|---|---|
| page_view | High | page, referrer, duration | Traffic analysis |
| button_click | High | button_id, page, context | User engagement |
| form_submission | Medium | form_id, fields, success | Conversion tracking |
| api_call | High | endpoint, method, duration, status | API monitoring |
| error_event | Medium | error_type, message, stack_trace | Error tracking |
| user_action | Medium | action_type, target, context | User behavior |
| performance_metric | Medium | metric_name, value, context | Performance monitoring |

### 2. Event Collection Implementation

**Frontend Event Collection:**

```javascript
// Initialize analytics SDK
import { AnalyticsSDK } from '@webwaka/analytics-sdk';

const analytics = new AnalyticsSDK({
  apiKey: process.env.REACT_APP_ANALYTICS_KEY,
  userId: currentUser.id,
  sessionId: getSessionId(),
  batchSize: 100,
  flushInterval: 5000
});

// Track page views
useEffect(() => {
  analytics.track('page_view', {
    page: window.location.pathname,
    referrer: document.referrer,
    title: document.title
  });
}, [location]);

// Track button clicks
const handleButtonClick = (buttonId) => {
  analytics.track('button_click', {
    button_id: buttonId,
    page: window.location.pathname,
    timestamp: new Date().toISOString()
  });
};

// Track form submissions
const handleFormSubmit = (formData) => {
  analytics.track('form_submission', {
    form_id: formData.formId,
    fields: Object.keys(formData),
    success: true,
    duration_ms: formData.duration
  });
};

// Track errors
window.addEventListener('error', (event) => {
  analytics.track('error_event', {
    error_type: event.error.name,
    message: event.error.message,
    stack_trace: event.error.stack,
    page: window.location.pathname
  });
});
```

**Backend Event Collection:**

```python
# Initialize analytics SDK
from webwaka.analytics import AnalyticsSDK

analytics = AnalyticsSDK(
    api_key=os.getenv('ANALYTICS_API_KEY'),
    batch_size=1000,
    flush_interval=10
)

# Track API calls
@app.middleware('http')
async def track_api_calls(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start_time) * 1000
    
    analytics.track('api_call', {
        'endpoint': request.url.path,
        'method': request.method,
        'status_code': response.status_code,
        'duration_ms': duration_ms,
        'user_id': request.user.id if request.user else None
    })
    
    return response

# Track database operations
def track_db_operation(operation, table, duration_ms):
    analytics.track('db_operation', {
        'operation': operation,
        'table': table,
        'duration_ms': duration_ms
    })

# Track business events
def track_transaction(user_id, product_id, amount):
    analytics.track('transaction', {
        'user_id': user_id,
        'product_id': product_id,
        'amount': amount,
        'timestamp': datetime.utcnow().isoformat()
    })
```

### 3. Event Ingestion to Kafka

**Kafka Topic Configuration:**

```yaml
topics:
  - name: raw_events
    partitions: 20
    replication_factor: 3
    retention_ms: 604800000  # 7 days
    compression_type: snappy
    
  - name: processed_events
    partitions: 10
    replication_factor: 3
    retention_ms: 2592000000  # 30 days
    compression_type: snappy
```

**Event Publishing:**

```python
from kafka import KafkaProducer
import json

producer = KafkaProducer(
    bootstrap_servers=['kafka:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    compression_type='snappy',
    acks='all',
    retries=3
)

def publish_event(event):
    """Publish event to Kafka"""
    try:
        future = producer.send(
            'raw_events',
            value=event,
            key=event['user_id'].encode('utf-8')
        )
        future.get(timeout=10)
    except Exception as e:
        logger.error(f"Failed to publish event: {e}")
        # Fallback to local queue or dead letter queue
```

---

## Stream Processing Pipeline (Week 4)

### 1. Spark Streaming Jobs

**Real-Time Event Aggregation:**

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col, window, count, avg, max

spark = SparkSession.builder \
    .appName("WebWaka Real-Time Analytics") \
    .getOrCreate()

# Read from Kafka
df = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:9092") \
    .option("subscribe", "raw_events") \
    .option("startingOffsets", "latest") \
    .load()

# Parse JSON events
schema = """
    event_id STRING,
    user_id STRING,
    session_id STRING,
    event_name STRING,
    event_timestamp TIMESTAMP,
    properties MAP<STRING, STRING>
"""

parsed_df = df.select(
    from_json(col("value").cast("string"), schema).alias("data")
).select("data.*")

# Real-time aggregation by 1-minute windows
aggregated = parsed_df.groupBy(
    window(col("event_timestamp"), "1 minute"),
    col("event_name")
).agg(
    count("*").alias("event_count"),
    count(col("user_id")).alias("unique_users")
)

# Write to Kafka for real-time dashboards
query = aggregated.select(
    col("window.start").alias("window_start"),
    col("window.end").alias("window_end"),
    col("event_name"),
    col("event_count"),
    col("unique_users")
).writeStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:9092") \
    .option("topic", "processed_events") \
    .option("checkpointLocation", "s3://webwaka-analytics/checkpoints/") \
    .start()

query.awaitTermination()
```

**Session Reconstruction:**

```python
from pyspark.sql.window import Window

# Define session window (30 minutes of inactivity)
session_window = Window.partitionBy("user_id") \
    .orderBy("event_timestamp") \
    .rangeBetween(-30*60, 0)

# Reconstruct sessions
sessions = parsed_df.withColumn(
    "session_id",
    max(col("session_id")).over(session_window)
).groupBy("user_id", "session_id").agg(
    min(col("event_timestamp")).alias("session_start"),
    max(col("event_timestamp")).alias("session_end"),
    count("*").alias("event_count"),
    collect_list(col("event_name")).alias("events")
)

# Write sessions to data warehouse
sessions.writeStream \
    .format("parquet") \
    .option("path", "s3://webwaka-analytics/sessions/") \
    .option("checkpointLocation", "s3://webwaka-analytics/checkpoints/sessions/") \
    .start()
```

### 2. Stream Processing Configuration

**Spark Configuration:**

```properties
# Spark streaming configuration
spark.streaming.kafka.maxRatePerPartition=10000
spark.streaming.kafka.minPartitions=10
spark.streaming.batchInterval=5000  # 5 seconds

# Memory configuration
spark.driver.memory=4g
spark.executor.memory=8g
spark.executor.cores=4

# Checkpoint configuration
spark.streaming.checkpointInterval=10000  # 10 seconds
spark.streaming.backpressure.enabled=true
spark.streaming.backpressure.initialRate=10000
```

---

## Batch Processing Pipeline (Week 4)

### 1. Daily Batch Jobs

**Daily Event Aggregation (dbt):**

```sql
-- models/marts/daily_events.sql
{{ config(
    materialized='incremental',
    unique_key='date_event_name'
) }}

SELECT
    CAST(event_timestamp AS DATE) as date,
    event_name,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as session_count,
    CURRENT_TIMESTAMP() as updated_at
FROM {{ ref('stg_events') }}
{% if execute %}
    WHERE event_timestamp >= (SELECT MAX(date) FROM {{ this }})
{% endif %}
GROUP BY 1, 2
```

**Daily Revenue Aggregation:**

```sql
-- models/marts/daily_revenue.sql
{{ config(
    materialized='incremental',
    unique_key='date_product_id'
) }}

SELECT
    CAST(transaction_timestamp AS DATE) as date,
    product_id,
    SUM(amount) as total_revenue,
    COUNT(*) as transaction_count,
    AVG(amount) as avg_transaction_value,
    MIN(amount) as min_transaction_value,
    MAX(amount) as max_transaction_value,
    CURRENT_TIMESTAMP() as updated_at
FROM {{ ref('stg_transactions') }}
WHERE status = 'completed'
{% if execute %}
    AND transaction_timestamp >= (SELECT MAX(date) FROM {{ this }})
{% endif %}
GROUP BY 1, 2
```

### 2. Batch Job Scheduling

**Airflow DAG Configuration:**

```python
from airflow import DAG
from airflow.operators.spark_submit_operator import SparkSubmitOperator
from airflow.operators.python_operator import PythonOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'webwaka-analytics',
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
    'start_date': datetime(2026, 2, 8)
}

dag = DAG(
    'webwaka_daily_analytics',
    default_args=default_args,
    schedule_interval='0 1 * * *',  # 1 AM UTC daily
    catchup=False
)

# Task 1: Run dbt models
dbt_task = PythonOperator(
    task_id='run_dbt_models',
    python_callable=run_dbt_models,
    dag=dag
)

# Task 2: Generate reports
report_task = PythonOperator(
    task_id='generate_reports',
    python_callable=generate_daily_reports,
    dag=dag
)

# Task 3: Send notifications
notify_task = PythonOperator(
    task_id='send_notifications',
    python_callable=send_daily_notifications,
    dag=dag
)

# Set dependencies
dbt_task >> report_task >> notify_task
```

---

## Data Transformation Pipeline (Week 4)

### 1. Staging Layer (dbt)

**Event Staging:**

```sql
-- models/staging/stg_events.sql
SELECT
    event_id,
    user_id,
    session_id,
    event_name,
    event_timestamp,
    properties,
    context,
    CAST(event_timestamp AS DATE) as event_date,
    EXTRACT(HOUR FROM event_timestamp) as event_hour,
    CURRENT_TIMESTAMP() as loaded_at
FROM {{ source('raw', 'events') }}
WHERE event_timestamp >= CURRENT_DATE - INTERVAL 30 DAY
```

**User Staging:**

```sql
-- models/staging/stg_users.sql
SELECT
    user_id,
    email,
    name,
    created_at,
    status,
    country,
    industry,
    company_size,
    CURRENT_TIMESTAMP() as loaded_at
FROM {{ source('raw', 'users') }}
WHERE created_at >= CURRENT_DATE - INTERVAL 1 YEAR
```

### 2. Mart Layer (dbt)

**User Metrics Mart:**

```sql
-- models/marts/user_metrics.sql
SELECT
    u.user_id,
    u.email,
    u.name,
    u.created_at,
    COUNT(DISTINCT e.session_id) as total_sessions,
    COUNT(DISTINCT e.event_id) as total_events,
    COUNT(DISTINCT CAST(e.event_timestamp AS DATE)) as active_days,
    MAX(e.event_timestamp) as last_activity,
    DATEDIFF(DAY, MAX(e.event_timestamp), CURRENT_DATE) as days_since_activity,
    CURRENT_TIMESTAMP() as updated_at
FROM {{ ref('stg_users') }} u
LEFT JOIN {{ ref('stg_events') }} e ON u.user_id = e.user_id
GROUP BY 1, 2, 3, 4
```

---

## Data Quality Monitoring (Week 4)

### 1. Quality Checks

**Completeness Checks:**

```python
def check_completeness(table_name, required_columns):
    """Check that required columns have no null values"""
    query = f"""
        SELECT
            {', '.join([f"SUM(CASE WHEN {col} IS NULL THEN 1 ELSE 0 END) as {col}_nulls" 
                       for col in required_columns])}
        FROM {table_name}
        WHERE DATE(loaded_at) = CURRENT_DATE
    """
    result = snowflake.query(query)
    
    for col in required_columns:
        null_count = result[f'{col}_nulls']
        if null_count > 0:
            alert(f"Completeness issue: {col} has {null_count} nulls")
```

**Freshness Checks:**

```python
def check_freshness(table_name, max_age_hours=24):
    """Check that data is fresh (loaded within max_age_hours)"""
    query = f"""
        SELECT MAX(loaded_at) as latest_load
        FROM {table_name}
    """
    result = snowflake.query(query)
    latest_load = result['latest_load']
    
    age_hours = (datetime.utcnow() - latest_load).total_seconds() / 3600
    if age_hours > max_age_hours:
        alert(f"Freshness issue: {table_name} is {age_hours} hours old")
```

**Accuracy Checks:**

```python
def check_accuracy(source_table, warehouse_table, sample_size=1000):
    """Sample validation between source and warehouse"""
    query = f"""
        SELECT COUNT(*) as discrepancies
        FROM (
            SELECT * FROM {source_table}
            EXCEPT
            SELECT * FROM {warehouse_table}
        )
        LIMIT {sample_size}
    """
    result = snowflake.query(query)
    
    if result['discrepancies'] > 0:
        alert(f"Accuracy issue: {result['discrepancies']} discrepancies found")
```

### 2. Quality Monitoring Dashboard

**Monitoring Metrics:**
- Data freshness (hours since last load)
- Completeness (% of required fields populated)
- Accuracy (% of records matching source)
- Timeliness (% of loads within SLA)
- Volume (record counts by table)

---

## Week 4 Deliverables Checklist

**Data Pipeline Implementation:**
- [x] Event collection schema designed
- [x] Event types and properties defined
- [x] Frontend event collection SDK specified
- [x] Backend event collection implementation designed
- [x] Kafka topic configuration designed
- [x] Spark streaming jobs specified
- [x] Batch processing pipeline designed
- [x] Data transformation (dbt) models specified
- [x] Data quality monitoring framework designed

**Infrastructure Coordination:**
- [ ] Kafka cluster setup (webwakaagent6)
- [ ] Spark cluster setup (webwakaagent6)
- [ ] Snowflake data warehouse setup (webwakaagent6)
- [ ] Airflow scheduler setup (webwakaagent6)

---

## Success Criteria

Step 10 data pipeline implementation is successful when:
1. ✓ Event collection pipeline designed and specified
2. ✓ Stream processing pipeline designed and specified
3. ✓ Batch processing pipeline designed and specified
4. ✓ Data transformation pipeline designed and specified
5. ✓ Data quality monitoring framework established

---

## Governance Compliance

**Compliance with Agent Identity Registry:**
- ✓ Authority: Data, Analytics & Intelligence (webwakaagent8)
- ✓ Mission: Define data strategy and analytics
- ✓ Coordination: With webwakaagent4 (Engineering), webwakaagent6 (Operations)
- ✓ Escalation: To Chief of Staff (webwakaagent1) for blockers >72 hours

**Compliance with Phase 2 Schedule:**
- ✓ Week 4 deliverables: Data pipeline implementation begun
- ✓ Completion target: 60% of Phase 2 analytics work
- ✓ Status: ON TRACK

---

**Document Status:** ACTIVE - Step 10 Implementation Underway  
**Next Review:** 2026-02-15 (End of Week 5)  
**Approval:** Pending webwakaagent1 (Chief of Staff) verification
