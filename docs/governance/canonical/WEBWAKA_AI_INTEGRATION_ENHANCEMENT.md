# WebWaka AI Integration Enhancement - OpenRouter, BYOK, and Plug-and-Play AI System

**Document Type:** Canonical Specification  
**Department:** Architecture & System Design + Data, Analytics & Intelligence  
**Owning Agents:** webwakaagent3 (Architecture), webwakaagent8 (Data & AI)  
**Status:** ACTIVATED  
**Authority:** FD-2026-001, FD-2026-002, WEBWAKA_CANONICAL_MASTER_CONTEXT.md  
**Related Documents:** WEBWAKA_AI_NATIVE_ARCHITECTURE.md, AI_LLM_ABSTRACTION_LAYER_SPEC.md  
**Version:** 1.0  
**Last Updated:** 2026-02-09  
**Precedence Level:** 2 (Constitutional Documents)  
**Immutability:** RATIFIED AND LOCKED

---

## ZERO-BASED GOVERNANCE CONTEXT

This document exists within the WebWakaHub governance universe initiated under a true zero-based restart per FD-2026-001.

This document extends WEBWAKA_AI_NATIVE_ARCHITECTURE.md with detailed specifications for:
- OpenRouter and AI aggregator integration
- Bring Your Own Keys (BYOK) implementation
- Plug-and-play AI system (free, paid, premium tiers)
- Every layer AI-driven/supported architecture
- Multi-LLM provider ecosystem

---

## 1. Purpose

This document defines the **enhanced AI integration architecture** for WebWaka, ensuring that AI is not a bolt-on feature but an **integral part of every layer** of the platform. It specifies how the platform will support:

1. **AI Aggregators** (OpenRouter, etc.) for unified multi-LLM access
2. **Bring Your Own Keys (BYOK)** for tenant-controlled AI costs
3. **Plug-and-Play AI System** with free, paid, and premium tiers
4. **Every Layer AI-Driven** architecture across all platform components
5. **Multi-LLM Ecosystem** supporting all major providers and aggregators

This architecture ensures WebWaka remains **LLM-agnostic**, **cost-optimized**, and **tenant-flexible** while delivering AI-powered capabilities at every level.

---

## 2. Architectural Principles

### 2.1. AI as Integral, Not Bolt-On

**Principle:** AI is integrated into every layer of the platform from Day 1, not added as an afterthought.

**Enforcement:**
- **Kernel Layer:** AI-powered logging, anomaly detection, resource optimization
- **Plugin System:** AI-powered plugin recommendations, compatibility checks
- **Event System:** AI-powered event correlation, pattern detection, anomaly alerts
- **Module System:** AI-powered module discovery, dependency resolution
- **Multi-Tenant System:** AI-powered tenant behavior analysis, usage prediction
- **Permission System (WEEG):** AI-powered permission recommendations, access pattern analysis
- **API Layer:** AI-powered API usage analytics, rate limit optimization
- **Offline-First Sync:** AI-powered conflict resolution, sync prioritization
- **Audit System:** AI-powered fraud detection, compliance monitoring
- **Economic Engine (MLAS):** AI-powered commission optimization, fraud detection
- **Commerce Suite:** AI-powered inventory prediction, pricing optimization, customer recommendations
- **Transportation Suite:** AI-powered route optimization, demand forecasting, dynamic pricing

### 2.2. LLM Aggregator First

**Principle:** Use AI aggregators (OpenRouter, etc.) as primary integration point to access multiple LLMs through a single API.

**Benefits:**
- Single API for 100+ LLM models
- Automatic failover across providers
- Cost optimization through provider competition
- Simplified billing and usage tracking
- No vendor lock-in

**Enforcement:**
- OpenRouter as primary aggregator
- Direct provider APIs as fallback
- Aggregator abstraction layer for future alternatives

### 2.3. Bring Your Own Keys (BYOK)

**Principle:** Tenants can bring their own API keys for AI providers, giving them full cost control and compliance flexibility.

**Benefits:**
- Tenants control their AI costs directly
- Compliance with data residency requirements
- No platform markup on AI costs
- Tenant-specific model preferences
- Enterprise-grade key management

