# WebWaka Platform Core

**Status:** In Development  
**Version:** 0.1.0  
**Module:** Minimal Kernel (Module 1)

---

## Overview

This repository contains the core platform code for WebWaka, starting with the Minimal Kernel. The Minimal Kernel is the foundational, non-negotiable core of the WebWaka platform, upon which all other modules and plugins are built.

## Key Features

- **Event-Driven Architecture:** Central event bus for asynchronous, decoupled communication
- **Multi-Tenant:** Strict data and operational isolation between tenants
- **Plugin-First:** Extensible architecture supporting dynamic plugin loading
- **Offline-First:** Designed for reliable operation in low-connectivity environments
- **Permission-Driven:** Centralized permission checking for all actions

## Technology Stack

- **Language:** TypeScript (Node.js)
- **Event Bus:** NATS
- **Database:** PostgreSQL
- **Cache:** Redis
- **API Gateway:** Fastify

## Getting Started

See [DEV_ENVIRONMENT_SETUP.md](./DEV_ENVIRONMENT_SETUP.md) for detailed instructions on setting up your local development environment.

## Documentation

- [Minimal Kernel Specification v1.0](https://github.com/WebWakaHub/webwaka-governance/blob/master/specifications/MINIMAL_KERNEL_SPECIFICATION.md)
- [Development Environment Setup](./DEV_ENVIRONMENT_SETUP.md)

## License

PROPRIETARY - All Rights Reserved

---

**Maintained by:** webwakaagent4 (Backend Engineering)  
**Organization:** WebWaka
