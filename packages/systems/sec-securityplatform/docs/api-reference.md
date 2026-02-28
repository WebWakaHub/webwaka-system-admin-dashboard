# SecurityplatformSystem API Reference

## System ID: SYS-SEC-SECURITYPLATFORM

## Methods

### coordinate(command)
Process a system command. Falls back to offline queue if network unavailable.

### coordinateOffline(command)
Queue a command for later sync. Uses IndexedDB storage.

### sync()
Sync offline queue with server. Processes in batches of 50.

### getHealth()
Return system health status including queue depth and uptime.

## Hash: 8866800b
