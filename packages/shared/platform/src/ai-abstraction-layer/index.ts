/**
 * AI Abstraction Layer
 * Unified interface for interacting with multiple AI providers
 * Supports OpenRouter, OpenAI, Anthropic, Google, and custom providers
 * Features: BYOK support, caching, analytics, request routing
 */

export { default as AIAbstractionLayer } from './AIAbstractionLayer';
export type { AIAbstractionLayerConfig } from './AIAbstractionLayer';

// Components
export { default as UnifiedAIInterface } from './components/UnifiedAIInterface';
export type { AIRequest, AIResponse } from './components/UnifiedAIInterface';

export { default as RequestRouter } from './components/RequestRouter';
export type { RoutingConfig } from './components/RequestRouter';

export { default as KeyManagement } from './components/KeyManagement';
export type { BYOKKey, KeyRotationPolicy } from './components/KeyManagement';

export { default as CachingLayer } from './components/CachingLayer';
export type { CacheEntry, CacheConfig } from './components/CachingLayer';

export { default as AnalyticsEngine } from './components/AnalyticsEngine';
export type { RequestMetrics, UsageStats } from './components/AnalyticsEngine';

// Providers
export { default as OpenRouterAdapter } from './providers/OpenRouterAdapter';
export type { OpenRouterConfig, OpenRouterRequest, OpenRouterResponse } from './providers/OpenRouterAdapter';

// Routes
export { default as apiRoutes } from './routes/api.routes';
