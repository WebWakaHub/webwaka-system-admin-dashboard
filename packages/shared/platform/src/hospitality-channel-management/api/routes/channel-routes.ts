/**
 * Channel Management API Routes
 * 
 * @author webwakaagent4
 * @step 438
 */

import { Router } from 'express';
import { ChannelController } from '../controllers/channel-controller';

const router = Router();
const channelController = new ChannelController();

// Connection management
router.post('/connections', channelController.createConnection);
router.get('/connections', channelController.listConnections);
router.get('/connections/:id', channelController.getConnection);
router.patch('/connections/:id', channelController.updateConnection);
router.delete('/connections/:id', channelController.deleteConnection);

// Mapping management
router.post('/connections/:id/mappings', channelController.createMapping);
router.get('/connections/:id/mappings', channelController.listMappings);

// Distribution operations
router.post('/connections/:id/inventory', channelController.distributeInventory);
router.post('/connections/:id/rates', channelController.distributeRates);
router.post('/connections/:id/availability', channelController.distributeAvailability);

// Booking operations
router.post('/connections/:id/bookings/pull', channelController.pullBookings);
router.get('/bookings', channelController.listChannelBookings);

// Rate parity
router.get('/rate-parity/:propertyId/:roomTypeId/:date', channelController.checkRateParity);

// Distribution logs
router.get('/logs', channelController.getDistributionLogs);

export default router;