**Enforcement:**
- Secure key storage per tenant
- Key rotation and expiration policies
- Audit trails for key usage
- Fallback to platform keys when tenant keys unavailable

### 2.4. Plug-and-Play AI Tiers

**Principle:** AI capabilities are available in free, paid, and premium tiers with clear feature differentiation.

**Tiers:**
- **Free Tier:** Platform-provided keys, rate-limited, basic models (GPT-3.5, Gemini Flash)
- **Paid Tier:** BYOK or platform keys, higher limits, advanced models (GPT-4, Claude 3)
- **Premium Tier:** BYOK required, unlimited, cutting-edge models (GPT-4 Turbo, Claude 3 Opus)

**Enforcement:**
- Tier-based rate limiting
- Model access control per tier
- Automatic tier detection and enforcement
- Billing integration for paid/premium tiers

---

## 3. OpenRouter Integration Architecture

### 3.1. OpenRouter as Primary Aggregator

**OpenRouter** provides unified access to 100+ LLM models from multiple providers:
- OpenAI (GPT-3.5, GPT-4, GPT-4 Turbo)
- Anthropic (Claude 3 Haiku, Sonnet, Opus)
- Google (Gemini Pro, Gemini Flash, Gemini Ultra)
- Meta (Llama 2, Llama 3)
- Mistral AI (Mistral 7B, Mixtral 8x7B)
- Open-source models (Falcon, MPT, etc.)

**Integration Benefits:**
- Single API endpoint for all models
- Automatic model availability detection
- Cost comparison across providers
- Fallback routing when models unavailable
- Unified billing and usage tracking

### 3.2. OpenRouter API Integration

```typescript
// OpenRouter Configuration
interface OpenRouterConfig {
  apiKey: string;              // Platform or tenant BYOK
  baseURL: string;             // https://openrouter.ai/api/v1
  defaultModel: string;        // Default model for requests
  fallbackModels: string[];    // Fallback models if default unavailable
  costLimit: number;           // Maximum cost per request (USD)
  rateLimit: number;           // Requests per minute
  timeout: number;             // Request timeout (ms)
}

// OpenRouter Request
interface OpenRouterRequest {
  model: string;               // Model identifier (e.g., "openai/gpt-4")
  messages: Message[];         // Chat messages
  temperature?: number;        // 0-2, default 1
  maxTokens?: number;          // Maximum tokens to generate
  topP?: number;               // Nucleus sampling parameter
  frequencyPenalty?: number;   // -2 to 2
  presencePenalty?: number;    // -2 to 2
  stop?: string[];             // Stop sequences
  stream?: boolean;            // Stream response
}

// OpenRouter Response
interface OpenRouterResponse {
  id: string;                  // Request ID
  model: string;               // Model used
  choices: Choice[];           // Generated completions
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: {
    prompt: number;            // Cost for prompt (USD)
    completion: number;        // Cost for completion (USD)
    total: number;             // Total cost (USD)
  };
}
```

### 3.3. Model Selection Strategy

**Platform-Managed Model Selection:**

```typescript
// Model selection based on task complexity and cost
function selectModel(task: AITask, tier: AITier): string {
  // Free tier: Use cheapest models
  if (tier === 'free') {
    return task.complexity === 'low' 
      ? 'google/gemini-flash-1.5'      // $0.00001/token
      : 'openai/gpt-3.5-turbo';        // $0.0005/token
  }
  
  // Paid tier: Balance cost and quality
  if (tier === 'paid') {
    return task.complexity === 'low'
      ? 'openai/gpt-3.5-turbo'         // $0.0005/token
      : 'anthropic/claude-3-haiku';    // $0.00025/token
  }
  
  // Premium tier: Best quality
  if (tier === 'premium') {
    return task.complexity === 'low'
      ? 'anthropic/claude-3-sonnet'    // $0.003/token
      : 'openai/gpt-4-turbo';          // $0.01/token
  }
}
```

### 3.4. Automatic Failover

