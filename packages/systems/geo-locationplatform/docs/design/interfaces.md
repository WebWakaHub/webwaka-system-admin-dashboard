# LocationPlatformSystem — Interface Design
## System ID: SYS-GEO-LOCATIONPLATFORM

### Public API Surface
- `MapRendererService`: Exposes map renderer operations
- `GeocoderService`: Exposes geocoder operations
- `SpatialAnalyzerService`: Exposes spatial analyzer operations
- `RoutePlannerService`: Exposes route planner operations
- `GeofenceManagerService`: Exposes geofence manager operations

### Event Contracts
- `MapRendererEvent`: Domain events from map renderer
- `GeocoderEvent`: Domain events from geocoder
- `SpatialAnalyzerEvent`: Domain events from spatial analyzer
- `RoutePlannerEvent`: Domain events from route planner
- `GeofenceManagerEvent`: Domain events from geofence manager

### Offline Interface
- `OfflineQueue.enqueue(operation)`: Queue operation for later sync
- `OfflineQueue.sync()`: Attempt to sync all queued operations
- `OfflineQueue.getStatus()`: Return sync status and pending count
