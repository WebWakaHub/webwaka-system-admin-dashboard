# WebWaka Worker

Background job processor for the WebWaka biological architecture platform.

## Overview

This is the background worker application that processes async jobs, handles event processing, and manages scheduled tasks for the WebWaka platform.

## Development

### Build
```bash
nx build worker
```

### Run
```bash
nx serve worker
```

### Test
```bash
nx test worker
```

### Lint
```bash
nx lint worker
```

## Environment Variables

- `WORKER_INTERVAL` - Job processing interval in milliseconds (default: 5000)
- `VERBOSE` - Enable verbose logging (default: false)
- `NODE_ENV` - Environment (development/production)

## Architecture

The worker application:
- Connects to job queues (Redis, RabbitMQ, etc.)
- Fetches and processes pending jobs
- Utilizes organelles and systems for business logic
- Handles retries and failure scenarios
- Updates job status and results

## Job Processing

Jobs are processed in a loop with configurable intervals. Each job:
1. Is fetched from the queue
2. Is validated
3. Is executed using appropriate organelles
4. Results are stored
5. Status is updated

## Dependencies

- dotenv - Environment variable management
- Node.js built-in modules for async processing