```typescript
// Failover logic when primary model unavailable
async function callWithFailover(
  request: OpenRouterRequest,
  config: OpenRouterConfig
): Promise<OpenRouterResponse> {
  const models = [config.defaultModel, ...config.fallbackModels];
  
  for (const model of models) {
    try {
      const response = await openrouter.chat({
        ...request,
        model: model
      });
      
      // Log successful model usage
      await auditLog.log({
        action: 'ai_request',
        model: model,
        cost: response.cost.total,
        success: true
      });
      
      return response;
    } catch (error) {
      // Log failure and try next model
      await auditLog.log({
        action: 'ai_request_failed',
        model: model,
        error: error.message
      });
      
      continue;
    }
  }
  
  throw new Error('All models failed');
}
```

---

## 4. Bring Your Own Keys (BYOK) Implementation

### 4.1. BYOK Architecture

**Tenant Key Management:**

```typescript
// Tenant AI Keys Schema
interface TenantAIKeys {
  tenantId: string;
  keys: {
    openrouter?: {
      apiKey: string;
      encryptedAt: Date;
      expiresAt?: Date;
      rateLimit: number;
    };
    openai?: {
      apiKey: string;
      organization?: string;
      encryptedAt: Date;
      expiresAt?: Date;
    };
    anthropic?: {
      apiKey: string;
      encryptedAt: Date;
      expiresAt?: Date;
    };
    google?: {
      apiKey: string;
      projectId?: string;
      encryptedAt: Date;
      expiresAt?: Date;
    };
  };
  fallbackToPlatformKeys: boolean;  // Use platform keys if tenant keys fail
  costAlerts: {
    dailyLimit: number;             // USD
    monthlyLimit: number;           // USD
    alertEmail: string;
  };
}
```

### 4.2. Secure Key Storage

**Encryption:**
- All API keys encrypted at rest using AES-256
- Encryption keys stored in Azure Key Vault (primary) or AWS KMS (secondary)
- Per-tenant encryption keys for additional isolation
- Key rotation every 90 days

**Access Control:**
- Only authorized services can decrypt keys
- Audit trail for all key access
- Multi-factor authentication for key management UI
- Role-based access control (RBAC) for key operations

### 4.3. BYOK Request Flow

```typescript
// AI request with BYOK support
async function makeAIRequest(
  tenantId: string,
  request: AIRequest,
  tier: AITier
): Promise<AIResponse> {
  // 1. Get tenant keys (if BYOK enabled)
  const tenantKeys = await getTenantKeys(tenantId);
  
  // 2. Select API key (tenant or platform)
  const apiKey = tenantKeys?.openrouter?.apiKey 
    ? await decrypt(tenantKeys.openrouter.apiKey)
    : await getPlatformKey('openrouter');
  
  // 3. Check cost limits
  const usage = await getUsageToday(tenantId);
  if (tenantKeys?.costAlerts?.dailyLimit && 
      usage.cost >= tenantKeys.costAlerts.dailyLimit) {
    throw new Error('Daily cost limit exceeded');
  }
  
  // 4. Make request
  const response = await openrouter.chat({
    ...request,
    apiKey: apiKey
  });
  
  // 5. Track usage and cost
  await trackUsage(tenantId, {
    model: response.model,
    tokens: response.usage.totalTokens,
    cost: response.cost.total,
    usingBYOK: !!tenantKeys?.openrouter?.apiKey
  });
  
  // 6. Check cost alerts
  if (tenantKeys?.costAlerts) {
    await checkCostAlerts(tenantId, usage.cost + response.cost.total);
  }
  
  return response;
}
```

### 4.4. BYOK UI and Management

**Tenant Dashboard:**
- Add/edit/delete API keys for each provider
- View real-time usage and costs
- Set cost alerts and limits
- Download usage reports
- Test keys before activation

**Key Validation:**
- Validate keys before storage
- Test API connectivity
- Check rate limits and quotas
- Verify permissions

---

## 5. Plug-and-Play AI System (Free, Paid, Premium)

### 5.1. AI Tier Definitions

