import { Router, Request, Response } from 'express';
import ContractManagementSystem from '../ContractManagementSystem';

const router = Router();
const cms = new ContractManagementSystem();

/**
 * Contract Management API Routes
 */

// ============ CONTRACT ROUTES ============

/**
 * POST /contracts/create
 * Create a new contract
 */
router.post('/contracts/create', async (req: Request, res: Response) => {
  try {
    const { tenantId, data, userId } = req.body;
    const contract = await cms.createContract(tenantId, data, userId);
    res.json({
      success: true,
      data: contract
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /contracts/:contractId
 * Get contract details
 */
router.get('/contracts/:contractId', async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;
    const { tenantId } = req.query;
    const contract = await cms.getContract(contractId, tenantId as string);
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }

    res.json({
      success: true,
      data: contract
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /contracts/:contractId/update
 * Update contract
 */
router.put('/contracts/:contractId/update', async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;
    const { tenantId, updates, userId } = req.body;
    const contract = await cms.updateContract(contractId, tenantId, updates, userId);
    
    res.json({
      success: true,
      data: contract
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /contracts
 * List contracts
 */
router.get('/contracts', async (req: Request, res: Response) => {
  try {
    const { tenantId, status, partyId, limit, offset } = req.query;
    const result = await cms.listContracts(tenantId as string, {
      status: status as string,
      partyId: partyId as string,
      limit: parseInt(limit as string) || 50,
      offset: parseInt(offset as string) || 0
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /contracts/:contractId/sign
 * Sign contract
 */
router.post('/contracts/:contractId/sign', async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;
    const { tenantId, partyId, signature, userId } = req.body;
    const contract = await cms.signContract(contractId, tenantId, partyId, signature, userId);

    res.json({
      success: true,
      data: contract
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /contracts/:contractId/execute
 * Execute contract
 */
router.post('/contracts/:contractId/execute', async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;
    const { tenantId, userId } = req.body;
    const contract = await cms.executeContract(contractId, tenantId, userId);

    res.json({
      success: true,
      data: contract
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /contracts/:contractId/complete
 * Complete contract
 */
router.post('/contracts/:contractId/complete', async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;
    const { tenantId, userId } = req.body;
    const contract = await cms.completeContract(contractId, tenantId, userId);

    res.json({
      success: true,
      data: contract
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ============ TEMPLATE ROUTES ============

/**
 * POST /templates/create
 * Create contract template
 */
router.post('/templates/create', async (req: Request, res: Response) => {
  try {
    const { tenantId, data, userId } = req.body;
    const template = await cms.createTemplate(tenantId, data, userId);

    res.json({
      success: true,
      data: template
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /templates/:templateId
 * Get template
 */
router.get('/templates/:templateId', async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const { tenantId } = req.query;
    const template = await cms.getTemplate(templateId, tenantId as string);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /templates/:templateId/generate
 * Generate contract from template
 */
router.post('/templates/:templateId/generate', async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const { tenantId, variables } = req.body;
    const content = await cms.generateFromTemplate(templateId, tenantId, variables);

    res.json({
      success: true,
      data: { content }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ============ NEGOTIATION ROUTES ============

/**
 * POST /negotiations/start
 * Start negotiation
 */
router.post('/negotiations/start', async (req: Request, res: Response) => {
  try {
    const { contractId, participants } = req.body;
    const session = await cms.startNegotiation(contractId, participants);

    res.json({
      success: true,
      data: session
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /negotiations/:sessionId/propose-change
 * Propose change
 */
router.post('/negotiations/:sessionId/propose-change', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { contractId, data, userId } = req.body;
    const change = await cms.proposeChange(contractId, sessionId, data, userId);

    res.json({
      success: true,
      data: change
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ============ MONITORING ROUTES ============

/**
 * POST /contracts/:contractId/milestones
 * Add milestone
 */
router.post('/contracts/:contractId/milestones', async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;
    const { data } = req.body;
    const milestone = await cms.addMilestone(contractId, data);

    res.json({
      success: true,
      data: milestone
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /contracts/:contractId/monitoring
 * Get monitoring summary
 */
router.get('/contracts/:contractId/monitoring', async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;
    const summary = await cms.getMonitoringSummary(contractId);

    res.json({
      success: true,
      data: summary
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ============ RENEWAL ROUTES ============

/**
 * POST /contracts/:contractId/renewal-request
 * Create renewal request
 */
router.post('/contracts/:contractId/renewal-request', async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;
    const { requestedBy, proposedTerms } = req.body;
    const request = await cms.createRenewalRequest(contractId, requestedBy, proposedTerms);

    res.json({
      success: true,
      data: request
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ============ ANALYTICS ROUTES ============

/**
 * GET /analytics/contracts
 * Get contract analytics
 */
router.get('/analytics/contracts', async (req: Request, res: Response) => {
  try {
    const analytics = await cms.getContractAnalytics();

    res.json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /analytics/performance
 * Generate performance report
 */
router.get('/analytics/performance', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await cms.generatePerformanceReport(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json({
      success: true,
      data: report
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ============ COMPLIANCE ROUTES ============

/**
 * POST /contracts/:contractId/compliance-check
 * Check contract compliance
 */
router.post('/contracts/:contractId/compliance-check', async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;
    const { contract } = req.body;
    const violations = await cms.checkContractCompliance(contractId, contract);

    res.json({
      success: true,
      data: { violations }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /contracts/:contractId/compliance-report
 * Get compliance report
 */
router.get('/contracts/:contractId/compliance-report', async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;
    const report = await cms.getComplianceReport(contractId);

    res.json({
      success: true,
      data: report
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ============ NOTIFICATION ROUTES ============

/**
 * GET /notifications
 * Get user notifications
 */
router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const { userId, read, limit, offset } = req.query;
    const result = await cms.getUserNotifications(userId as string, {
      read: read === 'true',
      limit: parseInt(limit as string) || 50,
      offset: parseInt(offset as string) || 0
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ============ SYSTEM ROUTES ============

/**
 * GET /system/status
 * Get system status
 */
router.get('/system/status', async (req: Request, res: Response) => {
  try {
    const status = await cms.getSystemStatus();

    res.json({
      success: true,
      data: status
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /system/metrics
 * Get system metrics
 */
router.get('/system/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await cms.getSystemMetrics();

    res.json({
      success: true,
      data: metrics
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
