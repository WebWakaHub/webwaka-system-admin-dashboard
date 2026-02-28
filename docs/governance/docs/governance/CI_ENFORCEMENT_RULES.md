# CI ENFORCEMENT RULES

**Document Type:** Enforcement Specification  
**Authority:** Founder-Mandated  
**Status:** RATIFIED  
**Version:** 1.0  
**Date:** 2026-02-15

---

## 1. PURPOSE

This document defines the mechanical enforcement rules that prevent architectural violations at build time. These rules are implemented in CI/CD pipelines and execute on every pull request.

**If CI passes, the code is architecturally compliant. If CI fails, the code violates platform law.**

---

## 2. ENFORCEMENT LAYERS

### Layer 1: Pre-Commit Hooks (Local)
### Layer 2: PR Validation (GitHub Actions)
### Layer 3: Build-Time Checks (CI Pipeline)
### Layer 4: Post-Merge Audits (Daily Scans)

---

## 3. PR GUARDRAILS

### 3.1. Suite Business Logic Detection

**Rule:** Suites must not contain business logic. They may only contain orchestration, routing, and UI composition.

**Prohibited Patterns in Suite Directories:**

```typescript
// ❌ ILLEGAL: Business calculation in suite
function calculateDiscount(price: number, customerType: string): number {
  if (customerType === 'vip') return price * 0.8;
  return price * 0.9;
}

// ❌ ILLEGAL: Payment processing in suite
async function processPayment(amount: number, method: string) {
  const gateway = new PaymentGateway();
  return await gateway.charge(amount, method);
}

// ❌ ILLEGAL: Database query in suite
async function getUserOrders(userId: string) {
  return await db.query('SELECT * FROM orders WHERE user_id = ?', [userId]);
}
```

**Allowed Patterns in Suite Directories:**

```typescript
// ✅ LEGAL: Orchestration
import { DiscountService } from '@webwaka/capability-commerce';
const discount = await discountService.calculate(price, customerType);

// ✅ LEGAL: Routing
app.post('/checkout', checkoutController.handle);

// ✅ LEGAL: UI Composition
return <CheckoutPage cart={cart} payment={paymentComponent} />;
```

**Detection Method:**

```bash
# Scan for prohibited patterns
./scripts/detect-illegal-logic.sh --target=suites

# Keywords that trigger violations:
# - "async function.*db\."
# - "SELECT|INSERT|UPDATE|DELETE"
# - "new.*Gateway"
# - "calculate.*return"
# - "process.*Payment"
```

**CI Action:** ❌ FAIL with message:
```
VIOLATION: Business logic detected in suite directory.
File: {file_path}
Line: {line_number}
Pattern: {matched_pattern}

Business logic must be in platform capabilities.
See: /docs/governance/CAPABILITY_BOUNDARY_LAW.md
```

---

### 3.2. Direct Database Access from Suites

**Rule:** Suites must not access databases directly. All data access must go through capability APIs.

**Prohibited Patterns:**

```typescript
// ❌ ILLEGAL: Direct DB import in suite
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ❌ ILLEGAL: Raw SQL in suite
await db.query('SELECT * FROM users WHERE id = ?', [userId]);

// ❌ ILLEGAL: ORM usage in suite
const user = await User.findOne({ where: { id: userId } });
```

**Detection Method:**

```bash
# Check imports in suite files
grep -r "import.*Prisma\|import.*knex\|import.*sequelize" suites/

# Check for SQL keywords
grep -r "SELECT\|INSERT\|UPDATE\|DELETE\|CREATE TABLE" suites/
```

**CI Action:** ❌ FAIL with message:
```
VIOLATION: Direct database access detected in suite.
File: {file_path}

Suites must use capability APIs for data access.
Capability: {suggested_capability_id}
```

---

### 3.3. Cross-Suite Imports

**Rule:** Suites must not import from other suites. All shared logic must be in platform capabilities.

**Prohibited Patterns:**

```typescript
// ❌ ILLEGAL: Suite importing from another suite
import { calculateShipping } from '@webwaka/suite-logistics';

// ❌ ILLEGAL: Relative path to another suite
import { UserService } from '../../../suite-hospitality/services/user';
```

**Allowed Patterns:**

```typescript
// ✅ LEGAL: Suite importing from capability
import { ShippingCalculator } from '@webwaka/capability-logistics';

// ✅ LEGAL: Suite importing from core
import { EventBus } from '@webwaka/platform-core';
```

**Detection Method:**

