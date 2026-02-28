/**
 * Property Management - API Routes
 * 
 * Express routes for property management endpoints.
 * 
 * @module hospitality-property-management/api/routes/property-routes
 * @author webwakaagent4
 */

import { Router } from 'express';
import { PropertyController } from '../controllers/property-controller';

export function createPropertyRoutes(controller: PropertyController): Router {
  const router = Router();

  // Property routes
  router.post('/properties', controller.createProperty.bind(controller));
  router.get('/properties', controller.listProperties.bind(controller));
  router.get('/properties/:id', controller.getProperty.bind(controller));
  router.put('/properties/:id', controller.updateProperty.bind(controller));
  router.delete('/properties/:id', controller.deleteProperty.bind(controller));
  router.post('/properties/:id/activate', controller.activateProperty.bind(controller));
  router.post('/properties/:id/deactivate', controller.deactivateProperty.bind(controller));

  // Room type routes
  router.post('/properties/:id/room-types', controller.createRoomType.bind(controller));
  router.get('/properties/:id/room-types', controller.listRoomTypes.bind(controller));
  router.get('/properties/:id/room-types/:rtId', controller.getRoomType.bind(controller));
  router.put('/properties/:id/room-types/:rtId', controller.updateRoomType.bind(controller));
  router.delete('/properties/:id/room-types/:rtId', controller.deleteRoomType.bind(controller));

  // Rate plan routes
  router.post('/properties/:id/rate-plans', controller.createRatePlan.bind(controller));
  router.get('/properties/:id/rate-plans', controller.listRatePlans.bind(controller));
  router.get('/properties/:id/rate-plans/:rpId', controller.getRatePlan.bind(controller));
  router.put('/properties/:id/rate-plans/:rpId', controller.updateRatePlan.bind(controller));
  router.delete('/properties/:id/rate-plans/:rpId', controller.deleteRatePlan.bind(controller));

  // Availability routes
  router.get('/properties/:id/availability', controller.getAvailability.bind(controller));
  router.put('/properties/:id/availability', controller.updateAvailability.bind(controller));
  router.post('/properties/:id/availability/block', controller.blockDates.bind(controller));
  router.post('/properties/:id/availability/unblock', controller.unblockDates.bind(controller));

  // Analytics routes
  router.get('/properties/:id/analytics', controller.getAnalytics.bind(controller));

  return router;
}
