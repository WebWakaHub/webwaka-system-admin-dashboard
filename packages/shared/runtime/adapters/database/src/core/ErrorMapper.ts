/**
 * RUNTIME-ADAPTER-DATABASE-v0.1.0
 * ErrorMapper — Translates engine errors to canonical DatabaseError types
 *
 * Issue: webwaka-runtime-universe#18 (P3-T01)
 */

import { DatabaseError, DatabaseErrorCode } from '../types/errors';

/**
 * Engine error pattern for matching.
 */
interface ErrorPattern {
  engine: string;
  codeOrMessage: string | RegExp;
  canonicalCode: DatabaseErrorCode;
}

const ERROR_PATTERNS: ErrorPattern[] = [
  // PostgreSQL
  { engine: 'postgresql', codeOrMessage: '23505', canonicalCode: DatabaseErrorCode.DUPLICATE_KEY },
  { engine: 'postgresql', codeOrMessage: '23503', canonicalCode: DatabaseErrorCode.VALIDATION_ERROR },
  { engine: 'postgresql', codeOrMessage: '40P01', canonicalCode: DatabaseErrorCode.DEADLOCK },
  { engine: 'postgresql', codeOrMessage: '57014', canonicalCode: DatabaseErrorCode.QUERY_TIMEOUT },
  { engine: 'postgresql', codeOrMessage: /ECONNREFUSED|ENOTFOUND/, canonicalCode: DatabaseErrorCode.CONNECTION_FAILED },

  // SQLite
  { engine: 'sqlite', codeOrMessage: 'SQLITE_CONSTRAINT_UNIQUE', canonicalCode: DatabaseErrorCode.DUPLICATE_KEY },
  { engine: 'sqlite', codeOrMessage: 'SQLITE_BUSY', canonicalCode: DatabaseErrorCode.DEADLOCK },
  { engine: 'sqlite', codeOrMessage: 'SQLITE_LOCKED', canonicalCode: DatabaseErrorCode.DEADLOCK },

  // MySQL / TiDB
  { engine: 'mysql', codeOrMessage: '1062', canonicalCode: DatabaseErrorCode.DUPLICATE_KEY },
  { engine: 'mysql', codeOrMessage: '1213', canonicalCode: DatabaseErrorCode.DEADLOCK },
  { engine: 'mysql', codeOrMessage: '1205', canonicalCode: DatabaseErrorCode.QUERY_TIMEOUT },
  { engine: 'mysql', codeOrMessage: /ECONNREFUSED|ENOTFOUND/, canonicalCode: DatabaseErrorCode.CONNECTION_FAILED },
];

export class ErrorMapper {
  /**
   * Map an engine-specific error to a canonical DatabaseError.
   */
  static map(engine: string, error: unknown): DatabaseError {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = (error as Record<string, unknown>)?.code as string | undefined;

    // Try to match against known patterns
    for (const pattern of ERROR_PATTERNS) {
      if (pattern.engine !== engine && pattern.engine !== 'all') continue;

      if (typeof pattern.codeOrMessage === 'string') {
        if (errorCode === pattern.codeOrMessage || errorMessage.includes(pattern.codeOrMessage)) {
          return new DatabaseError(
            pattern.canonicalCode,
            `[${engine}] ${errorMessage}`,
            error instanceof Error ? error : undefined,
            { engine, originalCode: errorCode },
          );
        }
      } else if (pattern.codeOrMessage.test(errorMessage) || (errorCode && pattern.codeOrMessage.test(errorCode))) {
        return new DatabaseError(
          pattern.canonicalCode,
          `[${engine}] ${errorMessage}`,
          error instanceof Error ? error : undefined,
          { engine, originalCode: errorCode },
        );
      }
    }

    // Unknown error
    return new DatabaseError(
      DatabaseErrorCode.UNKNOWN,
      `[${engine}] Unmapped error: ${errorMessage}`,
      error instanceof Error ? error : undefined,
      { engine, originalCode: errorCode },
    );
  }
}