```bash
# Check for cross-suite imports
./scripts/detect-cross-suite-imports.sh

# Regex: import.*from.*['"]@webwaka/suite-(?!{current_suite})
```

**CI Action:** ❌ FAIL with message:
```
VIOLATION: Cross-suite import detected.
From: {suite_a}
To: {suite_b}
File: {file_path}

Shared logic must be extracted to platform capability.
Create capability proposal: /docs/governance/CAPABILITY_PROPOSAL_TEMPLATE.md
```

---

### 3.4. Capability ID Reference Requirement

**Rule:** All PRs that add or modify business logic must reference a capability ID.

**PR Template (Mandatory Fields):**

```markdown
## Capability Registry Impact

- [ ] Capability ID: `{capability_id}`
- [ ] Reuse Justification: {why not creating new capability}
- [ ] Extension Point Used: {which extension point}
- [ ] Breaking Change: Yes/No
- [ ] ARB Approval: {link or N/A}

## Reuse Proof

Explain why this change extends an existing capability instead of creating a new one.

If creating a new capability, attach ARB approval link.
```

**CI Validation:**

```bash
# Extract PR body
pr_body=$(gh pr view $PR_NUMBER --json body -q .body)

# Check for capability ID
if ! echo "$pr_body" | grep -q "Capability ID:"; then
  echo "❌ FAIL: Missing Capability ID reference"
  exit 1
fi

# Check for reuse justification
if ! echo "$pr_body" | grep -q "Reuse Justification:"; then
  echo "❌ FAIL: Missing reuse justification"
  exit 1
fi
```

**CI Action:** ❌ FAIL with message:
```
VIOLATION: PR template incomplete.
Missing: Capability ID reference

All business logic changes must reference a registered capability.
See: /docs/governance/CAPABILITY_REGISTRY_STANDARD.md
```

---

### 3.5. Duplicate Capability Detection

**Rule:** New capabilities must not duplicate existing capabilities.

**Detection Method:**

```bash
# Semantic similarity check
./scripts/detect-duplicate-capability.sh \
  --new-capability="$NEW_CAPABILITY_ID" \
  --description="$DESCRIPTION"

# Checks:
# 1. Similar naming patterns
# 2. Overlapping interface contracts
# 3. Semantic similarity of descriptions (>80% match)
```

**CI Action:** ⚠️ WARN with message:
```
WARNING: Potential duplicate capability detected.
New: {new_capability_id}
Existing: {existing_capability_id}
Similarity: {percentage}%

Review existing capability before proceeding.
If intentional, add justification to PR description.
ARB approval required.
```

---

## 4. ILLEGAL LOGIC DETECTION

### 4.1. Service Duplication

**Scan Target:** All suite directories

**Prohibited Patterns:**

```typescript
// ❌ ILLEGAL: Service class in suite
export class PaymentService {
  async processPayment() { /* ... */ }
}

// ❌ ILLEGAL: Repository pattern in suite
export class UserRepository {
  async findById(id: string) { /* ... */ }
}

// ❌ ILLEGAL: Business logic service in suite
export class DiscountCalculator {
  calculate(price: number) { /* ... */ }
}
```

**Detection Script:**

```bash
#!/bin/bash
# detect-service-duplication.sh

SUITE_DIRS="suites/*"

for suite in $SUITE_DIRS; do
  # Find service classes
  grep -r "export class.*Service\|export class.*Repository\|export class.*Calculator" "$suite" \
    && echo "❌ VIOLATION: Service class found in $suite"
done
```

---

### 4.2. Calculation Logic

**Prohibited in Suites:**

```typescript
// ❌ ILLEGAL: Price calculation
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// ❌ ILLEGAL: Tax calculation
function calculateTax(amount: number, rate: number): number {
  return amount * rate;
}

// ❌ ILLEGAL: Commission calculation
function calculateCommission(sale: number, rate: number): number {
  return sale * rate;
}
```

**Detection Keywords:**
- `calculate.*return`
- `compute.*return`
- `*.reduce(`
- `Math.floor|Math.ceil|Math.round` (in business context)

---

### 4.3. Payment Logic

**Prohibited in Suites:**

```typescript
// ❌ ILLEGAL: Payment gateway integration
const stripe = new Stripe(apiKey);
await stripe.charges.create({ /* ... */ });

// ❌ ILLEGAL: Payment processing
async function chargeCard(amount: number, token: string) {
  // payment logic
}
```

**Detection Keywords:**
- `Stripe|Paystack|Flutterwave`
- `charges.create|payment.process`
- `apiKey.*payment`

---