**Free Tier:**
- **Models:** GPT-3.5 Turbo, Gemini Flash, Claude 3 Haiku
- **Rate Limit:** 100 requests/day per tenant
- **Cost:** Platform-funded (included in base subscription)
- **Features:** Basic AI capabilities (summarization, classification, simple generation)
- **Key Management:** Platform keys only
- **Support:** Community support

**Paid Tier:**
- **Models:** GPT-4, Gemini Pro, Claude 3 Sonnet, Llama 3
- **Rate Limit:** 1,000 requests/day per tenant (or unlimited with BYOK)
- **Cost:** $0.01 per request (platform keys) or BYOK (tenant pays directly)
- **Features:** Advanced AI capabilities (complex generation, analysis, code generation)
- **Key Management:** Platform keys or BYOK
- **Support:** Email support (24-hour response)

**Premium Tier:**
- **Models:** GPT-4 Turbo, GPT-4o, Gemini Ultra, Claude 3 Opus, Custom fine-tuned models
- **Rate Limit:** Unlimited (BYOK required)
- **Cost:** BYOK (tenant pays directly to provider)
- **Features:** Cutting-edge AI capabilities (multi-modal, long-context, custom models)
- **Key Management:** BYOK required
- **Support:** Priority support (4-hour response) + dedicated AI consultant

### 5.2. Tier Enforcement

```typescript
// Tier-based access control
interface AITierConfig {
  tier: 'free' | 'paid' | 'premium';
  allowedModels: string[];
  rateLimit: {
    requestsPerDay: number;
    requestsPerHour: number;
    requestsPerMinute: number;
  };
  costLimit: {
    perRequest: number;      // USD
    perDay: number;          // USD
    perMonth: number;        // USD
  };
  features: {
    streaming: boolean;
    functionCalling: boolean;
    multiModal: boolean;
    customModels: boolean;
    byokRequired: boolean;
  };
}

// Tier validation before request
async function validateTierAccess(
  tenantId: string,
  request: AIRequest
): Promise<void> {
  const subscription = await getSubscription(tenantId);
  const tierConfig = getTierConfig(subscription.aiTier);
  
  // Check model access
  if (!tierConfig.allowedModels.includes(request.model)) {
    throw new Error(`Model ${request.model} not available in ${subscription.aiTier} tier`);
  }
  
  // Check rate limits
  const usage = await getUsage(tenantId);
  if (usage.requestsToday >= tierConfig.rateLimit.requestsPerDay) {
    throw new Error('Daily rate limit exceeded');
  }
  
  // Check BYOK requirement
  if (tierConfig.features.byokRequired) {
    const hasKeys = await hasTenantKeys(tenantId);
    if (!hasKeys) {
      throw new Error('BYOK required for premium tier');
    }
  }
  
  // Check cost limits
  const estimatedCost = estimateRequestCost(request);
  if (estimatedCost > tierConfig.costLimit.perRequest) {
    throw new Error('Request exceeds per-request cost limit');
  }
}
```

### 5.3. Tier Upgrade Flow

**Automatic Tier Detection:**
- Free tier: Default for all new tenants
- Paid tier: Activated when tenant adds payment method
- Premium tier: Activated when tenant adds BYOK keys

**Upgrade Path:**
```
Free → Paid: Add payment method → Immediate upgrade
Paid → Premium: Add BYOK keys → Immediate upgrade
Premium → Paid: Remove BYOK keys → Downgrade (with warning)
Paid → Free: Remove payment method → Downgrade (with warning)
```

---

## 6. Every Layer AI-Driven Architecture

### 6.1. Kernel Layer AI Integration

**AI-Powered Capabilities:**
- **Anomaly Detection:** Detect unusual system behavior (CPU spikes, memory leaks, network anomalies)
- **Resource Optimization:** Predict resource needs, optimize allocation
- **Log Analysis:** Automatically categorize and summarize logs
- **Error Prediction:** Predict failures before they occur

