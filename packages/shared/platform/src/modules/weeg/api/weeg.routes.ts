/**
 * WEEG (Permission System) - REST API Routes
 * 
 * Defines HTTP routes for the WEEG module.
 * 
 * @module weeg/api/weeg-routes
 */

import { Router } from 'express';
import { WeegController, weegErrorHandler } from './weeg.controller';

/**
 * Create WEEG router
 */
export function createWeegRouter(controller: WeegController): Router {
  const router = Router();

  // Permission check
  router.post('/check', (req, res, next) => controller.checkPermission(req, res, next));

  // Role management
  router.get('/roles', (req, res, next) => controller.getRoles(req, res, next));
  router.get('/roles/:roleId', (req, res, next) => controller.getRole(req, res, next));
  router.post('/roles', (req, res, next) => controller.createRole(req, res, next));
  router.put('/roles/:roleId', (req, res, next) => controller.updateRole(req, res, next));
  router.delete('/roles/:roleId', (req, res, next) => controller.deleteRole(req, res, next));

  // Permission management
  router.get('/permissions', (req, res, next) => controller.getPermissions(req, res, next));
  router.post('/permissions', (req, res, next) => controller.createPermission(req, res, next));

  // Policy management
  router.post('/policies', (req, res, next) => controller.assignPermission(req, res, next));
  router.delete('/policies/:policyId', (req, res, next) => controller.removePermission(req, res, next));

  // User role management
  router.get('/users/:userId/roles', (req, res, next) => controller.getUserRoles(req, res, next));
  router.post('/users/:userId/roles', (req, res, next) => controller.assignRole(req, res, next));
  router.delete('/users/:userId/roles/:roleId', (req, res, next) => controller.removeRole(req, res, next));

  // ABAC rule management
  router.get('/abac-rules', (req, res, next) => controller.getAbacRules(req, res, next));
  router.post('/abac-rules', (req, res, next) => controller.createAbacRule(req, res, next));
  router.put('/abac-rules/:ruleId', (req, res, next) => controller.updateAbacRule(req, res, next));
  router.delete('/abac-rules/:ruleId', (req, res, next) => controller.deleteAbacRule(req, res, next));

  // Error handler
  router.use(weegErrorHandler);

  return router;
}