### 4.4. Messaging Logic

**Prohibited in Suites:**

```typescript
// ❌ ILLEGAL: Email sending
await sendEmail(to, subject, body);

// ❌ ILLEGAL: SMS sending
await sendSMS(phone, message);

// ❌ ILLEGAL: Notification logic
await notifyUser(userId, notification);
```

**Detection Keywords:**
- `sendEmail|sendSMS|sendNotification`
- `nodemailer|twilio|sendgrid`

---

### 4.5. Identity Logic

**Prohibited in Suites:**

```typescript
// ❌ ILLEGAL: Authentication logic
function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

// ❌ ILLEGAL: JWT generation
function generateToken(userId: string): string {
  return jwt.sign({ userId }, secret);
}
```

**Detection Keywords:**
- `bcrypt|argon2|scrypt`
- `jwt.sign|jwt.verify`
- `hashPassword|verifyPassword`

---

## 5. AUTOMATED SCANNING

### 5.1. Daily Violation Scan

**Schedule:** Every day at 00:00 UTC

**Scan Targets:**
- All suite directories
- All capability directories
- All core directories

**Checks:**
1. Illegal logic in suites
2. Cross-suite imports
3. Direct database access from suites
4. Duplicate capabilities
5. Orphan code (not in registry)

**Output:** Violation report sent to `#architecture-violations` Slack channel

**Format:**

```
🚨 DAILY VIOLATION REPORT - 2026-02-15

Total Violations: 3

1. ILLEGAL LOGIC IN SUITE
   Suite: webwaka-suite-hospitality
   File: src/services/payment-processor.ts
   Line: 42
   Pattern: Payment processing logic
   Severity: CRITICAL
   
2. CROSS-SUITE IMPORT
   From: webwaka-suite-commerce
   To: webwaka-suite-logistics
   File: src/controllers/checkout.ts
   Line: 15
   Severity: HIGH

3. ORPHAN CODE
   File: webwaka-platform/src/abandoned-module
   Status: Not in registry
   Severity: MEDIUM

Action Required: Create remediation tickets
```

---

### 5.2. Weekly Compliance Report

**Schedule:** Every Monday at 09:00 UTC

**Metrics:**
- Total capabilities registered
- Capabilities by maturity level
- Capabilities by lifecycle state
- Violation count (by type)
- Remediation rate
- ARB approval backlog

**Recipients:** Founder, ARB, Engineering Leads

---

### 5.3. Automatic Violation Ticket Creation

**Trigger:** Daily scan detects violation

**Action:**
1. Create GitHub issue in appropriate repository
2. Assign to capability owner
3. Label: `architectural-violation`, `priority:high`
4. Link to violation evidence
5. Suggest remediation path

**Issue Template:**

```markdown
## Architectural Violation Detected

**Type:** {violation_type}
**Severity:** {severity}
**Detected:** {timestamp}

### Evidence

File: {file_path}
Line: {line_number}
Pattern: {matched_pattern}

### Remediation

{suggested_fix}

### References

- Capability Registry: /docs/governance/CAPABILITY_REGISTRY_STANDARD.md
- Boundary Law: /docs/governance/CAPABILITY_BOUNDARY_LAW.md
- Enforcement Rules: /docs/governance/CI_ENFORCEMENT_RULES.md

### Deadline

{deadline_date} (7 days from detection)
```

---

## 6. ENFORCEMENT MATURITY LADDER

```
Level 0: Ad-hoc (no enforcement)
Level 1: Guided (documentation only)
Level 2: Mandatory (CI blocks merges)
Level 3: Automated (daily scans + auto-tickets)
Level 4: Self-healing (auto-remediation where possible)
```

**Current Target:** Level 3 (Automated)

**Roadmap to Level 4:**
- Auto-generate capability wrappers for detected violations
- Auto-create PRs for simple refactorings
- Auto-migrate deprecated capability usage

---

## 7. ACCEPTANCE TEST

**Question:** "What prevents someone tomorrow from rebuilding donations inside another suite?"

**Answer:**

1. **Pre-Commit Hook:** Local linter flags donation keywords in suite directory
2. **PR Validation:** CI detects donation logic pattern, fails build
3. **PR Template:** Missing capability ID reference, auto-reject
4. **Daily Scan:** If merged by override, detected within 24 hours, ticket auto-created
5. **Registry Law:** Donation capability already registered, duplicate detection prevents new registration

**Result:** 5 layers of mechanical prevention. Zero reliance on human memory.

---

## END OF ENFORCEMENT RULES
