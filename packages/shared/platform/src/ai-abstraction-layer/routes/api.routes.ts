/**
 * AI Abstraction Layer API Routes
 * Provides REST API endpoints for interacting with the AI Abstraction Layer
 */

import { Router, Request, Response } from 'express';
import AIAbstractionLayer from '../AIAbstractionLayer';

const router = Router();
const aiLayer = new AIAbstractionLayer({
  enableAnalytics: true,
  enableCaching: true,
  cacheMaxSize: 1000,
  cacheTTL: 3600,
});

/**
 * POST /api/ai/request
 * Create and execute an AI request
 */
router.post('/request', async (req: Request, res: Response) => {
  try {
    const { model, messages, temperature, maxTokens, apiKey } = req.body;

    // Validate input
    if (!model || !messages) {
      return res.status(400).json({ error: 'Model and messages are required' });
    }

    // Execute request
    const response = await aiLayer.executeRequest({
      model,
      messages,
      temperature,
      maxTokens,
      apiKey,
    });

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/keys
 * Create a BYOK key
 */
router.post('/keys', (req: Request, res: Response) => {
  try {
    const { name, provider, apiKey, expiresAt, metadata } = req.body;

    // Validate input
    if (!name || !provider || !apiKey) {
      return res.status(400).json({ error: 'Name, provider, and apiKey are required' });
    }

    // Create key
    const key = aiLayer.createBYOKKey(
      name,
      provider,
      apiKey,
      expiresAt ? new Date(expiresAt) : undefined,
      metadata
    );

    res.status(201).json(key);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ai/keys/:provider
 * List BYOK keys for a provider
 */
router.get('/keys/:provider', (req: Request, res: Response) => {
  try {
    const { provider } = req.params;

    const keys = aiLayer.listBYOKKeys(provider);

    res.json(keys);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/ai/keys/:keyId/rotate
 * Rotate a BYOK key
 */
router.put('/keys/:keyId/rotate', (req: Request, res: Response) => {
  try {
    const { keyId } = req.params;
    const { newApiKey } = req.body;

    // Validate input
    if (!newApiKey) {
      return res.status(400).json({ error: 'newApiKey is required' });
    }

    // Rotate key
    const newKey = aiLayer.rotateBYOKKey(keyId, newApiKey);

    res.json(newKey);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/ai/keys/:keyId
 * Revoke a BYOK key
 */
router.delete('/keys/:keyId', (req: Request, res: Response) => {
  try {
    const { keyId } = req.params;

    // Revoke key
    aiLayer.revokeBYOKKey(keyId);

    res.json({ message: 'Key revoked successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/openrouter/init
 * Initialize OpenRouter adapter
 */
router.post('/openrouter/init', (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body;

    // Validate input
    if (!apiKey) {
      return res.status(400).json({ error: 'apiKey is required' });
    }

    // Initialize OpenRouter
    aiLayer.initializeOpenRouter(apiKey);

    res.json({ message: 'OpenRouter initialized successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ai/stats
 * Get system statistics
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = aiLayer.getStatistics();

    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ai/health
 * Get system health status
 */
router.get('/health', (req: Request, res: Response) => {
  try {
    const health = aiLayer.getHealthStatus();

    res.json(health);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ai/shutdown
 * Shutdown the system
 */
router.post('/shutdown', (req: Request, res: Response) => {
  try {
    aiLayer.shutdown();

    res.json({ message: 'System shutdown successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
