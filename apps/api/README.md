# WebWaka API

The main API service for the WebWaka biological architecture platform.

## Overview

This is the primary API application that serves as the entry point for all client requests. It orchestrates interactions with the various organelles and systems in the monorepo.

## Development

### Build
```bash
nx build api
```

### Run
```bash
nx serve api
```

### Test
```bash
nx test api
```

### Lint
```bash
nx lint api
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check
- `GET /api/v1` - API v1 root

## Architecture

The API application composes various organelles and systems to provide a unified interface for the platform.

## Dependencies

- Express.js - Web framework
- CORS - Cross-origin resource sharing
- dotenv - Environment variable management
