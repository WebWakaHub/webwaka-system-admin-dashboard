# Nigeria Cloud Infrastructure Research — Key Findings

## Market Overview (2026)
- Nigeria data center capacity: ~330-340MW by 2026 (5x from 2024)
- Market value: $280-300M today, projected $670M by 2030
- Colocation revenue: $251M (2025) → $580M (2030), 18% CAGR
- 70% of new West Africa DC capacity built locally
- Lagos is the primary hyperscale and interconnection hub

## Major Data Center Projects (2026)
1. 21st Century Technologies — 50MW Hyperscale, Ikeja (Tier IV, AI-ready, Nigerian-owned)
2. Airtel/Nxtra — 38MW Hyperscale, Eko Atlantic (carrier-neutral, subsea cable proximity)
3. Open Access Data Centres — 24MW, Ilasan (next to Equiano subsea cable landing)
4. MTN Dabengwa — 9MW modular, Lagos (prefabricated, fast deployment)
5. Rack Centre + EdgeNext — CDN and cloud hosting partnership

## Cloud Provider Landscape
- Local: Layer3Cloud, Nobus Cloud, Cloudflex, MTN Cloud
- Global: AWS (Cape Town region closest), Azure (no Nigeria region yet), GCP (no Nigeria region)
- Trend: Nigerian companies moving to local cloud for naira pricing, data sovereignty, lower latency

## Key Infrastructure Considerations
- Subsea cables: Equiano (Google), 2Africa (Meta), MainOne, WACS
- Fiber: Project BRIDGE — 90,000km national fiber
- Power: Unreliable grid, need for generator backup + solar
- Latency: Local DC = 5-15ms, South Africa = 80-120ms, Europe = 120-180ms

## Offline-First Deployment Patterns (from Finance in Africa research)
- USSD gateways for feature phone access
- SMS fallback for notifications and transactions
- Local queues: SQLite, Room, Realm, IndexedDB for PWA
- Sync workers with exponential backoff
- AES-256 encryption for offline data
- Conflict resolution: Last-Write-Wins with transaction hashes
- 30s timeout policy for all network operations