**Implementation:**
```typescript
// Kernel AI Service
class KernelAIService {
  async detectAnomalies(metrics: SystemMetrics): Promise<Anomaly[]> {
    const analysis = await ai.analyze({
      model: 'gpt-3.5-turbo',
      prompt: `Analyze these system metrics for anomalies: ${JSON.stringify(metrics)}`,
      tier: 'free'  // Kernel uses free tier
    });
    
    return parseAnomalies(analysis);
  }
  
  async optimizeResources(usage: ResourceUsage): Promise<ResourceRecommendation> {
    const recommendation = await ai.generate({
      model: 'gpt-4',
      prompt: `Recommend resource optimization for: ${JSON.stringify(usage)}`,
      tier: 'paid'  // Resource optimization uses paid tier
    });
    
    return parseRecommendation(recommendation);
  }
}
```

### 6.2. Plugin System AI Integration

**AI-Powered Capabilities:**
- **Plugin Recommendations:** Suggest plugins based on tenant usage patterns
- **Compatibility Checks:** Predict plugin conflicts before installation
- **Plugin Discovery:** Semantic search for plugins
- **Auto-Configuration:** Generate plugin configurations based on tenant needs

### 6.3. Event System AI Integration

**AI-Powered Capabilities:**
- **Event Correlation:** Identify related events across system
- **Pattern Detection:** Detect recurring event patterns
- **Anomaly Alerts:** Alert on unusual event sequences
- **Event Summarization:** Summarize event streams for dashboards

### 6.4. Multi-Tenant System AI Integration

**AI-Powered Capabilities:**
- **Tenant Behavior Analysis:** Identify usage patterns per tenant
- **Usage Prediction:** Predict future resource needs
- **Churn Prediction:** Identify tenants at risk of leaving
- **Upsell Recommendations:** Suggest tier upgrades based on usage

### 6.5. Permission System (WEEG) AI Integration

**AI-Powered Capabilities:**
- **Permission Recommendations:** Suggest permissions based on role
- **Access Pattern Analysis:** Identify unusual access patterns
- **Compliance Monitoring:** Detect permission violations
- **Auto-Remediation:** Automatically fix permission issues

### 6.6. Economic Engine (MLAS) AI Integration

**AI-Powered Capabilities:**
- **Commission Optimization:** Optimize commission rates for maximum revenue
- **Fraud Detection:** Detect fraudulent affiliate activity
- **Revenue Prediction:** Predict revenue based on affiliate performance
- **Affiliate Recommendations:** Suggest high-performing affiliates

### 6.7. Commerce Suite AI Integration

**AI-Powered Capabilities:**
- **Inventory Prediction:** Predict inventory needs based on sales trends
- **Pricing Optimization:** Optimize prices for maximum profit
- **Customer Recommendations:** Recommend products to customers
- **Demand Forecasting:** Forecast demand for products

### 6.8. Transportation Suite AI Integration

**AI-Powered Capabilities:**
- **Route Optimization:** Optimize routes for minimum travel time
- **Demand Forecasting:** Forecast passenger demand
- **Dynamic Pricing:** Adjust prices based on demand
- **Seat Allocation:** Optimize seat allocation for maximum revenue

---

## 7. Multi-LLM Provider Ecosystem

### 7.1. Supported Providers

**Direct Provider Integration:**
- **OpenAI:** GPT-3.5, GPT-4, GPT-4 Turbo, GPT-4o
- **Anthropic:** Claude 3 Haiku, Sonnet, Opus
- **Google:** Gemini Flash, Pro, Ultra
- **Meta:** Llama 2, Llama 3 (via Replicate or Together AI)
- **Mistral AI:** Mistral 7B, Mixtral 8x7B
- **Cohere:** Command, Command Light
- **AI21 Labs:** Jurassic-2

**Aggregator Integration:**
- **OpenRouter:** Primary aggregator (100+ models)
- **Together AI:** Alternative aggregator for open-source models
- **Replicate:** Alternative aggregator for custom models

### 7.2. Provider Selection Logic

