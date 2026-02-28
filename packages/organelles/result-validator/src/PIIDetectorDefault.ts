/**
 * ORGN-AI-RESULT_VALIDATOR-v0.1.0 — Default PII Detector (Nigeria-First)
 * Agent: webwakaagent5 (Quality, Security & Reliability)
 * Issue: #970 (P2-T03)
 *
 * Includes Nigerian-specific PII patterns: BVN, NIN, Nigerian phone numbers
 */

import { IPIIDetectorPort } from './ports';
import { PIIMatch } from './types';

interface PIIPattern {
  type: string;
  regex: RegExp;
  confidence: number;
}

const NIGERIAN_PII_PATTERNS: PIIPattern[] = [
  // Nigerian Bank Verification Number (11 digits)
  { type: 'BVN', regex: /\b\d{11}\b/g, confidence: 0.7 },
  // Nigerian National Identification Number (11 digits)
  { type: 'NIN', regex: /\b\d{11}\b/g, confidence: 0.6 },
  // Nigerian phone numbers (+234 or 0-prefix)
  { type: 'PHONE_NG', regex: /(?:\+234|0)[789]\d{9}\b/g, confidence: 0.9 },
  // Email addresses
  { type: 'EMAIL', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, confidence: 0.95 },
  // Credit card numbers (basic pattern)
  { type: 'CREDIT_CARD', regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, confidence: 0.85 },
  // Nigerian bank account numbers (10 digits, NUBAN)
  { type: 'BANK_ACCOUNT_NG', regex: /\b\d{10}\b/g, confidence: 0.5 },
  // IP addresses
  { type: 'IP_ADDRESS', regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, confidence: 0.8 },
];

export class PIIDetectorDefault implements IPIIDetectorPort {
  private patterns: PIIPattern[];

  constructor(additionalPatterns?: PIIPattern[]) {
    this.patterns = [...NIGERIAN_PII_PATTERNS, ...(additionalPatterns ?? [])];
  }

  detect(text: string): PIIMatch[] {
    const matches: PIIMatch[] = [];

    for (const pattern of this.patterns) {
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          type: pattern.type,
          value: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          confidence: pattern.confidence,
        });
      }
    }

    // Deduplicate overlapping matches (keep highest confidence)
    return this.deduplicateMatches(matches);
  }

  redact(text: string, matches: PIIMatch[]): string {
    // Sort by start index descending to replace from end to start
    const sorted = [...matches].sort((a, b) => b.startIndex - a.startIndex);
    let result = text;
    for (const match of sorted) {
      const replacement = `[${match.type}:REDACTED]`;
      result = result.substring(0, match.startIndex) + replacement + result.substring(match.endIndex);
    }
    return result;
  }

  private deduplicateMatches(matches: PIIMatch[]): PIIMatch[] {
    const sorted = matches.sort((a, b) => a.startIndex - b.startIndex);
    const result: PIIMatch[] = [];

    for (const match of sorted) {
      const overlapping = result.find(
        existing => match.startIndex < existing.endIndex && match.endIndex > existing.startIndex
      );
      if (!overlapping) {
        result.push(match);
      } else if (match.confidence > overlapping.confidence) {
        const idx = result.indexOf(overlapping);
        result[idx] = match;
      }
    }

    return result;
  }
}
