# Nigerian-First Compliance Checklist

**Document Type:** Compliance Checklist  
**Status:** PROPOSED - Awaiting Founder Agent Approval  
**Date:** 2026-02-09  
**Prepared By:** webwakaagent1 (Chief of Staff)  
**Review Required:** webwaka007 (Founder Agent) - MANDATORY  
**Authority:** NIGERIAN_MOBILE_PWA_FIRST_INTEGRATION_REVIEW.md, WEBWAKA_MODULAR_DESIGN_ARCHITECTURE_INVARIANTS.md (Core Invariant #9: Nigerian-First)  
**Related Documents:**
- WEBWAKA_MODULAR_DESIGN_ARCHITECTURE_INVARIANTS.md
- CORE_MODULES_REMEDIATION_PLAN.md
- NIGERIAN_MOBILE_PWA_FIRST_INTEGRATION_REVIEW.md

---

## Purpose

This checklist ensures that **every module, feature, and component** of the WebWaka platform complies with **Nigerian-First** requirements as defined in the architectural invariants.

**Nigerian-First Principle:** All features must support Nigerian market requirements (Paystack/Flutterwave/Interswitch payment gateways, 40+ Nigerian banks, Termii SMS gateway, Nigerian Naira currency, NDPR compliance, +234 phone format).

---

## Nigerian-First Requirements

### 1. Payment Gateways

**Requirement:** Support for Nigerian payment gateways

**Mandatory Providers:**
- ✅ Paystack (primary)
- ✅ Flutterwave (secondary)
- ✅ Interswitch (tertiary)

**Validation:**
- [ ] Paystack integration tested and operational
- [ ] Flutterwave integration tested and operational
- [ ] Interswitch integration tested and operational
- [ ] Payment gateway selection configurable per tenant
- [ ] Payment gateway failover logic implemented
- [ ] Payment gateway transaction fees correctly calculated
- [ ] Payment gateway webhook handling implemented
- [ ] Payment gateway refund handling implemented

---

### 2. Nigerian Banks

**Requirement:** Support for Nigerian bank accounts

**Mandatory Banks:** 40+ Nigerian banks including:
- Access Bank, GTBank, Zenith Bank, First Bank, UBA, Ecobank, Fidelity Bank, Union Bank, Stanbic IBTC, Sterling Bank, Wema Bank, FCMB, Polaris Bank, Keystone Bank, Heritage Bank, Providus Bank, Unity Bank, Citibank Nigeria, Standard Chartered, Suntrust Bank, Titan Trust Bank, Globus Bank, Parallex Bank, Kuda Bank, VFD Microfinance Bank, Rubies Bank, Sparkle Bank, Opay, PalmPay, Moniepoint, Carbon, FairMoney, Renmoney, ALAT by Wema, V Bank, Eyowo, Paga, Quickteller, Interswitch, Flutterwave, Paystack

**Validation:**
- [ ] Bank account verification (NUBAN) implemented
- [ ] Bank transfer initiation implemented
- [ ] Bank transfer status tracking implemented
- [ ] Bank account balance inquiry implemented (where supported)
- [ ] Bank list updated quarterly
- [ ] Bank logos and branding displayed correctly
- [ ] Bank selection UI optimized for Nigerian users

---

### 3. SMS Gateway

**Requirement:** Support for Nigerian SMS gateway

**Mandatory Provider:**
- ✅ Termii (primary Nigerian SMS gateway)

**Validation:**
- [ ] Termii integration tested and operational
- [ ] SMS sending for OTP (One-Time Password) implemented
- [ ] SMS sending for notifications implemented
- [ ] SMS delivery status tracking implemented
- [ ] SMS cost tracking per tenant implemented
- [ ] SMS templates support Nigerian English and Pidgin
- [ ] SMS fallback to email when SMS fails

---

### 4. Currency

**Requirement:** Support for Nigerian Naira (₦)

**Mandatory Currency:**
- ✅ Nigerian Naira (NGN, ₦)

**Validation:**
- [ ] Naira (₦) symbol displayed correctly across all UIs
- [ ] Naira formatting follows Nigerian conventions (e.g., ₦1,000.00)
- [ ] Currency conversion to/from USD, EUR, GBP supported
- [ ] Exchange rates updated daily from reliable source (e.g., CBN, Aboki FX)
- [ ] Multi-currency support for international transactions
- [ ] Currency selection defaults to Naira for Nigerian users
- [ ] All financial calculations use Naira as base currency for Nigerian tenants

---

### 5. Regulatory Compliance

**Requirement:** Compliance with Nigerian Data Protection Regulation (NDPR)

**Mandatory Compliance:**
- ✅ NDPR (Nigeria Data Protection Regulation)

**Validation:**
- [ ] Data residency: Nigerian user data stored in Nigeria or approved location
- [ ] Consent management: Explicit consent obtained for data collection
- [ ] Right to access: Users can request their data
- [ ] Right to deletion: Users can request data deletion
- [ ] Right to portability: Users can export their data
- [ ] Data breach notification: Breach notification within 72 hours
- [ ] Privacy policy: NDPR-compliant privacy policy published
- [ ] Data Protection Officer (DPO): DPO contact information published
- [ ] Data processing agreements: DPAs with all third-party processors
- [ ] Annual NDPR compliance audit conducted

---

### 6. Phone Number Format

**Requirement:** Support for Nigerian phone number format

**Mandatory Format:**
- ✅ +234 (Nigeria country code)

**Validation:**
- [ ] Phone number input accepts +234 format
- [ ] Phone number input auto-formats to +234XXXXXXXXXX
- [ ] Phone number validation rejects invalid Nigerian numbers
- [ ] Phone number display shows +234 format
- [ ] Phone number search supports both +234 and 0 prefix
- [ ] Phone number internationalization supports other countries
- [ ] Phone number defaults to +234 for Nigerian users

---

### 7. Edge Locations

**Requirement:** Nigerian users routed to African edge locations

**Mandatory Edge Locations:**
- ✅ Lagos (LOS) - Cloudflare primary edge
- ✅ Abuja (ABV) - Cloudflare secondary edge
- ✅ Cape Town (CPT) - AWS CloudFront edge
- ✅ Johannesburg (JNB) - AWS CloudFront edge

**Validation:**
- [ ] Nigerian users routed to Lagos/Abuja Cloudflare edge
- [ ] Static assets cached at African edge locations
- [ ] Latency < 100ms for Nigerian users (Lagos/Abuja)
- [ ] Latency < 200ms for Nigerian users (Cape Town/Johannesburg)
- [ ] Edge routing tested from multiple Nigerian ISPs
- [ ] Edge routing monitored and alerted on degradation

---

### 8. Nigerian English & Pidgin

**Requirement:** Support for Nigerian English and Nigerian Pidgin

**Mandatory Languages:**
- ✅ Nigerian English (en-NG)
- ✅ Nigerian Pidgin (pcm)

**Validation:**
- [ ] Nigerian English language pack created
- [ ] Nigerian Pidgin language pack created
- [ ] Language selection defaults to Nigerian English for Nigerian users
- [ ] Language selection includes Nigerian Pidgin option
- [ ] All UI text supports Nigerian English idioms and phrases
- [ ] All error messages support Nigerian English and Pidgin
- [ ] All email templates support Nigerian English and Pidgin
- [ ] All SMS templates support Nigerian English and Pidgin

---

### 9. Nigerian Holidays

**Requirement:** Support for Nigerian public holidays

**Mandatory Holidays:**
- New Year's Day, Good Friday, Easter Monday, Workers' Day, Democracy Day, Eid al-Fitr, Eid al-Adha, Independence Day, Christmas Day, Boxing Day

**Validation:**
- [ ] Nigerian public holidays calendar integrated
- [ ] Business hours respect Nigerian public holidays
- [ ] Automated processes pause on Nigerian public holidays
- [ ] Holiday greetings displayed on Nigerian public holidays
- [ ] Holiday-specific promotions supported

---

### 10. Nigerian Time Zone

**Requirement:** Support for West Africa Time (WAT)

**Mandatory Time Zone:**
- ✅ WAT (West Africa Time, UTC+1)

**Validation:**
- [ ] Time zone defaults to WAT for Nigerian users
- [ ] All timestamps displayed in WAT for Nigerian users
- [ ] Time zone selection supports other time zones
- [ ] Time zone conversion accurate for Nigerian users
- [ ] Daylight saving time NOT applied (Nigeria does not observe DST)

---

## Module-Specific Compliance Checklists

### Module 1: Minimal Kernel

**Nigerian-First Requirements:**
- [ ] Kernel configuration supports Naira currency
- [ ] Kernel configuration supports +234 phone format
- [ ] Kernel configuration supports WAT time zone
- [ ] Kernel configuration supports Nigerian English language
- [ ] Kernel logging includes Nigerian-specific context

**Validation:**
- [ ] All requirements tested and operational
- [ ] Founder Agent review and approval

---

### Module 2: Plugin System

**Nigerian-First Requirements:**
- [ ] Plugin marketplace includes Nigerian payment gateway plugins
- [ ] Plugin marketplace includes Nigerian SMS gateway plugins
- [ ] Plugin marketplace includes Nigerian bank plugins
- [ ] Plugin discovery supports Nigerian English search
- [ ] Plugin recommendations prioritize Nigerian-relevant plugins

**Validation:**
- [ ] All requirements tested and operational
- [ ] Founder Agent review and approval

---

### Module 3: Event System

**Nigerian-First Requirements:**
- [ ] Event timestamps use WAT time zone
- [ ] Event routing supports Nigerian edge locations
- [ ] Event batching optimized for Nigerian network conditions
- [ ] Event correlation detects Nigerian-specific patterns (e.g., bank transfer delays)

**Validation:**
- [ ] All requirements tested and operational
- [ ] Founder Agent review and approval

---

### Module 4: Module System

**Nigerian-First Requirements:**
- [ ] Module discovery supports Nigerian English search
- [ ] Module recommendations prioritize Nigerian-relevant modules
- [ ] Module installation supports low-bandwidth Nigerian networks

**Validation:**
- [ ] All requirements tested and operational
- [ ] Founder Agent review and approval

---

### Module 5: Multi-Tenant Data Scoping

**Nigerian-First Requirements:**
- [ ] Tenant data residency supports Nigerian data storage
- [ ] Tenant configuration defaults to Naira currency for Nigerian tenants
- [ ] Tenant configuration defaults to +234 phone format for Nigerian tenants
- [ ] Tenant configuration defaults to WAT time zone for Nigerian tenants
- [ ] Tenant configuration defaults to Nigerian English language for Nigerian tenants
- [ ] NDPR compliance enforced for Nigerian tenants

**Validation:**
- [ ] All requirements tested and operational
- [ ] Founder Agent review and approval

---

### Module 6: Permission System (WEEG)

**Nigerian-First Requirements:**
- [ ] Permission templates include Nigerian-specific roles (e.g., Accountant, Cashier, Sales Rep)
- [ ] Permission recommendations consider Nigerian business practices
- [ ] Permission audit trails comply with NDPR

**Validation:**
- [ ] All requirements tested and operational
- [ ] Founder Agent review and approval

---

### Module 7: API Layer

**Nigerian-First Requirements:**
- [ ] API documentation includes Nigerian payment gateway examples
- [ ] API documentation includes Nigerian SMS gateway examples
- [ ] API documentation includes Nigerian bank examples
- [ ] API rate limiting considers Nigerian network conditions
- [ ] API error messages support Nigerian English

**Validation:**
- [ ] All requirements tested and operational
- [ ] Founder Agent review and approval

---

### Module 8: Offline-First Sync Engine

**Nigerian-First Requirements:**
- [ ] Sync engine optimized for Nigerian network conditions (2G/3G)
- [ ] Sync engine supports offline payment queue (sync when online)
- [ ] Sync engine supports offline SMS queue (sync when online)
- [ ] Sync engine prioritizes Nigerian-critical data (payments, inventory)

**Validation:**
- [ ] All requirements tested and operational
- [ ] Founder Agent review and approval

---

### Module 9: Audit System

**Nigerian-First Requirements:**
- [ ] Audit logs comply with NDPR
- [ ] Audit logs include Nigerian-specific events (payment gateway transactions, bank transfers, SMS sends)
- [ ] Audit logs use WAT time zone
- [ ] Audit log retention follows NDPR requirements (minimum 6 years for financial records)

**Validation:**
- [ ] All requirements tested and operational
- [ ] Founder Agent review and approval

---

### Module 10: AI-Extension Framework

**Nigerian-First Requirements:**
- [ ] AI prompts support Nigerian English
- [ ] AI prompts support Nigerian Pidgin
- [ ] AI responses consider Nigerian context (e.g., business practices, idioms)
- [ ] AI cost optimization for Nigerian users (free tier sufficient for basic usage)

**Validation:**
- [ ] All requirements tested and operational
- [ ] Founder Agent review and approval

---

### Module 11: Economic Engine (MLAS)

**Nigerian-First Requirements:**
- [ ] Commission calculations use Naira currency
- [ ] Revenue sharing supports Nigerian payment gateways
- [ ] Payout scheduling respects Nigerian public holidays
- [ ] Payout methods support Nigerian bank transfers
- [ ] Commission reports use WAT time zone

**Validation:**
- [ ] All requirements tested and operational
- [ ] Founder Agent review and approval

---

### Module 12: Fraud Prevention System

**Nigerian-First Requirements:**
- [ ] Fraud detection considers Nigerian-specific fraud patterns
- [ ] Fraud detection integrates with Nigerian payment gateways
- [ ] Fraud alerts sent via Nigerian SMS gateway
- [ ] Fraud reports comply with NDPR

**Validation:**
- [ ] All requirements tested and operational
- [ ] Founder Agent review and approval

---

### Module 13: Contract Management System

**Nigerian-First Requirements:**
- [ ] Contract templates support Nigerian English
- [ ] Contract templates comply with Nigerian contract law
- [ ] Contract signing supports Nigerian digital signatures
- [ ] Contract storage complies with NDPR

**Validation:**
- [ ] All requirements tested and operational
- [ ] Founder Agent review and approval

---

### Module 14: AI Abstraction Layer

**Nigerian-First Requirements:**
- [ ] AI tier pricing in Naira currency
- [ ] AI cost tracking in Naira currency
- [ ] AI usage alerts sent via Nigerian SMS gateway
- [ ] AI responses support Nigerian English and Pidgin

**Validation:**
- [ ] All requirements tested and operational
- [ ] Founder Agent review and approval

---

### Module 15: Deployment Infrastructure

**Nigerian-First Requirements:**
- [ ] Nigerian users routed to Lagos/Abuja Cloudflare edge
- [ ] Static assets cached at African edge locations
- [ ] Latency < 100ms for Nigerian users validated
- [ ] Monitoring alerts sent via Nigerian SMS gateway

**Validation:**
- [ ] All requirements tested and operational
- [ ] Founder Agent review and approval

---

### Commerce Suite

**Nigerian-First Requirements:**
- [ ] POS supports Naira currency
- [ ] POS supports Nigerian payment gateways
- [ ] POS supports Nigerian bank transfers
- [ ] POS supports Nigerian SMS receipts
- [ ] SVM supports Nigerian vendor onboarding
- [ ] MVM supports Nigerian vendor marketplace
- [ ] Inventory Sync supports Nigerian suppliers

**Validation:**
- [ ] All requirements tested and operational
- [ ] Founder Agent review and approval

---

### Transportation Suite

**Nigerian-First Requirements:**
- [ ] Transport Company Platform supports Naira currency
- [ ] Transport Company Platform supports Nigerian payment gateways
- [ ] Transport Company Platform supports Nigerian SMS notifications
- [ ] Motor Park Platform supports Nigerian motor parks
- [ ] Motor Park Platform supports Nigerian transport companies
- [ ] Seat Inventory Sync supports Nigerian routes

**Validation:**
- [ ] All requirements tested and operational
- [ ] Founder Agent review and approval

---

## Validation Checkpoints

**Nigerian-First compliance MUST be validated at:**

- Week 7: Tier 1 completion (Minimal Kernel)
- Week 12: Tier 2 completion (Event System, Multi-Tenant, Audit System)
- Week 18: Tier 3 completion (Plugin System, Module System, Permission System)
- Week 31: Tier 5 completion (Economic Engine, Fraud Prevention, Contract Management)
- Week 35: Module 14 completion (AI Abstraction Layer)
- Week 39: Module 15 completion (Deployment Infrastructure)
- Week 47: Commerce Suite completion
- Week 63: Transportation Suite completion
- Week 71: Final validation

**Validation Process:**
1. Chief of Staff conducts Nigerian-First compliance review
2. Quality validates all requirements tested
3. Chief of Staff submits to Founder Agent for approval
4. Founder Agent approves or requests modifications
5. Do NOT proceed to next tier/phase without Founder Agent approval

---

## Success Criteria

**Nigerian-First compliance is successful when:**

1. ✅ All payment gateways (Paystack, Flutterwave, Interswitch) operational
2. ✅ All Nigerian banks supported (40+)
3. ✅ SMS gateway (Termii) operational
4. ✅ Naira currency (₦) displayed correctly across all UIs
5. ✅ NDPR compliance validated
6. ✅ +234 phone format supported
7. ✅ Nigerian users routed to African edge locations (< 100ms latency)
8. ✅ Nigerian English and Pidgin supported
9. ✅ Nigerian public holidays respected
10. ✅ WAT time zone supported
11. ✅ All modules pass Nigerian-First compliance validation
12. ✅ Founder Agent approves final Nigerian-First compliance

---

**END OF DOCUMENT**

**Document Created:** 2026-02-09  
**Author:** webwakaagent1 (Chief of Staff)  
**Status:** PROPOSED - Awaiting Founder Agent Approval  
**Next Action:** Assign to webwaka007 for review