```typescript
// Provider selection based on requirements
function selectProvider(
  request: AIRequest,
  tier: AITier,
  tenantKeys: TenantAIKeys
): Provider {
  // 1. Check if tenant has BYOK for specific provider
  if (tenantKeys?.openai && request.model.startsWith('gpt')) {
    return 'openai-direct';
  }
  
  if (tenantKeys?.anthropic && request.model.startsWith('claude')) {
    return 'anthropic-direct';
  }
  
  // 2. Use OpenRouter for most requests (cost optimization)
  if (tier === 'free' || tier === 'paid') {
    return 'openrouter';
  }
  
  // 3. Premium tier can use direct providers for best performance
  if (tier === 'premium') {
    return request.preferredProvider || 'openrouter';
  }
}
```

---

## 8. Integration with Core Modules

### 8.1. AI Module Dependencies

**AI capabilities require the following core modules:**

1. **Minimal Kernel:** System-level AI operations
2. **Event System:** AI event routing and processing
3. **Permission System (WEEG):** AI access control
4. **API Layer:** AI API endpoints
5. **Audit System:** AI usage logging and compliance
6. **Multi-Tenant Data Scoping:** Tenant-specific AI keys and usage

### 8.2. AI Module Build Order

**Phase 2.5 (Core Modules Build):**
- Week 1-6: Minimal Kernel (with AI anomaly detection)
- Week 7-12: Event System (with AI event correlation)
- Week 13-18: Permission System (with AI permission recommendations)
- Week 19-24: API Layer (with AI API analytics)
- Week 25-31: Economic Engine (with AI fraud detection)

**Phase 3 (Commerce Suite):**
- Week 32-35: Commerce Shared Primitives (with AI inventory prediction)
- Week 36-47: Commerce Suite (with AI pricing optimization, customer recommendations)

**Phase 4 (Transportation Suite):**
- Week 48-51: Transportation Shared Primitives (with AI route optimization)
- Week 52-63: Transportation Suite (with AI demand forecasting, dynamic pricing)

---

## 9. Nigerian-First, Mobile-First, PWA-First, Africa-First Compliance

### 9.1. Offline AI Capabilities

**On-Device Models for Offline:**
- TensorFlow Lite models for basic classification
- Cached AI responses for common queries
- Queue AI requests for when online
- Graceful degradation when AI unavailable

### 9.2. Low-Bandwidth Optimization

**Bandwidth Minimization:**
- Compress AI requests and responses
- Batch multiple AI requests
- Cache frequently used AI results
- Use smaller models for low-bandwidth scenarios

### 9.3. African Language Support

**Multilingual AI:**
- Yoruba, Hausa, Igbo, Swahili, Amharic support
- Language detection and auto-translation
- Culturally relevant prompts
- Local context awareness

### 9.4. Cost Optimization for African Markets

**Affordable AI:**
- Free tier sufficient for basic usage
- BYOK for cost control
- Aggressive caching to reduce API calls
- Use cheapest models that meet quality requirements

---

## 10. Success Criteria

**AI Integration is successful when:**

1. ✅ OpenRouter integrated and operational
2. ✅ BYOK implemented for all major providers
3. ✅ Free, Paid, Premium tiers enforced
4. ✅ Every core module has AI capabilities
5. ✅ 100+ LLM models accessible via OpenRouter
6. ✅ AI costs tracked per tenant
7. ✅ Offline AI capabilities functional
8. ✅ African language support operational
9. ✅ AI audit trails complete
10. ✅ Responsible AI governance enforced

---

## 11. References

**Related Governance Documents:**
- WEBWAKA_AI_NATIVE_ARCHITECTURE.md
- AI_LLM_ABSTRACTION_LAYER_SPEC.md
- AI_PERMISSION_COST_CONTROLS.md
- AI_AUDIT_EXPLAINABILITY_RULES.md
- WEBWAKA_MODULAR_DESIGN_ARCHITECTURE_INVARIANTS.md
- FD-2026-001: Governance Foundation & Authority Model
- FD-2026-002: Mandatory Agent Checklist & Execution Visibility Rule

---

**END OF DOCUMENT**

**Document Created:** 2026-02-09  
**Authors:** webwakaagent1 (Chief of Staff), webwakaagent3 (Architecture), webwakaagent8 (Data & AI)  
**Status:** ACTIVATED AND LOCKED  
**Precedence Level:** 2 (Constitutional Documents)
